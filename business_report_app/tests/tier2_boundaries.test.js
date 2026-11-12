/**
 * tests/tier2_boundaries.test.js
 * Tier 2: Boundary, Division-by-Zero, Edge Case & Type Safety Tests
 * Validates division-by-zero guards, empty inputs, type coercions, large numbers, and Vietnamese Unicode.
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
// EMPTY STATE GUARDS (T2.01 - T2.05)
// ============================================================================

test('T2.01', 'calculateEcom([]) with empty array returns zeroed schema', () => {
  const summary = engine.calculateEcom([]);
  assert.strictEqual(summary.total_revenue, 0);
  assert.strictEqual(summary.total_orders, 0);
  assert.strictEqual(summary.cvr, 0);
  assert.strictEqual(summary.aov, 0);
  assert.strictEqual(summary.cancellation_rate, 0);
  assert.deepStrictEqual(summary.channel_breakdown, {});
});

test('T2.02', 'calculateDigital([]) with empty array returns zeroed schema', () => {
  const summary = engine.calculateDigital([]);
  assert.strictEqual(summary.total_spend, 0);
  assert.strictEqual(summary.total_attributed_revenue, 0);
  assert.strictEqual(summary.roas, 0);
  assert.strictEqual(summary.total_impressions, 0);
  assert.strictEqual(summary.total_clicks, 0);
  assert.strictEqual(summary.ctr, 0);
  assert.strictEqual(summary.cpl, 0);
  assert.strictEqual(summary.total_leads, 0);
  assert.deepStrictEqual(summary.channel_breakdown, {});
});

test('T2.03', 'calculateMarCom([]) with empty array returns zeroed schema', () => {
  const summary = engine.calculateMarCom([]);
  assert.strictEqual(summary.total_reach, 0);
  assert.strictEqual(summary.total_leads, 0);
  assert.strictEqual(summary.avg_milestone, 0);
  assert.strictEqual(summary.avg_sentiment, 0);
  assert.strictEqual(summary.total_budget, 0);
  assert.strictEqual(summary.total_spend, 0);
  assert.strictEqual(summary.budget_utilization, 0);
});

test('T2.04', 'calculateCSKH([]) with empty array returns zeroed schema', () => {
  const summary = engine.calculateCSKH([]);
  assert.strictEqual(summary.total_tickets, 0);
  assert.strictEqual(summary.resolved_tickets, 0);
  assert.strictEqual(summary.resolution_rate, 0);
  assert.strictEqual(summary.csat_percentage, 0);
  assert.strictEqual(summary.avg_resolution_time, 0);
  assert.strictEqual(summary.fcr_rate, 0);
  assert.deepStrictEqual(summary.channel_breakdown, {});
});

test('T2.05', 'calculateDivisionOverview({}, {}, {}, {}) with empty objects returns zeroed schema', () => {
  const overview = engine.calculateDivisionOverview({}, {}, {}, {});
  assert.strictEqual(overview.enterprise_health_score, 0);
  assert.strictEqual(overview.total_revenue, 0);
  assert.strictEqual(overview.total_marketing_spend, 0);
  assert.strictEqual(overview.blended_mer, 0);
  assert.strictEqual(overview.total_leads, 0);
  assert.strictEqual(overview.division_csat, 0);
  assert.strictEqual(overview.total_tickets, 0);
});

// ============================================================================
// DIVISION-BY-ZERO PROTECTIONS (T2.06 - T2.14)
// ============================================================================

test('T2.06', 'Ecom CVR division-by-zero protection (0 visitors)', () => {
  const records = [{ revenue: 10000000, orders: 5, order_volume: 5, traffic: 0, visitors: 0 }];
  const summary = engine.calculateEcom(records);
  assert.strictEqual(summary.cvr, 0, 'CVR must return 0 instead of Infinity');
  assert(!Number.isNaN(summary.cvr), 'CVR must not be NaN');
});

test('T2.07', 'Ecom AOV and Cancellation Rate division-by-zero protection (0 orders)', () => {
  const records = [{ revenue: 0, orders: 0, order_volume: 0, traffic: 500, visitors: 500, cancelled_orders: 0 }];
  const summary = engine.calculateEcom(records);
  assert.strictEqual(summary.aov, 0, 'AOV must return 0 instead of NaN/Infinity');
  assert.strictEqual(summary.cancellation_rate, 0, 'Cancellation rate must return 0 instead of NaN/Infinity');
});

test('T2.08', 'Digital ROAS division-by-zero protection (0 spend)', () => {
  const records = [{ spend: 0, ad_spend: 0, attributed_revenue: 25000000, impressions: 50000, clicks: 1000, leads: 20 }];
  const summary = engine.calculateDigital(records);
  assert.strictEqual(summary.roas, 0, 'ROAS must return 0 instead of Infinity');
  assert(!Number.isNaN(summary.roas), 'ROAS must not be NaN');
});

test('T2.09', 'Digital CTR division-by-zero protection (0 impressions)', () => {
  const records = [{ spend: 1000000, attributed_revenue: 0, impressions: 0, clicks: 0, leads: 0 }];
  const summary = engine.calculateDigital(records);
  assert.strictEqual(summary.ctr, 0, 'CTR must return 0 instead of NaN/Infinity');
});

test('T2.10', 'Digital CPL division-by-zero protection (0 leads)', () => {
  const records = [{ spend: 15000000, attributed_revenue: 0, impressions: 10000, clicks: 200, leads: 0 }];
  const summary = engine.calculateDigital(records);
  assert.strictEqual(summary.cpl, 0, 'CPL must return 0 instead of Infinity');
});

test('T2.11', 'CSKH Avg Resolution Time division-by-zero protection (0 resolved tickets)', () => {
  const records = [{ ticket_count: 50, resolved_count: 0, csat_score: 4.0, avg_resolution_time_minutes: 0, fcr_count: 0 }];
  const summary = engine.calculateCSKH(records);
  assert.strictEqual(summary.avg_resolution_time, 0, 'Resolution time must return 0 when 0 tickets resolved');
});

test('T2.12', 'CSKH CSAT and FCR division-by-zero protection (0 total tickets)', () => {
  const records = [{ ticket_count: 0, tickets: 0, resolved_count: 0, csat_score: 5.0, avg_resolution_time_minutes: 0, fcr_count: 0 }];
  const summary = engine.calculateCSKH(records);
  assert.strictEqual(summary.csat_percentage, 0, 'CSAT must return 0 instead of NaN');
  assert.strictEqual(summary.fcr_rate, 0, 'FCR must return 0 instead of NaN');
});

test('T2.13', 'Division Overview Blended MER division-by-zero protection (0 marketing spend)', () => {
  const ecom = { total_revenue: 500000000 };
  const dig = { total_spend: 0 };
  const marcom = { total_spend: 0 };
  const cskh = { total_tickets: 100 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  assert.strictEqual(overview.blended_mer, 0, 'Blended MER must return 0 instead of Infinity');
});

test('T2.14', 'Division Overview Health Score with all zero inputs', () => {
  const overview = engine.calculateDivisionOverview({}, {}, {}, {});
  assert.strictEqual(overview.enterprise_health_score, 0, 'Health score must return 0 for blank data');
});

// ============================================================================
// NEGATIVE & ANOMALY VALUE HANDLING (T2.15 - T2.18)
// ============================================================================

test('T2.15', 'Negative revenue handling is non-crashing and safe', () => {
  const records = [{ revenue: -5000000, orders: 10, traffic: 200 }];
  const summary = engine.calculateEcom(records);
  assert(!Number.isNaN(summary.total_revenue), 'Revenue must not be NaN');
  assert.strictEqual(summary.total_revenue, -5000000, 'Sum should handle negative values safely');
});

test('T2.16', 'Negative ad spend handling is non-crashing and safe', () => {
  const records = [{ spend: -1000000, attributed_revenue: 5000000 }];
  const summary = engine.calculateDigital(records);
  assert(!Number.isNaN(summary.total_spend), 'Spend must not be NaN');
});

test('T2.17', 'Anomaly orders > traffic is handled without NaN or crash', () => {
  const records = [{ orders: 150, traffic: 100 }];
  const summary = engine.calculateEcom(records);
  assert(!Number.isNaN(summary.cvr), 'CVR must be a finite number');
  assert.strictEqual(summary.cvr, 150.00, 'CVR calculates mathematically without exception');
});

test('T2.18', 'Anomaly clicks > impressions is handled without NaN or crash', () => {
  const records = [{ clicks: 200, impressions: 100 }];
  const summary = engine.calculateDigital(records);
  assert(!Number.isNaN(summary.ctr), 'CTR must be a finite number');
  assert.strictEqual(summary.ctr, 200.00, 'CTR calculates mathematically without exception');
});

// ============================================================================
// MALFORMED & TYPE SAFETY GUARDS (T2.19 - T2.22)
// ============================================================================

test('T2.19', 'Missing and partial fields handling ([{}]) defaults safely to 0', () => {
  const summary = engine.calculateEcom([{}]);
  assert.strictEqual(summary.total_revenue, 0);
  assert.strictEqual(summary.total_orders, 0);
  assert.strictEqual(summary.cvr, 0);
  assert.strictEqual(summary.aov, 0);
});

test('T2.20', 'Explicit null and undefined field values produce valid numbers, not NaN', () => {
  const records = [{ revenue: null, orders: undefined, order_volume: null, visitors: undefined }];
  const summary = engine.calculateEcom(records);
  assert.strictEqual(summary.total_revenue, 0);
  assert.strictEqual(summary.total_orders, 0);
  assert(!Number.isNaN(summary.total_revenue));
  assert(!Number.isNaN(summary.total_orders));
});

test('T2.21', 'Numeric strings type coercion performs arithmetic sum instead of concatenation', () => {
  const records = [
    { revenue: '50000000', orders: '200', traffic: '5000' },
    { revenue: '25000000', orders: '100', traffic: '2500' }
  ];
  const summary = engine.calculateEcom(records);
  // Must sum: 50,000,000 + 25,000,000 = 75,000,000 (not string "05000000025000000")
  assert.strictEqual(summary.total_revenue, 75000000);
  assert.strictEqual(summary.total_orders, 300);
});

test('T2.22', 'Non-numeric string rejection / fallback defaults cleanly to 0', () => {
  const records = [{ revenue: 'chua_tinh', orders: 'invalid', traffic: 'abc' }];
  const summary = engine.calculateEcom(records);
  assert.strictEqual(summary.total_revenue, 0);
  assert.strictEqual(summary.total_orders, 0);
  assert.strictEqual(summary.cvr, 0);
});

// ============================================================================
// HIGH VALUES, VIETNAMESE UNICODE & PRECISION (T2.23 - T2.27)
// ============================================================================

test('T2.23', 'High currency numbers (100 Billion VND scale) retain exact integer precision', () => {
  // 100 Billion VND per record
  const records = [
    { revenue: 100000000000, orders: 100000 },
    { revenue: 100000000000, orders: 100000 }
  ];
  const summary = engine.calculateEcom(records);
  assert.strictEqual(summary.total_revenue, 200000000000, 'Sum should be exact 200 Billion VND without scientific distortion');
});

test('T2.24', 'Vietnamese diacritics in channel names are preserved in channel_breakdown', () => {
  const records = [
    { channel: 'Shopee - Đồ gia dụng', revenue: 50000000 },
    { channel: 'TikTok Shop - Bếp Thông Minh', revenue: 30000000 }
  ];
  const summary = engine.calculateEcom(records);
  assert.strictEqual(summary.channel_breakdown['Shopee - Đồ gia dụng'], 50000000);
  assert.strictEqual(summary.channel_breakdown['TikTok Shop - Bếp Thông Minh'], 30000000);
});

test('T2.25', 'Vietnamese diacritics in MarCom and CSKH campaigns/channels are preserved', () => {
  const marcom = [{ campaign_name: 'Chiến dịch Nồi chiên không dầu 3AE', reach: 100000, leads: 200, type: 'Truyền thông Mạng xã hội' }];
  const cskh = [{ channel: 'Tổng đài Chăm sóc Khách hàng & Bảo hành', ticket_count: 50 }];

  const mSummary = engine.calculateMarCom(marcom);
  const cSummary = engine.calculateCSKH(cskh);

  assert.strictEqual(mSummary.total_reach, 100000);
  assert.strictEqual(mSummary.type_breakdown['Truyền thông Mạng xã hội'], 1);
  assert.strictEqual(cSummary.channel_breakdown['Tổng đài Chăm sóc Khách hàng & Bảo hành'], 50);
});

test('T2.26', 'Floating point precision rounding to 2 decimal places eliminates binary noise', () => {
  // 1 order out of 3 visitors = 0.3333333333333333... -> 33.33%
  const records = [{ orders: 1, traffic: 3 }];
  const summary = engine.calculateEcom(records);
  assert.strictEqual(summary.cvr, 33.33, 'CVR must round strictly to 33.33');
});

test('T2.27', 'Enterprise Health Score is bounded to maximum 100.0', () => {
  const ecom = { total_orders: 100, cvr: 10.0, cancellation_rate: 0 };
  const dig = { total_spend: 1000, roas: 10.0, ctr: 10.0 };
  const marcom = { total_reach: 1000, avg_milestone: 100, avg_sentiment: 5.0 };
  const cskh = { total_tickets: 1000, csat_percentage: 100, resolution_rate: 100, fcr_rate: 100 };

  const overview = engine.calculateDivisionOverview(ecom, dig, marcom, cskh);
  assert(overview.enterprise_health_score <= 100.0, 'Health score must not exceed 100.0');
});

// ============================================================================
// MICRO-RUNNER EXECUTION
// ============================================================================

async function run() {
  console.log('--- Tier 2: Boundary & Corner Cases Tests ---');
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
