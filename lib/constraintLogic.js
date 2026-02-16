/**
 * constraintLogic.js
 * Deterministic constraint identification for the Sequential Leverage Diagnostic.
 * No AI, no heuristics — pure threshold-based logic.
 */

function computeDerivedMetrics(raw) {
  const monthlyRevenue = Number(raw.monthlyRevenue) || 0;
  const costOfDelivery = Number(raw.costOfDelivery) || 0;
  const fixedExpenses = Number(raw.fixedExpenses) || 0;
  const leadsPerMonth = Number(raw.leadsPerMonth) || 0;
  const dealsClosedPerMonth = Number(raw.dealsClosedPerMonth) || 0;
  const averageDealValue = Number(raw.averageDealValue) || 0;
  const maxCapacityPerMonth = Number(raw.maxCapacityPerMonth) || 1;
  const currentOutputPerMonth = Number(raw.currentOutputPerMonth) || 0;
  const cashOnHand = Number(raw.cashOnHand) || 0;
  const averageDaysToCollect = Number(raw.averageDaysToCollect) || 0;

  const grossMargin = monthlyRevenue > 0
    ? (monthlyRevenue - costOfDelivery) / monthlyRevenue
    : 0;

  const netProfit = monthlyRevenue - costOfDelivery - fixedExpenses;

  const netMargin = monthlyRevenue > 0
    ? netProfit / monthlyRevenue
    : 0;

  const conversionRate = leadsPerMonth > 0
    ? dealsClosedPerMonth / leadsPerMonth
    : 0;

  const capacityUtilization = maxCapacityPerMonth > 0
    ? currentOutputPerMonth / maxCapacityPerMonth
    : 0;

  const monthlyBurn = fixedExpenses + costOfDelivery;

  const runwayMonths = monthlyBurn > 0
    ? cashOnHand / monthlyBurn
    : Infinity;

  return {
    grossMargin,
    netProfit,
    netMargin,
    conversionRate,
    capacityUtilization,
    monthlyBurn,
    runwayMonths,
    averageDaysToCollect
  };
}

function determineConstraint(rawMetrics) {
  const derived = computeDerivedMetrics(rawMetrics);

  let constraint;

  if (derived.runwayMonths < 2 || derived.averageDaysToCollect > 45) {
    constraint = 'Cash Flow';
  } else if (derived.grossMargin < 0.40 || derived.netMargin < 0.10) {
    constraint = 'Margin';
  } else if (derived.capacityUtilization > 0.85) {
    constraint = 'Capacity';
  } else if (derived.conversionRate < 0.20) {
    constraint = 'Conversion';
  } else {
    constraint = 'Lead Volume';
  }

  return { constraint, derived };
}

// Action previews per constraint
const ACTION_PREVIEWS = {
  'Cash Flow': [
    'Shorten payment terms and enforce collection within 30 days',
    'Renegotiate vendor payment schedules to extend payables',
    'Build a 60-day cash reserve before investing in growth'
  ],
  'Margin': [
    'Audit delivery costs and eliminate sub-threshold engagements',
    'Restructure pricing to achieve 50%+ gross margin',
    'Reduce fixed overhead by renegotiating or eliminating non-essential expenses'
  ],
  'Capacity': [
    'Systematize delivery with SOPs to increase throughput without hiring',
    'Identify and eliminate bottleneck tasks consuming the most capacity',
    'Evaluate selective outsourcing for non-core delivery functions'
  ],
  'Conversion': [
    'Audit your sales process for friction points and drop-off stages',
    'Implement a lead qualification framework to focus on high-intent prospects',
    'Defer paid acquisition until conversion rate exceeds 20%'
  ],
  'Lead Volume': [
    'Double down on your highest-converting acquisition channel',
    'Launch a referral or partnership program to generate warm leads',
    'Test one new channel with a 30-day sprint before scaling spend'
  ]
};
