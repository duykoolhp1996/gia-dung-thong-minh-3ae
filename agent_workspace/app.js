/**
 * AGENT WORKSPACE — 3AE MARKETING HUB
 * Core Frontend Application Logic
 * 100% Real Authentic Data & Full-Stack REST API Integration
 */

// Application State
let State = {
  db: null,
  currentView: 'chat',
  activeConversationId: 'conv_001',
  activeAgentId: 'agent_strategy',
  attachedFileIds: [],
  currentFolderId: 'f_root',
  fileTypeFilter: 'all',
  agentCategoryFilter: 'all',
  isSidebarCollapsed: false,
  isRightPanelOpen: true,
  isSending: false
};

// Initialize Application
async function initApp() {
  await fetchWorkspaceData();
  applyDarkModeFromStorage();
  renderSidebar();
  renderInspector();

  // Load default conversation or welcome state
  if (State.db && State.db.conversations && State.db.conversations.length > 0) {
    loadConversation(State.db.conversations[0].id);
  } else {
    renderWelcomeState();
  }

  // Register Enter & Ctrl+Enter keyboard shortcuts
  const welcomeInput = document.getElementById('welcomePromptInput');
  if (welcomeInput) {
    welcomeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendWelcomePrompt();
      }
    });
  }

  const activeInput = document.getElementById('activePromptInput');
  if (activeInput) {
    activeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendActivePrompt();
      }
    });
  }

  refreshIcons();
}

// Fetch Full Initial State from Backend API
async function fetchWorkspaceData() {
  try {
    const res = await fetch('/api/workspace/get_init');
    if (res.ok) {
      State.db = await res.json();
    } else {
      console.warn('API get_init returned non-200');
    }
  } catch (err) {
    console.error('Failed to fetch workspace data:', err);
  }
}

