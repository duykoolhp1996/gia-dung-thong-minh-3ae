/**
 * 3AE Operational Business Reporting Application - Node.js REST & Static Server
 * Runtime: Node.js 18+ (Zero External Dependencies)
 * Standard Modules: node:http, node:fs, node:path, node:url
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

// --- Configuration & Paths ---
const PORT = parseInt(process.env.PORT || process.argv[2] || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const BASE_DIR = __dirname;
const PUBLIC_DIR = path.resolve(BASE_DIR, 'public');
const DATA_DIR = path.resolve(BASE_DIR, 'data');
const SEED_FILE = path.join(DATA_DIR, 'seed.json');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const ENGINE_FILE = path.join(PUBLIC_DIR, 'js', 'engine.js');

const VALID_DEPARTMENTS = ['ecom', 'digital', 'marcom', 'cskh'];

// Accurate MIME Types table
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf'
};

// --- Database & Persistence Subsystem ---
function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(SEED_FILE)) {
      try {
        fs.copyFileSync(SEED_FILE, DB_FILE);
      } catch (e) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ ecom: [], digital: [], marcom: [], cskh: [] }, null, 2), 'utf8');
      }
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify({ ecom: [], digital: [], marcom: [], cskh: [] }, null, 2), 'utf8');
    }
  }
}

function readDatabase() {
  ensureDatabase();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    return {
      ecom: Array.isArray(data.ecom) ? data.ecom : [],
      digital: Array.isArray(data.digital) ? data.digital : [],
      marcom: Array.isArray(data.marcom) ? data.marcom : [],
      cskh: Array.isArray(data.cskh) ? data.cskh : []
    };
  } catch (err) {
    console.error('[DB Error] Failed to read database.json:', err.message);
    return { ecom: [], digital: [], marcom: [], cskh: [] };
  }
}

function writeDatabaseAtomic(data) {
  ensureDatabase();
  const tmpFile = path.join(DATA_DIR, `.db_tmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.json`);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(tmpFile, content, 'utf8');
  try {
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    // Windows fallback if destination is temporarily locked
    fs.copyFileSync(tmpFile, DB_FILE);
    try { fs.unlinkSync(tmpFile); } catch (e) {}
  }
}

function resetDatabase() {
  ensureDatabase();
  if (fs.existsSync(SEED_FILE)) {
    const seedContent = fs.readFileSync(SEED_FILE, 'utf8');
    const parsed = JSON.parse(seedContent);
    writeDatabaseAtomic(parsed);
    return true;
  } else {
    writeDatabaseAtomic({ ecom: [], digital: [], marcom: [], cskh: [] });
    return false;
  }
}

// --- Engine Subsystem with Native Fallbacks ---
function getEngine() {
  try {
    delete require.cache[require.resolve(ENGINE_FILE)];
    return require(ENGINE_FILE);
  } catch (err) {
    console.warn('[Engine Warning] Could not require engine.js, using internal fallback:', err.message);
    // Universal fallback calculation engine
    return {
      calculateEcom(records = []) {
        const total_revenue = records.reduce((s, r) => s + (Number(r.revenue) || 0), 0);
        const total_orders = records.reduce((s, r) => s + (Number(r.orders || r.order_volume) || 0), 0);
        const visitors = records.reduce((s, r) => s + (Number(r.traffic || r.visitors) || 0), 0);
        const cancelled = records.reduce((s, r) => s + (Number(r.cancelled_orders) || 0), 0);
        const completed = records.reduce((s, r) => s + (Number(r.completed_orders !== undefined ? r.completed_orders : (r.orders - (r.cancelled_orders || 0))) || 0), 0);
        const cvr = visitors > 0 ? Number(((total_orders / visitors) * 100).toFixed(2)) : 0;
        const aov = total_orders > 0 ? Number((total_revenue / total_orders).toFixed(2)) : 0;
        const cancellation_rate = total_orders > 0 ? Number(((cancelled / total_orders) * 100).toFixed(2)) : 0;
        const channel_breakdown = {};
        records.forEach(r => {
          const ch = r.channel || 'Other';
          channel_breakdown[ch] = (channel_breakdown[ch] || 0) + (Number(r.revenue) || 0);
        });
        return {
          total_revenue,
          total_orders,
          total_completed_orders: completed,
          total_cancelled_orders: cancelled,
          total_traffic: visitors,
          cvr,
          aov,
          cancellation_rate,
          channel_breakdown
        };
      },
      calculateDigital(records = []) {
        const total_spend = records.reduce((s, r) => s + (Number(r.spend || r.ad_spend) || 0), 0);
        const total_attributed_revenue = records.reduce((s, r) => s + (Number(r.attributed_revenue) || 0), 0);
        const total_impressions = records.reduce((s, r) => s + (Number(r.impressions) || 0), 0);
        const total_clicks = records.reduce((s, r) => s + (Number(r.clicks) || 0), 0);
        const total_leads = records.reduce((s, r) => s + (Number(r.leads) || 0), 0);
        const roas = total_spend > 0 ? Number((total_attributed_revenue / total_spend).toFixed(2)) : 0;
        const ctr = total_impressions > 0 ? Number(((total_clicks / total_impressions) * 100).toFixed(2)) : 0;
        const cpc = total_clicks > 0 ? Number((total_spend / total_clicks).toFixed(2)) : 0;
        const cpl = total_leads > 0 ? Number((total_spend / total_leads).toFixed(2)) : 0;
        const channel_breakdown = {};
        records.forEach(r => {
          const ch = r.channel || 'Other';
          channel_breakdown[ch] = (channel_breakdown[ch] || 0) + (Number(r.spend || r.ad_spend) || 0);
        });
        return { total_spend, total_attributed_revenue, roas, total_impressions, total_clicks, ctr, cpc, cpl, total_leads, channel_breakdown };
      },
      calculateMarCom(records = []) {
        const total_reach = records.reduce((s, r) => s + (Number(r.reach || r.campaign_reach) || 0), 0);
        const total_leads = records.reduce((s, r) => s + (Number(r.leads) || 0), 0);
        const total_budget = records.reduce((s, r) => s + (Number(r.budget) || 0), 0);
        const total_spend = records.reduce((s, r) => s + (Number(r.spend) || 0), 0);
        const avg_milestone = records.length > 0 ? Number((records.reduce((s, r) => s + (Number(r.milestone_progress) || 0), 0) / records.length).toFixed(2)) : 0;
        const avg_sentiment = records.length > 0 ? Number((records.reduce((s, r) => s + (Number(r.sentiment_score) || 0), 0) / records.length).toFixed(2)) : 0;
        const budget_utilization = total_budget > 0 ? Number(((total_spend / total_budget) * 100).toFixed(2)) : 0;
        let active_campaigns = 0;
        let completed_campaigns = 0;
        const type_breakdown = {};
        records.forEach(r => {
          const st = String(r.status || '').toLowerCase();
          if (st === 'active') active_campaigns++;
          if (st === 'completed') completed_campaigns++;
          const t = r.type || 'Other';
          type_breakdown[t] = (type_breakdown[t] || 0) + 1;
        });
        return { total_reach, total_leads, avg_milestone, avg_sentiment, total_budget, total_spend, budget_utilization, active_campaigns, completed_campaigns, type_breakdown };
      },
      calculateCSKH(records = []) {
        const total_tickets = records.reduce((s, r) => s + (Number(r.ticket_count || r.tickets) || 0), 0);
        const resolved_tickets = records.reduce((s, r) => s + (Number(r.resolved_count || r.resolved_tickets) || 0), 0);
        const fcr_count = records.reduce((s, r) => s + (Number(r.fcr_count) || 0), 0);
        const total_escalations = records.reduce((s, r) => s + (Number(r.escalation_count) || 0), 0);
        const fcr_rate = total_tickets > 0 ? Number(((fcr_count / total_tickets) * 100).toFixed(2)) : 0;
        const resolution_rate = total_tickets > 0 ? Number(((resolved_tickets / total_tickets) * 100).toFixed(2)) : 0;
        let weightedCsat = 0;
        let weightedResTime = 0;
        let resolvedCountForTime = 0;
        const channel_breakdown = {};
        records.forEach(r => {
          const count = Number(r.ticket_count || r.tickets) || 0;
          const resCount = Number(r.resolved_count || r.resolved_tickets) || 0;
          let rawCsat = Number(r.csat_score) || 0;
          if (rawCsat <= 5.0 && rawCsat > 0) rawCsat = (rawCsat / 5) * 100;
          weightedCsat += rawCsat * count;
          if (resCount > 0) {
            weightedResTime += (Number(r.avg_resolution_time_minutes || r.avg_resolution_time) || 0) * resCount;
            resolvedCountForTime += resCount;
          }
          const ch = r.channel || 'Other';
          channel_breakdown[ch] = (channel_breakdown[ch] || 0) + count;
        });
        const csat_percentage = total_tickets > 0 ? Number((weightedCsat / total_tickets).toFixed(2)) : 0;
        const avg_resolution_time = resolvedCountForTime > 0 ? Number((weightedResTime / resolvedCountForTime).toFixed(2)) : 0;
        return { total_tickets, resolved_tickets, resolution_rate, csat_percentage, avg_resolution_time, fcr_rate, total_escalations, channel_breakdown };
      },
      calculateDivisionOverview(ecom, dig, marcom, cskh) {
        const total_revenue = Number(ecom.total_revenue) || 0;
        const digital_spend = Number(dig.total_spend) || 0;
        const marcom_spend = Number(marcom.total_spend) || 0;
        const total_marketing_spend = digital_spend + marcom_spend;
        const blended_mer = total_marketing_spend > 0 ? Number((total_revenue / total_marketing_spend).toFixed(2)) : 0;
        const total_leads = (Number(dig.total_leads) || 0) + (Number(marcom.total_leads) || 0);
        const division_csat = Number(cskh.csat_percentage) || 0;
        const total_tickets = Number(cskh.total_tickets) || 0;

        const cvrScore = Math.min(100, Math.max(0, ((Number(ecom.cvr) || 0) / 4.0) * 100));
        const cancelScore = Math.min(100, Math.max(0, 100 - ((Number(ecom.cancellation_rate) || 0) * 5)));
        const sEcom = (Number(ecom.total_orders) || 0) > 0 ? (0.7 * cvrScore + 0.3 * cancelScore) : 0;

        const roasScore = Math.min(100, Math.max(0, ((Number(dig.roas) || 0) / 5.0) * 100));
        const ctrScore = Math.min(100, Math.max(0, ((Number(dig.ctr) || 0) / 4.0) * 100));
        const sDigital = (Number(dig.total_spend) || 0) > 0 ? (0.75 * roasScore + 0.25 * ctrScore) : 0;

        const milestoneScore = Math.min(100, Math.max(0, Number(marcom.avg_milestone) || 0));
        const sentimentScore = Math.min(100, Math.max(0, ((Number(marcom.avg_sentiment) || 0) / 5.0) * 100));
        const sMarCom = ((Number(marcom.total_reach) || 0) > 0 || (Number(marcom.total_budget) || 0) > 0)
          ? (0.5 * milestoneScore + 0.5 * sentimentScore) : 0;

        const csatScore = Math.min(100, Math.max(0, division_csat));
        const resScore = Math.min(100, Math.max(0, Number(cskh.resolution_rate) || 0));
        const fcrScore = Math.min(100, Math.max(0, Number(cskh.fcr_rate) || 0));
        const sCSKH = total_tickets > 0 ? (0.5 * csatScore + 0.3 * resScore + 0.2 * fcrScore) : (total_revenue > 0 ? 100 : 0);

        const healthScore = Math.min(100, Math.max(0, (0.35 * sEcom) + (0.30 * sDigital) + (0.20 * sMarCom) + (0.15 * sCSKH)));
        const roundedHealth = Number(healthScore.toFixed(1));

        let healthGrade = 'Chưa có dữ liệu';
        if (roundedHealth >= 90.0) healthGrade = 'Xuất sắc (Hạng A+)';
        else if (roundedHealth >= 80.0) healthGrade = 'Tốt (Hạng A)';
        else if (roundedHealth >= 70.0) healthGrade = 'Khá (Hạng B)';
        else if (roundedHealth >= 50.0) healthGrade = 'Trung bình (Hạng C)';
        else if (roundedHealth > 0) healthGrade = 'Cần cải thiện (Hạng D)';

        return {
          enterprise_health_score: roundedHealth,
          health_grade: healthGrade,
          total_revenue,
          total_marketing_spend,
          digital_spend,
          marcom_spend,
          blended_mer,
          total_leads,
          division_csat,
          total_tickets,
          department_scores: {
            ecom: Number(sEcom.toFixed(1)),
            digital: Number(sDigital.toFixed(1)),
            marcom: Number(sMarCom.toFixed(1)),
            cskh: Number(sCSKH.toFixed(1))
          }
        };
      }
    };
  }
}

// --- Request Helpers ---
function sendJson(res, statusCode, data) {
  const jsonStr = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(jsonStr),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With'
  });
  res.end(jsonStr);
}

function parseJsonBody(req, maxSize = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxSize) {
        req.destroy();
        reject(new Error('Payload Too Large: max 2MB'));
        return;
      }
      body += chunk.toString('utf8');
    });
    req.on('end', () => {
      if (!body || body.trim() === '') {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

// --- Static File Handler with Traversal Guard ---
function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (e) {
    return sendJson(res, 400, { error: 'Bad Request: Malformed URI component' });
  }

  if (decoded.includes('\0')) {
    return sendJson(res, 400, { error: 'Bad Request: Null byte detected' });
  }

  let relPath = decoded.replace(/^[/\\]+/, '');
  if (relPath === '' || relPath.endsWith('/')) {
    relPath = path.join(relPath, 'index.html');
  }

  const safePrefix = PUBLIC_DIR.endsWith(path.sep) ? PUBLIC_DIR : PUBLIC_DIR + path.sep;
  const targetFile = path.resolve(PUBLIC_DIR, relPath);

  // Security check: must reside inside PUBLIC_DIR
  if (!targetFile.startsWith(safePrefix) && targetFile !== PUBLIC_DIR) {
    return sendJson(res, 403, { error: 'Forbidden: Directory traversal denied' });
  }

  fs.stat(targetFile, (err, stats) => {
    if (err || !stats.isFile()) {
      return sendJson(res, 404, { error: 'Not Found', path: pathname });
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff'
    });

    if (req.method === 'HEAD') {
      return res.end();
    }

    const stream = fs.createReadStream(targetFile);
    stream.pipe(res);
    stream.on('error', () => {
      if (!res.headersSent) sendJson(res, 500, { error: 'Internal Server Error' });
    });
  });
}

// --- Main HTTP Server ---
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- API Routing ---
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.substring(5).replace(/\/+$/, '');
    const segments = apiPath.split('/');

    try {
      // 1. GET /api/health
      if (apiPath === 'health' && req.method === 'GET') {
        return sendJson(res, 200, {
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });
      }

      // 2. GET /api/records
      if (apiPath === 'records' && req.method === 'GET') {
        const db = readDatabase();
        return sendJson(res, 200, db);
      }

      // 3. POST /api/records/reset
      if (apiPath === 'records/reset' && req.method === 'POST') {
        resetDatabase();
        return sendJson(res, 200, { success: true, message: 'Reset to seed data' });
      }

      // 4. GET /api/reports/overview
      if (apiPath === 'reports/overview' && req.method === 'GET') {
        const db = readDatabase();
        const eng = getEngine();
        const ecom = eng.calculateEcom(db.ecom);
        const digital = eng.calculateDigital(db.digital);
        const marcom = eng.calculateMarCom(db.marcom);
        const cskh = eng.calculateCSKH(db.cskh);
        const overview = eng.calculateDivisionOverview(ecom, digital, marcom, cskh);
        return sendJson(res, 200, {
          overview,
          departments: { ecom, digital, marcom, cskh }
        });
      }

      // 5. GET /api/reports/:department
      if (segments[0] === 'reports' && segments.length === 2 && req.method === 'GET') {
        const dept = segments[1].toLowerCase();
        if (!VALID_DEPARTMENTS.includes(dept)) {
          return sendJson(res, 400, { error: `Invalid department '${dept}'. Allowed: ${VALID_DEPARTMENTS.join(', ')}` });
        }
        const db = readDatabase();
        const eng = getEngine();
        let summary;
        if (dept === 'ecom') summary = eng.calculateEcom(db.ecom);
        else if (dept === 'digital') summary = eng.calculateDigital(db.digital);
        else if (dept === 'marcom') summary = eng.calculateMarCom(db.marcom);
        else if (dept === 'cskh') summary = eng.calculateCSKH(db.cskh);

        return sendJson(res, 200, { summary, records: db[dept] });
      }

      // 6. POST /api/records/:department
      if (segments[0] === 'records' && segments.length === 2 && req.method === 'POST') {
        const dept = segments[1].toLowerCase();
        if (!VALID_DEPARTMENTS.includes(dept)) {
          return sendJson(res, 400, { error: `Invalid department '${dept}'. Allowed: ${VALID_DEPARTMENTS.join(', ')}` });
        }
        const body = await parseJsonBody(req);
        const record = { ...body };
        if (!record.id) {
          record.id = `${dept}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
        }
        const db = readDatabase();
        db[dept].push(record);
        writeDatabaseAtomic(db);
        return sendJson(res, 201, { success: true, record });
      }

      // 7. PUT /api/records/:department/:id
      if (segments[0] === 'records' && segments.length === 3 && req.method === 'PUT') {
        const dept = segments[1].toLowerCase();
        const recordId = segments[2];
        if (!VALID_DEPARTMENTS.includes(dept)) {
          return sendJson(res, 400, { error: `Invalid department '${dept}'. Allowed: ${VALID_DEPARTMENTS.join(', ')}` });
        }
        const body = await parseJsonBody(req);
        const db = readDatabase();
        const index = db[dept].findIndex(r => String(r.id) === String(recordId));
        if (index === -1) {
          return sendJson(res, 404, { error: `Record with id '${recordId}' not found in department '${dept}'` });
        }
        const updatedRecord = { ...db[dept][index], ...body, id: recordId };
        db[dept][index] = updatedRecord;
        writeDatabaseAtomic(db);
        return sendJson(res, 200, { success: true, record: updatedRecord });
      }

      // 8. DELETE /api/records/:department/:id
      if (segments[0] === 'records' && segments.length === 3 && req.method === 'DELETE') {
        const dept = segments[1].toLowerCase();
        const recordId = segments[2];
        if (!VALID_DEPARTMENTS.includes(dept)) {
          return sendJson(res, 400, { error: `Invalid department '${dept}'. Allowed: ${VALID_DEPARTMENTS.join(', ')}` });
        }
        const db = readDatabase();
        const index = db[dept].findIndex(r => String(r.id) === String(recordId));
        if (index === -1) {
          return sendJson(res, 404, { error: `Record with id '${recordId}' not found in department '${dept}'` });
        }
        db[dept].splice(index, 1);
        writeDatabaseAtomic(db);
        return sendJson(res, 200, { success: true, id: recordId });
      }

      return sendJson(res, 404, { error: 'Not Found', path: pathname });
    } catch (apiErr) {
      console.error('[API Error]:', apiErr);
      return sendJson(res, 500, { error: 'Internal Server Error', message: apiErr.message });
    }
  }

  // --- Static Asset Serving ---
  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res, pathname);
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
});

// Initialize database baseline on start
ensureDatabase();

server.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`  3AE BUSINESS REPORT APPLICATION - NODE.JS REST SERVER`);
  console.log(`  Listening at: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/`);
  console.log(`  Base Directory: ${BASE_DIR}`);
  console.log(`=======================================================`);
});

// Graceful process shutdown
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
