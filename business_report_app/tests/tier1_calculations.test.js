/**
 * tests/tier1_calculations.test.js
 * Tier 1: Mathematical Aggregation & Metric Engine Calculations
 * Validates all pure formulas, volume-weighted ratios, and cross-departmental consolidations.
 * Zero external npm dependencies (node:assert, node:path).
 */

const assert = require('node:assert');
const path = require('node:path');

// Resolve calculation engine
const enginePath = path.resolve(__dirname, '../public/js/engine.js');
const engine = require(enginePath);

const tests = [];
function test(id, name, fn) {
  tests.push({ id, name, fn });
}

// ============================================================================
// E-COMMERCE DEPARTMENT TESTS (T1.01 - T1.06)
// ============================================================================

test('T1.01', 'calculateEcom single record basic math', () => {
  const records = [
    {
      id: 'e1',
      revenue: 100000000,
      order_volume: 500,
      orders: 500,
      visitors: 10000,
      traffic: 10000,
      sessions: 10000,
      cancelled_orders: 25,
      completed_orders: 475,
      channel: 'Shopee'
    }
  ];
  const summary = engine.calculateEcom(records);

  assert.strictEqual(summary.total_revenue, 100000000, 'total_revenue should equal 100,000,000');
  assert.strictEqual(summary.total_orders, 500, 'total_orders should equal 500');
  assert.strictEqual(summary.cvr, 5.00, 'cvr should be (500 / 10000) * 100 = 5.00%');
  assert.strictEqual(summary.aov, 200000, 'aov should be 100,000,000 / 500 = 200,000');
  assert.strictEqual(summary.cancellation_rate, 5.00, 'cancellation_rate should be (25 / 500) * 100 = 5.00%');
  assert.strictEqual(summary.channel_breakdown['Shopee'], 100000000, 'Shopee channel breakdown mismatch');
});

test('T1.02', 'calculateEcom multi-record revenue and order volume sum', () => {
  const records = [
    { revenue: 150000000, orders: 300, order_volume: 300, visitors: 6000, traffic: 6000, cancelled_orders: 15, channel: 'Shopee' },
    { revenue: 80000000, orders: 200, order_volume: 200, visitors: 5000, traffic: 5000, cancelled_orders: 10, channel: 'TikTok Shop' },
    { revenue: 70000000, orders: 100, order_volume: 100, visitors: 4000, traffic: 4000, cancelled_orders: 5, channel: 'Lazada' }
  ];
  const summary = engine.calculateEcom(records);

  assert.strictEqual(summary.total_revenue, 300000000, 'total_revenue should sum to 300,000,000');
  assert.strictEqual(summary.total_orders, 600, 'total_orders should sum to 600');
  assert.strictEqual(summary.total_cancelled_orders, 30, 'cancelled orders should sum to 30');
});

test('T1.03', 'calculateEcom weighted CVR parity vs unweighted average', () => {
  // Day 1: 100 orders / 1,000 visitors = 10.0% CVR
  // Day 2: 100 orders / 9,000 visitors = 1.11% CVR
  // Total: 200 orders / 10,000 visitors = 2.00% CVR (NOT (10 + 1.11) / 2 = 5.56%)
  const records = [
    { revenue: 20000000, orders: 100, order_volume: 100, visitors: 1000, traffic: 1000, cancelled_orders: 0 },
    { revenue: 20000000, orders: 100, order_volume: 100, visitors: 9000, traffic: 9000, cancelled_orders: 0 }
  ];
  const summary = engine.calculateEcom(records);

  assert.strictEqual(summary.cvr, 2.00, 'CVR must be volume-weighted (200 / 10000 * 100 = 2.00%)');
});

test('T1.04', 'calculateEcom Average Order Value (AOV) across heterogeneous baskets', () => {
  const records = [
    { revenue: 50000000, orders: 100, visitors: 1000, traffic: 1000 },
    { revenue: 150000000, orders: 150, visitors: 2000, traffic: 2000 }
  ];
  const summary = engine.calculateEcom(records);

  // Total Revenue = 200,000,000, Total Orders = 250 -> AOV = 800,000
  assert.strictEqual(summary.aov, 800000, 'AOV must equal 200,000,000 / 250 = 800,000');
});

test('T1.05', 'calculateEcom cancellation rate calculation', () => {
  const records = [
    { revenue: 50000000, orders: 400, visitors: 8000, traffic: 8000, cancelled_orders: 24 }
  ];
  const summary = engine.calculateEcom(records);

  assert.strictEqual(summary.cancellation_rate, 6.00, 'Cancellation rate should be (24 / 400) * 100 = 6.00%');
});

