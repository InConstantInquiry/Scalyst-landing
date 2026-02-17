/**
 * constraintLogic.js
 * Deterministic constraint identification for the Sequential Leverage Diagnostic.
 * No AI, no heuristics  pure threshold-based logic.
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

// Action previews per constraint (summary only)
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

// Detailed implementation steps per constraint (gated behind account creation)
const ACTION_DETAILS = {
  'Cash Flow': [
    {
      title: 'Shorten Collection Cycles',
      summary: 'Shorten payment terms and enforce collection within 30 days.',
      steps: [
        'Rewrite all client contracts with Net-15 or Net-30 terms  remove Net-60 entirely',
        'Set up automated invoice reminders at day 1, day 7, and day 14 after invoice date',
        'Offer a 2% early-payment discount for invoices paid within 10 days',
        'Flag accounts over 30 days past due and pause new work until resolved',
        'Review AR aging weekly  escalate anything over 45 days to a direct phone call'
      ],
      metric: 'Average Days to Collect (target: under 30 days)'
    },
    {
      title: 'Extend Payables Strategically',
      summary: 'Renegotiate vendor payment schedules to extend payables.',
      steps: [
        'List all recurring vendor payments and their current terms',
        'Negotiate Net-45 or Net-60 terms with your top 5 vendors by spend',
        'Consolidate vendor payments to two batch dates per month to improve cash predictability',
        'Identify which vendors offer volume discounts and shift spend accordingly'
      ],
      metric: 'Cash Conversion Cycle (target: negative or under 15 days)'
    },
    {
      title: 'Build a Cash Buffer',
      summary: 'Build a 60-day cash reserve before investing in growth.',
      steps: [
        'Calculate your exact 60-day operating cost number (fixed + variable)',
        'Set up a separate reserve account and auto-transfer a fixed % of monthly revenue',
        'Freeze all non-essential discretionary spend until the buffer is funded',
        'Only resume growth investments once the 60-day reserve is fully funded'
      ],
      metric: 'Runway Months (target: 2+ months minimum)'
    }
  ],
  'Margin': [
    {
      title: 'Audit Delivery Economics',
      summary: 'Audit delivery costs and eliminate sub-threshold engagements.',
      steps: [
        'Calculate gross margin per client or engagement  rank from highest to lowest',
        'Flag any engagement under 40% gross margin for renegotiation or exit',
        'Identify hidden delivery costs: scope creep, unbilled hours, tool overhead',
        'Set a minimum gross margin threshold for new deals and enforce it in pricing'
      ],
      metric: 'Gross Margin (target: 50%+)'
    },
    {
      title: 'Restructure Pricing',
      summary: 'Restructure pricing to achieve 50%+ gross margin.',
      steps: [
        'Shift from hourly billing to value-based or fixed-scope pricing',
        'Bundle services into tiered packages with built-in margin protection',
        'Add a pricing floor  no proposal goes out under your minimum margin threshold',
        'Test a 10-15% price increase on new clients and measure close rate impact'
      ],
      metric: 'Average Deal Margin (target: 50%+ gross on new deals)'
    },
    {
      title: 'Cut Fixed Overhead',
      summary: 'Reduce fixed overhead by eliminating non-essential expenses.',
      steps: [
        'Export last 90 days of expenses and categorize as essential vs. discretionary',
        'Cancel or downgrade tools, subscriptions, and services under 3x ROI',
        'Renegotiate rent, insurance, and recurring contracts annually',
        'Set a fixed overhead budget as a percentage of revenue and review monthly'
      ],
      metric: 'Net Margin (target: 15%+)'
    }
  ],
  'Capacity': [
    {
      title: 'Systematize Delivery',
      summary: 'Systematize delivery with SOPs to increase throughput without hiring.',
      steps: [
        'Document your top 5 most-repeated delivery tasks as step-by-step SOPs',
        'Create templates for proposals, onboarding, and deliverables',
        'Implement a project management system with standardized workflows',
        'Measure time-per-deliverable before and after systematization'
      ],
      metric: 'Output per Person (target: 20%+ increase without new hires)'
    },
    {
      title: 'Eliminate Bottlenecks',
      summary: 'Identify and eliminate bottleneck tasks consuming the most capacity.',
      steps: [
        'Track time by task category for 2 weeks to identify where hours concentrate',
        'Identify the single highest-time task and determine if it can be automated or delegated',
        'Remove yourself from any task that does not require your specific expertise',
        'Batch similar tasks into dedicated time blocks instead of context-switching'
      ],
      metric: 'Capacity Utilization (target: 70-80%  above 85% means no room to grow)'
    },
    {
      title: 'Evaluate Selective Outsourcing',
      summary: 'Evaluate selective outsourcing for non-core delivery functions.',
      steps: [
        'List all delivery tasks and classify as core (competitive advantage) vs. non-core',
        'Get quotes for outsourcing 2-3 non-core functions',
        'Run a 30-day pilot with one outsourced function and compare quality + cost',
        'Scale outsourcing only after the pilot proves consistent quality'
      ],
      metric: 'Effective Capacity (target: increase max capacity 25%+ without full-time hires)'
    }
  ],
  'Conversion': [
    {
      title: 'Audit the Sales Process',
      summary: 'Audit your sales process for friction points and drop-off stages.',
      steps: [
        'Map every step from first contact to signed deal  identify where prospects stall',
        'Calculate conversion rate between each stage to find the biggest drop-off',
        'Interview 3-5 recent lost deals to understand why they did not close',
        'Reduce the number of steps between qualified lead and proposal to 2 or fewer',
        'Implement a follow-up cadence  no lead goes more than 48 hours without contact'
      ],
      metric: 'Stage-to-Stage Conversion Rate (target: identify and fix the weakest stage)'
    },
    {
      title: 'Qualify Leads Earlier',
      summary: 'Implement a lead qualification framework to focus on high-intent prospects.',
      steps: [
        'Define your ideal client profile: industry, revenue range, problem type, budget',
        'Create a 3-question qualification script for first contact',
        'Score leads as A/B/C and only invest selling time in A-tier prospects',
        'Set up automatic disqualification criteria to stop wasting time on bad fits'
      ],
      metric: 'Lead-to-Close Rate (target: 20%+)'
    },
    {
      title: 'Defer Paid Acquisition',
      summary: 'Defer paid acquisition until conversion rate exceeds 20%.',
      steps: [
        'Pause all paid lead generation channels immediately',
        'Focus 100% of sales effort on converting your existing pipeline',
        'Fix conversion before adding volume  otherwise you scale waste',
        'Only reactivate paid channels after sustaining 20%+ conversion for 30 days'
      ],
      metric: 'Cost per Acquisition (target: reduce by fixing conversion before scaling spend)'
    }
  ],
  'Lead Volume': [
    {
      title: 'Double Down on Best Channel',
      summary: 'Double down on your highest-converting acquisition channel.',
      steps: [
        'Rank all lead sources by conversion rate and cost per qualified lead',
        'Allocate 70% of marketing budget to your #1 channel',
        'Increase frequency or spend on the top channel by 50% for 30 days',
        'Measure cost per qualified lead weekly  scale only if CPA stays flat or drops'
      ],
      metric: 'Qualified Leads per Month (target: 2x current volume from top channel)'
    },
    {
      title: 'Launch Referral Program',
      summary: 'Launch a referral or partnership program to generate warm leads.',
      steps: [
        'Identify your 10 best clients and ask each for 2 introductions',
        'Create a simple referral incentive: discount, credit, or cash per qualified referral',
        'Partner with 2-3 complementary service providers for mutual referrals',
        'Track referral source on every new lead to measure program ROI'
      ],
      metric: 'Referral Leads per Month (target: 20%+ of total pipeline from referrals)'
    },
    {
      title: 'Test a New Channel',
      summary: 'Test one new channel with a 30-day sprint before scaling spend.',
      steps: [
        'Pick one untested channel based on where your ideal clients spend time',
        'Set a fixed 30-day budget and clear success criteria before starting',
        'Run the sprint  no changes mid-sprint, just collect data',
        'Evaluate at day 30: if CPA is within 2x of your best channel, scale it'
      ],
      metric: 'New Channel CPA vs. Best Channel CPA (target: within 2x to justify scaling)'
    }
  ]
};
