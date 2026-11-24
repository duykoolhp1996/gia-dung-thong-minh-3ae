/**
 * ============================================================================
 * 🤖 HỆ THỐNG ZALO BOT & BÁO CÁO TỰ ĐỘNG 24/7 TRÊN CLOUD (MIỄN PHÍ 100%)
 * ĐƠN VỊ: PHÒNG MARCOM - GIA DỤNG THÔNG MINH 3AE
 * ============================================================================
 * 
 * TÍNH NĂNG:
 * 1. Trực Chat 24/7 trong Nhóm Zalo (Không cần bật máy tính cá nhân).
 * 2. Tự động đọc dữ liệu thời gian thực từ 5 Sheet:
 *    - Quản Lý Task Tổng
 *    - ✍️ Content Calendar
 *    - Quản Lý Graphic Designer
 *    - Quản Lý Video Editor
 *    - 👥 Quản Lý Tài Khoản Nhân Sự
 * 3. Tự động hẹn giờ bắn báo cáo 08:30 sáng mỗi ngày ngay trên máy chủ Google.
 * 4. Hỗ trợ kích hoạt GitHub Actions để render ảnh Infographic 16:9 gửi vào nhóm.
 */

const CONFIG = {
  SPREADSHEET_ID: '1dI_z3TzLBmMgPmRICya6aVyqyw18qdgPitmsw2in5ac',
  BOT_TOKEN: '3153359854443286675:xjllrOtuEwnyHLRibfGqWaQIuOrZfmnPMdjdftkkOZsZlkBnbWfCNHdfUpuGpRbc',
  GROUP_CHAT_ID: 'zgr-323efe35775a9e04c74b',
  PERSONAL_CHAT_ID: 'fe4d0d0d2659cf079648',
  // Tùy chọn: Điền GitHub Repo (vd: "ten-ban/marcom-3ae") và Token nếu muốn gọi GitHub chụp ảnh 16:9
  GITHUB_REPO: '',
  GITHUB_TOKEN: ''
};

const BASE_ZALO_URL = 'https://bot-api.zapps.me/bot' + CONFIG.BOT_TOKEN;

/**
 * 1. HÀM CÀI ĐẶT WEBHOOK TỰ ĐỘNG (Chạy 1 lần sau khi Deploy Web App)
 * Hướng dẫn: Dán URL Web App của bạn vào biến WEB_APP_URL bên dưới rồi bấm Run hàm `kichHoatWebhookOnline()`
 */
const WEB_APP_URL = ''; // Dán link https://script.google.com/macros/s/.../exec vào đây

function kichHoatWebhookOnline() {
  if (!WEB_APP_URL) {
    Logger.log('⚠️ Vui lòng dán link Web App vào biến WEB_APP_URL ở dòng 33 trước khi chạy!');
    return;
  }
  const url = BASE_ZALO_URL + '/setWebhook';
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ url: WEB_APP_URL })
  });
  Logger.log('✅ Kết quả bật Webhook Online 24/7: ' + res.getContentText());
  sendZaloMessage(CONFIG.GROUP_CHAT_ID, '☁️ [CLOUD 24/7 ĐÃ BẬT]: Bot Marcom 3AE đã chuyển sang chạy trực tiếp trên đám mây Google! Không cần bật máy tính vẫn hoạt động 24/24.');
}

/**
 * Hàm tắt Webhook (Khi muốn quay về dùng zalo_gateway.ps1 trên máy tính cá nhân)
 */
function tatWebhookVeMayTinh() {
  const url = BASE_ZALO_URL + '/deleteWebhook';
  const res = UrlFetchApp.fetch(url, { method: 'post' });
  Logger.log('✅ Đã tắt Webhook Cloud để dùng trên máy tính: ' + res.getContentText());
}

/**
 * 2. HÀM CÀI ĐẶT LỊCH TỰ ĐỘNG 08:30 SÁNG HÀNG NGÀY TRÊN GOOGLE CLOUD (MIỄN PHÍ)
 * Chỉ cần bấm chọn hàm `caiDatLichTuDong0830` trên thanh công cụ và nhấn nút "Run" (Chạy) 1 lần duy nhất!
 */