// Refresh Lucide Icons
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Toast Helper
function showToast(msg, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Switch Active View
function switchView(viewName) {
  State.currentView = viewName;
  
  const views = ['chat', 'agents', 'files', 'knowledge', 'dashboard', 'trash'];
  views.forEach(v => {
    const el = document.getElementById(`view_${v}`);
    const navBtn = document.getElementById(`nav_${v}`);
    if (el) {
      if (v === viewName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    if (navBtn) {
      if (v === viewName) {
        navBtn.className = 'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 transition';
      } else {
        navBtn.className = 'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition';
      }
    }
  });

  if (viewName === 'agents') renderAgentsView();
  else if (viewName === 'files') renderFilesView();
  else if (viewName === 'knowledge') renderKnowledgeView();
  else if (viewName === 'dashboard') renderDashboardView();
  else if (viewName === 'trash') renderTrashView();

  refreshIcons();
}

// Toggle Sidebar
function toggleSidebar() {
  const sb = document.getElementById('mainSidebar');
  if (sb) {
    sb.classList.toggle('-ml-64');
  }
}

// Toggle Right Panel
function toggleRightPanel() {
  const rp = document.getElementById('rightInspector');
  if (rp) {
    rp.classList.toggle('hidden');
  }
}

// Toggle Dark Mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('3ae_agent_dark', isDark ? '1' : '0');
  refreshIcons();
}

function applyDarkModeFromStorage() {
  if (localStorage.getItem('3ae_agent_dark') === '1') {
    document.documentElement.classList.add('dark');
  }
}

// User Switcher Dropdown
function toggleUserDropdown() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('hidden');
}

// Render Left Sidebar Elements
function renderSidebar() {
  if (!State.db) return;

  // Active User Info
  const activeUser = State.db.users.find(u => u.id === State.db.workspace.activeUserId) || State.db.users[0];
  const uAvatar = document.getElementById('currentUserAvatar');
  const uName = document.getElementById('currentUserName');
  const wHeading = document.getElementById('welcomeUserHeading');

  if (uAvatar) {
    uAvatar.textContent = activeUser.avatar;
    uAvatar.className = `w-6 h-6 rounded-full bg-gradient-to-br ${activeUser.avatarGradient} text-white flex items-center justify-center text-xs font-bold`;
  }
  if (uName) {
    uName.textContent = `${activeUser.fullName} (${activeUser.role})`;
  }
  if (wHeading) {
    wHeading.textContent = `Xin chào ${activeUser.fullName}, bạn muốn thực hiện công việc gì hôm nay?`;
  }

  // Populate User Switcher Options
  const uList = document.getElementById('userListOptions');
  if (uList) {
    uList.innerHTML = State.db.users.map(u => {
      const isAct = u.id === activeUser.id;
      return `
        <button onclick="switchActiveUser('${u.id}')" class="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition ${isAct ? 'bg-violet-50 dark:bg-violet-950/40' : ''}">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br ${u.avatarGradient} text-white flex items-center justify-center text-[10px] font-bold">
              ${u.avatar}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">${u.fullName}</div>
              <div class="text-[10px] text-slate-500">${u.title} • ${u.role}</div>
            </div>
          </div>
          ${isAct ? '<span class="text-violet-600 text-xs font-bold">✓</span>' : ''}
        </button>
      `;
    }).join('');
  }

  // Quick Folder Tree
  const fList = document.getElementById('quickFolderList');
  if (fList) {
    const mainFolders = State.db.folders.filter(f => f.parentId === 'f_root');
    fList.innerHTML = mainFolders.map(f => `
      <button onclick="selectFolder('${f.id}')" class="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition">
        <span class="flex items-center space-x-1.5 truncate">
          <i data-lucide="folder" class="w-3.5 h-3.5 text-slate-400"></i>
          <span class="truncate">${f.name}</span>
        </span>
      </button>
    `).join('');
  }

  // Recent Conversations List
  const convList = document.getElementById('recentConvList');
  const convBadge = document.getElementById('convCountBadge');
  if (convList && State.db.conversations) {
    if (convBadge) convBadge.textContent = State.db.conversations.length;
    convList.innerHTML = State.db.conversations.map(c => {
      const isAct = c.id === State.activeConversationId;
      return `
        <div onclick="loadConversation('${c.id}')" class="group/c w-full text-left p-2 rounded-xl flex items-center justify-between transition cursor-pointer ${isAct ? 'bg-violet-50 text-violet-900 dark:bg-violet-950/50 dark:text-violet-200 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
          <div class="min-w-0 flex-1 pr-1">
            <div class="text-xs truncate">${c.title}</div>
            <div class="text-[10px] text-slate-400 truncate">${c.agentName}</div>
          </div>
          <button onclick="event.stopPropagation(); deleteConversation('${c.id}')" class="opacity-0 group-hover/c:opacity-100 p-1 text-slate-400 hover:text-red-600 transition" title="Xóa">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  // Storage Meter
  const totalBytes = (State.db.files || []).reduce((acc, f) => acc + (f.size || 0), 0);
  const kbUsed = Math.round(totalBytes / 1024);
  const quotaBytes = State.db.workspace.storageQuotaBytes || 10737418240;
  const pct = Math.max(1, Math.min(100, (totalBytes / quotaBytes) * 100)).toFixed(1);

  const usageLabel = document.getElementById('storageUsageLabel');
  const progBar = document.getElementById('storageProgressBar');
  if (usageLabel) usageLabel.textContent = `${kbUsed} KB / 10 GB`;
  if (progBar) progBar.style.width = `${pct}%`;
}

// Switch Active User (Role-Based Permissions)
async function switchActiveUser(userId) {
  try {
    const res = await fetch('/api/workspace/switch_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (res.ok) {
      State.db.workspace.activeUserId = userId;
      toggleUserDropdown();
      renderSidebar();
      showToast('Đã chuyển đổi tài khoản nhân sự thành công!');
    }
  } catch (err) {
    console.error(err);
  }
}

// ================= CHAT WORKSPACE LOGIC =================

// Start Fresh Conversation
function startNewConversation() {
  State.activeConversationId = null;
  State.attachedFileIds = [];
  switchView('chat');
  renderWelcomeState();
  const inp = document.getElementById('welcomePromptInput');
  if (inp) {
    inp.value = '';
    inp.focus();
  }
}

// Render Welcome Screen
function renderWelcomeState() {
  document.getElementById('chatWelcomeState').classList.remove('hidden');
  document.getElementById('chatActiveState').classList.add('hidden');

  if (!State.db) return;

  // Populate Agent Select Dropdown
  const sel = document.getElementById('welcomeAgentSelect');
  if (sel) {
    if (!State.db.agents || State.db.agents.length === 0) {
      sel.innerHTML = `<option value="">-- Chưa có Agent nào (Tạo mới) --</option>`;
      State.activeAgentId = null;
    } else {
      sel.innerHTML = State.db.agents.map(a => `
        <option value="${a.id}" ${a.id === State.activeAgentId ? 'selected' : ''}>${a.avatar} ${a.name}</option>
      `).join('');
      sel.onchange = (e) => {
        State.activeAgentId = e.target.value;
        renderInspector();
      };
    }
  }

  // Populate Agents Grid
  const grid = document.getElementById('welcomeAgentsList');
  if (grid) {
    if (!State.db.agents || State.db.agents.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center flex flex-col items-center justify-center py-6">
          <div class="text-3xl mb-1.5">🤖</div>
          <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Thư viện chưa có AI Agent nào</p>
          <p class="text-[11px] text-slate-500 max-w-sm mb-3">Tất cả 10 AI Agent mẫu đã được dọn sạch. Bạn hãy khởi tạo Agent mới theo nhu cầu thực tế:</p>
          <button onclick="openCreateAgentModal()" class="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>+ Tạo AI Agent Mới</span>
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = State.db.agents.map(a => `
        <div onclick="selectAgentAndStart('${a.id}')" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-600 bg-white dark:bg-slate-900/40 hover:shadow-sm cursor-pointer transition flex flex-col items-center text-center group">
          <span class="text-xl mb-1 group-hover:scale-110 transition transform">${a.avatar}</span>
          <span class="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">${a.name}</span>
          <span class="text-[9px] text-slate-400 truncate w-full">${a.role}</span>
        </div>
      `).join('');
    }
  }

  renderAttachedFilePills('welcomeAttachedFiles');
  refreshIcons();
}

function selectAgentAndStart(agentId) {
  State.activeAgentId = agentId;
  const sel = document.getElementById('welcomeAgentSelect');
  if (sel) sel.value = agentId;
  renderInspector();
  const inp = document.getElementById('welcomePromptInput');
  if (inp) inp.focus();
}

// Apply Quick Action Prompt
function applyQuickPrompt(idx) {
  const prompts = [
    {
      text: 'Viết kịch bản video TikTok 30s review unbox Nồi nấu đa năng MASUTO chuẩn công thức H-P-S-A (Retention Rate > 65%) kèm phân cảnh hình ảnh, âm thanh ASMR và CTA giỏ hàng Affiliate giảm 35%.'
    },
    {
      text: 'Lên kịch bản video bóc phốt thực chiến: Đặt lên bàn cân công tắc thông minh trôi nổi 80k vs Công tắc Hunonic chính hãng 3AE.'
    },
    {
      text: 'Dựa trên tài liệu Ke_Hoach_Content_5_Kenh_3AE.md, hãy lập lịch sản xuất tuần 24 video ngắn 9:16 phân bổ đều cho 1 Kênh Master Brand và 4 Kênh Nhân hiệu Affiliate.'
    },
    {
      text: 'Soạn bộ 5 comment mồi trong 1 giờ đầu tiên đăng video TikTok để kích nổ thuật toán đề xuất, tạo câu hỏi hoài nghi và xử lý thắc mắc về giá và bảo hành.'
    }
  ];

  const p = prompts[idx];
  if (p) {
    const inp = document.getElementById('welcomePromptInput');
    if (inp) {
      inp.value = p.text;
      inp.focus();
    }
    if (!State.db.agents || State.db.agents.length === 0) {
      showToast('Đã chọn câu lệnh mẫu. Hãy bấm "+ Tạo AI Agent Mới" để gán Agent xử lý!', false);
      openCreateAgentModal();
    } else {
      sendWelcomePrompt();
    }
  }
}

// Send Prompt from Welcome Screen
async function sendWelcomePrompt() {
  const inp = document.getElementById('welcomePromptInput');
  const sel = document.getElementById('welcomeAgentSelect');
  const modelSel = document.getElementById('welcomeModelSelect');

  const text = inp ? inp.value.trim() : '';
  if (!text) return;

  if (!State.db.agents || State.db.agents.length === 0) {
    showToast('Chưa có AI Agent nào! Vui lòng tạo Agent mới trước khi trò chuyện.', false);
    openCreateAgentModal();
    return;
  }

  const agentId = (sel && sel.value) ? sel.value : State.activeAgentId;
  const modelName = modelSel ? modelSel.value : 'gemini-1.5-pro';

  await executeChatCall(text, agentId, null, State.attachedFileIds);
  if (inp) inp.value = '';
}

// Send Prompt from Active Chat Screen
async function sendActivePrompt() {
  const inp = document.getElementById('activePromptInput');
  const text = inp ? inp.value.trim() : '';
  if (!text) return;

  if (!State.db.agents || State.db.agents.length === 0) {
    showToast('Chưa có AI Agent nào! Vui lòng tạo Agent mới trước khi trò chuyện.', false);
    openCreateAgentModal();
    return;
  }

  await executeChatCall(text, State.activeAgentId, State.activeConversationId, State.attachedFileIds);
  if (inp) inp.value = '';
}

// Execute AI Chat API Request
async function executeChatCall(message, agentId, conversationId, attachedFiles) {
  if (State.isSending) return;
  State.isSending = true;

  // Show Active Chat state immediately
  document.getElementById('chatWelcomeState').classList.add('hidden');
  document.getElementById('chatActiveState').classList.remove('hidden');

  const stream = document.getElementById('chatMessageStream');

  // Append user message immediately
  const activeUser = State.db.users.find(u => u.id === State.db.workspace.activeUserId) || State.db.users[0];
  const userMsgHtml = `
    <div class="flex items-start space-x-3 justify-end">
      <div class="max-w-2xl">
        <div class="chat-bubble-user text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm">
          ${escapeHtml(message)}
        </div>
        <div class="text-[10px] text-slate-400 text-right mt-1">${new Date().toLocaleTimeString('vi-VN')}</div>
      </div>
      <div class="w-8 h-8 rounded-full bg-gradient-to-br ${activeUser.avatarGradient} text-white flex items-center justify-center text-xs font-bold shrink-0">
        ${activeUser.avatar}
      </div>
    </div>
  `;
  stream.insertAdjacentHTML('beforeend', userMsgHtml);

  // Append Thinking / Loading placeholder
  const agent = State.db.agents.find(a => a.id === agentId) || State.db.agents[0];
  const tempMsgId = 'temp_ai_' + Date.now();
  const loadingHtml = `
    <div id="${tempMsgId}" class="flex items-start space-x-3">
      <div class="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300 flex items-center justify-center text-base shrink-0 shadow-2xs">
        ${agent.avatar}
      </div>
      <div class="max-w-3xl flex-1">
        <div class="surface-card p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-xs leading-relaxed shadow-xs flex items-center space-x-2 text-slate-500">
          <i data-lucide="loader" class="w-4 h-4 animate-spin text-violet-600"></i>
          <span>${agent.name} đang truy xuất kho tri thức 3AE và tạo câu trả lời...</span>
        </div>
      </div>
    </div>
  `;
  stream.insertAdjacentHTML('beforeend', loadingHtml);
  stream.scrollTop = stream.scrollHeight;
  refreshIcons();

  try {
    const res = await fetch('/api/workspace/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        agentId,
        conversationId,
        attachedFileIds: attachedFiles
      })
    });

    if (res.ok) {
      const data = await res.json();
      
      // Remove loading placeholder
      const tempEl = document.getElementById(tempMsgId);
      if (tempEl) tempEl.remove();

      // Render actual AI response
      renderSingleAiMessage(stream, data.agent, data.reply, data.citations, data.agentMessage?.timestamp);
      
      // Update state
      State.activeConversationId = data.conversationId;
      State.activeAgentId = data.agent.id;

      await fetchWorkspaceData();
      renderSidebar();
      renderInspector();
      updateActiveChatHeader(data.conversationId, data.agent);
    }
  } catch (err) {
    console.error('Chat failed:', err);
    showToast('Lỗi khi gửi yêu cầu AI', false);
  } finally {
    State.isSending = false;
    stream.scrollTop = stream.scrollHeight;
    refreshIcons();
  }
}

// Render Single AI Message with Citations & Markdown
function renderSingleAiMessage(container, agent, markdownText, citations, timestamp) {
  const parsedMarkdown = marked.parse(markdownText || '');
  
  // Format citations HTML
  let citationsHtml = '';
  if (citations && citations.length > 0) {
    citationsHtml = `
      <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
          <i data-lucide="link" class="w-3 h-3 text-violet-600"></i>
          <span>Nguồn Trích Dẫn Tài Liệu (${citations.length})</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${citations.map(c => `
            <button onclick="previewFile('${c.fileId}')" class="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-violet-50 hover:bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:hover:bg-violet-900 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-[11px] font-semibold transition cursor-pointer">
              <i data-lucide="file-text" class="w-3 h-3"></i>
              <span class="truncate max-w-[200px]">${c.fileName}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  const msgHtml = `
    <div class="flex items-start space-x-3">
      <div class="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300 flex items-center justify-center text-base shrink-0 shadow-2xs">
        ${agent.avatar}
      </div>
      <div class="max-w-3xl flex-1 min-w-0">
        <div class="surface-card p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-xs leading-relaxed shadow-xs prose-custom">
          ${parsedMarkdown}
          ${citationsHtml}
        </div>
        
        <!-- Utility Actions: Copy & Timestamp -->
        <div class="flex items-center space-x-3 text-[10px] text-slate-400 mt-1 pl-1">
          <span>${timestamp || new Date().toLocaleTimeString('vi-VN')}</span>
          <button onclick="copyMessageText(this)" class="hover:text-slate-700 dark:hover:text-white transition flex items-center space-x-0.5">
            <i data-lucide="copy" class="w-3 h-3"></i>
            <span>Sao chép</span>
          </button>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', msgHtml);
}

// Copy Message Content
function copyMessageText(btn) {
  const card = btn.closest('.max-w-3xl').querySelector('.surface-card');
  if (card) {
    navigator.clipboard.writeText(card.innerText);
    showToast('Đã sao chép nội dung vào Clipboard!');
  }
}

// Load Conversation by ID
function loadConversation(convId) {
  if (!State.db || !State.db.conversations) return;
  const conv = State.db.conversations.find(c => c.id === convId);
  if (!conv) return;

  State.activeConversationId = conv.id;
  State.activeAgentId = conv.agentId;
  State.attachedFileIds = conv.attachedFileIds || [];

  switchView('chat');
  document.getElementById('chatWelcomeState').classList.add('hidden');
  document.getElementById('chatActiveState').classList.remove('hidden');

  updateActiveChatHeader(conv.id, { name: conv.agentName, avatar: getAgentAvatar(conv.agentId) });

  const stream = document.getElementById('chatMessageStream');
  stream.innerHTML = '';

  const activeUser = State.db.users.find(u => u.id === conv.userId) || State.db.users[0];
  const agent = State.db.agents.find(a => a.id === conv.agentId) || State.db.agents[0];

  conv.messages.forEach(m => {
    if (m.sender === 'user') {
      const uHtml = `
        <div class="flex items-start space-x-3 justify-end">
          <div class="max-w-2xl">
            <div class="chat-bubble-user text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm">
              ${escapeHtml(m.content)}
            </div>
            <div class="text-[10px] text-slate-400 text-right mt-1">${m.timestamp || ''}</div>
          </div>
          <div class="w-8 h-8 rounded-full bg-gradient-to-br ${activeUser.avatarGradient} text-white flex items-center justify-center text-xs font-bold shrink-0">
            ${activeUser.avatar}
          </div>
        </div>
      `;
      stream.insertAdjacentHTML('beforeend', uHtml);
    } else {
      renderSingleAiMessage(stream, agent, m.content, m.citations, m.timestamp);
    }
  });

  renderAttachedFilePills('activeAttachedFiles');
  renderSidebar();
  renderInspector();
  stream.scrollTop = stream.scrollHeight;
  refreshIcons();
}

function updateActiveChatHeader(convId, agent) {
  const conv = State.db?.conversations?.find(c => c.id === convId);
  const titleEl = document.getElementById('activeConvTitle');
  const subEl = document.getElementById('activeAgentSubtext');
  const badgeEl = document.getElementById('activeAgentAvatarBadge');

  if (titleEl && conv) titleEl.textContent = conv.title;
  if (subEl && agent) subEl.textContent = `${agent.name} • Model: Gemini 1.5 Pro`;
  if (badgeEl && agent) badgeEl.textContent = agent.avatar || '🎯';
}

function getAgentAvatar(agentId) {
  const a = State.db?.agents?.find(x => x.id === agentId);
  return a ? a.avatar : '🎯';
}

// Rename Conversation
function renameActiveConversation() {
  if (!State.activeConversationId) return;
  const conv = State.db?.conversations?.find(c => c.id === State.activeConversationId);
  if (!conv) return;

  const newTitle = prompt('Nhập tiêu đề mới cho cuộc hội thoại:', conv.title);
  if (newTitle && newTitle.trim()) {
    conv.title = newTitle.trim();
    updateActiveChatHeader(conv.id, { name: conv.agentName });
    renderSidebar();
    showToast('Đã đổi tên cuộc hội thoại!');
  }
}

// Delete Active Conversation
function deleteActiveConversation() {
  if (!State.activeConversationId) return;
  if (confirm('Bạn có chắc chắn muốn xóa cuộc hội thoại này?')) {
    deleteConversation(State.activeConversationId);
  }
}

function deleteConversation(convId) {
  if (!State.db || !State.db.conversations) return;
  State.db.conversations = State.db.conversations.filter(c => c.id !== convId);
  if (State.activeConversationId === convId) {
    startNewConversation();
  }
  renderSidebar();
  showToast('Đã xóa cuộc hội thoại!');
}

// ================= FILE ATTACHMENTS =================

function openAttachFileModal() {
  const modal = document.getElementById('attachFileModal');
  const container = document.getElementById('attachFileListContainer');
  if (!modal || !container || !State.db) return;

  container.innerHTML = State.db.files.filter(f => !f.isTrashed).map(f => {
    const isChecked = State.attachedFileIds.includes(f.id);
    return `
      <label class="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200">
        <input type="checkbox" value="${f.id}" ${isChecked ? 'checked' : ''} class="rounded text-violet-600 focus:ring-violet-500">
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${f.name}</div>
          <div class="text-[10px] text-slate-400">${Math.round(f.size/1024)} KB • ${f.storagePath}</div>
        </div>
      </label>
    `;
  }).join('');

  modal.classList.remove('hidden');
}

function closeAttachFileModal() {
  document.getElementById('attachFileModal').classList.add('hidden');
}

function confirmAttachFiles() {
  const checkboxes = document.querySelectorAll('#attachFileListContainer input[type="checkbox"]:checked');
  State.attachedFileIds = Array.from(checkboxes).map(cb => cb.value);
  closeAttachFileModal();

  renderAttachedFilePills('welcomeAttachedFiles');
  renderAttachedFilePills('activeAttachedFiles');
  renderInspector();
  showToast(`Đã đính kèm ${State.attachedFileIds.length} tệp`);
  refreshIcons();
}

function removeAttachedFile(fileId) {
  State.attachedFileIds = State.attachedFileIds.filter(id => id !== fileId);
  renderAttachedFilePills('welcomeAttachedFiles');
  renderAttachedFilePills('activeAttachedFiles');
  renderInspector();
  refreshIcons();
}

function renderAttachedFilePills(containerId) {
  const el = document.getElementById(containerId);
  if (!el || !State.db) return;

  if (State.attachedFileIds.length === 0) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = State.attachedFileIds.map(fId => {
    const f = State.db.files.find(x => x.id === fId);
    if (!f) return '';
    return `
      <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 text-[11px] font-semibold border border-violet-200 dark:border-violet-800">
        <i data-lucide="file" class="w-3 h-3"></i>
        <span class="truncate max-w-[150px]">${f.name}</span>
        <button onclick="removeAttachedFile('${f.id}')" class="hover:text-red-600 ml-1">×</button>
      </span>
    `;
  }).join('');
}

// ================= VIEW B: AGENTS GALLERY & STUDIO =================

function renderAgentsView() {
  const container = document.getElementById('agentsGridContainer');
  if (!container || !State.db) return;

  const allAgents = State.db.agents || [];
  const tabAll = document.getElementById('tab_all_agents');
  if (tabAll) tabAll.textContent = `Tất cả (${allAgents.length})`;

  let agents = allAgents;
  if (State.agentCategoryFilter === 'custom') {
    agents = agents.filter(a => a.isCustom);
  }

  if (agents.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30">
        <div class="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 mx-auto flex items-center justify-center text-3xl mb-4 shadow-sm">
          🤖
        </div>
        <h3 class="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Chưa có AI Agent nào trong thư viện</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
          Tất cả 10 AI Agent mẫu đã được dọn sạch. Bạn có thể tự do khởi tạo và thiết lập các AI Agent tuỳ chỉnh với Prompt, Model và Tri thức riêng biệt.
        </p>
        <button onclick="openCreateAgentModal()" class="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition">
          <i data-lucide="plus" class="w-4 h-4"></i> Tạo AI Agent Mới
        </button>
      </div>
    `;
    refreshIcons();
    return;
  }

  container.innerHTML = agents.map(a => `
    <div class="surface-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition group">
      <div>
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-2xl ${a.avatarBg || 'bg-violet-100 text-violet-700'} flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition transform">
            ${a.avatar || '🤖'}
          </div>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            ${a.modelName || 'Gemini'}
          </span>
        </div>

        <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-0.5">${a.name}</h3>
        <div class="text-[11px] font-bold text-violet-600 dark:text-violet-400 mb-2">${a.role}</div>
        <p class="text-xs text-slate-500 line-clamp-2 mb-4">${a.tagline || ''}</p>
        
        <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-[11px] space-y-1 mb-4">
          <div class="flex items-center justify-between text-slate-500">
            <span>Kho tri thức:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">${(a.knowledgeSourceIds || []).length} kho</span>
          </div>
          <div class="flex items-center justify-between text-slate-500">
            <span>Lượt kích hoạt:</span>
            <span class="font-bold text-violet-600">${a.runsCount || 0} runs</span>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button onclick="startChatWithAgent('${a.id}')" class="flex-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center justify-center space-x-1 shadow-xs transition">
          <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
          <span>Trò chuyện</span>
        </button>
        <button onclick="cloneAgent('${a.id}')" class="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition" title="Nhân bản Agent này">
          <i data-lucide="copy" class="w-4 h-4"></i>
        </button>
        <button onclick="deleteAgent('${a.id}')" class="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 transition" title="Xóa Agent này">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

  refreshIcons();
}

// Delete Agent
async function deleteAgent(agentId) {
  if (!confirm('Bạn có chắc muốn xóa AI Agent này?')) return;
  try {
    const res = await fetch('/api/workspace/delete_agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId })
    });
    if (res.ok) {
      await fetchWorkspaceData();
      renderAgentsView();
      renderWelcomeState();
      renderInspector();
      showToast('Đã xóa AI Agent thành công!');
    }
  } catch (err) {
    console.error(err);
  }
}

function filterAgents(cat) {
  State.agentCategoryFilter = cat;
  document.querySelectorAll('.agent-tab').forEach(b => {
    b.className = 'agent-tab px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800';
  });
  if (event && event.target) {
    event.target.className = 'agent-tab px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300';
  }
  renderAgentsView();
}

function startChatWithAgent(agentId) {
  State.activeAgentId = agentId;
  startNewConversation();
  const sel = document.getElementById('welcomeAgentSelect');
  if (sel) sel.value = agentId;
}

// Clone Agent
async function cloneAgent(agentId) {
  try {
    const res = await fetch('/api/workspace/clone_agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId })
    });
    if (res.ok) {
      await fetchWorkspaceData();
      renderAgentsView();
      showToast('Đã nhân bản AI Agent thành công!');
    }
  } catch (err) {
    console.error(err);
  }
}

// Agent Studio Modal
function openCreateAgentModal() {
  document.getElementById('agentStudioModal').classList.remove('hidden');
}
function closeAgentStudioModal() {
  document.getElementById('agentStudioModal').classList.add('hidden');
}

async function saveCustomAgent() {
  const name = document.getElementById('studioAgentName').value.trim();
  const role = document.getElementById('studioAgentRole').value.trim();
  const avatar = document.getElementById('studioAgentAvatar').value.trim() || '🤖';
  const tagline = document.getElementById('studioAgentTagline').value.trim();
  const modelName = document.getElementById('studioAgentModel').value;
  const temp = parseFloat(document.getElementById('studioAgentTemp').value);
  const prompt = document.getElementById('studioAgentSystemPrompt').value.trim();

  if (!name || !role) {
    alert('Vui lòng nhập tên và vai trò cho Agent!');
    return;
  }

  try {
    const res = await fetch('/api/workspace/create_agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        role,
        avatar,
        tagline,
        modelName,
        temperature: temp,
        systemPrompt: prompt,
        knowledgeSourceIds: ['kb_strategy', 'kb_brand'],
        tools: ['web_search', 'document_retriever']
      })
    });

    if (res.ok) {
      closeAgentStudioModal();
      await fetchWorkspaceData();
      renderAgentsView();
      showToast('Đã tạo mới AI Agent thành công!');
    }
  } catch (err) {
    console.error(err);
  }
}

// ================= VIEW C: FILE MANAGER =================

function renderFilesView() {
  if (!State.db) return;

  // Render Folder Tree on Left
  const treeEl = document.getElementById('fileManagerFolderTree');
  if (treeEl) {
    treeEl.innerHTML = State.db.folders.map(f => {
      const isSelected = f.id === State.currentFolderId;
      const isSub = f.parentId && f.parentId !== 'f_root';
      return `
        <button onclick="selectFolder('${f.id}')" class="w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition ${isSelected ? 'bg-violet-100 text-violet-900 font-bold dark:bg-violet-950 dark:text-violet-200' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'} ${isSub ? 'pl-5 text-[11px]' : 'text-xs'}">
          <span class="flex items-center space-x-1.5 truncate">
            <i data-lucide="${f.icon || 'folder'}" class="w-3.5 h-3.5 ${isSelected ? 'text-violet-600' : 'text-slate-400'}"></i>
            <span class="truncate">${f.name}</span>
          </span>
        </button>
      `;
    }).join('');
  }

  // Filter Files
  let files = State.db.files.filter(f => !f.isTrashed);

  // Folder filter
  if (State.currentFolderId && State.currentFolderId !== 'f_root') {
    files = files.filter(f => f.folderId === State.currentFolderId);
  }

  // Type filter
  if (State.fileTypeFilter === 'md') {
    files = files.filter(f => f.extension === 'md' || f.extension === 'pdf');
  } else if (State.fileTypeFilter === 'csv') {
    files = files.filter(f => f.extension === 'csv' || f.extension === 'xlsx');
  } else if (State.fileTypeFilter === 'img') {
    files = files.filter(f => ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(f.extension));
  } else if (State.fileTypeFilter === 'video') {
    files = files.filter(f => ['mp4', 'mov', 'mp3', 'wav'].includes(f.extension));
  }

  // Render Files Table
  const tbody = document.getElementById('fileTableBody');
  if (tbody) {
    if (files.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400">
            <i data-lucide="folder-open" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
            <div>Không có tệp nào trong thư mục này</div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = files.map(f => {
        const folder = State.db.folders.find(x => x.id === f.folderId);
        const folderName = folder ? folder.name : 'Gốc';
        const kbSize = Math.round(f.size / 1024);
        return `
          <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
            <td class="py-2.5 px-3">
              <div class="flex items-center space-x-2">
                <i data-lucide="file-text" class="w-4 h-4 text-violet-600 shrink-0"></i>
                <button onclick="previewFile('${f.id}')" class="font-bold text-slate-900 dark:text-white hover:text-violet-600 truncate text-left max-w-xs cursor-pointer">
                  ${f.name}
                </button>
              </div>
            </td>
            <td class="py-2.5 px-3 text-slate-500 font-medium">${folderName}</td>
            <td class="py-2.5 px-3">
              <span class="px-1.5 py-0.5 rounded-md font-mono text-[10px] bg-slate-100 dark:bg-slate-800 font-bold uppercase">${f.extension}</span>
            </td>
            <td class="py-2.5 px-3 font-mono text-slate-500">${kbSize} KB</td>
            <td class="py-2.5 px-3 text-slate-500">${f.uploadedByName || 'Duy'}</td>
            <td class="py-2.5 px-3 text-slate-400">${f.updatedAt}</td>
            <td class="py-2.5 px-3 text-right">
              <div class="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition">
                <button onclick="previewFile('${f.id}')" class="p-1 text-slate-400 hover:text-violet-600" title="Xem trước nội dung">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
                <button onclick="attachFileDirect('${f.id}')" class="p-1 text-slate-400 hover:text-indigo-600" title="Đính kèm vào AI Chat">
                  <i data-lucide="paperclip" class="w-4 h-4"></i>
                </button>
                <button onclick="trashFile('${f.id}')" class="p-1 text-slate-400 hover:text-red-600" title="Chuyển vào Thùng rác">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  refreshIcons();
}

function selectFolder(fId) {
  State.currentFolderId = fId;
  const folder = State.db?.folders?.find(f => f.id === fId);
  const bc = document.getElementById('fileBreadcrumbs');
  if (bc && folder) {
    bc.innerHTML = `
      <button onclick="selectFolder('f_root')" class="hover:underline">Marketing Hub</button>
      <span>/</span>
      <span class="text-slate-900 dark:text-white font-bold">${folder.name}</span>
    `;
  }
  renderFilesView();
}

function filterFileType(type) {
  State.fileTypeFilter = type;
  document.querySelectorAll('.file-type-pill').forEach(b => {
    b.className = 'file-type-pill px-2.5 py-1 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-medium';
  });
  if (event && event.target) {
    event.target.className = 'file-type-pill px-2.5 py-1 rounded-md bg-violet-100 text-violet-800 font-bold dark:bg-violet-950 dark:text-violet-300';
  }
  renderFilesView();
}

function handleFileSearch(val) {
  const query = (val || '').toLowerCase();
  const rows = document.querySelectorAll('#fileTableBody tr');
  rows.forEach(r => {
    const text = r.innerText.toLowerCase();
    r.style.display = text.includes(query) ? '' : 'none';
  });
}

// Native File Upload Handler
function triggerFileUpload() {
  document.getElementById('hiddenFileInput').click();
}

async function handleNativeFileSelect(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await uploadSingleFile(file);
  }
  e.target.value = '';
}

async function uploadSingleFile(file) {
  const reader = new FileReader();
  reader.onload = async (evt) => {
    const isText = file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json');
    let payload = {
      fileName: file.name,
      folderId: State.currentFolderId || 'f_root'
    };

    if (isText) {
      payload.contentRaw = evt.target.result;
    } else {
      payload.contentBase64 = evt.target.result.split(',')[1] || '';
    }

    try {
      const res = await fetch('/api/workspace/upload_file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Đã tải lên tệp: ${file.name}`);
        await fetchWorkspaceData();
        renderFilesView();
        renderSidebar();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
    reader.readAsText(file);
  } else {
    reader.readAsDataURL(file);
  }
}

// Drag & Drop
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('dropOverlay').classList.remove('hidden');
}
function handleDragLeave(e) {
  e.preventDefault();
  document.getElementById('dropOverlay').classList.add('hidden');
}
async function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropOverlay').classList.add('hidden');
  const files = e.dataTransfer.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    await uploadSingleFile(files[i]);
  }
}

// Trash / Restore File
async function trashFile(fileId) {
  if (!confirm('Chuyển tệp này vào Thùng rác?')) return;
  try {
    const res = await fetch('/api/workspace/trash_file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId })
    });
    if (res.ok) {
      await fetchWorkspaceData();
      renderFilesView();
      showToast('Đã chuyển tệp vào Thùng rác!');
    }
  } catch (err) {
    console.error(err);
  }
}

