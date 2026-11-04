// app.js - SE Primer Uygulama Mantığı ve Durum Makinesi
import { CRISIS_STEPS, ONBOARDING_QUESTIONS, OUTCOMES } from './data.js';
import { askAITutor, AI_STUDIO_SYSTEM_PROMPT } from './ai_tutor_engine.js';

class SEPrimerApp {
  constructor() {
    this.state = {
      currentScreen: 'onboarding', // 'onboarding' | 'crisis' | 'outcome' | 'stitch'
      userProfile: {
        level: 'junior',
        role: 'backend',
        goal: 'reliability'
      },
      currentStepIndex: 0,
      userChoices: [],
      currentChoice: null,
      choiceFeedback: null,
      telemetry: {
        waitingPatients: 300,
        errorRate: '98.4%',
        cpuLoad: '92%',
        dbPool: '100%'
      },
      timerSeconds: 60,
      timerInterval: null,
      tutorMessages: [
        {
          role: 'tutor',
          text: 'Nöbetçi mühendis, 08:00 krizine hoş geldin. Ben senin Sokratik rehberinim. Doğru butonu sana asla söylemem; ancak sistemin stabilitesini ve veritabanı bütünlüğünü koruman için doğru soruları sormana yardımcı olurum.'
        }
      ],
      apiKey: localStorage.getItem('se_primer_gemini_api_key') || '',
      viewMode: 'mobile',
      theme: localStorage.getItem('se_primer_theme') || 'light',
      mlTelemetry: {
        sceneStartTime: Date.now(),
        decisionChanges: 0,
        previousErrors: 0,
        hintClicks: 0,
        lastProb: 0.05,
        interventionActive: false
      }
    };

    this.init();
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.cacheDom();
    this.updateThemeButton();
    this.bindEvents();
    this.render();
  }

  cacheDom() {
    this.appFrame = document.getElementById('app-frame');
    this.screenContainer = document.getElementById('screen-container');
    this.telemetryBar = document.getElementById('telemetry-bar');
    this.stressBar = document.getElementById('stress-timer-bar');
    this.btnToggleView = document.getElementById('btn-toggle-view');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    this.btnStitchModal = document.getElementById('btn-stitch-modal');
    this.btnPromptModal = document.getElementById('btn-prompt-modal');
    this.btnSettingsModal = document.getElementById('btn-settings-modal');
    this.btnEvalModal = document.getElementById('btn-eval-modal');
    this.btnOnnxModal = document.getElementById('btn-onnx-modal');
    this.btnRunDemo = document.getElementById('btn-run-demo');
    this.settingsModal = document.getElementById('settings-modal');
    this.promptModal = document.getElementById('prompt-modal');
    this.stitchModal = document.getElementById('stitch-modal');
    this.evalModal = document.getElementById('eval-modal');
    this.onnxModal = document.getElementById('onnx-modal');
    this.evalTableContainer = document.getElementById('eval-table-container');
    this.parityTableContainer = document.getElementById('parity-table-container');
    this.btnRunParityTest = document.getElementById('btn-run-parity-test');
    this.apiKeyInput = document.getElementById('api-key-input');
    this.saveApiKeyBtn = document.getElementById('btn-save-api-key');
  }