function caiDatLichTuDong0830() {
  // Xóa các trigger cũ để tránh trùng lặp
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Tạo lịch chạy tự động mỗi sáng từ 08:00 - 09:00
  ScriptApp.newTrigger('guiBaoCaoSangTuDong')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .nearMinute(30)
    .inTimezone('Asia/Ho_Chi_Minh')
    .create();

  Logger.log('✅ Đã cài đặt lịch tự động bắn báo cáo 08:30 sáng hàng ngày trên Google Cloud!');
  sendZaloMessage(CONFIG.GROUP_CHAT_ID, '⏰ [ĐÃ HẸN GIỜ CLOUD 08:30]: Hệ thống sẽ tự động báo cáo công việc lúc 08:30 sáng mỗi ngày ngay cả khi tắt máy tính!');
}

/**
 * Hàm tự động chạy lúc 08:30 sáng
 */
function guiBaoCaoSangTuDong() {
  const now = new Date();
  const day = now.getDay(); // 0 = Chủ Nhật
  if (day === 0) return; // Nghỉ Chủ Nhật

  // 1. Gửi bản tin tổng hợp & cá nhân trực tiếp vào Group Zalo
  const fullReport = buildDailyAndPersonalReport('');
  sendZaloMessage(CONFIG.GROUP_CHAT_ID, fullReport);

  // 2. Nếu có cấu hình GitHub Actions thì gọi GitHub chụp ảnh Infographic 16:9 gửi kèm
  triggerGitHubInfographic('daily_all', CONFIG.GROUP_CHAT_ID, '');
}

/**
 * 3. XỬ LÝ TIN NHẮN TƯƠNG TÁC TỪ NHÓM ZALO 24/7 (WEBHOOK POST)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const msg = data.message || (data.result && data.result.message);
    if (!msg || !msg.chat || !msg.chat.id) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    const chatId = String(msg.chat.id);
    const rawText = String(msg.text || '').trim();
    if (!rawText) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    const clean = rawText.toLowerCase();

    // Lệnh Menu / Trợ giúp
    if (clean === 'menu' || clean === 'help' || clean.indexOf('trợ giúp') !== -1 || clean.indexOf('lệnh') !== -1) {
      const menuMsg = [
        '🤖 BOT MARCOM 3AE (CHẾ ĐỘ CLOUD 24/7):',
        '━━━━━━━━━━━━━━━━━━━━',
        '1️⃣ Báo cáo hàng ngày & Cá nhân:',
        '   • Gõ: "hôm nay", "tiến độ", "daily"',
        '2️⃣ Báo cáo riêng từng nhân sự:',
        '   • Gõ: "cá nhân" (Tất cả 4 nhân sự)',
        '   • Gõ: "cá nhân loan" (Graphic Design)',
        '   • Gõ: "cá nhân mỵ" (Content & Kịch bản)',
        '   • Gõ: "cá nhân toàn" (Video Editor)',
        '   • Gõ: "cá nhân phụng" (Kênh & Seeding)',
        '3️⃣ Báo cáo tuần & Quá hạn:',
        '   • Gõ: "tuần" hoặc "quá hạn"',
        '━━━━━━━━━━━━━━━━━━━━',
        '☁️ Hoạt động 24/7 trực tiếp từ Google Sheets 3AE!'
      ].join('\n');
      sendZaloMessage(chatId, menuMsg);
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
    }

    // Lệnh xem riêng từng cá nhân
    if (clean.indexOf('loan') !== -1) {
      sendZaloMessage(chatId, buildPersonalReportFor('Loan'));
      triggerGitHubInfographic('personal_only', chatId, 'Loan');
    } else if (clean.indexOf('mỵ') !== -1 || clean.indexOf('my') !== -1) {
      sendZaloMessage(chatId, buildPersonalReportFor('Mỵ'));
      triggerGitHubInfographic('personal_only', chatId, 'Mỵ');
    } else if (clean.indexOf('toàn') !== -1 || clean.indexOf('toan') !== -1) {
      sendZaloMessage(chatId, buildPersonalReportFor('Toàn'));
      triggerGitHubInfographic('personal_only', chatId, 'Toàn');
    } else if (clean.indexOf('phụng') !== -1 || clean.indexOf('phung') !== -1) {
      sendZaloMessage(chatId, buildPersonalReportFor('Phụng'));
      triggerGitHubInfographic('personal_only', chatId, 'Phụng');
    } else if (clean.indexOf('cá nhân') !== -1 || clean.indexOf('ca nhan') !== -1 || clean.indexOf('từng người') !== -1 || clean.indexOf('mỗi người') !== -1) {
      sendZaloMessage(chatId, buildAllPersonalReports());
      triggerGitHubInfographic('personal_only', chatId, '');
    } else if (clean.indexOf('hôm nay') !== -1 || clean.indexOf('hom nay') !== -1 || clean.indexOf('tiến độ') !== -1 || clean.indexOf('tien do') !== -1 || clean.indexOf('daily') !== -1 || clean.indexOf('báo cáo') !== -1 || clean.indexOf('quá hạn') !== -1 || clean.indexOf('tuần') !== -1) {
      const reportText = buildDailyAndPersonalReport();
      sendZaloMessage(chatId, reportText);
      triggerGitHubInfographic('daily_all', chatId, '');
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Error in doPost: ' + err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 4. API JSON TRỰC TIẾP CHO WEB DASHBOARD ONLINE (GET)
 */