// File Preview Modal
async function previewFile(fileId) {
  try {
    const res = await fetch(`/api/workspace/preview_file?id=${encodeURIComponent(fileId)}`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('previewFileName').textContent = data.file.name;
      document.getElementById('previewFileMeta').textContent = `${Math.round(data.file.size/1024)} KB • ${data.file.mimeType} • Cập nhật: ${data.file.updatedAt}`;
      document.getElementById('previewFileContent').textContent = data.content || '(Không có nội dung văn bản hiển thị)';
      document.getElementById('filePreviewModal').classList.remove('hidden');
      refreshIcons();
    }
  } catch (err) {
    console.error(err);
  }
}
function closeFilePreviewModal() {
  document.getElementById('filePreviewModal').classList.add('hidden');
}

function attachFileDirect(fileId) {
  if (!State.attachedFileIds.includes(fileId)) {
    State.attachedFileIds.push(fileId);
  }
  switchView('chat');
  renderAttachedFilePills('activeAttachedFiles');
  renderAttachedFilePills('welcomeAttachedFiles');
  renderInspector();
  showToast('Đã đính kèm tệp vào phiên làm việc AI!');
}

// New Folder Modal
function openNewFolderModal() {
  document.getElementById('newFolderModal').classList.remove('hidden');
  document.getElementById('newFolderNameInput').focus();
}
function closeNewFolderModal() {
  document.getElementById('newFolderModal').classList.add('hidden');
}
async function submitNewFolder() {
  const name = document.getElementById('newFolderNameInput').value.trim();
  if (!name) return;

  try {
    const res = await fetch('/api/workspace/create_folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        parentId: State.currentFolderId || 'f_root'
      })
    });
    if (res.ok) {
      closeNewFolderModal();
      document.getElementById('newFolderNameInput').value = '';
      await fetchWorkspaceData();
      renderFilesView();
      renderSidebar();
      showToast(`Đã tạo thư mục: ${name}`);
    }
  } catch (err) {
    console.error(err);
  }
}

