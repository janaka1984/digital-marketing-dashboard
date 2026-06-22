type CampaignStatsRow = {
  name?: string;
  campaign?: string;
  campaign_name?: string;
  spend?: number;
  revenue?: number;
  clicks?: number;
  impressions?: number;
  pageviews?: number;
  purchases?: number;
  recommended_budget?: number;
  allocated_budget?: number;
  recommendation_action?: string;
  budget_recommendation?: string;
};

const toRows = (data: any): CampaignStatsRow[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.campaigns)) return data.campaigns;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const numberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value: number) =>
  (value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const count = (value: number) => Math.round(value || 0).toLocaleString();

const campaignName = (row: CampaignStatsRow) => row.name || row.campaign || row.campaign_name || "Untitled campaign";

const sum = (rows: CampaignStatsRow[], key: keyof CampaignStatsRow) => rows.reduce((total, row) => total + numberValue(row[key]), 0);

const topBy = (rows: CampaignStatsRow[], key: keyof CampaignStatsRow) =>
  [...rows].sort((first, second) => numberValue(second[key]) - numberValue(first[key]))[0];

const budgetValue = (value: unknown) => numberValue(value) / 10;

const recommendationText = (row: CampaignStatsRow) => {
  const budget = budgetValue(row.allocated_budget);
  const recommendation = budgetValue(row.recommended_budget);
  const action = row.recommendation_action || row.budget_recommendation || "";

  if (!recommendation && !budget) return "No budget is currently assigned.";
  if (recommendation > budget) return `Increase from ${money(budget)} to ${money(recommendation)}.`;
  if (recommendation < budget) return `Decrease from ${money(budget)} to ${money(recommendation)}.`;
  return action ? `${action}: keep near ${money(recommendation || budget)}.` : `Keep near ${money(recommendation || budget)}.`;
};

export function buildCampaignInsight(message: string, data: any, range: string) {
  const rows = toRows(data);
  const totals = data?.totals || {};
  const normalized = message.toLowerCase();

  if (!rows.length) {
    return "I do not have campaign statistics loaded yet. Open the Campaigns page or try again after the dashboard data finishes loading.";
  }

  const totalSpend = numberValue(totals.spend) || sum(rows, "spend");
  const totalClicks = numberValue(totals.clicks) || sum(rows, "clicks");
  const totalImpressions = numberValue(totals.impressions) || sum(rows, "impressions");
  const totalPurchases = numberValue(totals.purchases) || sum(rows, "purchases");
  const totalRevenue = numberValue(totals.revenue) || sum(rows, "revenue");

  if (normalized.includes("spend") || normalized.includes("cost")) {
    const top = topBy(rows, "spend");
    return `${range} spend is ${money(totalSpend)}. Highest spend is ${campaignName(top)} with ${money(numberValue(top.spend))}.`;
  }

  if (normalized.includes("click") || normalized.includes("ctr")) {
    const top = topBy(rows, "clicks");
    const ctr = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;
    return `${range} clicks are ${count(totalClicks)} with an overall CTR of ${ctr.toFixed(2)}%. Top click volume is ${campaignName(top)} with ${count(numberValue(top.clicks))} clicks.`;
  }

  if (normalized.includes("purchase") || normalized.includes("revenue") || normalized.includes("roas")) {
    const roas = totalSpend ? totalRevenue / totalSpend : 0;
    return `${range} purchases are ${count(totalPurchases)}, revenue is ${money(totalRevenue)}, and ROAS is ${roas.toFixed(2)}x.`;
  }

  if (normalized.includes("budget") || normalized.includes("recommend")) {
    const recommended = rows
      .filter((row) => row.recommended_budget !== undefined && row.recommended_budget !== null)
      .slice(0, 3)
      .map((row) => `${campaignName(row)}: ${recommendationText(row)}`);

    return recommended.length
      ? `Top budget recommendations:\n${recommended.join("\n")}`
      : "I do not see AI budget recommendations in the loaded campaign data yet.";
  }

  const topSpend = topBy(rows, "spend");
  return `${range} summary: ${count(rows.length)} campaigns, ${money(totalSpend)} spend, ${count(totalClicks)} clicks, ${count(totalPurchases)} purchases, and ${money(totalRevenue)} revenue. Highest spend is ${campaignName(topSpend)}.`;
}