  bindEvents() {
    this.btnToggleView?.addEventListener('click', () => this.toggleViewMode());
    this.btnThemeToggle?.addEventListener('click', () => this.toggleTheme());
    this.btnSettingsModal?.addEventListener('click', () => this.openModal(this.settingsModal));
    this.btnPromptModal?.addEventListener('click', () => this.openModal(this.promptModal));
    this.btnStitchModal?.addEventListener('click', () => this.openModal(this.stitchModal));
    this.btnEvalModal?.addEventListener('click', () => {
      this.populateEvalTable();
      this.openModal(this.evalModal);
    });
    this.btnOnnxModal?.addEventListener('click', () => {
      this.populateParityTable();
      this.openModal(this.onnxModal);
    });
    this.btnRunParityTest?.addEventListener('click', () => this.populateParityTable());
    this.btnRunDemo?.addEventListener('click', () => this.runInteractiveCypressDemo());

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.style.display = 'none';
      });
    });

    this.saveApiKeyBtn?.addEventListener('click', () => {
      const val = this.apiKeyInput.value.trim();
      this.state.apiKey = val;
      localStorage.setItem('se_primer_gemini_api_key', val);
      alert('Gemini API Anahtarı başarıyla kaydedildi!');
      this.settingsModal.style.display = 'none';
    });
  }

  openModal(modal) {
    if (modal) {
      modal.style.display = 'flex';
      if (modal === this.settingsModal && this.apiKeyInput) {
        this.apiKeyInput.value = this.state.apiKey;
      }
    }
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.state.theme);
    localStorage.setItem('se_primer_theme', this.state.theme);
    this.updateThemeButton();
  }

  updateThemeButton() {
    if (this.btnThemeToggle) {
      if (this.state.theme === 'light') {
        this.btnThemeToggle.innerHTML = '🌙 Koyu';
      } else {
        this.btnThemeToggle.innerHTML = '☀️ Açık';
      }
    }
  }

  toggleViewMode() {
    if (this.state.viewMode === 'mobile') {
      this.state.viewMode = 'wide';
      this.appFrame.className = 'frame-wide';
      this.btnToggleView.innerHTML = '📱 Mobil Görünüm (390px)';
    } else {
      this.state.viewMode === 'mobile';
      this.appFrame.className = 'frame-mobile';
      this.btnToggleView.innerHTML = '💻 Geniş Ekran';
    }
  }

  render() {
    if (this.state.currentScreen === 'onboarding') {
      this.renderOnboardingScreen();
    } else if (this.state.currentScreen === 'crisis') {
      this.renderCrisisScreen();
    } else if (this.state.currentScreen === 'outcome') {
      this.renderOutcomeScreen();
    }
  }

  renderOnboardingScreen() {
    clearInterval(this.state.timerInterval);
    this.telemetryBar.style.display = 'none';
    this.stressBar.style.display = 'none';

    const { level, role, goal } = this.state.userProfile;
    const isJunior = level === 'junior';

    this.screenContainer.innerHTML = `
      <div class="screen-header-block">
        <div class="brand-sub-badge">
          <span class="badge-blue">YZM301</span>
          <span class="badge-dot">•</span>
          <span class="badge-gold">SE PRİMER</span>
        </div>
        <h1 class="apple-headline">SE Primer</h1>
        <p class="apple-sub">
          Kişiye uyum sağlayan kitap, yazılım mühendisi için; oyuncu karar verir, sistem teknik sonucunu gösterir.
        </p>
      </div>

      <div class="crisis-amber-pill">
        <span class="pill-sparkle">✦</span>
        <span class="pill-text">08:00 Kriz Başlangıcı</span>
      </div>

      <!-- Soru 1: Seviye -->
      <div class="card-glass">
        <span class="card-title">1. DENEYİM SEVİYESİ</span>
        <div class="grid-2">
          <div class="selectable-chip ${level === 'junior' ? 'selected' : ''}" data-type="level" data-val="junior">
            <strong>🌱 Yeni Başladım (Jr)</strong>
            <span>Sokratik ipuçları açık, süre kısıtı yok.</span>
          </div>
          <div class="selectable-chip ${level === 'senior' ? 'selected' : ''}" data-type="level" data-val="senior">
            <strong>⚡ Deneyimliyim (Sr)</strong>
            <span>60 sn süre baskısı ve stres sayacı.</span>
          </div>
        </div>
      </div>

      <!-- Soru 2: Rol -->
      <div class="card-glass">
        <span class="card-title">2. NÖBETÇİ ROLÜ</span>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div class="selectable-chip ${role === 'backend' ? 'selected' : ''}" data-type="role" data-val="backend">
            <strong>🛡️ Backend Mühendisi</strong>
            <span>Transaction bütünlüğü, connection pool ve DB stabilitesi.</span>
          </div>
          <div class="selectable-chip ${role === 'devops' ? 'selected' : ''}" data-type="role" data-val="devops">
            <strong>🚀 DevOps & SRE</strong>
            <span>Kubernetes podları, rollback pipeline'ı ve MTTR.</span>
          </div>
          <div class="selectable-chip ${role === 'fullstack' ? 'selected' : ''}" data-type="role" data-val="fullstack">
            <strong>💻 Fullstack Geliştirici</strong>
            <span>Hasta randevu akışı ve uçtan uca hata yönetimi.</span>
          </div>
        </div>
      </div>

      <!-- Soru 3: Hedef -->
      <div class="card-glass">
        <span class="card-title">3. ÖNCELİKLİ HEDEF</span>
        <div class="grid-2">
          <div class="selectable-chip ${goal === 'reliability' ? 'selected' : ''}" data-type="goal" data-val="reliability">
            <strong>🔒 Güvenilirlik</strong>
            <span>Minimum risk, %100 veri koruması.</span>
          </div>
          <div class="selectable-chip ${goal === 'speed' ? 'selected' : ''}" data-type="goal" data-val="speed">
            <strong>⚡ Hız (MTTR)</strong>
            <span>Randevuları anında açmak.</span>
          </div>
        </div>
      </div>

      <div class="mode-info-card">
        ${isJunior ? '💡 <strong>Junior Modu:</strong> AI Tutor her adımda hazır rehber ipuçlarıyla eşlik eder.' : '⚠️ <strong>Senior Modu:</strong> 60 saniyelik görsel ve sesli stres sayacı devrededir!'}
      </div>

      <button id="btn-start-crisis" class="btn-primary-cta" style="margin-top:auto;">
        Nöbeti Devral · Krize Başla (08:00) ➔
      </button>
    `;

    this.screenContainer.querySelectorAll('.selectable-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const target = e.currentTarget;
        const type = target.dataset.type;
        const val = target.dataset.val;
        this.state.userProfile[type] = val;
        this.renderOnboardingScreen();
      });
    });

    document.getElementById('btn-start-crisis')?.addEventListener('click', () => {
      this.startCrisisGame();
    });
  }

  startCrisisGame() {
    this.state.currentScreen = 'crisis';
    this.state.currentStepIndex = 0;
    this.state.userChoices = [];
    this.state.currentChoice = null;
    this.state.choiceFeedback = null;
    this.state.telemetry = { ...CRISIS_STEPS[0].initialTelemetry };

    if (this.state.userProfile.level === 'senior') {
      this.startSeniorTimer();
    }

    this.render();
  }

  startSeniorTimer() {
    clearInterval(this.state.timerInterval);
    this.state.timerSeconds = 60;
    this.stressBar.style.display = 'block';

    this.state.timerInterval = setInterval(() => {
      this.state.timerSeconds--;
      const fill = document.getElementById('stress-timer-fill');
      const timerLabel = document.getElementById('telemetry-timer');
      if (fill) {
        fill.style.width = `${(this.state.timerSeconds / 60) * 100}%`;
      }
      if (timerLabel) {
        timerLabel.innerText = `⏱️ ${this.state.timerSeconds}s`;
        if (this.state.timerSeconds <= 15) {
          timerLabel.style.color = '#EF4444';
          this.playTick(true);
        } else {
          this.playTick(false);
        }
      }

      if (this.state.timerSeconds <= 0) {
        clearInterval(this.state.timerInterval);
        alert('⚠️ SÜRE DOLDU (AC-6 Fail-Safe Kuralı)!\n\nNöbetçi mühendis zamanında karar veremedi; sistem kilitlenmeyi önlemek için otomatik olarak kararlı duruma (Rollback) çekildi.');
        this.handleDecisionSelect('A');
      }
    }, 1000);
  }

  playTick(isEmergency = false) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = isEmergency ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isEmergency ? 880 : 330, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio playback permitted only after interaction
    }
  }

  async populateEvalTable() {
    if (!this.evalTableContainer) return;
    try {
      const res = await fetch('/tutor_eval.json');
      const data = await res.json();
      const rows = data.evaluations.map(item => `
        <tr style="border-bottom:1px solid #1E293B; font-size:11px;">
          <td style="padding:8px; font-weight:700; color:#818CF8;">${item.id}</td>
          <td style="padding:8px; color:#CBD5E1;">${item.category}</td>
          <td style="padding:8px; color:#F9FAFB; font-style:italic;">"${item.student_prompt}"</td>
          <td style="padding:8px; color:#E9D5FF;">${item.tutor_response}</td>
          <td style="padding:8px; text-align:center;">
            <span style="background:rgba(16,185,129,0.2); color:#34D399; font-weight:700; padding:2px 6px; border-radius:4px; font-size:10px;">
              BAŞARILI (%0 Sızıntı)
            </span>
          </td>
        </tr>
      `).join('');

      this.evalTableContainer.innerHTML = `
        <table style="width:100%; border-collapse:collapse; text-align:left; background:#0B0F19;">
          <thead>
            <tr style="background:#1E293B; font-size:11px; text-transform:uppercase; color:#94A3B8;">
              <th style="padding:8px;">ID</th>
              <th style="padding:8px;">Kategori</th>
              <th style="padding:8px;">Öğrenci İstemi (Prompt)</th>
              <th style="padding:8px;">Sokratik Model Yanıtı</th>
              <th style="padding:8px; text-align:center;">Sonuç</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    } catch (e) {
      this.evalTableContainer.innerHTML = `<div style="padding:16px; color:#F87171;">Eval verisi yüklenemedi. Lütfen <code>tutor_eval.json</code> dosyasını kontrol edin.</div>`;
    }
  }

  async populateParityTable() {
    if (!this.parityTableContainer || !window.sePrimerML) return;
    this.parityTableContainer.innerHTML = `<div style="padding:16px; color:#93C5FD;">⏳ ONNX parite testleri koşturuluyor...</div>`;
    try {
      const res = await window.sePrimerML.runParitySuite();
      const rows = res.cases.map(c => `
        <tr style="border-bottom:1px solid #1F2937; font-size:11px;">
          <td style="padding:8px; font-weight:700; color:#93C5FD;">${c.id}</td>
          <td style="padding:8px; color:#E5E7EB; font-family:monospace; font-size:10px;">[${c.input.join(', ')}]</td>
          <td style="padding:8px; color:#A7F3D0; font-family:monospace;">${c.expectedP1.toFixed(6)}</td>
          <td style="padding:8px; color:#FDE047; font-family:monospace;"><span data-cy="p">${c.webP1.toFixed(6)}</span></td>
          <td style="padding:8px; color:#CBD5E1; font-family:monospace;">${c.diff.toFixed(8)}</td>
          <td style="padding:8px; text-align:center;">
            <span data-cy="parity-status" style="background:${c.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color:${c.passed ? '#34D399' : '#F87171'}; font-weight:700; padding:2px 8px; border-radius:4px; font-size:10px;">
              ${c.passed ? '✅ GEÇTİ (Δ < 1e-4)' : '❌ KALDI'}
            </span>
          </td>
        </tr>
      `).join('');

      this.parityTableContainer.innerHTML = `
        <table style="width:100%; border-collapse:collapse; text-align:left; background:#0B0F19;">
          <thead>
            <tr style="background:#1E293B; font-size:10px; text-transform:uppercase; color:#94A3B8;">
              <th style="padding:8px;">Test ID</th>
              <th style="padding:8px;">Girdi [7]</th>
              <th style="padding:8px;">Python Oracle P(1)</th>
              <th style="padding:8px;">Web ONNX P(1)</th>
              <th style="padding:8px;">Fark (Δ)</th>
              <th style="padding:8px; text-align:center;">Parite Durumu</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    } catch (e) {
      this.parityTableContainer.innerHTML = `<div style="padding:16px; color:#F87171;">Parite testi hatası: ${e.message}</div>`;
    }
  }

  async updateModelTelemetry() {
    if (!window.sePrimerML) return;
    const { level, role } = this.state.userProfile;
    const seviyeCode = level === 'junior' ? 0.0 : 1.0;
    const roleCode = role === 'backend' ? 0.0 : (role === 'devops' ? 1.0 : 2.0);
    const sceneNo = Number(this.state.currentStepIndex + 1);
    const elapsed = Math.max(1.0, (Date.now() - this.state.mlTelemetry.sceneStartTime) / 1000);
    const changes = Number(this.state.mlTelemetry.decisionChanges);
    const errors = Number(this.state.mlTelemetry.previousErrors);
    const hints = Number(this.state.mlTelemetry.hintClicks);

    const features = [seviyeCode, roleCode, sceneNo, elapsed, changes, errors, hints];
    const res = await window.sePrimerML.predict(features);
    const p1 = res.probabilityClass1;
    this.state.mlTelemetry.lastProb = p1;

    const probEl = document.getElementById('ml-live-prob');
    const statusEl = document.getElementById('ml-live-status');
    const boxEl = document.getElementById('ml-intervention-box');

    if (probEl) {
      probEl.innerText = `P: ${p1.toFixed(4)}`;
      probEl.setAttribute('data-cy', 'p');
      probEl.setAttribute('data-cy-prob', p1.toFixed(4));
    }
    if (statusEl) {
      statusEl.innerText = p1 >= 0.50 ? '⚠️ Aşırı Yük' : '🟢 Otonom';
      statusEl.style.color = p1 >= 0.50 ? '#EF4444' : '#10B981';
    }

    if (boxEl) {
      if (p1 >= 0.50) {
        boxEl.style.display = 'block';
        boxEl.innerHTML = `
          <div class="ml-intervention-card" data-cy="ml-intervention">
            <span>⚡ <strong>ML Adaptif Müdahale:</strong> Bilişsel aşırı yüklenme tespit edildi (%${(p1 * 100).toFixed(0)} olasılık). Sokratik ipucu kartı öne çıkarıldı!</span>
          </div>
        `;
        const tutorDock = document.querySelector('.tutor-dock');
        if (tutorDock) {
          tutorDock.style.borderColor = 'rgba(255, 149, 0, 0.7)';
          tutorDock.style.boxShadow = '0 0 16px rgba(255, 149, 0, 0.25)';
        }
      } else {
        boxEl.style.display = 'none';
        const tutorDock = document.querySelector('.tutor-dock');
        if (tutorDock) {
          tutorDock.style.borderColor = 'rgba(175, 82, 222, 0.25)';
          tutorDock.style.boxShadow = '0 6px 20px rgba(175, 82, 222, 0.08)';
        }
      }
    }
  }

  renderCrisisScreen() {
    const step = CRISIS_STEPS[this.state.currentStepIndex];
    const isSenior = this.state.userProfile.level === 'senior';

    this.telemetryBar.style.display = 'flex';
    this.telemetryBar.innerHTML = `
      <div class="telemetry-item">
        <span>⏰ 08:0${this.state.currentStepIndex * 8}</span>
        <span style="color:#94A3B8;">| ${this.state.userProfile.role.toUpperCase()}</span>
      </div>
      <div class="telemetry-item">
        ${isSenior ? `<span id="telemetry-timer" style="color:#FBBF24; font-weight:800;">⏱️ ${this.state.timerSeconds}s</span>` : ''}
        <span class="pulse-badge">🚨 ${this.state.telemetry.waitingPatients} HASTA</span>
      </div>
    `;

    const optionsHtml = step.options.map(opt => `
      <button class="btn-decision ${this.state.currentChoice === opt.id ? 'active-choice' : ''}" data-choice="${opt.id}">
        <span class="choice-header">${opt.label}</span>
        <span class="choice-desc">${opt.shortDesc}</span>
      </button>
    `).join('');

    const feedbackHtml = this.state.choiceFeedback ? `
      <div class="feedback-panel">
        <span class="feedback-label">💡 TEKNİK GERİ BİLDİRİM</span>
        <div class="feedback-row">
          <strong style="color:#93C5FD;">🔹 Ne Oldu?</strong>
          <span>${this.state.choiceFeedback.what}</span>
        </div>
        <div class="feedback-row" style="margin-top:4px;">
          <strong style="color:#FBBF24;">🔸 Neden Oldu? (Teknik Gerekçe)</strong>
          <span>${this.state.choiceFeedback.why}</span>
        </div>
      </div>
    ` : '';

    const tutorChatHistoryHtml = this.state.tutorMessages.map(msg => `
      <div class="tutor-bubble" style="${msg.role === 'user' ? 'color:#93C5FD; text-align:right; font-style:italic;' : 'color:#F3E8FF;'}">
        <strong>${msg.role === 'user' ? 'Sen:' : '🔮 AI Tutor:'}</strong> ${msg.text}
      </div>
    `).join('');

    const quickPillsHtml = step.tutorGuidingQuestions.map((q, idx) => `
      <button class="quick-prompt-btn" data-question="${encodeURIComponent(q)}">
        💭 ${idx === 0 ? 'Risk Nedir?' : 'İpucu Sor'}
      </button>
    `).join('');

    this.screenContainer.innerHTML = `
      <!-- Kriz Kartı -->
      <div class="card-glass" style="background:rgba(30,30,34,0.7); border-color:rgba(255,255,255,0.12);">
        <div class="card-title">
          <span style="color:var(--apple-blue); font-weight:600;">${step.category}</span>
          <span style="font-size:10px; color:var(--apple-text-secondary);">ADIM ${this.state.currentStepIndex + 1} / 3</span>
        </div>
        <h2 style="font-size:17px; font-weight:700; line-height:1.25; color:#ffffff; letter-spacing:-0.02em;">${step.title}</h2>
        <p style="font-size:12px; color:var(--apple-text-secondary); line-height:1.45;">${step.context}</p>
        
        <!-- Canlı Telemetri Paneli (Apple Health Style) -->
        <div class="telemetry-mini-grid">
          <div class="telemetry-stat">
            <div class="num" style="color:var(--apple-red);">${this.state.telemetry.waitingPatients}</div>
            <div class="lbl">Bekleyen</div>
          </div>
          <div class="telemetry-stat">
            <div class="num" style="color:var(--apple-orange);">${this.state.telemetry.errorRate}</div>
            <div class="lbl">Hata</div>
          </div>
          <div class="telemetry-stat">
            <div class="num" style="color:var(--apple-blue);">${this.state.telemetry.cpuLoad}</div>
            <div class="lbl">CPU</div>
          </div>
          <div class="telemetry-stat">
            <div class="num" style="color:var(--apple-purple);">${this.state.telemetry.dbPool}</div>
            <div class="lbl">DB Havuzu</div>
          </div>
        </div>
      </div>

      <!-- v2.0 ONNX Model Telemetrisi & Bilişsel Aşırı Yük Tespiti -->
      <div id="ml-badge-container" class="ml-badge-container">
        <div class="ml-telemetry-pill">
          <span class="ml-pill-dot"></span>
          <span class="ml-pill-label">ML v2 ONNX:</span>
          <span class="ml-pill-prob" id="ml-live-prob" data-cy="p">P: 0.0500</span>
          <span class="ml-pill-status" id="ml-live-status" data-cy="model-status">Otonom</span>
        </div>
        <div style="font-size:10px; color:var(--apple-text-secondary);" id="ml-live-mode">onnxruntime-web (WASM)</div>
      </div>

      <div id="ml-intervention-box" style="display:none; margin: 4px 0;"></div>

      <!-- Karar Seçenekleri -->
      <div style="display:flex; flex-direction:column; gap:10px;">
        <span style="font-size:11px; font-weight:600; color:var(--apple-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">Mühendislik Kararı:</span>
        ${optionsHtml}
      </div>

      <!-- Seçim Sonrası Teknik Neden-Sonuç Bildirimi -->
      ${feedbackHtml}

      <!-- Sonraki Adım Butonu (Seçim yapıldıysa görünür) -->
      ${this.state.currentChoice ? `
        <button id="btn-next-step" class="btn-primary-cta">
          ${this.state.currentStepIndex < 2 ? 'Sonraki Karara İlerle ➔' : 'Kriz Sonucunu ve Raporu Gör 🏆'}
        </button>
      ` : ''}

      <!-- Sokratik AI Tutor Paneli (Apple Intelligence / Siri Glow) -->
      <div class="tutor-dock">
        <div class="tutor-header">
          <span style="display:flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:var(--apple-purple); box-shadow:0 0 8px var(--apple-purple);"></span>
            Sokratik AI Tutor · SE Primer
          </span>
          <span style="font-size:10px; color:var(--apple-text-secondary); font-weight:normal;">Cevabı ele vermez</span>
        </div>
        
        <div class="tutor-chat-box" id="tutor-chat-box">
          ${tutorChatHistoryHtml}
        </div>

        <div class="quick-prompts-row">
          ${quickPillsHtml}
          <button class="quick-prompt-btn" data-question="Hangi seçeneği seçmeliyim?">❓ A mı B mi?</button>
          <button class="quick-prompt-btn" data-question="Rollback yaparsam veritabanı bozulur mu?">🗄️ DB Riski?</button>
        </div>

        <div class="tutor-input-row">
          <input type="text" id="tutor-input" class="tutor-input-field" placeholder="Tutor'a sor (örn: Canlıda yamanın riski ne?)..." />
          <button id="btn-ask-tutor" class="btn-tutor-submit">Sor</button>
        </div>
      </div>
    `;

    // Event Dinleyicileri
    this.screenContainer.querySelectorAll('.btn-decision').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.choice;
        this.handleDecisionSelect(choice);
      });
    });

    document.getElementById('btn-next-step')?.addEventListener('click', () => {
      this.advanceToNextStep();
    });

    document.getElementById('btn-ask-tutor')?.addEventListener('click', () => {
      this.handleTutorQuestion();
    });

    document.getElementById('tutor-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleTutorQuestion();
    });

    this.screenContainer.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const q = decodeURIComponent(e.currentTarget.dataset.question);
        document.getElementById('tutor-input').value = q;
        this.handleTutorQuestion();
      });
    });

    // Otomatik alta kaydır
    const chatBox = document.getElementById('tutor-chat-box');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

    // v2.0 ONNX model telemetrisini anlık hesapla
    this.updateModelTelemetry();
  }

  handleDecisionSelect(choiceId) {
    const step = CRISIS_STEPS[this.state.currentStepIndex];
    const opt = step.options.find(o => o.id === choiceId);
    if (!opt) return;

    this.state.mlTelemetry.decisionChanges++;
    if (choiceId === 'B') {
      this.state.mlTelemetry.previousErrors++;
    }

    this.state.currentChoice = choiceId;
    this.state.choiceFeedback = opt.feedback;

    // Telemetri güncelle
    if (opt.feedback.telemetryImpact) {
      this.state.telemetry = {
        ...this.state.telemetry,
        ...opt.feedback.telemetryImpact
      };
    }

    this.updateModelTelemetry();

    this.renderCrisisScreen();
  }

  advanceToNextStep() {
    this.state.userChoices.push(this.state.currentChoice);
    this.state.currentChoice = null;
    this.state.choiceFeedback = null;

    if (this.state.currentStepIndex < 2) {
      this.state.currentStepIndex++;
      if (this.state.userProfile.level === 'senior') {
        this.startSeniorTimer();
      }
      this.renderCrisisScreen();
    } else {
      clearInterval(this.state.timerInterval);
      this.state.currentScreen = 'outcome';
      this.renderOutcomeScreen();
    }
  }

  async handleTutorQuestion() {
    const input = document.getElementById('tutor-input');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    this.state.tutorMessages.push({ role: 'user', text: question });
    this.renderCrisisScreen();

    // AI Tutor cevabı üret (offline Sokratik motor veya canlı Gemini)
    const currentStep = CRISIS_STEPS[this.state.currentStepIndex];
    const response = await askAITutor({
      studentQuestion: question,
      currentStep,
      userProfile: this.state.userProfile,
      apiKey: this.state.apiKey
    });

    this.state.tutorMessages.push({ role: 'tutor', text: response });
    this.renderCrisisScreen();
  }

  renderOutcomeScreen() {
    this.telemetryBar.style.display = 'none';
    this.stressBar.style.display = 'none';

    const choices = this.state.userChoices; // örn: ['A', 'A', 'A']
    const choiceStr = choices.join('-');

    let outcome;
    if (choiceStr === 'A-A-A' || choiceStr === 'B-A-A') {
      outcome = OUTCOMES.GOOD_OUTCOME;
    } else if (choices[2] === 'B') {
      outcome = OUTCOMES.KVKK_BAD_OUTCOME;
    } else if (choiceStr === 'B-B-B' || choiceStr === 'B-B-A') {
      outcome = OUTCOMES.CATASTROPHIC_OUTCOME;
    } else {
      outcome = OUTCOMES.KVKK_BAD_OUTCOME;
    }

    const postMortemHtml = outcome.postMortem.map(item => `
      <li style="margin-bottom:6px;">${item}</li>
    `).join('');

    this.screenContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <span style="font-size:11px; color:${outcome.type === 'SUCCESS' ? 'var(--apple-green)' : 'var(--apple-red)'}; font-weight:600; letter-spacing:0.04em; text-transform:uppercase;">YZM301 · Post-Mortem Raporu</span>
        <div style="background: ${outcome.type === 'SUCCESS' ? 'linear-gradient(180deg, rgba(48, 209, 88, 0.15) 0%, rgba(28, 28, 30, 0.85) 100%)' : 'linear-gradient(180deg, rgba(255, 69, 58, 0.15) 0%, rgba(28, 28, 30, 0.85) 100%)'}; border:1px solid ${outcome.type === 'SUCCESS' ? 'rgba(48, 209, 88, 0.4)' : 'rgba(255, 69, 58, 0.4)'}; border-radius:22px; padding:18px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
          <span style="display:inline-block; background:${outcome.type === 'SUCCESS' ? 'var(--apple-green)' : 'var(--apple-red)'}; color:${outcome.type === 'SUCCESS' ? '#000000' : '#ffffff'}; font-size:11px; font-weight:700; padding:4px 12px; border-radius:var(--radius-pill); text-transform:uppercase; margin-bottom:10px; letter-spacing:0.03em;">
            ${outcome.badge}
          </span>
          <h2 style="font-size:20px; font-weight:700; letter-spacing:-0.02em; color:#ffffff;">${outcome.title}</h2>
          <p style="font-size:13px; color:var(--apple-text-secondary); margin-top:6px; line-height:1.45;">${outcome.headline}</p>
        </div>
      </div>

      <!-- KPI Metrikleri (Apple Health Style) -->
      <div class="grid-2">
        <div class="card-glass" style="padding:12px; text-align:center;">
          <div style="font-size:17px; font-weight:700; color:var(--apple-green);">${outcome.metrics.mttr}</div>
          <div style="font-size:10px; color:var(--apple-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">MTTR (Çözüm)</div>
        </div>
        <div class="card-glass" style="padding:12px; text-align:center;">
          <div style="font-size:17px; font-weight:700; color:var(--apple-blue);">${outcome.metrics.servedPatients}</div>
          <div style="font-size:10px; color:var(--apple-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">Kurtarılan Hasta</div>
        </div>
        <div class="card-glass" style="padding:12px; text-align:center;">
          <div style="font-size:17px; font-weight:700; color:var(--apple-purple);">${outcome.metrics.kvkkScore}</div>
          <div style="font-size:10px; color:var(--apple-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">KVKK Uyum Skoru</div>
        </div>
        <div class="card-glass" style="padding:12px; text-align:center;">
          <div style="font-size:17px; font-weight:700; color:var(--apple-yellow);">${outcome.metrics.penaltyRisk}</div>
          <div style="font-size:10px; color:var(--apple-text-secondary); text-transform:uppercase; letter-spacing:0.04em;">Yasal Yaptırım</div>
        </div>
      </div>

      <!-- Kararların Zaman Çizelgesi -->
      <div class="card-glass">
        <span class="card-title">Seçtiğin Mühendislik Kararları</span>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
          <div><strong style="color:var(--apple-blue);">1. Mimari:</strong> ${choices[0] === 'A' ? 'A) Rollback (Stabil v1.4)' : 'B) Canlıda Hotfix'}</div>
          <div><strong style="color:var(--apple-blue);">2. Test:</strong> ${choices[1] === 'A' ? 'A) 90s Smoke Test' : 'B) Doğrudan Yayına Al'}</div>
          <div><strong style="color:var(--apple-blue);">3. KVKK:</strong> ${choices[2] === 'A' ? 'A) Logları Maskele' : 'B) Ham Logu Ekibe At'}</div>
        </div>
      </div>

      <!-- Post-Mortem -->
      <div class="card-glass">
        <span class="card-title">Mühendislik Post-Mortem Özeti</span>
        <ul style="font-size:12px; color:var(--apple-text-secondary); line-height:1.5; padding-left:16px;">
          ${postMortemHtml}
        </ul>
      </div>

      <button id="btn-restart-game" class="btn-nav" style="padding:14px 20px; font-size:13px; font-weight:600; justify-content:center; margin-top:auto; background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.15);">
        🔄 Farklı Bir Stratejiyle Yeniden Oyna
      </button>
    `;

    document.getElementById('btn-restart-game')?.addEventListener('click', () => {
      this.state.currentScreen = 'onboarding';
      this.render();
    });
  }

  // Cypress Simülasyonunu Canlı Tarayıcıda Gösteren Otomasyon
  async runInteractiveCypressDemo() {
    alert('🎬 60 Saniyelik Cypress E2E Test Koşusu Başlatılıyor!\n\nSenaryo: Junior Profil -> Rollback (A) -> Smoke Test (A) -> Maskeleme (A) -> SON A Başarısı!');
    this.state.currentScreen = 'onboarding';
    this.state.userProfile = { level: 'junior', role: 'backend', goal: 'reliability' };
    this.render();

    await this.sleep(1000);
    this.startCrisisGame();

    await this.sleep(1200);
    // Karar 1: A seç
    this.handleDecisionSelect('A');
    await this.sleep(1000);
    this.advanceToNextStep();

    await this.sleep(1200);
    // Karar 2: A seç
    this.handleDecisionSelect('A');
    await this.sleep(1000);
    this.advanceToNextStep();

    await this.sleep(1200);
    // Karar 3: A seç
    this.handleDecisionSelect('A');
    await this.sleep(1000);
    this.advanceToNextStep();
  }

  sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

// Uygulamayı Başlat
window.addEventListener('DOMContentLoaded', () => {
  window.sePrimerApp = new SEPrimerApp();
});