function doGet(e) {
  const allTasks = loadAllNormalizedTasks();
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    updatedAt: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'),
    totalTasks: allTasks.length,
    tasks: allTasks
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * ============================================================================
 * CÁC HÀM ĐỌC DỮ LIỆU GOOGLE SHEETS & TỔNG HỢP BÁO CÁO
 * ============================================================================
 */
function isTaskDone(status) {
  if (!status) return false;
  const s = String(status).toLowerCase();
  return s.indexOf('hoàn thành') !== -1 || s.indexOf('đã duyệt') !== -1 || s.indexOf('đã đăng') !== -1 || s.indexOf('5.') !== -1 || s.indexOf('6.') !== -1 || s.indexOf('8.') !== -1;
}

function parseVnDate(str) {
  if (!str) return null;
  if (str instanceof Date) return str;
  const clean = String(str).trim();
  const parts = clean.split('/');
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function readSheetObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  const list = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (row.every(c => !c || String(c).trim() === '')) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) obj[headers[c].trim()] = row[c] || '';
    }
    list.push(obj);
  }
  return list;
}

function loadAllNormalizedTasks() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const all = [];

  // 1. Task Tổng
  readSheetObjects(ss, 'Quản Lý Task Tổng').forEach(r => {
    const title = r['Tên công việc / Task'] || '';
    if (!title) return;
    const status = r['Trạng thái'] || '';
    const dlStr = r['Hạn chót (Deadline)'] || '';
    const dl = parseVnDate(dlStr);
    const done = isTaskDone(status);
    all.push({
      source: 'Task Tổng',
      title: title,
      assignee: r['Người phụ trách'] || 'Team',
      status: status,
      priority: r['Mức độ ưu tiên'] || '',
      deadlineStr: dlStr,
      deadline: dl,
      isDone: done,
      isOverdue: !done && dl && dl < today,
      isToday: !done && dl && dl.getTime() === today.getTime()
    });
  });

  // 2. Content Calendar
  readSheetObjects(ss, '✍️ Content Calendar').forEach(r => {
    const title = r['Tiêu Đề Bài Viết / Kịch Bản'] || r['Tiêu đề bài viết / Kịch bản'] || '';
    if (!title) return;
    const status = r['Trạng Thái'] || r['Trạng thái'] || '';
    const dlStr = r['Lịch Đăng (Air Date)'] || '';
    const dl = parseVnDate(dlStr);
    const done = isTaskDone(status);
    all.push({
      source: 'Content',
      title: title,
      assignee: r['Người Phụ Trách (PIC)'] || r['Người thực hiện'] || 'Mỵ',
      status: status,
      priority: r['Ưu Tiên'] || '',
      deadlineStr: dlStr,
      deadline: dl,
      isDone: done,
      isOverdue: !done && dl && dl < today,
      isToday: !done && dl && dl.getTime() === today.getTime()
    });
  });

  // 3. Graphic Designer
  readSheetObjects(ss, 'Quản Lý Graphic Designer').forEach(r => {
    const title = r['Tên ấn phẩm / Task Thiết Kế'] || r['Tên ấn phẩm / Task'] || '';
    if (!title) return;
    const status = r['Trạng thái'] || '';
    const dlStr = r['Hạn chót (Deadline)'] || '';
    const dl = parseVnDate(dlStr);
    const done = isTaskDone(status);
    all.push({
      source: 'Design',
      title: title,
      assignee: r['Designer phụ trách'] || r['Người phụ trách'] || 'Loan',
      status: status,
      priority: r['Mức độ ưu tiên'] || '',
      deadlineStr: dlStr,
      deadline: dl,
      isDone: done,
      isOverdue: !done && dl && dl < today,
      isToday: !done && dl && dl.getTime() === today.getTime()
    });
  });

  // 4. Video Editor
  readSheetObjects(ss, 'Quản Lý Video Editor').forEach(r => {
    const title = r['Tên Video / Dự án dựng'] || '';
    if (!title) return;
    const status = r['Trạng thái dựng'] || r['Trạng thái'] || '';
    const dlStr = r['Hạn chót bàn giao (Deadline)'] || r['Hạn chót (Deadline)'] || '';
    const dl = parseVnDate(dlStr);
    const done = isTaskDone(status);
    all.push({
      source: 'Video',
      title: title,
      assignee: r['Editor phụ trách'] || 'Toàn',
      status: status,
      priority: r['Mức độ ưu tiên'] || '',
      deadlineStr: dlStr,
      deadline: dl,
      isDone: done,
      isOverdue: !done && dl && dl < today,
      isToday: !done && dl && dl.getTime() === today.getTime()
    });
  });

  return all;
}

