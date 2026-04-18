import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
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

type FeedbackState = { type: "success" | "error" | "info"; message: string } | null;

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

function normalizeValue(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function maskValue(value?: string | null) {
  if (!value) return "Not connected";
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function toNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: string | null) {
  return value === "true" || value === "1" || value === "True";
}

function parseAccountPayload(value: string | null): FacebookAdAccountOption[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (typeof item === "string") return { id: item, name: item };
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
            normalizeValue(record.label),
          account_id:
            normalizeValue(record.account_id) || normalizeValue(record.ad_account_id) || id,
          normalized_account_id: normalizeValue(record.normalized_account_id) || id,
        };
      })
      .filter(Boolean) as FacebookAdAccountOption[];
  } catch {
    return [];
  }
}

function hasFacebookOAuth(
  dataSource: IntegrationDataSource | null | undefined,
  credential: IntegrationCredential | null | undefined
) {
  return Boolean(
    credential?.facebook_oauth_available ?? dataSource?.facebook_oauth_available ?? false
  );
}

function resolveFacebookOAuthAvailability(
  sourceType: string,
  activeDataSource: IntegrationDataSource | null,
  activeCredential: IntegrationCredential | null,
  dataSources: IntegrationDataSource[]
) {
  if (sourceType !== "meta") return false;

  const activeAvailability =
    activeCredential?.facebook_oauth_available ?? activeDataSource?.facebook_oauth_available;
  if (typeof activeAvailability === "boolean") return activeAvailability;

  const matchingMetaSource = dataSources.find((dataSource) => dataSource.source_type === "meta");
  if (typeof matchingMetaSource?.facebook_oauth_available === "boolean") {
    return matchingMetaSource.facebook_oauth_available;
  }

  // New Meta integrations should still present the guided OAuth path by default.
  return true;
}

function buildFormState(
  dataSource?: IntegrationDataSource | null,
  credential?: IntegrationCredential | null
): IntegrationFormState {
  return {
    client_id: normalizeValue(dataSource?.client_id),
    source_type: normalizeValue(dataSource?.source_type) || "meta",
    external_id: normalizeValue(dataSource?.external_id),
    access_token: normalizeValue(credential?.access_token),
    marketing_access_token: normalizeValue(credential?.marketing_access_token),
    marketing_ad_account_id: normalizeValue(credential?.marketing_ad_account_id),
    api_version: normalizeValue(credential?.api_version),
    business_id: normalizeValue(credential?.business_id),
    test_event_code: normalizeValue(credential?.test_event_code),
  };
}

function readCallbackPayload(searchParams: URLSearchParams): CallbackPayload | null {
  const hasOAuthSignal =
    searchParams.has("selection_required") ||
    searchParams.has("credential_id") ||
    searchParams.has("data_source_id") ||
    searchParams.has("facebook_oauth");
  if (!hasOAuthSignal) return null;
  const directAccounts = parseAccountPayload(searchParams.get("ad_accounts"));
  const availableAccounts = parseAccountPayload(searchParams.get("available_ad_accounts"));
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
    message: searchParams.get("message") || searchParams.get("status") || undefined,
  };
}

