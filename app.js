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
      viewMode: 'mobile'
    };

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
  }

  cacheDom() {
    this.appFrame = document.getElementById('app-frame');
    this.screenContainer = document.getElementById('screen-container');
    this.telemetryBar = document.getElementById('telemetry-bar');
    this.stressBar = document.getElementById('stress-timer-bar');
    this.btnToggleView = document.getElementById('btn-toggle-view');
    this.btnStitchModal = document.getElementById('btn-stitch-modal');
    this.btnPromptModal = document.getElementById('btn-prompt-modal');
    this.btnSettingsModal = document.getElementById('btn-settings-modal');
    this.btnRunDemo = document.getElementById('btn-run-demo');
    this.settingsModal = document.getElementById('settings-modal');
    this.promptModal = document.getElementById('prompt-modal');
    this.stitchModal = document.getElementById('stitch-modal');
    this.apiKeyInput = document.getElementById('api-key-input');
    this.saveApiKeyBtn = document.getElementById('btn-save-api-key');
  }

  bindEvents() {
    this.btnToggleView?.addEventListener('click', () => this.toggleViewMode());
    this.btnSettingsModal?.addEventListener('click', () => this.openModal(this.settingsModal));
    this.btnPromptModal?.addEventListener('click', () => this.openModal(this.promptModal));
    this.btnStitchModal?.addEventListener('click', () => this.openModal(this.stitchModal));
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
      <div style="display:flex; flex-direction:column; gap:6px;">
        <span style="font-size:10px; color:#60A5FA; font-weight:800; letter-spacing:0.5px;">YZM301 · SE PRIMER · 1. HAFTA</span>
        <h1 style="font-size:22px; font-weight:800; line-height:1.2;">SE Primer</h1>
        <p style="font-size:12px; color:var(--text-muted); line-height:1.5;">
          Kişiye uyum sağlayan kitap, bu kez yazılım mühendisi için: oyuncu karar verir, uygulama o kararın teknik sonucunu gösterir.
        </p>
      </div>

      <div style="background:linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.12)); border:1px dashed rgba(139,92,246,0.4); border-radius:12px; padding:12px; font-size:11px; color:#C4B5FD;">
        ⚡ <strong>Kriz Başlangıcı:</strong> "08:00, randevu sistemi çöktü. Nöbetçi sensin. Dün gece yeni sürüm çıktı. 300 hasta poliklinik kapısında bekliyor."
      </div>

      <!-- Soru 1: Seviye -->
      <div class="card-glass">
        <span class="card-title">1. Seviye Seçimi (Deneyim)</span>
        <div class="grid-2">
          <div class="selectable-chip ${level === 'junior' ? 'selected' : ''}" data-type="level" data-val="junior">
            <strong>🌱 Yeni Başladım (Jr)</strong>
            <span>Sokratik ipuçları açık, süre kısıtı yok, öğretici mod.</span>
          </div>
          <div class="selectable-chip ${level === 'senior' ? 'selected' : ''}" data-type="level" data-val="senior">
            <strong>⚡ Deneyimliyim (Sr)</strong>
            <span>60 sn süre baskısı! Gerçek kriz stresi altında karar ver.</span>
          </div>
        </div>
      </div>

      <!-- Soru 2: Rol -->
      <div class="card-glass">
        <span class="card-title">2. Nöbetçi Rolü</span>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div class="selectable-chip ${role === 'backend' ? 'selected' : ''}" data-type="role" data-val="backend">
            <strong>🛡️ Backend Mühendisi</strong>
            <span>Veritabanı transactionları, connection pool ve API stabilitesi.</span>
          </div>
          <div class="selectable-chip ${role === 'devops' ? 'selected' : ''}" data-type="role" data-val="devops">
            <strong>🚀 DevOps & SRE</strong>
            <span>Kubernetes pod durumu, rollback pipeline ve MTTR yönetimi.</span>
          </div>
          <div class="selectable-chip ${role === 'fullstack' ? 'selected' : ''}" data-type="role" data-val="fullstack">
            <strong>💻 Fullstack Geliştirici</strong>
            <span>Kullanıcı akışı, hasta kuyruğu ve uçtan uca hata yönetimi.</span>
          </div>
        </div>
      </div>

      <!-- Soru 3: Hedef -->
      <div class="card-glass">
        <span class="card-title">3. Öncelikli Kriz Hedefin</span>
        <div class="grid-2">
          <div class="selectable-chip ${goal === 'reliability' ? 'selected' : ''}" data-type="goal" data-val="reliability">
            <strong>🔒 Sistem Güvenilirliği</strong>
            <span>En az risk, tam veri koruması.</span>
          </div>
          <div class="selectable-chip ${goal === 'speed' ? 'selected' : ''}" data-type="goal" data-val="speed">
            <strong>⚡ Maksimum Hız (MTTR)</strong>
            <span>Randevuları hemen açmak.</span>
          </div>
        </div>
      </div>

      <div style="font-size:11px; color:#A7F3D0; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:10px;">
        ${isJunior ? '💡 <strong>Junior Modu Seçildi:</strong> Kararlarda AI Tutor her adımda hazır rehber ipuçları sunacaktır.' : '⚠️ <strong>Senior Modu Seçildi:</strong> Her karar için 60 saniyelik stres zamanlayıcısı devrede olacaktır!'}
      </div>

      <button id="btn-start-crisis" class="btn-primary-cta" style="margin-top:auto;">
        NÖBETİ DEVRAL · KRİZE BAŞLA (08:00) 🚨
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
        }
      }

      if (this.state.timerSeconds <= 0) {
        clearInterval(this.state.timerInterval);
        alert('Süre doldu! Stres altında varsayılan fail-safe aksiyonu devreye alındı.');
        this.handleDecisionSelect('A');
      }
    }, 1000);
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
      <div class="card-glass" style="background:linear-gradient(180deg, #1E1B4B 0%, #0F172A 100%); border-color:#4338CA;">
        <div class="card-title">
          <span style="color:#818CF8;">${step.category}</span>
          <span style="font-size:10px; color:#A5B4FC;">ADIM ${this.state.currentStepIndex + 1} / 3</span>
        </div>
        <h2 style="font-size:16px; font-weight:800; line-height:1.3;">${step.title}</h2>
        <p style="font-size:11px; color:#CBD5E1; line-height:1.4;">${step.context}</p>
        
        <!-- Canlı Telemetri Paneli -->
        <div class="telemetry-mini-grid">
          <div class="telemetry-stat">
            <div class="num" style="color:#EF4444;">${this.state.telemetry.waitingPatients}</div>
            <div class="lbl">Bekleyen</div>
          </div>
          <div class="telemetry-stat">
            <div class="num" style="color:#F59E0B;">${this.state.telemetry.errorRate}</div>
            <div class="lbl">Hata Oranı</div>
          </div>
          <div class="telemetry-stat">
            <div class="num" style="color:#60A5FA;">${this.state.telemetry.cpuLoad}</div>
            <div class="lbl">CPU Yükü</div>
          </div>
          <div class="telemetry-stat">
            <div class="num" style="color:#A78BFA;">${this.state.telemetry.dbPool}</div>
            <div class="lbl">DB Havuzu</div>
          </div>
        </div>
      </div>

      <!-- Karar Seçenekleri -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        <span style="font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase;">Seçenekler:</span>
        ${optionsHtml}
      </div>

      <!-- Seçim Sonrası Teknik Neden-Sonuç Bildirimi -->
      ${feedbackHtml}

      <!-- Sonraki Adım Butonu (Seçim yapıldıysa görünür) -->
      ${this.state.currentChoice ? `
        <button id="btn-next-step" class="btn-primary-cta" style="padding:12px;">
          ${this.state.currentStepIndex < 2 ? 'SONRAKİ KARARA İLERLE ➔' : 'KRİZ SONUCUNU VE RAPORU GÖR 🏆'}
        </button>
      ` : ''}

      <!-- Sokratik AI Tutor Paneli -->
      <div class="tutor-dock">
        <div class="tutor-header">
          <span>🔮 AI TUTOR (SOKRATİK DANIŞMAN)</span>
          <span style="font-size:9px; color:#A78BFA; font-weight:normal;">Cevabı ele vermez · İpucu sorar</span>
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
  }

  handleDecisionSelect(choiceId) {
    const step = CRISIS_STEPS[this.state.currentStepIndex];
    const opt = step.options.find(o => o.id === choiceId);
    if (!opt) return;

    this.state.currentChoice = choiceId;
    this.state.choiceFeedback = opt.feedback;

    // Telemetri güncelle
    if (opt.feedback.telemetryImpact) {
      this.state.telemetry = {
        ...this.state.telemetry,
        ...opt.feedback.telemetryImpact
      };
    }

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
      <div style="display:flex; flex-direction:column; gap:6px;">
        <span style="font-size:10px; color:#10B981; font-weight:800; letter-spacing:0.5px;">YZM301 · SİMÜLASYON RAPORU</span>
        <div style="background: ${outcome.type === 'SUCCESS' ? 'linear-gradient(180deg, #064E3B 0%, #0F172A 100%)' : 'linear-gradient(180deg, #7F1D1D 0%, #0F172A 100%)'}; border:1.5px solid ${outcome.type === 'SUCCESS' ? '#059669' : '#DC2626'}; border-radius:16px; padding:16px; text-align:center;">
          <span style="display:inline-block; background:${outcome.type === 'SUCCESS' ? '#10B981' : '#EF4444'}; color:${outcome.type === 'SUCCESS' ? '#064E3B' : '#FFF'}; font-size:11px; font-weight:800; padding:4px 10px; border-radius:100px; text-transform:uppercase; margin-bottom:8px;">
            ${outcome.badge}
          </span>
          <h2 style="font-size:18px; font-weight:800;">${outcome.title}</h2>
          <p style="font-size:12px; color:#D1D5DB; margin-top:6px; line-height:1.4;">${outcome.headline}</p>
        </div>
      </div>

      <!-- KPI Metrikleri -->
      <div class="grid-2">
        <div class="card-glass" style="padding:10px; text-align:center;">
          <div style="font-size:16px; font-weight:800; color:#34D399;">${outcome.metrics.mttr}</div>
          <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">MTTR (Çözüm Süresi)</div>
        </div>
        <div class="card-glass" style="padding:10px; text-align:center;">
          <div style="font-size:16px; font-weight:800; color:#60A5FA;">${outcome.metrics.servedPatients}</div>
          <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Kurtarılan Hasta</div>
        </div>
        <div class="card-glass" style="padding:10px; text-align:center;">
          <div style="font-size:16px; font-weight:800; color:#A78BFA;">${outcome.metrics.kvkkScore}</div>
          <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">KVKK Uyum Skoru</div>
        </div>
        <div class="card-glass" style="padding:10px; text-align:center;">
          <div style="font-size:16px; font-weight:800; color:#FBBF24;">${outcome.metrics.penaltyRisk}</div>
          <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Hukuki Yaptırım</div>
        </div>
      </div>

      <!-- Kararların Zaman Çizelgesi -->
      <div class="card-glass">
        <span class="card-title">Seçtiğin Mühendislik Kararları</span>
        <div style="display:flex; flex-direction:column; gap:6px; font-size:11px;">
          <div>🔹 <strong>Karar 1 (Mimari):</strong> ${choices[0] === 'A' ? 'A) Eski Sürüme Geri Dön (Rollback)' : 'B) Canlıda Yama Yap (Hotfix)'}</div>
          <div>🔹 <strong>Karar 2 (Test):</strong> ${choices[1] === 'A' ? 'A) Önce Kısa Test Koş (Smoke Test)' : 'B) Hemen Yayına Al (Direct Deploy)'}</div>
          <div>🔹 <strong>Karar 3 (KVKK):</strong> ${choices[2] === 'A' ? 'A) Logları Maskele' : 'B) Ekibe Olduğu Gibi At (Ham Log)'}</div>
        </div>
      </div>

      <!-- Post-Mortem -->
      <div class="card-glass">
        <span class="card-title">Mühendislik Post-Mortem Değerlendirmesi</span>
        <ul style="font-size:11px; color:#CBD5E1; line-height:1.5; padding-left:16px;">
          ${postMortemHtml}
        </ul>
      </div>

      <button id="btn-restart-game" class="btn-primary-cta" style="background:#374151; box-shadow:none; margin-top:auto;">
        🔄 FARKLI BİR STRATEJİYLE YENİDEN OYNA
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