test('T1.06', 'calculateEcom channel breakdown aggregation', () => {
  const records = [
    { channel: 'Shopee', revenue: 50000000, orders: 100 },
    { channel: 'Shopee', revenue: 70000000, orders: 120 },
    { channel: 'TikTok Shop', revenue: 40000000, orders: 80 },
    { channel: 'Website', revenue: 30000000, orders: 50 }
  ];
  const summary = engine.calculateEcom(records);

  assert.strictEqual(summary.channel_breakdown['Shopee'], 120000000, 'Shopee total should be 120M');
  assert.strictEqual(summary.channel_breakdown['TikTok Shop'], 40000000, 'TikTok Shop total should be 40M');
  assert.strictEqual(summary.channel_breakdown['Website'], 30000000, 'Website total should be 30M');
});

// ============================================================================
// DIGITAL MARKETING DEPARTMENT TESTS (T1.07 - T1.12)
// ============================================================================

test('T1.07', 'calculateDigital single record basic math', () => {
  const records = [
    {
      id: 'd1',
      ad_spend: 20000000,
      spend: 20000000,
      attributed_revenue: 80000000,
      impressions: 400000,
      clicks: 16000,
      leads: 100,
      channel: 'Facebook Ads'
    }
  ];
  const summary = engine.calculateDigital(records);

  assert.strictEqual(summary.total_spend, 20000000, 'total_spend should be 20,000,000');
  assert.strictEqual(summary.total_attributed_revenue, 80000000, 'total_attributed_revenue should be 80,000,000');
  assert.strictEqual(summary.roas, 4.00, 'roas should be 80M / 20M = 4.00');
  assert.strictEqual(summary.total_impressions, 400000, 'total_impressions should be 400,000');
  assert.strictEqual(summary.total_clicks, 16000, 'total_clicks should be 16,000');
  assert.strictEqual(summary.ctr, 4.00, 'ctr should be (16,000 / 400,000) * 100 = 4.00%');
  assert.strictEqual(summary.cpl, 200000, 'cpl should be 20,000,000 / 100 = 200,000');
  assert.strictEqual(summary.total_leads, 100, 'total_leads should be 100');
});

test('T1.08', 'calculateDigital multi-campaign spend and revenue aggregation', () => {
  const records = [
    { channel: 'Facebook Ads', spend: 40000000, attributed_revenue: 160000000, impressions: 500000, clicks: 20000, leads: 150 },
    { channel: 'Google Ads', spend: 30000000, attributed_revenue: 120000000, impressions: 300000, clicks: 15000, leads: 100 },
    { channel: 'TikTok Ads', spend: 30000000, attributed_revenue: 90000000, impressions: 400000, clicks: 12000, leads: 80 }
  ];
  const summary = engine.calculateDigital(records);

  assert.strictEqual(summary.total_spend, 100000000, 'total_spend should sum to 100,000,000');
  assert.strictEqual(summary.total_attributed_revenue, 370000000, 'total_attributed_revenue should sum to 370,000,000');
  assert.strictEqual(summary.total_impressions, 1200000, 'impressions should sum to 1,200,000');
  assert.strictEqual(summary.total_clicks, 47000, 'clicks should sum to 47,000');
  assert.strictEqual(summary.total_leads, 330, 'leads should sum to 330');
});

test('T1.09', 'calculateDigital weighted ROAS parity vs arithmetic mean', () => {
  // Campaign 1: spend 10M, rev 50M (ROAS = 5.0)
  // Campaign 2: spend 90M, rev 180M (ROAS = 2.0)
  // Total: spend 100M, rev 230M -> ROAS = 2.30 (NOT (5.0 + 2.0) / 2 = 3.50)
  const records = [
    { spend: 10000000, attributed_revenue: 50000000, impressions: 50000, clicks: 2000, leads: 20 },
    { spend: 90000000, attributed_revenue: 180000000, impressions: 450000, clicks: 18000, leads: 180 }
  ];
  const summary = engine.calculateDigital(records);

  assert.strictEqual(summary.roas, 2.30, 'ROAS must be spend-weighted (230M / 100M = 2.30)');
});

test('T1.10', 'calculateDigital Click-Through Rate (CTR) calculation', () => {
  const records = [
    { spend: 10000000, attributed_revenue: 20000000, impressions: 500000, clicks: 12345, leads: 50 }
  ];
  const summary = engine.calculateDigital(records);

  // 12345 / 500000 * 100 = 2.469 -> rounds to 2.47%
  assert.strictEqual(summary.ctr, 2.47, 'CTR should round to 2.47%');
});