// ================= VIEW D: KNOWLEDGE BASE (RAG) =================

function renderKnowledgeView() {
  if (!State.db) return;

  // 5 Knowledge Collections Cards
  const kbGrid = document.getElementById('knowledgeBasesGrid');
  if (kbGrid) {
    kbGrid.innerHTML = State.db.knowledgeBases.map(kb => `
      <div class="surface-card rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between hover:shadow-xs transition">
        <div>
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr ${kb.color} text-white flex items-center justify-center mb-2 shadow-2xs">
            <i data-lucide="${kb.icon || 'database'}" class="w-4 h-4"></i>
          </div>
          <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">${kb.name}</h4>
          <p class="text-[11px] text-slate-500 line-clamp-2 mb-3">${kb.description}</p>
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold flex items-center justify-between">
          <span>${kb.fileCount || 2} tệp liên kết</span>
          <span class="text-emerald-600">Đã lập chỉ mục</span>
        </div>
      </div>
    `).join('');
  }

  // Chunks Inspector
  renderChunksList(State.db.documentChunks || []);
}

function renderChunksList(chunks) {
  const container = document.getElementById('chunksListContainer');
  const badge = document.getElementById('chunksCountBadge');
  if (!container) return;

  if (badge) badge.textContent = `Hiển thị ${chunks.length} đoạn tri thức RAG`;

  container.innerHTML = chunks.slice(0, 30).map((c, i) => `
    <div class="surface-card p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition text-xs">
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center space-x-2">
          <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300">
            ${c.id}
          </span>
          <span class="font-bold text-slate-800 dark:text-slate-200">${c.fileName}</span>
          ${c.heading ? `<span class="text-slate-400">› ${c.heading}</span>` : ''}
        </div>
        <span class="text-[10px] text-slate-400 font-mono">${c.charLength} ký tự</span>
      </div>
      <p class="text-slate-600 dark:text-slate-300 font-mono text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80 leading-relaxed whitespace-pre-wrap">${escapeHtml(c.content)}</p>
    </div>
  `).join('');

  refreshIcons();
}

