import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useListAgencyClientsQuery } from "@services/accountsApi";
import {
  FacebookAdAccountOption,
  IntegrationCredential,
  IntegrationDataSource,
  useAddDataSourceMutation,
  useInitiateFacebookOAuthMutation,
  useLazyGetDataSourceCredentialsQuery,
  useListDataSourcesQuery,
  useSelectFacebookAdAccountMutation,
  useUpdateDataSourceCredentialsMutation,
} from "@services/integrationApi";
import { useAppSelector } from "@store/hooks";
import { dashboardTitleSx } from "@theme/index";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type IntegrationFormState = {
  client_id: string;
  source_type: string;
  external_id: string;
  access_token: string;
  marketing_access_token: string;
  marketing_ad_account_id: string;
  api_version: string;
  business_id: string;
  test_event_code: string;
};

type FeedbackState = {
  type: "success" | "error" | "info" | "warning";
  message: string;
} | null;

type CallbackPayload = {
  credentialId?: number;
  dataSourceId?: number;
  selectionToken?: string;
  selectionRequired: boolean;
  adAccounts: FacebookAdAccountOption[];
  message?: string;
};

const EMPTY_FORM: IntegrationFormState = {
  client_id: "",
  source_type: "meta",
  external_id: "",
  access_token: "",
  marketing_access_token: "",
  marketing_ad_account_id: "",
  api_version: "",
  business_id: "",
  test_event_code: "",
};

const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta (Facebook/Instagram)" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok_ads", label: "TikTok Ads" },
];

function normalizeValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value).trim();
}

function maskValue(value?: string | null): string {
  if (!value) return "Not connected";
  if (value.length <= 12) return "••••••••••••";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | null): boolean {
  return value === "true" || value === "1" || value === "True";
}

function parseAccountPayload(value: string | null): FacebookAdAccountOption[] {
  if (!value) return [];
  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return {
            id: item,
            name: item,
            account_id: item,
            normalized_account_id: item,
          };
        }
        if (!item || typeof item !== "object") return null;

        const record = item as Record<string, unknown>;
        const id =
          normalizeValue(record.id) ||
          normalizeValue(record.account_id) ||
          normalizeValue(record.ad_account_id);

        if (!id) return null;

        return {
          id,
          name:
            normalizeValue(record.name) ||
            normalizeValue(record.account_name) ||
            normalizeValue(record.label) ||
            id,
          account_id:
            normalizeValue(record.account_id) ||
            normalizeValue(record.ad_account_id) ||
            id,
          normalized_account_id:
            normalizeValue(record.normalized_account_id) || id,
        };
      })
      .filter(Boolean) as FacebookAdAccountOption[];
  } catch (err) {
    console.warn("Failed to parse ad account payload:", err);
    return [];
  }
}

function hasFacebookOAuth(
  dataSource: IntegrationDataSource | null | undefined,
  credential: IntegrationCredential | null | undefined,
): boolean {
  return Boolean(
    credential?.facebook_oauth_available ??
    dataSource?.facebook_oauth_available ??
    false,
  );
}

function resolveFacebookOAuthAvailability(
  sourceType: string,
  activeDataSource: IntegrationDataSource | null,
  activeCredential: IntegrationCredential | null,
  dataSources: IntegrationDataSource[],
): boolean {
  if (sourceType !== "meta") return false;

  const activeAvailability =
    activeCredential?.facebook_oauth_available ??
    activeDataSource?.facebook_oauth_available;

  if (typeof activeAvailability === "boolean") return activeAvailability;

  const matchingMetaSource = dataSources.find(
    (ds) => ds.source_type === "meta",
  );
  if (typeof matchingMetaSource?.facebook_oauth_available === "boolean") {
    return matchingMetaSource.facebook_oauth_available;
  }

  return true;
}

function buildFormState(
  dataSource?: IntegrationDataSource | null,
  credential?: IntegrationCredential | null,
): IntegrationFormState {
  return {
    client_id: normalizeValue(dataSource?.client_id),
    source_type: normalizeValue(dataSource?.source_type) || "meta",
    external_id: normalizeValue(dataSource?.external_id),
    access_token: normalizeValue(credential?.access_token),
    marketing_access_token: normalizeValue(credential?.marketing_access_token),
    marketing_ad_account_id: normalizeValue(
      credential?.marketing_ad_account_id,
    ),
    api_version: normalizeValue(credential?.api_version),
    business_id: normalizeValue(credential?.business_id),
    test_event_code: normalizeValue(credential?.test_event_code),
  };
}