export default function IntegrationsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isAgency = user?.role === "agency";
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: allDataSources = [], isLoading: isLoadingDataSources, refetch: refetchDataSources } =
    useListDataSourcesQuery();
  const { data: agencyClients = [], isLoading: isLoadingClients } = useListAgencyClientsQuery(
    undefined,
    { skip: !isAgency }
  );

  const [createDataSource, { isLoading: isCreatingDataSource }] = useAddDataSourceMutation();
  const [triggerGetCredentials] = useLazyGetDataSourceCredentialsQuery();
  const [updateCredentials, { isLoading: isSavingCredentials }] =
    useUpdateDataSourceCredentialsMutation();
  const [initiateFacebookOAuth, { isLoading: isInitiatingOAuth }] =
    useInitiateFacebookOAuthMutation();
  const [selectFacebookAdAccount, { isLoading: isSelectingAdAccount }] =
    useSelectFacebookAdAccountMutation();

  const [selectedClientId, setSelectedClientId] = useState(searchParams.get("client") || "");
  const [credentialsByDataSource, setCredentialsByDataSource] = useState<
    Record<number, IntegrationCredential | null>
  >({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDataSourceId, setEditingDataSourceId] = useState<number | null>(null);
  const [form, setForm] = useState<IntegrationFormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [adAccountOptions, setAdAccountOptions] = useState<FacebookAdAccountOption[]>([]);
  const [pendingCredentialId, setPendingCredentialId] = useState<number | null>(null);
  const [pendingDataSourceId, setPendingDataSourceId] = useState<number | null>(null);
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
    if (clientInUrl !== selectedClientId) setSelectedClientId(clientInUrl);
  }, [searchParams, selectedClientId]);

  const visibleDataSources = useMemo(() => {
    if (!isAgency || !selectedClientId) return allDataSources;
    return allDataSources.filter(
      (dataSource) => normalizeValue(dataSource.client_id) === selectedClientId
    );
  }, [allDataSources, isAgency, selectedClientId]);

  const selectedClient = useMemo(
    () => agencyClients.find((client) => String(client.id) === selectedClientId) ?? null,
    [agencyClients, selectedClientId]
  );

  useEffect(() => {
    if (!visibleDataSources.length) return;
    let ignore = false;

    const loadCredentials = async () => {
      const updates: Record<number, IntegrationCredential | null> = {};
      for (const dataSource of visibleDataSources) {
        try {
          updates[dataSource.id] = await triggerGetCredentials(dataSource.id, true).unwrap();
        } catch {
          updates[dataSource.id] = null;
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
          ""
      );
      setFeedback({
        type: "info",
        message:
          callback.message ||
          "Choose the Facebook ad account to finish importing the Meta integration.",
      });
      return;
    }

    setFeedback({
      type: "success",
      message: callback.message || "Facebook connection completed. Imported values are refreshing.",
    });

    if (callback.dataSourceId) {
      triggerGetCredentials(callback.dataSourceId, true)
        .unwrap()
        .then((credential) => {
          setCredentialsByDataSource((current) => ({
            ...current,
            [callback.dataSourceId as number]: credential,
          }));
        })
        .catch(() => undefined);
    }

    refetchDataSources();
  }, [refetchDataSources, searchParams, setSearchParams, triggerGetCredentials]);

  const activeDataSource = editingDataSourceId
    ? visibleDataSources.find((item) => item.id === editingDataSourceId) ?? null
    : null;
  const activeCredential = editingDataSourceId
    ? credentialsByDataSource[editingDataSourceId] ?? null
    : null;
  const showFacebookOAuthCTA = resolveFacebookOAuthAvailability(
    form.source_type,
    activeDataSource,
    activeCredential,
    visibleDataSources
  );

  const handleClientChange = (clientId: string) => {
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
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleStartNew = () => {
    setEditingDataSourceId(null);
    setForm({ ...EMPTY_FORM, client_id: isAgency ? selectedClientId : "" });
    setIsFormOpen(true);
    setFeedback(null);
  };

  const handleEdit = (dataSource: IntegrationDataSource) => {
    setEditingDataSourceId(dataSource.id);
    setForm(buildFormState(dataSource, credentialsByDataSource[dataSource.id]));
    setIsFormOpen(true);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ensureDataSource = async () => {
    if (editingDataSourceId) {
      return {
        id: editingDataSourceId,
        source_type: form.source_type,
        external_id: form.external_id,
        client_id: form.client_id,
      } as IntegrationDataSource;
    }
    const created = await createDataSource({
      client_id: isAgency ? form.client_id || undefined : undefined,
      source_type: form.source_type,
      external_id: form.external_id,
    }).unwrap();
    setEditingDataSourceId(created.id);
    return created;
  };

  const refreshCredentials = async (dataSourceId: number) => {
    try {
      const credential = await triggerGetCredentials(dataSourceId, true).unwrap();
      setCredentialsByDataSource((current) => ({ ...current, [dataSourceId]: credential }));
      return credential;
    } catch {
      setCredentialsByDataSource((current) => ({ ...current, [dataSourceId]: null }));
      return null;
    }
  };

  const handleSaveIntegration = async () => {
    if (isAgency && !form.client_id) {
      setFeedback({ type: "error", message: "Select a client before saving an integration." });
      return;
    }
    try {
      const dataSource = await ensureDataSource();
      const credential = await updateCredentials({
        dataSourceId: dataSource.id,
        body: {
          access_token: form.access_token,
          marketing_access_token: form.marketing_access_token,
          marketing_ad_account_id: form.marketing_ad_account_id,
          api_version: form.api_version,
          business_id: form.business_id,
          test_event_code: form.test_event_code,
        },
      }).unwrap();
      setCredentialsByDataSource((current) => ({ ...current, [dataSource.id]: credential }));
      setForm(buildFormState(dataSource, credential));
      setFeedback({ type: "success", message: "Integration saved." });
      refetchDataSources();
    } catch (error) {
      console.error("Failed to save integration", error);
      setFeedback({
        type: "error",
        message: "The integration could not be saved. Check the values and try again.",
      });
    }
  };

  const handleFacebookConnect = async () => {
    if (isAgency && !form.client_id) {
      setFeedback({ type: "error", message: "Select a client before connecting Facebook." });
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
    } catch (error) {
      console.error("Failed to start Facebook OAuth", error);
      setFeedback({
        type: "error",
        message: "Facebook could not be connected right now. Try again or use manual fields below.",
      });
    }
  };

  const closeAdAccountDialog = () => {
    setPendingCredentialId(null);
    setPendingDataSourceId(null);
    setPendingSelectionToken("");
    setAdAccountOptions([]);
    setSelectedAdAccountId("");
  };

  const handleAdAccountSubmit = async () => {
    if (!pendingCredentialId || !pendingSelectionToken || !selectedAdAccountId) return;
    try {
      await selectFacebookAdAccount({
        credentialId: pendingCredentialId,
        selection_token: pendingSelectionToken,
        selected_ad_account_id: selectedAdAccountId,
      }).unwrap();
      if (pendingDataSourceId) await refreshCredentials(pendingDataSourceId);
      setFeedback({
        type: "success",
        message: "Facebook tokens imported and the ad account was connected.",
      });
      closeAdAccountDialog();
      refetchDataSources();
    } catch (error) {
      console.error("Failed to select Facebook ad account", error);
      setFeedback({
        type: "error",
        message: "The ad account could not be connected. Please try again.",
      });
    }
  };

  const isBusy =
    isCreatingDataSource ||
    isSavingCredentials ||
    isInitiatingOAuth ||
    isSelectingAdAccount ||
    isLoadingDataSources;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            Integrations
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage each client&apos;s platform connection and tokens from one guided screen.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="stretch">
          {isAgency && (
            <TextField
              select
              label="Client"
              value={selectedClientId}
              onChange={(event) => handleClientChange(event.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 320 } }}
              disabled={isLoadingClients}
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
          >
            Add Integration
          </Button>
        </Stack>
      </Stack>

      {isBusy && <LinearProgress />}
      {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

      {isAgency && !isLoadingClients && agencyClients.length === 0 && (
        <Alert severity="info">
          No clients are available yet. Invite a client first before creating integrations.
        </Alert>
      )}

      {isAgency && selectedClient && (
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              Current Client Workspace
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {selectedClient.business_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Only this client&apos;s integration values are shown and editable here.
            </Typography>
          </Stack>
        </Paper>
      )}

      {(isFormOpen || visibleDataSources.length === 0) && (
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {editingDataSourceId ? "Edit Integration" : "Connect a Platform"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  For Meta, start with Facebook connect. Manual token fields are still available if
                  needed.
                </Typography>
              </Box>
              {editingDataSourceId && (
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setEditingDataSourceId(null);
                    setForm({ ...EMPTY_FORM, client_id: isAgency ? selectedClientId : "" });
                  }}
                >
                  Switch To New Integration
                </Button>
              )}
            </Stack>

            <Stack spacing={2}>
              <TextField
                select
                label="Platform"
                name="source_type"
                value={form.source_type}
                onChange={handleFormChange}
                fullWidth
                disabled={Boolean(editingDataSourceId)}
                helperText={editingDataSourceId ? "Platform is fixed after creation." : undefined}
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="External ID"
                name="external_id"
                value={form.external_id}
                onChange={handleFormChange}
                fullWidth
                disabled={Boolean(editingDataSourceId)}
                helperText={
                  editingDataSourceId
                    ? "External ID is set when the datasource is created."
                    : "Use the platform account, pixel, or property ID you want to connect."
                }
              />
            </Stack>

            {showFacebookOAuthCTA && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  borderColor: "primary.main",
                  bgcolor: "rgba(233, 30, 99, 0.04)",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="center">
                    <Chip
                      icon={<FacebookIcon />}
                      label="Recommended"
                      color="primary"
                      variant="filled"
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Connect Facebook & Import Tokens
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    This imports the Meta access values for the selected client and keeps manual
                    entry as a fallback.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SyncAltIcon />}
                    onClick={handleFacebookConnect}
                    disabled={isInitiatingOAuth}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Connect Facebook & Import Tokens
                  </Button>
                </Stack>
              </Paper>
            )}

            <Divider />

            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                Manual Fields
              </Typography>
              <TextField
                label="Access Token"
                name="access_token"
                value={form.access_token}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="Marketing Access Token"
                name="marketing_access_token"
                value={form.marketing_access_token}
                onChange={handleFormChange}
                fullWidth
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveIntegration}
                disabled={isSavingCredentials || isCreatingDataSource}
              >
                {editingDataSourceId ? "Save Changes" : "Save Integration"}
              </Button>
              {isFormOpen && visibleDataSources.length > 0 && (
                <Button variant="outlined" onClick={() => setIsFormOpen(false)}>
                  Hide Form
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>
          Existing Integrations
        </Typography>

        {isLoadingDataSources ? (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography color="text.secondary">Loading integrations...</Typography>
          </Paper>
        ) : visibleDataSources.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="body1" fontWeight={600}>
              No integrations yet for this client.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Start with Meta and use Facebook connect to import tokens automatically.
            </Typography>
          </Paper>
        ) : (
          visibleDataSources.map((dataSource) => {
            const credential = credentialsByDataSource[dataSource.id];
            const oauthAvailable = hasFacebookOAuth(dataSource, credential);
            return (
              <Card key={dataSource.id} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={1.5}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {dataSource.source_type === "meta"
                            ? "Meta"
                            : dataSource.source_type.replace("_", " ")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          External ID: {dataSource.external_id || "Not set"}
                        </Typography>
                      </Box>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        {oauthAvailable && dataSource.source_type === "meta" && (
                          <Chip
                            color="success"
                            icon={<CheckCircleOutlineIcon />}
                            label="Facebook import available"
                          />
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => handleEdit(dataSource)}
                        >
                          Edit
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Box sx={{ minWidth: 220 }}>
                        <Typography variant="caption" color="text.secondary">
                          Access Token
                        </Typography>
                        <Typography variant="body2">{maskValue(credential?.access_token as string)}</Typography>
                      </Box>
                      <Box sx={{ minWidth: 220 }}>
                        <Typography variant="caption" color="text.secondary">
                          Marketing Token
                        </Typography>
                        <Typography variant="body2">
                          {maskValue(credential?.marketing_access_token as string)}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 220 }}>
                        <Typography variant="caption" color="text.secondary">
                          Ad Account ID
                        </Typography>
                        <Typography variant="body2">
                          {normalizeValue(credential?.marketing_ad_account_id) || "Not set"}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 220 }}>
                        <Typography variant="caption" color="text.secondary">
                          API Version
                        </Typography>
                        <Typography variant="body2">
                          {normalizeValue(credential?.api_version) || "Not set"}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 220 }}>
                        <Typography variant="caption" color="text.secondary">
                          Business ID
                        </Typography>
                        <Typography variant="body2">
                          {normalizeValue(credential?.business_id) || "Not set"}
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 220 }}>
                        <Typography variant="caption" color="text.secondary">
                          Test Event Code
                        </Typography>
                        <Typography variant="body2">
                          {normalizeValue(credential?.test_event_code) || "Not set"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      <Dialog
        open={Boolean(pendingCredentialId)}
        onClose={() => {
          if (!isSelectingAdAccount) closeAdAccountDialog();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select Facebook Ad Account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Multiple ad accounts were returned from Facebook. Choose the account to finish this
              client&apos;s Meta connection.
            </Typography>
            <TextField
              select
              label="Ad Account"
              value={selectedAdAccountId}
              onChange={(event) => setSelectedAdAccountId(event.target.value)}
              fullWidth
            >
              {adAccountOptions.map((account) => {
                const optionValue =
                  account.normalized_account_id || account.account_id || account.id;
                return (
                  <MenuItem key={account.id} value={optionValue}>
                    {account.name || account.id} ({optionValue})
                  </MenuItem>
                );
              })}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdAccountDialog} disabled={isSelectingAdAccount}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdAccountSubmit}
            disabled={!pendingSelectionToken || !selectedAdAccountId || isSelectingAdAccount}
          >
            Connect Account
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