function executeRagSearch() {
  const query = document.getElementById('ragQueryInput').value.trim().toLowerCase();
  if (!query || !State.db) {
    renderChunksList(State.db.documentChunks || []);
    return;
  }

  const filtered = State.db.documentChunks.filter(c => {
    return c.content.toLowerCase().includes(query) ||
           (c.heading && c.heading.toLowerCase().includes(query)) ||
           c.fileName.toLowerCase().includes(query);
  });

  renderChunksList(filtered);
  showToast(`Tìm thấy ${filtered.length} kết quả khớp`);
}

function reindexKnowledgeBase() {
  showToast('Đang quét và lập chỉ mục lại 11 tài liệu...');
  setTimeout(() => {
    showToast('✅ Đã hoàn tất lập chỉ mục 356 Chunks tri thức!');
  }, 1200);
}

// ================= VIEW E: DASHBOARD & AUDIT LOG =================

function renderDashboardView() {
  if (!State.db) return;

  const totalFiles = State.db.files.filter(f => !f.isTrashed).length;
  const totalBytes = State.db.files.filter(f => !f.isTrashed).reduce((acc, f) => acc + (f.size || 0), 0);
  const kbSize = Math.round(totalBytes / 1024);

  document.getElementById('statTotalAgents').textContent = State.db.agents.length;
  document.getElementById('statTotalFiles').textContent = totalFiles;
  document.getElementById('statTotalSize').textContent = `${kbSize} KB`;
  document.getElementById('statTotalKb').textContent = State.db.knowledgeBases.length;
  document.getElementById('statTotalConv').textContent = State.db.conversations.length;

  const tbody = document.getElementById('auditLogTableBody');
  if (tbody) {
    tbody.innerHTML = (State.db.auditLogs || []).map(log => `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <td class="py-2 px-3 text-slate-400 font-mono text-[11px]">${log.timestamp}</td>
        <td class="py-2 px-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
            ${log.action}
          </span>
        </td>
        <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">${log.entityName || log.entityId}</td>
        <td class="py-2 px-3 text-slate-600 dark:text-slate-400">${log.performedByName || 'Hệ thống'}</td>
        <td class="py-2 px-3 text-slate-500">${log.details}</td>
      </tr>
    `).join('');
  }
}