function readCallbackPayload(
  searchParams: URLSearchParams,
): CallbackPayload | null {
  const hasOAuthSignal =
    searchParams.has("selection_required") ||
    searchParams.has("credential_id") ||
    searchParams.has("data_source_id") ||
    searchParams.has("facebook_oauth");

  if (!hasOAuthSignal) return null;

  const directAccounts = parseAccountPayload(searchParams.get("ad_accounts"));
  const availableAccounts = parseAccountPayload(
    searchParams.get("available_ad_accounts"),
  );
  const fallbackAccounts = parseAccountPayload(searchParams.get("accounts"));

  return {
    credentialId:
      toNumber(searchParams.get("credential_id")) ??
      toNumber(searchParams.get("credentials_id")) ??
      toNumber(searchParams.get("integration_credential_id")),
    dataSourceId:
      toNumber(searchParams.get("data_source_id")) ??
      toNumber(searchParams.get("datasource_id")) ??
      toNumber(searchParams.get("integration_id")),
    selectionToken: searchParams.get("selection_token") || undefined,
    selectionRequired: parseBoolean(searchParams.get("selection_required")),
    adAccounts: directAccounts.length
      ? directAccounts
      : availableAccounts.length
        ? availableAccounts
        : fallbackAccounts,
    message:
      searchParams.get("message") || searchParams.get("status") || undefined,
  };
}