test('T1.11', 'calculateDigital Cost Per Lead (CPL) calculation', () => {
  const records = [
    { spend: 75000000, attributed_revenue: 150000000, impressions: 300000, clicks: 10000, leads: 300 }
  ];
  const summary = engine.calculateDigital(records);

  assert.strictEqual(summary.cpl, 250000, 'CPL should be 75,000,000 / 300 = 250,000');
});

test('T1.12', 'calculateDigital alternative key tolerance (spend vs ad_spend)', () => {
  const recordsWithAdSpend = [
    { ad_spend: 15000000, attributed_revenue: 45000000, impressions: 100000, clicks: 3000, leads: 50 }
  ];
  const summary = engine.calculateDigital(recordsWithAdSpend);

  assert.strictEqual(summary.total_spend, 15000000, 'Should parse ad_spend property');
  assert.strictEqual(summary.roas, 3.00, 'ROAS should equal 3.00');
});

// ============================================================================
// MARCOM DEPARTMENT TESTS (T1.13 - T1.17)
// ============================================================================

test('T1.13', 'calculateMarCom single campaign activation basic math', () => {
  const records = [
    {
      id: 'm1',
      campaign_name: 'Brand Awareness Q4',
      reach: 150000,
      campaign_reach: 150000,
      leads: 320,
      milestone_progress: 75,
      sentiment_score: 4.5,
      budget: 50000000,
      spend: 40000000,
      status: 'Active'
    }
  ];
  const summary = engine.calculateMarCom(records);

  assert.strictEqual(summary.total_reach, 150000, 'total_reach should be 150,000');
  assert.strictEqual(summary.total_leads, 320, 'total_leads should be 320');
  assert.strictEqual(summary.avg_milestone, 75.00, 'avg_milestone should be 75.00%');
  assert.strictEqual(summary.avg_sentiment, 4.50, 'avg_sentiment should be 4.50');
  assert.strictEqual(summary.total_budget, 50000000, 'total_budget should be 50,000,000');
  assert.strictEqual(summary.total_spend, 40000000, 'total_spend should be 40,000,000');
  assert.strictEqual(summary.budget_utilization, 80.00, 'budget_utilization should be 80.00%');
});

test('T1.14', 'calculateMarCom multi-campaign reach and lead accumulation', () => {
  const records = [
    { reach: 200000, leads: 400, budget: 30000000, spend: 25000000, milestone_progress: 50, sentiment_score: 4.0 },
    { reach: 350000, leads: 650, budget: 50000000, spend: 45000000, milestone_progress: 80, sentiment_score: 4.5 },
    { reach: 150000, leads: 250, budget: 20000000, spend: 18000000, milestone_progress: 90, sentiment_score: 4.8 }
  ];
  const summary = engine.calculateMarCom(records);

  assert.strictEqual(summary.total_reach, 700000, 'total_reach should sum to 700,000');
  assert.strictEqual(summary.total_leads, 1300, 'total_leads should sum to 1,300');
});

test('T1.15', 'calculateMarCom average milestone progress percentage', () => {
  const records = [
    { reach: 10000, leads: 10, milestone_progress: 100 },
    { reach: 10000, leads: 10, milestone_progress: 60 },
    { reach: 10000, leads: 10, milestone_progress: 80 }
  ];
  const summary = engine.calculateMarCom(records);

  // (100 + 60 + 80) / 3 = 80.00%
  assert.strictEqual(summary.avg_milestone, 80.00, 'avg_milestone should equal 80.00%');
});

test('T1.16', 'calculateMarCom average sentiment score', () => {
  const records = [
    { sentiment_score: 4.5 },
    { sentiment_score: 4.0 },
    { sentiment_score: 5.0 }
  ];
  const summary = engine.calculateMarCom(records);

  // (4.5 + 4.0 + 5.0) / 3 = 4.50
  assert.strictEqual(summary.avg_sentiment, 4.50, 'avg_sentiment should equal 4.50');
});

test('T1.17', 'calculateMarCom budget and actual spend rollups', () => {
  const records = [
    { budget: 100000000, spend: 95000000 },
    { budget: 80000000, spend: 70000000 }
  ];
  const summary = engine.calculateMarCom(records);

  assert.strictEqual(summary.total_budget, 180000000, 'total_budget should be 180,000,000');
  assert.strictEqual(summary.total_spend, 165000000, 'total_spend should be 165,000,000');
});

// ============================================================================
// CUSTOMER SERVICE (CSKH) DEPARTMENT TESTS (T1.18 - T1.22)
// ============================================================================