function buildDailyAndPersonalReport() {
  const tasks = loadAllNormalizedTasks();
  const total = tasks.length;
  const doneCount = tasks.filter(t => t.isDone).length;
  const pendingCount = total - doneCount;
  const overdueTasks = tasks.filter(t => t.isOverdue);
  const todayTasks = tasks.filter(t => t.isToday);
  const rate = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');

  const lines = [];
  lines.push('📢 [BÁO CÁO TIẾN ĐỘ & CÁ NHÂN - MARCOM 3AE]');
  lines.push('⏰ Cập nhật Cloud: ' + nowStr);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('📊 1. TỔNG QUAN TOÀN PHÒNG');
  lines.push('• Tổng công việc: ' + total + ' task');
  lines.push('• ✅ Đã hoàn thành: ' + doneCount + ' (' + rate + '%)');
  lines.push('• ⏳ Đang triển khai: ' + pendingCount + ' task');
  lines.push('• 🚨 Quá hạn cần xử lý: ' + overdueTasks.length + ' task');
  lines.push('');

  if (todayTasks.length > 0) {
    lines.push('🎯 2. ĐẦU VIỆC ĐẾN HẠN HÔM NAY (' + todayTasks.length + '):');
    todayTasks.slice(0, 8).forEach(t => {
      lines.push(' • [' + t.source + '] ' + t.title + ' (' + t.assignee + ')');
    });
    lines.push('');
  }

  lines.push('👥 3. TIẾN ĐỘ CHI TIẾT TỪNG CÁ NHÂN:');
  const members = [
    { key: 'Loan', label: '🎨 Loan (Graphic Designer)' },
    { key: 'Mỵ', label: '✍️ Mỵ (Content & Kịch Bản)' },
    { key: 'Toàn', label: '🎬 Toàn (Video Editor)' },
    { key: 'Phụng', label: '📱 Phụng (Kênh & Seeding)' }
  ];

  members.forEach(m => {
    const mTasks = tasks.filter(t => t.assignee.toLowerCase().indexOf(m.key.toLowerCase()) !== -1 || (m.key === 'Toàn' && t.assignee.toLowerCase().indexOf('toan') !== -1));
    const mDone = mTasks.filter(t => t.isDone).length;
    const mPending = mTasks.filter(t => !t.isDone);
    const mOver = mTasks.filter(t => t.isOverdue).length;
    lines.push(m.label + ': Tổng ' + mTasks.length + ' | ✅ Xong: ' + mDone + ' | ⏳ Còn: ' + mPending.length + (mOver > 0 ? ' (🚨 Quá hạn: ' + mOver + ')' : ''));
    mPending.slice(0, 3).forEach(pt => {
      lines.push('   ↳ ' + pt.title + (pt.deadlineStr ? ' [Hạn: ' + pt.deadlineStr + ']' : ''));
    });
  });

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('🔗 Sheet Master: https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID);
  return lines.join('\n');
}

function buildPersonalReportFor(personName) {
  const tasks = loadAllNormalizedTasks();
  const key = personName.toLowerCase();
  const mTasks = tasks.filter(t => {
    const a = t.assignee.toLowerCase();
    return a.indexOf(key) !== -1 || (key === 'toàn' && a.indexOf('toan') !== -1);
  });
  const mDone = mTasks.filter(t => t.isDone).length;
  const mPending = mTasks.filter(t => !t.isDone);
  const mOver = mTasks.filter(t => t.isOverdue);

  const lines = [];
  lines.push('👤 [BÁO CÁO CÁ NHÂN: ' + personName.toUpperCase() + ']');
  lines.push('📊 Tổng: ' + mTasks.length + ' việc | ✅ Xong: ' + mDone + ' | ⏳ Còn lại: ' + mPending.length + ' | 🚨 Quá hạn: ' + mOver.length);
  lines.push('━━━━━━━━━━━━━━━━━━━━');

  if (mOver.length > 0) {
    lines.push('🚨 VIỆC QUÁ HẠN CẦN ƯU TIÊN (' + mOver.length + '):');
    mOver.forEach(t => {
      lines.push(' • [' + t.source + '] ' + t.title + ' (Hạn: ' + t.deadlineStr + ')');
    });
    lines.push('');
  }

  lines.push('⏳ ĐẦU VIỆC ĐANG TRIỂN KHAI (' + mPending.length + '):');
  mPending.slice(0, 12).forEach(t => {
    lines.push(' • [' + t.source + '] ' + t.title + (t.deadlineStr ? ' - Hạn: ' + t.deadlineStr : ''));
  });

  return lines.join('\n');
}

function buildAllPersonalReports() {
  return ['Loan', 'Mỵ', 'Toàn', 'Phụng'].map(p => buildPersonalReportFor(p)).join('\n\n====================\n\n');
}

function sendZaloMessage(chatId, text) {
  const url = BASE_ZALO_URL + '/sendMessage';
  // Chia nhỏ nếu tin nhắn quá 1800 ký tự
  const chunks = [];
  let current = '';
  const rows = text.split('\n');
  for (let i = 0; i < rows.length; i++) {
    if ((current.length + rows[i].length + 2) > 1800) {
      chunks.push(current);
      current = rows[i] + '\n';
    } else {
      current += rows[i] + '\n';
    }
  }
  if (current) chunks.push(current);

  chunks.forEach(chunk => {
    try {
      UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: chatId,
          text: chunk.trim()
        }),
        muteHttpExceptions: true
      });
    } catch (e) {
      Logger.log('Send Zalo error: ' + e);
    }
  });
}

function triggerGitHubInfographic(reportType, chatId, person) {
  if (!CONFIG.GITHUB_REPO || !CONFIG.GITHUB_TOKEN) return;
  try {
    const ghUrl = 'https://api.github.com/repos/' + CONFIG.GITHUB_REPO + '/dispatches';
    UrlFetchApp.fetch(ghUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + CONFIG.GITHUB_TOKEN,
        'Accept': 'application/vnd.github+json'
      },
      payload: JSON.stringify({
        event_type: 'zalo_bot_command',
        client_payload: {
          report_type: reportType,
          chat_id: chatId,
          person: person || ''
        }
      }),
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log('GitHub trigger error: ' + e);
  }
}