export default function IntegrationsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isAgency = user?.role === "agency";
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: allDataSources = [],
    isLoading: isLoadingDataSources,
    refetch: refetchDataSources,
  } = useListDataSourcesQuery();

  const { data: agencyClients = [], isLoading: isLoadingClients } =
    useListAgencyClientsQuery(undefined, { skip: !isAgency });

  const [createDataSource, { isLoading: isCreatingDataSource }] =
    useAddDataSourceMutation();
  const [triggerGetCredentials] = useLazyGetDataSourceCredentialsQuery();
  const [updateCredentials, { isLoading: isSavingCredentials }] =
    useUpdateDataSourceCredentialsMutation();
  const [initiateFacebookOAuth, { isLoading: isInitiatingOAuth }] =
    useInitiateFacebookOAuthMutation();
  const [selectFacebookAdAccount, { isLoading: isSelectingAdAccount }] =
    useSelectFacebookAdAccountMutation();

  const [selectedClientId, setSelectedClientId] = useState(
    searchParams.get("client") || "",
  );
  const [credentialsByDataSource, setCredentialsByDataSource] = useState<
    Record<number, IntegrationCredential | null>
  >({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDataSourceId, setEditingDataSourceId] = useState<number | null>(
    null,
  );
  const [form, setForm] = useState<IntegrationFormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [adAccountOptions, setAdAccountOptions] = useState<
    FacebookAdAccountOption[]
  >([]);
  const [pendingCredentialId, setPendingCredentialId] = useState<number | null>(
    null,
  );
  const [pendingDataSourceId, setPendingDataSourceId] = useState<number | null>(
    null,
  );
  const [pendingSelectionToken, setPendingSelectionToken] = useState("");
  const [selectedAdAccountId, setSelectedAdAccountId] = useState("");

  useEffect(() => {
    if (!isAgency || selectedClientId || !agencyClients.length) return;
    const firstClientId = String(agencyClients[0].id);
    setSelectedClientId(firstClientId);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("client", firstClientId);
      return next;
    });
  }, [agencyClients, isAgency, selectedClientId, setSearchParams]);

  useEffect(() => {
    const clientInUrl = searchParams.get("client") || "";
    if (clientInUrl !== selectedClientId) {
      setSelectedClientId(clientInUrl);
    }
  }, [searchParams, selectedClientId]);

  const visibleDataSources = useMemo(() => {
    if (!isAgency || !selectedClientId) return allDataSources;
    return allDataSources.filter(
      (ds) => normalizeValue(ds.client_id) === selectedClientId,
    );
  }, [allDataSources, isAgency, selectedClientId]);

  const selectedClient = useMemo(
    () =>
      agencyClients.find((client) => String(client.id) === selectedClientId) ??
      null,
    [agencyClients, selectedClientId],
  );

  useEffect(() => {
    if (!visibleDataSources.length) return;

    let ignore = false;
    const loadCredentials = async () => {
      const updates: Record<number, IntegrationCredential | null> = {};

      for (const ds of visibleDataSources) {
        try {
          const credential = await triggerGetCredentials(ds.id, true).unwrap();
          updates[ds.id] = credential;
        } catch (err) {
          console.error(`Failed to load credentials for DS ${ds.id}:`, err);
          updates[ds.id] = null;
        }
      }

      if (!ignore) {
        setCredentialsByDataSource((current) => ({ ...current, ...updates }));
      }
    };

    loadCredentials();

    return () => {
      ignore = true;
    };
  }, [triggerGetCredentials, visibleDataSources]);

  useEffect(() => {
    const callback = readCallbackPayload(searchParams);
    if (!callback) return;

    const nextSearch = new URLSearchParams(searchParams);
    [
      "facebook_oauth",
      "selection_required",
      "credential_id",
      "credentials_id",
      "integration_credential_id",
      "data_source_id",
      "datasource_id",
      "integration_id",
      "selection_token",
      "ad_accounts",
      "available_ad_accounts",
      "accounts",
      "message",
      "status",
    ].forEach((key) => nextSearch.delete(key));

    setSearchParams(nextSearch, { replace: true });

    if (callback.selectionRequired) {
      setPendingCredentialId(callback.credentialId ?? null);
      setPendingDataSourceId(callback.dataSourceId ?? null);
      setPendingSelectionToken(callback.selectionToken || "");
      setAdAccountOptions(callback.adAccounts);
      setSelectedAdAccountId(
        callback.adAccounts[0]?.normalized_account_id ||
          callback.adAccounts[0]?.account_id ||
          callback.adAccounts[0]?.id ||
          "",
      );
      setFeedback({
        type: "info",
        message:
          callback.message ||
          "Multiple ad accounts detected. Please select one to complete the Meta integration.",
      });
      return;
    }

    setFeedback({
      type: "success",
      message:
        callback.message ||
        "Facebook OAuth completed successfully. Credentials refreshed.",
    });

    if (callback.dataSourceId) {
      refreshCredentials(callback.dataSourceId);
    }

    refetchDataSources();
  }, [
    searchParams,
    setSearchParams,
    triggerGetCredentials,
    refetchDataSources,
  ]);

  const activeDataSource = editingDataSourceId
    ? (visibleDataSources.find((item) => item.id === editingDataSourceId) ??
      null)
    : null;

  const activeCredential = editingDataSourceId
    ? (credentialsByDataSource[editingDataSourceId] ?? null)
    : null;

  const showFacebookOAuthCTA = resolveFacebookOAuthAvailability(
    form.source_type,
    activeDataSource,
    activeCredential,
    visibleDataSources,
  );

  const showForm = isFormOpen || Boolean(editingDataSourceId);

  const alertSx = {
    width: "100%",
    "& .MuiAlert-message": { fontWeight: 600 },
  };

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleClientChange = useCallback(
    (clientId: string) => {
      setSelectedClientId(clientId);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (clientId) next.set("client", clientId);
        else next.delete("client");
        return next;
      });
      setIsFormOpen(false);
      setEditingDataSourceId(null);
      setForm(EMPTY_FORM);
      setFeedback(null);
    },
    [setSearchParams],
  );

  const handleFormChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setForm((current) => ({ ...current, [name]: value }));
    },
    [],
  );

  const handleStartNew = useCallback(() => {
    setEditingDataSourceId(null);
    setForm({
      ...EMPTY_FORM,
      client_id: isAgency ? selectedClientId : "",
    });
    setIsFormOpen(true);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [isAgency, selectedClientId]);

  const handleEdit = useCallback(
    (dataSource: IntegrationDataSource) => {
      setEditingDataSourceId(dataSource.id);
      const credential = credentialsByDataSource[dataSource.id];
      setForm(buildFormState(dataSource, credential));
      setIsFormOpen(true);
      setFeedback(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [credentialsByDataSource],
  );

  const handleHideForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDataSourceId(null);
    setForm({
      ...EMPTY_FORM,
      client_id: isAgency ? selectedClientId : "",
    });
    setFeedback(null);
  }, [isAgency, selectedClientId]);

  const ensureDataSource = async (): Promise<IntegrationDataSource> => {
    if (editingDataSourceId) {
      const existing = visibleDataSources.find(
        (ds) => ds.id === editingDataSourceId,
      );
      if (!existing) throw new Error("Data source not found");
      return existing;
    }

    const created = await createDataSource({
      client_id: isAgency ? form.client_id || undefined : undefined,
      source_type: form.source_type,
      external_id: form.external_id || undefined,
    }).unwrap();

    setEditingDataSourceId(created.id);
    return created;
  };

  const refreshCredentials = useCallback(
    async (dataSourceId: number) => {
      try {
        const credential = await triggerGetCredentials(
          dataSourceId,
          true,
        ).unwrap();
        setCredentialsByDataSource((current) => ({
          ...current,
          [dataSourceId]: credential,
        }));
        return credential;
      } catch (err) {
        console.error("Credential refresh failed:", err);
        setCredentialsByDataSource((current) => ({
          ...current,
          [dataSourceId]: null,
        }));
        return null;
      }
    },
    [triggerGetCredentials],
  );

  const validateForm = (): boolean => {
    if (isAgency && !form.client_id) {
      setFeedback({
        type: "error",
        message: "Please select a client before saving.",
      });
      return false;
    }
    if (!form.source_type) {
      setFeedback({ type: "error", message: "Platform type is required." });
      return false;
    }
    return true;
  };

  const handleSaveIntegration = async () => {
    if (!validateForm()) return;

    try {
      const dataSource = await ensureDataSource();

      const credential = await updateCredentials({
        dataSourceId: dataSource.id,
        body: {
          access_token: form.access_token || undefined,
          marketing_access_token: form.marketing_access_token || undefined,
          marketing_ad_account_id: form.marketing_ad_account_id || undefined,
          api_version: form.api_version || undefined,
          business_id: form.business_id || undefined,
          test_event_code: form.test_event_code || undefined,
        },
      }).unwrap();

      setCredentialsByDataSource((current) => ({
        ...current,
        [dataSource.id]: credential,
      }));

      setForm(buildFormState(dataSource, credential));
      setFeedback({
        type: "success",
        message: "Integration saved successfully.",
      });
      await refetchDataSources();
    } catch (error: any) {
      console.error("Failed to save integration:", error);
      const msg =
        error?.data?.message ||
        "Failed to save integration. Please verify your inputs and try again.";
      setFeedback({ type: "error", message: msg });
    }
  };

  const handleFacebookConnect = async () => {
    if (isAgency && !form.client_id) {
      setFeedback({
        type: "error",
        message: "Please select a client before connecting to Facebook.",
      });
      return;
    }

    try {
      const dataSource = await ensureDataSource();
      const callbackUrl = `${window.location.origin}/integrations${
        isAgency && form.client_id ? `?client=${form.client_id}` : ""
      }`;

      const response = await initiateFacebookOAuth({
        dataSourceId: dataSource.id,
        frontend_callback_url: callbackUrl,
      }).unwrap();

      window.location.assign(response.oauth_url);
    } catch (error: any) {
      console.error("Facebook OAuth initiation failed:", error);
      setFeedback({
        type: "error",
        message:
          error?.data?.message ||
          "Failed to start Facebook connection. You can still use manual configuration below.",
      });
    }
  };

  const closeAdAccountDialog = useCallback(() => {
    setPendingCredentialId(null);
    setPendingDataSourceId(null);
    setPendingSelectionToken("");
    setAdAccountOptions([]);
    setSelectedAdAccountId("");
    setFeedback(null);
  }, []);

  const handleAdAccountSubmit = async () => {
    if (
      !pendingCredentialId ||
      !pendingSelectionToken ||
      !selectedAdAccountId
    ) {
      setFeedback({
        type: "error",
        message: "Missing required selection data.",
      });
      return;
    }

    try {
      await selectFacebookAdAccount({
        credentialId: pendingCredentialId,
        selection_token: pendingSelectionToken,
        selected_ad_account_id: selectedAdAccountId,
      }).unwrap();

      if (pendingDataSourceId) {
        await refreshCredentials(pendingDataSourceId);
      }

      setFeedback({
        type: "success",
        message:
          "Ad account selected and Meta integration completed successfully.",
      });
      closeAdAccountDialog();
      await refetchDataSources();
    } catch (error: any) {
      console.error("Ad account selection failed:", error);
      setFeedback({
        type: "error",
        message:
          error?.data?.message ||
          "Failed to connect selected ad account. Please try again.",
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Box>
          <Typography variant="h4" sx={dashboardTitleSx}>
            Integrations
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems="stretch"
        >
          {isAgency && (
            <TextField
              select
              label="Client Workspace"
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 340 } }}
              disabled={isLoadingClients}
              size="medium"
            >
              {agencyClients.map((client) => (
                <MenuItem key={client.id} value={String(client.id)}>
                  {client.business_name} ({client.user_email})
                </MenuItem>
              ))}
            </TextField>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleStartNew}
            disabled={isAgency && !selectedClientId}
            size="medium"
          >
            Add New Integration
          </Button>
        </Stack>
      </Stack>

      {isAgency && selectedClient && (
        <Paper
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              Current Workspace
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {selectedClient.business_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All changes here apply only to this client&apos;s integrations.
            </Typography>
          </Stack>
        </Paper>
      )}

      {showForm && (
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {editingDataSourceId ? "Edit Integration" : "New Integration"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Configure platform connection. Use guided OAuth where
                  available.
                </Typography>
              </Box>

              {editingDataSourceId && (
                <Button
                  variant="text"
                  onClick={() => {
                    setEditingDataSourceId(null);
                    setForm({
                      ...EMPTY_FORM,
                      client_id: isAgency ? selectedClientId : "",
                    });
                  }}
                >
                  Create New Instead
                </Button>
              )}
            </Stack>

            <Stack spacing={2.5}>
              <TextField
                select
                label="Platform"
                name="source_type"
                value={form.source_type}
                onChange={handleFormChange}
                fullWidth
                disabled={Boolean(editingDataSourceId)}
                helperText={
                  editingDataSourceId
                    ? "Platform cannot be changed after creation"
                    : ""
                }
              >
                {PLATFORM_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="External ID / Account Identifier"
                name="external_id"
                value={form.external_id}
                onChange={handleFormChange}
                fullWidth
                disabled={Boolean(editingDataSourceId)}
                helperText={
                  editingDataSourceId
                    ? "Identifier is locked after creation"
                    : "Pixel ID, Property ID, or Account ID from the platform"
                }
              />
            </Stack>

            {showFacebookOAuthCTA && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Chip
                      icon={<FacebookIcon />}
                      label="RECOMMENDED"
                      color="primary"
                      sx={{
                        p: 0.5,
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Guided Meta Connection
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Securely connect your Meta account and automatically import
                    tokens and permissions.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      isInitiatingOAuth ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SyncAltIcon />
                      )
                    }
                    onClick={handleFacebookConnect}
                    disabled={isInitiatingOAuth}
                  >
                    {isInitiatingOAuth
                      ? "Redirecting to Meta..."
                      : "Connect with Facebook"}
                  </Button>
                </Stack>
              </Paper>
            )}

            <Divider />

            <Stack spacing={2.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                Manual Credential Configuration
              </Typography>

              <TextField
                label="Access Token"
                name="access_token"
                value={form.access_token}
                onChange={handleFormChange}
                fullWidth
                type="password"
                helperText="Long-lived access token (masked on save)"
              />
              <TextField
                label="Marketing Access Token"
                name="marketing_access_token"
                value={form.marketing_access_token}
                onChange={handleFormChange}
                fullWidth
                type="password"
              />
              <TextField
                label="Marketing Ad Account ID"
                name="marketing_ad_account_id"
                value={form.marketing_ad_account_id}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="API Version"
                name="api_version"
                value={form.api_version}
                onChange={handleFormChange}
                fullWidth
                placeholder="v19.0"
              />
              <TextField
                label="Business ID"
                name="business_id"
                value={form.business_id}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="Test Event Code"
                name="test_event_code"
                value={form.test_event_code}
                onChange={handleFormChange}
                fullWidth
              />
            </Stack>

            <Stack spacing={2} alignItems="flex-start">
              {feedback && (
                <Alert
                  severity={feedback.type}
                  sx={alertSx}
                  onClose={() => setFeedback(null)}
                >
                  {feedback.message}
                </Alert>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSaveIntegration}
                  disabled={isSavingCredentials || isCreatingDataSource}
                  startIcon={
                    (isSavingCredentials || isCreatingDataSource) && (
                      <CircularProgress size={20} color="inherit" />
                    )
                  }
                >
                  {editingDataSourceId ? "Save Changes" : "Create Integration"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleHideForm}
                  size="large"
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" fontWeight={700}>
              Connected Integrations
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => refetchDataSources()}
              disabled={isLoadingDataSources}
              startIcon={
                isLoadingDataSources ? (
                  <CircularProgress size={16} />
                ) : undefined
              }
            >
              Refresh
            </Button>
          </Stack>

          {isLoadingDataSources ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading integrations...
              </Typography>
            </Box>
          ) : visibleDataSources.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                No integrations configured yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get started by adding a new integration above.
              </Typography>
            </Box>
          ) : (
            visibleDataSources.map((dataSource) => {
              const credential = credentialsByDataSource[dataSource.id];
              const oauthAvailable = hasFacebookOAuth(dataSource, credential);

              return (
                <Card
                  key={dataSource.id}
                  sx={{ borderRadius: 3 }}
                  variant="outlined"
                >
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={2}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {dataSource.source_type === "meta"
                              ? "Meta Ads"
                              : dataSource.source_type
                                  .replace("_", " ")
                                  .toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {dataSource.external_id || "—"}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {oauthAvailable &&
                            dataSource.source_type === "meta" && (
                              <Chip
                                color="success"
                                icon={<CheckCircleOutlineIcon />}
                                label="OAuth Enabled"
                                size="small"
                              />
                            )}
                          <Button
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => handleEdit(dataSource)}
                            size="small"
                          >
                            Manage
                          </Button>
                        </Stack>
                      </Stack>

                      <Divider />

                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {[
                          {
                            label: "Access Token",
                            value: credential?.access_token,
                          },
                          {
                            label: "Marketing Token",
                            value: credential?.marketing_access_token,
                          },
                          {
                            label: "Ad Account ID",
                            value: credential?.marketing_ad_account_id,
                          },
                          {
                            label: "API Version",
                            value: credential?.api_version,
                          },
                          {
                            label: "Business ID",
                            value: credential?.business_id,
                          },
                          {
                            label: "Test Event Code",
                            value: credential?.test_event_code,
                          },
                        ].map((field, idx) => (
                          <Box
                            key={idx}
                            sx={{ minWidth: 200, flex: "1 1 auto" }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              gutterBottom
                            >
                              {field.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                wordBreak: "break-all",
                              }}
                            >
                              {maskValue(field.value as string | undefined)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </Paper>

      <Dialog
        open={Boolean(pendingCredentialId)}
        onClose={() => !isSelectingAdAccount && closeAdAccountDialog()}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select Ad Account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Facebook returned multiple ad accounts. Choose the primary account
              to associate with this integration.
            </Typography>

            <TextField
              select
              label="Facebook Ad Account"
              value={selectedAdAccountId}
              onChange={(e) => setSelectedAdAccountId(e.target.value)}
              fullWidth
              disabled={isSelectingAdAccount}
            >
              {adAccountOptions.map((acc) => {
                const displayId =
                  acc.normalized_account_id || acc.account_id || acc.id;
                return (
                  <MenuItem key={acc.id} value={displayId}>
                    {acc.name || "Unnamed Account"} — {displayId}
                  </MenuItem>
                );
              })}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeAdAccountDialog}
            disabled={isSelectingAdAccount}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdAccountSubmit}
            disabled={!selectedAdAccountId || isSelectingAdAccount}
            startIcon={isSelectingAdAccount && <CircularProgress size={18} />}
          >
            Confirm & Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