test('T1.18', 'calculateCSKH single channel service record basic math', () => {
  const records = [
    {
      id: 'cs1',
      ticket_count: 400,
      tickets: 400,
      resolved_count: 380,
      resolved_tickets: 380,
      csat_score: 4.75, // 4.75 / 5 = 95.0%
      avg_resolution_time_minutes: 18.5,
      fcr_count: 340,
      fcr_tickets: 340,
      channel: 'Hotline'
    }
  ];
  const summary = engine.calculateCSKH(records);

  assert.strictEqual(summary.total_tickets, 400, 'total_tickets should be 400');
  assert.strictEqual(summary.resolved_tickets, 380, 'resolved_tickets should be 380');
  assert.strictEqual(summary.csat_percentage, 95.00, 'csat_percentage should be 95.00%');
  assert.strictEqual(summary.avg_resolution_time, 18.50, 'avg_resolution_time should be 18.50 min');
  assert.strictEqual(summary.fcr_rate, 85.00, 'fcr_rate should be (340 / 400) * 100 = 85.00%');
  assert.strictEqual(summary.channel_breakdown['Hotline'], 400, 'Hotline tickets should be 400');
});

test('T1.19', 'calculateCSKH multi-channel ticket volume sum', () => {
  const records = [
    { channel: 'Hotline', ticket_count: 500, resolved_count: 480 },
    { channel: 'Zalo OA', ticket_count: 450, resolved_count: 420 },
    { channel: 'Ecom Chat', ticket_count: 250, resolved_count: 240 }
  ];
  const summary = engine.calculateCSKH(records);

  assert.strictEqual(summary.total_tickets, 1200, 'total_tickets should sum to 1200');
  assert.strictEqual(summary.resolved_tickets, 1140, 'resolved_tickets should sum to 1140');
});

test('T1.20', 'calculateCSKH volume-weighted CSAT score calculation', () => {
  // Small channel: 100 tickets @ 4.0 CSAT (80.0%)
  // Large channel: 900 tickets @ 4.9 CSAT (98.0%)
  // Total tickets = 1,000
  // Weighted CSAT = (100 * 80 + 900 * 98) / 1000 = (8000 + 88200) / 1000 = 96.20%
  // (NOT unweighted (80 + 98) / 2 = 89.0%)
  const records = [
    { ticket_count: 100, csat_score: 4.0 },
    { ticket_count: 900, csat_score: 4.9 }
  ];
  const summary = engine.calculateCSKH(records);

  assert.strictEqual(summary.csat_percentage, 96.20, 'CSAT must be volume-weighted (96.20%)');
});

test('T1.21', 'calculateCSKH weighted average resolution time calculation', () => {
  // Channel 1: 100 resolved tickets @ 12.0 min
  // Channel 2: 400 resolved tickets @ 22.0 min
  // Weighted Avg = (100 * 12 + 400 * 22) / 500 = (1200 + 8800) / 500 = 20.00 min
  const records = [
    { ticket_count: 100, resolved_count: 100, avg_resolution_time_minutes: 12.0 },
    { ticket_count: 400, resolved_count: 400, avg_resolution_time_minutes: 22.0 }
  ];
  const summary = engine.calculateCSKH(records);

  assert.strictEqual(summary.avg_resolution_time, 20.00, 'Resolution time must be weighted across resolved tickets (20.00 min)');
});

test('T1.22', 'calculateCSKH First Contact Resolution (FCR) rate percentage', () => {
  const records = [
    { ticket_count: 300, fcr_count: 270 },
    { ticket_count: 400, fcr_count: 360 },
    { ticket_count: 200, fcr_count: 180 }
  ];
  const summary = engine.calculateCSKH(records);

  // Total FCR = 810, Total Tickets = 900 -> 90.00%
  assert.strictEqual(summary.fcr_rate, 90.00, 'FCR rate should be (810 / 900) * 100 = 90.00%');
});

// ============================================================================
// EXECUTIVE DIVISION OVERVIEW TESTS (T1.23 - T1.28)
// ============================================================================

