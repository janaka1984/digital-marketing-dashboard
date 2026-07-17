import { describe, expect, it } from "vitest";

import {
  parseAccountPayload,
  readCallbackPayload,
} from "./IntegrationsPage";

describe("Facebook OAuth callback parsing", () => {
  it("parses a successful callback and returned credential metadata", () => {
    const params = new URLSearchParams({
      ok: "true",
      message: "Connected successfully",
      credential_id: "17",
      data_source_id: "23",
      marketing_ad_account_id: "act_123",
      business_id: "456",
    });

    expect(readCallbackPayload(params)).toMatchObject({
      ok: true,
      message: "Connected successfully",
      credentialId: 17,
      dataSourceId: 23,
      marketingAdAccountId: "act_123",
      businessId: "456",
      selectionRequired: false,
    });
  });

  it("parses and decodes a Facebook cancellation error", () => {
    const params = new URLSearchParams(
      "error=Facebook%20authorization%20was%20cancelled",
    );

    expect(readCallbackPayload(params)?.error).toBe(
      "Facebook authorization was cancelled",
    );
  });

  it("parses selection state and ad accounts without double-decoding JSON", () => {
    const accounts = JSON.stringify([
      {
        id: "act_123",
        name: "50% Growth Account",
        normalized_account_id: "act_123",
        business_names: ["Example Business"],
      },
    ]);
    const params = new URLSearchParams({
      selection_required: "true",
      selection_token: "temporary-selection-token",
      credential_id: "17",
      data_source_id: "23",
      available_ad_accounts: accounts,
    });

    expect(readCallbackPayload(params)).toMatchObject({
      selectionRequired: true,
      selectionToken: "temporary-selection-token",
      credentialId: 17,
      dataSourceId: 23,
      adAccounts: [
        {
          id: "act_123",
          name: "50% Growth Account",
          normalized_account_id: "act_123",
          business_names: ["Example Business"],
        },
      ],
    });
  });

  it("returns no callback for an unrelated client query", () => {
    expect(readCallbackPayload(new URLSearchParams("client=9"))).toBeNull();
  });
});

describe("Facebook ad-account parsing", () => {
  it("accepts a legacy doubly encoded account payload", () => {
    const payload = encodeURIComponent(
      JSON.stringify([{ account_id: "act_789", account_name: "Legacy" }]),
    );

    expect(parseAccountPayload(payload)).toEqual([
      {
        id: "act_789",
        name: "Legacy",
        account_id: "act_789",
        normalized_account_id: "act_789",
        sources: [],
        business_ids: [],
        business_names: [],
      },
    ]);
  });
});