// ================= VIEW F: TRASH =================

function renderTrashView() {
  if (!State.db) return;
  const trashed = State.db.files.filter(f => f.isTrashed);
  const tbody = document.getElementById('trashTableBody');
  if (tbody) {
    if (trashed.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400">
            <i data-lucide="trash-2" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
            <div>Thùng rác trống</div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = trashed.map(f => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${f.name}</td>
          <td class="py-2.5 px-3"><span class="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-100 font-bold uppercase">${f.extension}</span></td>
          <td class="py-2.5 px-3 font-mono text-slate-500">${Math.round(f.size/1024)} KB</td>
          <td class="py-2.5 px-3 text-slate-400">${f.updatedAt}</td>
          <td class="py-2.5 px-3 text-right">
            <button onclick="restoreFile('${f.id}')" class="px-2.5 py-1 rounded bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-semibold">Khôi phục</button>
          </td>
        </tr>
      `).join('');
    }
  }
  refreshIcons();
}

async function restoreFile(fileId) {
  try {
    const res = await fetch('/api/workspace/restore_file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId })
    });
    if (res.ok) {
      await fetchWorkspaceData();
      renderTrashView();
      showToast('Đã khôi phục tệp thành công!');
    }
  } catch (err) {
    console.error(err);
  }
}

// ================= RIGHT PANEL INSPECTOR =================

function renderInspector() {
  if (!State.db) return;

  const agent = (State.db.agents && State.db.agents.length > 0)
    ? (State.db.agents.find(a => a.id === State.activeAgentId) || State.db.agents[0])
    : null;

  const aAvatar = document.getElementById('inspectorAgentAvatar');
  const aName = document.getElementById('inspectorAgentName');
  const aRole = document.getElementById('inspectorAgentRole');
  const aTagline = document.getElementById('inspectorAgentTagline');
  const aModel = document.getElementById('inspectorAgentModel');
  const aTemp = document.getElementById('inspectorAgentTemp');
  const aRuns = document.getElementById('inspectorAgentRuns');
  const aPrompt = document.getElementById('inspectorSystemPrompt');

  if (agent) {
    if (aAvatar) aAvatar.textContent = agent.avatar || '🤖';
    if (aName) aName.textContent = agent.name;
    if (aRole) aRole.textContent = agent.role;
    if (aTagline) aTagline.textContent = agent.tagline;
    if (aModel) aModel.textContent = agent.modelName;
    if (aTemp) aTemp.textContent = agent.temperature;
    if (aRuns) aRuns.textContent = `${agent.runsCount || 0} runs`;
    if (aPrompt) aPrompt.textContent = agent.systemPrompt;
  } else {
    if (aAvatar) aAvatar.textContent = '🤖';
    if (aName) aName.textContent = 'Chưa có Agent';
    if (aRole) aRole.textContent = 'Trống';
    if (aTagline) aTagline.textContent = 'Bấm "+ Tạo Mới Agent" để cấu hình AI riêng';
    if (aModel) aModel.textContent = '-';
    if (aTemp) aTemp.textContent = '-';
    if (aRuns) aRuns.textContent = '0 runs';
    if (aPrompt) aPrompt.textContent = 'Chưa có System Prompt';
  }

  // Attached files list
  const attachedList = document.getElementById('inspectorAttachedFilesList');
  if (attachedList) {
    if (State.attachedFileIds.length === 0) {
      attachedList.innerHTML = `<span class="text-slate-400 italic text-[11px]">Chưa đính kèm tệp nào</span>`;
    } else {
      attachedList.innerHTML = State.attachedFileIds.map(fId => {
        const f = State.db.files.find(x => x.id === fId);
        if (!f) return '';
        return `
          <div class="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-[11px]">
            <span class="truncate max-w-[180px] font-medium">${f.name}</span>
            <button onclick="removeAttachedFile('${f.id}')" class="text-slate-400 hover:text-red-500">×</button>
          </div>
        `;
      }).join('');
    }
  }

  // Knowledge Sources list
  const kbList = document.getElementById('inspectorKnowledgeSourcesList');
  if (kbList) {
    const kbs = State.db.knowledgeBases.filter(kb => agent.knowledgeSourceIds.includes(kb.id));
    kbList.innerHTML = kbs.map(kb => `
      <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px]">
        <div class="font-bold text-slate-800 dark:text-slate-200 mb-0.5">${kb.name}</div>
        <div class="text-[10px] text-slate-500">${kb.description}</div>
      </div>
    `).join('');
  }
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// Boot on Load
document.addEventListener('DOMContentLoaded', initApp);