test('T1.23', 'calculateDivisionOverview consolidated revenue mapping', () => {
  const ecom = { total_revenue: 850000000, total_orders: 1000, cvr: 4.0, cancellation_rate: 2.0 };
  const dig = { total_spend: 100000000, roas: 4.0, ctr: 3.5, total_leads: 200 };
  const marcom = { total_spend: 50000000, total_reach: 200000, total_leads: 300, avg_milestone: 90, avg_sentiment: 4.5 };
  const cskh = { total_tickets: 500, csat_percentage: 95.0, resolution_rate: 96.0, fcr_rate: 85.0 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  assert.strictEqual(overview.total_revenue, 850000000, 'Overview total_revenue should equal Ecom total_revenue');
});

test('T1.24', 'calculateDivisionOverview consolidated marketing expenditure', () => {
  const ecom = { total_revenue: 500000000 };
  const dig = { total_spend: 120000000 };
  const marcom = { total_spend: 80000000 };
  const cskh = { total_tickets: 100 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  // Marketing Spend = 120M + 80M = 200M
  assert.strictEqual(overview.total_marketing_spend, 200000000, 'Marketing spend should equal Digital spend + MarCom spend');
  assert.strictEqual(overview.digital_spend, 120000000, 'Digital spend breakdown should be 120M');
  assert.strictEqual(overview.marcom_spend, 80000000, 'MarCom spend breakdown should be 80M');
});

test('T1.25', 'calculateDivisionOverview Blended Marketing Efficiency Ratio (MER)', () => {
  const ecom = { total_revenue: 1000000000 };
  const dig = { total_spend: 150000000 };
  const marcom = { total_spend: 100000000 };
  const cskh = { total_tickets: 200 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  // Revenue 1B / Spend 250M = 4.00 MER
  assert.strictEqual(overview.blended_mer, 4.00, 'Blended MER should equal 1,000,000,000 / 250,000,000 = 4.00');
});

test('T1.26', 'calculateDivisionOverview cross-department leads aggregation', () => {
  const ecom = { total_revenue: 100000000 };
  const dig = { total_spend: 10000000, total_leads: 450 };
  const marcom = { total_spend: 10000000, total_leads: 550 };
  const cskh = { total_tickets: 50 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  assert.strictEqual(overview.total_leads, 1000, 'Total leads should equal Digital leads (450) + MarCom leads (550) = 1,000');
});

test('T1.27', 'calculateDivisionOverview customer operational rollup', () => {
  const ecom = { total_revenue: 200000000 };
  const dig = { total_spend: 20000000 };
  const marcom = { total_spend: 10000000 };
  const cskh = { total_tickets: 1450, csat_percentage: 94.50 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  assert.strictEqual(overview.division_csat, 94.50, 'Division CSAT should match CSKH csat_percentage');
  assert.strictEqual(overview.total_tickets, 1450, 'Division total_tickets should match CSKH total_tickets');
});

test('T1.28', 'calculateDivisionOverview Enterprise Health Score composite calculation', () => {
  // Optimal benchmarks:
  // Ecom: cvr=4.0%, cancel=0% -> sEcom = 100 (weight 35%)
  // Digital: roas=5.0, ctr=4.0% -> sDigital = 100 (weight 30%)
  // MarCom: milestone=100, sentiment=5.0 -> sMarCom = 100 (weight 20%)
  // CSKH: csat=100, res=100, fcr=100 -> sCSKH = 100 (weight 15%)
  // Health Score = 100.0, Grade = Xuất sắc (Hạng A+)
  const ecom = { total_revenue: 500000000, total_orders: 500, cvr: 4.0, cancellation_rate: 0 };
  const dig = { total_spend: 50000000, roas: 5.0, ctr: 4.0 };
  const marcom = { total_reach: 100000, total_budget: 30000000, avg_milestone: 100, avg_sentiment: 5.0 };
  const cskh = { total_tickets: 200, csat_percentage: 100, resolution_rate: 100, fcr_rate: 100 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  assert.strictEqual(overview.enterprise_health_score, 100.0, 'Enterprise Health Score should be 100.0 for optimal metrics');
  assert.strictEqual(overview.health_grade, 'Xuất sắc (Hạng A+)', 'Health grade should be Xuất sắc (Hạng A+)');
  assert(overview.enterprise_health_score >= 0 && overview.enterprise_health_score <= 100, 'Score must be bounded [0, 100]');
});

// ============================================================================
// MICRO-RUNNER EXECUTION
// ============================================================================

async function run() {
  console.log('--- Tier 1: Mathematical Aggregation Tests ---');
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      t.fn();
      passed++;
      console.log(`  [PASS] ${t.id}: ${t.name}`);
    } catch (err) {
      failed++;
      console.error(`  [FAIL] ${t.id}: ${t.name}`);
      console.error(`         ${err.message}`);
    }
  }

  console.log(`\n# tests ${tests.length}`);
  console.log(`# pass  ${passed}`);
  console.log(`# fail  ${failed}`);
  console.log(`Total: ${tests.length}, Passed: ${passed}, Failed: ${failed}\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  run();
}

module.exports = { tests, run };
