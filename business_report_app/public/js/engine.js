/**
 * 3AE Operational Business Reporting Metric Engine
 * Universal Module Definition (UMD) with Pure Math Parity
 * Supports: Node.js (CommonJS), Browser (<script> / window.ReportEngine), ES Modules.
 */
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node.js CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else {
    // Browser Global
    var engine = factory();
    global.ReportEngine = engine;
    if (typeof window !== 'undefined') {
      window.ReportEngine = engine;
      window.calculateEcom = engine.calculateEcom;
      window.calculateDigital = engine.calculateDigital;
      window.calculateMarCom = engine.calculateMarCom;
      window.calculateCSKH = engine.calculateCSKH;
      window.calculateDivisionOverview = engine.calculateDivisionOverview;
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // ==========================================
  // 1. SAFE MATH & SANITIZATION HELPERS
  // ==========================================

  function parseNum(val, fallback) {
    if (fallback === undefined) fallback = 0;
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'number') return isFinite(val) ? val : fallback;
    if (typeof val === 'string') {
      var cleaned = val.replace(/,/g, '').trim();
      if (cleaned === '') return fallback;
      var parsed = Number(cleaned);
      return isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
  }

  function safeDiv(num, den, fallback) {
    if (fallback === undefined) fallback = 0;
    var n = parseNum(num, 0);
    var d = parseNum(den, 0);
    if (d === 0) return fallback;
    var result = n / d;
    return isFinite(result) ? result : fallback;
  }

  function round(val, decimals) {
    if (decimals === undefined) decimals = 2;
    var num = parseNum(val, 0);
    var factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  function clamp(val, min, max) {
    var num = parseNum(val, min);
    return Math.min(max, Math.max(min, num));
  }

  // ==========================================
  // 2. E-COMMERCE CALCULATIONS
  // ==========================================

  function calculateEcom(records) {
    var emptySummary = {
      total_revenue: 0,
      total_orders: 0,
      total_completed_orders: 0,
      total_cancelled_orders: 0,
      total_traffic: 0,
      cvr: 0,
      aov: 0,
      cancellation_rate: 0,
      channel_breakdown: {}
    };

    if (!Array.isArray(records) || records.length === 0) {
      return emptySummary;
    }

    var totalRevenue = 0;
    var totalOrders = 0;
    var totalCompleted = 0;
    var totalCancelled = 0;
    var totalTraffic = 0;
    var channelMap = {};

    for (var i = 0; i < records.length; i++) {
      var r = records[i] || {};
      var rev = parseNum(r.revenue);
      var ord = parseNum(r.orders !== undefined ? r.orders : r.order_volume);
      var can = parseNum(r.cancelled_orders);
      var comp = parseNum(r.completed_orders !== undefined ? r.completed_orders : (ord - can));
      var traf = parseNum(r.traffic !== undefined ? r.traffic : r.visitors);
      var ch = String(r.channel || 'Other').trim();

      totalRevenue += rev;
      totalOrders += ord;
      totalCancelled += can;
      totalCompleted += comp;
      totalTraffic += traf;

      if (!channelMap[ch]) channelMap[ch] = 0;
      channelMap[ch] += rev;
    }

    // Format channel breakdown
    var channelBreakdown = {};
    for (var key in channelMap) {
      channelBreakdown[key] = round(channelMap[key], 2);
    }

    var cvr = totalTraffic > 0 ? (totalOrders / totalTraffic) * 100 : 0;
    var aov = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    var cancellationRate = totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0;

    return {
      total_revenue: round(totalRevenue, 2),
      total_orders: Math.round(totalOrders),
      total_completed_orders: Math.round(totalCompleted),
      total_cancelled_orders: Math.round(totalCancelled),
      total_traffic: Math.round(totalTraffic),
      cvr: round(cvr, 2),
      aov: round(aov, 2),
      cancellation_rate: round(cancellationRate, 2),
      channel_breakdown: channelBreakdown
    };
  }

  // ==========================================
  // 3. DIGITAL MARKETING CALCULATIONS
  // ==========================================

  function calculateDigital(records) {
    var emptySummary = {
      total_spend: 0,
      total_attributed_revenue: 0,
      roas: 0,
      total_impressions: 0,
      total_clicks: 0,
      ctr: 0,
      cpc: 0,
      cpl: 0,
      total_leads: 0,
      channel_breakdown: {}
    };

    if (!Array.isArray(records) || records.length === 0) {
      return emptySummary;
    }

    var totalSpend = 0;
    var totalAttributedRev = 0;
    var totalImpressions = 0;
    var totalClicks = 0;
    var totalLeads = 0;
    var channelMap = {};

    for (var i = 0; i < records.length; i++) {
      var r = records[i] || {};
      var sp = parseNum(r.spend !== undefined ? r.spend : r.ad_spend);
      var attr = parseNum(r.attributed_revenue);
      var imp = parseNum(r.impressions);
      var clk = parseNum(r.clicks);
      var lds = parseNum(r.leads);
      var ch = String(r.channel || 'Other').trim();

      totalSpend += sp;
      totalAttributedRev += attr;
      totalImpressions += imp;
      totalClicks += clk;
      totalLeads += lds;

      if (!channelMap[ch]) channelMap[ch] = 0;
      channelMap[ch] += sp;
    }

    var channelBreakdown = {};
    for (var key in channelMap) {
      channelBreakdown[key] = round(channelMap[key], 2);
    }

    var roas = totalSpend > 0 ? (totalAttributedRev / totalSpend) : 0;
    var ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    var cpc = totalClicks > 0 ? (totalSpend / totalClicks) : 0;
    var cpl = totalLeads > 0 ? (totalSpend / totalLeads) : 0;

    return {
      total_spend: round(totalSpend, 2),
      total_attributed_revenue: round(totalAttributedRev, 2),
      roas: round(roas, 2),
      total_impressions: Math.round(totalImpressions),
      total_clicks: Math.round(totalClicks),
      ctr: round(ctr, 2),
      cpc: round(cpc, 2),
      cpl: round(cpl, 2),
      total_leads: Math.round(totalLeads),
      channel_breakdown: channelBreakdown
    };
  }

  // ==========================================
  // 4. MARCOM CALCULATIONS
  // ==========================================

  function calculateMarCom(records) {
    var emptySummary = {
      total_reach: 0,
      total_leads: 0,
      avg_milestone: 0,
      avg_sentiment: 0,
      total_budget: 0,
      total_spend: 0,
      budget_utilization: 0,
      active_campaigns: 0,
      completed_campaigns: 0,
      type_breakdown: {}
    };

    if (!Array.isArray(records) || records.length === 0) {
      return emptySummary;
    }

    var totalReach = 0;
    var totalLeads = 0;
    var totalBudget = 0;
    var totalSpend = 0;
    var milestoneSum = 0;
    var sentimentSum = 0;
    var activeCount = 0;
    var completedCount = 0;
    var typeMap = {};

    for (var i = 0; i < records.length; i++) {
      var r = records[i] || {};
      var rch = parseNum(r.reach !== undefined ? r.reach : r.campaign_reach);
      var lds = parseNum(r.leads);
      var bdg = parseNum(r.budget);
      var spd = parseNum(r.spend);
      var status = String(r.status || '').trim();
      var type = String(r.type || 'Other').trim();

      // Normalize milestone (if 0.85 -> 85%)
      var m = parseNum(r.milestone_progress);
      if (m > 0 && m <= 1.0) m = m * 100;
      milestoneSum += clamp(m, 0, 100);

      // Normalize sentiment (if > 5, assume percentage -> scale to 5.0)
      var s = parseNum(r.sentiment_score);
      if (s > 5.0) s = (s / 100) * 5.0;
      sentimentSum += clamp(s, 0, 5.0);

      totalReach += rch;
      totalLeads += lds;
      totalBudget += bdg;
      totalSpend += spd;

      if (status.toLowerCase() === 'active') activeCount++;
      if (status.toLowerCase() === 'completed') completedCount++;

      if (!typeMap[type]) typeMap[type] = 0;
      typeMap[type]++;
    }

    var n = records.length;
    var avgMilestone = n > 0 ? (milestoneSum / n) : 0;
    var avgSentiment = n > 0 ? (sentimentSum / n) : 0;
    var budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

    return {
      total_reach: Math.round(totalReach),
      total_leads: Math.round(totalLeads),
      avg_milestone: round(avgMilestone, 2),
      avg_sentiment: round(avgSentiment, 2),
      total_budget: round(totalBudget, 2),
      total_spend: round(totalSpend, 2),
      budget_utilization: round(budgetUtilization, 2),
      active_campaigns: activeCount,
      completed_campaigns: completedCount,
      type_breakdown: typeMap
    };
  }

  // ==========================================
  // 5. CSKH CALCULATIONS
  // ==========================================

  function calculateCSKH(records) {
    var emptySummary = {
      total_tickets: 0,
      resolved_tickets: 0,
      resolution_rate: 0,
      csat_percentage: 0,
      avg_resolution_time: 0,
      fcr_rate: 0,
      total_escalations: 0,
      channel_breakdown: {}
    };

    if (!Array.isArray(records) || records.length === 0) {
      return emptySummary;
    }

    var totalTickets = 0;
    var resolvedTickets = 0;
    var fcrTickets = 0;
    var totalEscalations = 0;
    var weightedCsatSum = 0;
    var weightedResTimeSum = 0;
    var resolvedTicketsForTime = 0;
    var channelMap = {};

    for (var i = 0; i < records.length; i++) {
      var r = records[i] || {};
      var tCount = parseNum(r.ticket_count !== undefined ? r.ticket_count : r.tickets);
      var rCount = parseNum(r.resolved_count !== undefined ? r.resolved_count : r.resolved_tickets);
      var fCount = parseNum(r.fcr_count);
      var escCount = parseNum(r.escalation_count);
      var resTime = parseNum(r.avg_resolution_time_minutes !== undefined ? r.avg_resolution_time_minutes : r.avg_resolution_time);
      var ch = String(r.channel || 'Other').trim();

      // Normalize CSAT: if <= 5.0 -> percentage = (score / 5) * 100
      var rawCsat = parseNum(r.csat_score);
      var csatPct = rawCsat <= 5.0 && rawCsat > 0 ? (rawCsat / 5.0) * 100 : clamp(rawCsat, 0, 100);

      totalTickets += tCount;
      resolvedTickets += rCount;
      fcrTickets += fCount;
      totalEscalations += escCount;

      weightedCsatSum += (csatPct * tCount);

      if (rCount > 0) {
        weightedResTimeSum += (resTime * rCount);
        resolvedTicketsForTime += rCount;
      }

      if (!channelMap[ch]) channelMap[ch] = 0;
      channelMap[ch] += tCount;
    }

    var resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
    var csatPercentage = totalTickets > 0 ? (weightedCsatSum / totalTickets) : 0;
    var avgResolutionTime = resolvedTicketsForTime > 0 ? (weightedResTimeSum / resolvedTicketsForTime) : 0;
    var fcrRate = totalTickets > 0 ? (fcrTickets / totalTickets) * 100 : 0;

    return {
      total_tickets: Math.round(totalTickets),
      resolved_tickets: Math.round(resolvedTickets),
      resolution_rate: round(resolutionRate, 2),
      csat_percentage: round(csatPercentage, 2),
      avg_resolution_time: round(avgResolutionTime, 2),
      fcr_rate: round(fcrRate, 2),
      total_escalations: Math.round(totalEscalations),
      channel_breakdown: channelMap
    };
  }

  // ==========================================
  // 6. EXECUTIVE DIVISION OVERVIEW & HEALTH SCORE
  // ==========================================

  function calculateDivisionOverview(ecomSum, digSum, marcomSum, cskhSum) {
    var ecom = ecomSum || {};
    var dig = digSum || {};
    var marcom = marcomSum || {};
    var cskh = cskhSum || {};

    var totalRevenue = parseNum(ecom.total_revenue);
    var digitalSpend = parseNum(dig.total_spend);
    var marcomSpend = parseNum(marcom.total_spend);
    var totalMarketingSpend = digitalSpend + marcomSpend;
    var totalLeads = parseNum(dig.total_leads) + parseNum(marcom.total_leads);
    var totalTickets = parseNum(cskh.total_tickets);
    var divisionCsat = parseNum(cskh.csat_percentage);

    // Blended MER = Total Revenue / Total Marketing Spend
    var blendedMer = totalMarketingSpend > 0 ? (totalRevenue / totalMarketingSpend) : 0;

    // Component Sub-Scores (0 to 100)
    // 1. Ecom Component (35%): CVR Benchmark 4.0%, Cancel benchmark < 5%
    var cvrScore = clamp((parseNum(ecom.cvr) / 4.0) * 100, 0, 100);
    var cancelScore = clamp(100 - (parseNum(ecom.cancellation_rate) * 5), 0, 100);
    var sEcom = parseNum(ecom.total_orders) > 0 ? (0.7 * cvrScore + 0.3 * cancelScore) : 0;

    // 2. Digital Component (30%): ROAS Benchmark 5.0x, CTR Benchmark 4.0%
    var roasScore = clamp((parseNum(dig.roas) / 5.0) * 100, 0, 100);
    var ctrScore = clamp((parseNum(dig.ctr) / 4.0) * 100, 0, 100);
    var sDigital = parseNum(dig.total_spend) > 0 ? (0.75 * roasScore + 0.25 * ctrScore) : 0;

    // 3. MarCom Component (20%): Milestone completion & Sentiment
    var milestoneScore = clamp(parseNum(marcom.avg_milestone), 0, 100);
    var sentimentScore = clamp((parseNum(marcom.avg_sentiment) / 5.0) * 100, 0, 100);
    var sMarCom = (parseNum(marcom.total_reach) > 0 || parseNum(marcom.total_budget) > 0)
      ? (0.5 * milestoneScore + 0.5 * sentimentScore)
      : 0;

    // 4. CSKH Component (15%): CSAT, Resolution Rate, FCR
    var csatScore = clamp(parseNum(cskh.csat_percentage), 0, 100);
    var resScore = clamp(parseNum(cskh.resolution_rate), 0, 100);
    var fcrScore = clamp(parseNum(cskh.fcr_rate), 0, 100);
    var sCSKH = parseNum(cskh.total_tickets) > 0
      ? (0.5 * csatScore + 0.3 * resScore + 0.2 * fcrScore)
      : (totalRevenue > 0 ? 100 : 0);

    // Weighted Enterprise Health Score
    var healthScore = (0.35 * sEcom) + (0.30 * sDigital) + (0.20 * sMarCom) + (0.15 * sCSKH);
    healthScore = clamp(healthScore, 0, 100);

    // Descriptive Health Grade
    var healthGrade;
    if (healthScore >= 90.0) {
      healthGrade = "Xuất sắc (Hạng A+)";
    } else if (healthScore >= 80.0) {
      healthGrade = "Tốt (Hạng A)";
    } else if (healthScore >= 70.0) {
      healthGrade = "Khá (Hạng B)";
    } else if (healthScore >= 50.0) {
      healthGrade = "Trung bình (Hạng C)";
    } else if (healthScore > 0) {
      healthGrade = "Cần cải thiện (Hạng D)";
    } else {
      healthGrade = "Chưa có dữ liệu";
    }

    return {
      enterprise_health_score: round(healthScore, 1),
      health_grade: healthGrade,
      total_revenue: round(totalRevenue, 2),
      total_marketing_spend: round(totalMarketingSpend, 2),
      digital_spend: round(digitalSpend, 2),
      marcom_spend: round(marcomSpend, 2),
      blended_mer: round(blendedMer, 2),
      total_leads: Math.round(totalLeads),
      division_csat: round(divisionCsat, 2),
      total_tickets: Math.round(totalTickets),
      department_scores: {
        ecom: round(sEcom, 1),
        digital: round(sDigital, 1),
        marcom: round(sMarCom, 1),
        cskh: round(sCSKH, 1)
      }
    };
  }

  // ==========================================
  // 7. PUBLIC API EXPORT
  // ==========================================

  return {
    calculateEcom: calculateEcom,
    calculateDigital: calculateDigital,
    calculateMarCom: calculateMarCom,
    calculateCSKH: calculateCSKH,
    calculateDivisionOverview: calculateDivisionOverview,
    helpers: {
      parseNum: parseNum,
      safeDiv: safeDiv,
      round: round,
      clamp: clamp
    }
  };
});
