import { describe, expect, it } from "vitest";

import { formatMoney, normalizeRow } from "./CampaignsPage";

describe("campaign table monetary values", () => {
  it.each([
    [20, "$20.00"],
    [5, "$5.00"],
  ])("renders a USD %s budget without scaling", (allocatedBudget, display) => {
    const row = normalizeRow(
      {
        campaign_id: `campaign-${allocatedBudget}`,
        allocated_budget: allocatedBudget,
        daily_budget: allocatedBudget,
        lifetime_budget: allocatedBudget,
        currency: "USD",
      },
      0,
      "campaign",
    );

    expect(row.allocated_budget).toBe(allocatedBudget);
    expect(row.daily_budget).toBe(allocatedBudget);
    expect(row.lifetime_budget).toBe(allocatedBudget);
    expect(formatMoney(row.allocated_budget, row.currency)).toBe(display);
  });

  it("formats monetary fields in the campaign currency without scaling", () => {
    const row = normalizeRow(
      {
        campaign_id: "campaign-eur",
        allocated_budget: 20,
        spend: 12.5,
        cpc: 2.5,
        currency: "EUR",
      },
      0,
      "campaign",
    );

    expect(row.spend).toBe(12.5);
    expect(row.cpc).toBe(2.5);
    expect(formatMoney(row.spend, row.currency)).toBe("€12.50");
    expect(formatMoney(row.cpc, row.currency)).toBe("€2.50");
    expect(formatMoney(5)).toBe("$5.00");
  });
});

describe("campaign table PageViews", () => {
  it("uses Meta pageviews instead of AdFlux site_pageviews", () => {
    const row = normalizeRow(
      {
        campaign_id: "campaign-pageviews",
        pageviews: 42,
        site_pageviews: 999,
        currency: "USD",
      },
      0,
      "campaign",
    );

    expect(row.pageviews).toBe(42);
    expect(row.raw.site_pageviews).toBe(999);
  });
});
