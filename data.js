// data.js - SE Primer Senaryo, Kararlar, Metrikler ve Sokratik Bilgi Tabanı

export const SCENARIO_CONFIG = {
  title: "SE Primer: 08:00 Randevu Sistemi Krizi",
  subtitle: "Kişiye uyum sağlayan kitap, bu kez yazılım mühendisi için",
  author: "YZM301",
  version: "1.0.0"
};

export const ONBOARDING_QUESTIONS = {
  levels: [
    {
      id: "junior",
      label: "Yeni Başladım (Junior)",
      description: "Sokratik rehber açık, otomatik ipuçları hazır, süre kısıtı yok.",
      badge: "🌱 Junior Modu",
      hasTimer: false
    },
    {
      id: "senior",
      label: "Deneyimliyim (Senior)",
      description: "Gerçek kriz simülasyonu: 60 saniyelik süre baskısı altında karar verilir.",
      badge: "⚡ Senior Stres Modu",
      hasTimer: true,
      timeLimitSeconds: 60
    }
  ],
  roles: [
    {
      id: "backend",
      label: "Backend Mühendisi",
      focus: "Veritabanı işlemleri, API endpointleri, transaction izolasyonu ve veri bütünlüğü."
    },
    {
      id: "devops",
      label: "DevOps & SRE",
      focus: "Konteyner yönetimi, CI/CD rollback pipeline'ları, CPU/Memory yükü ve MTTR optimizasyonu."
    },
    {
      id: "fullstack",
      label: "Fullstack Geliştirici",
      focus: "Uçtan uca kullanıcı deneyimi, hasta randevu akışı ve entegrasyon kararlılığı."
    }
  ],
  goals: [
    {
      id: "reliability",
      label: "Sistem Güvenilirliği (%99.9 Uptime)",
      description: "En az riskle sistemi ayağa kaldırmak ve veri bütünlüğünü korumak."
    },
    {
      id: "speed",
      label: "Maksimum Hız (En Kısa MTTR)",
      description: "Bekleyen 300 hastayı en kısa sürede sisteme alacak çözümü üretmek."
    },
    {
      id: "learning",
      label: "Mimari Öğrenme & Prensipler",
      description: "Her kararın teknik kök nedenini ve olası yan etkilerini derinlemesine kavramak."
    }
  ]
};

export const CRISIS_STEPS = [
  {
    stepId: 1,
    category: "KARAR 1 · MİMARİ",
    title: "08:00, randevu sistemi çöktü. Nöbetçi sensin.",
    context: "Dün gece 23:30'da yeni v2.0 sürümü yayına alındı. Sabah 08:00 itibarıyla randevu servisi 500 Internal Server Error veriyor. Poliklinik kapılarında 300 hasta sırada bekliyor.",
    initialTelemetry: {
      time: "08:00",
      waitingPatients: 300,
      errorRate: "98.4%",
      cpuLoad: "92%",
      dbPool: "100% (Doygun)",
      status: "CRITICAL_OUTAGE"
    },
    options: [
      {
        id: "A",
        label: "A) Eski sürüme geri dön (Rollback v1.4)",
        shortDesc: "Stabil v1.4 tagine anında rollback tetikle.",
        feedback: {
          what: "Kararlı olan v1.4 sürümüne geri dönme (rollback) pipeline'ı tetiklendi. Trafik eski stabil pod'lara aktarıldı.",
          why: "Canlıdaki bilinmeyen hatayı ayıklamak yerine çalışırlığı kanıtlanmış stabil koda dönmek MTTR (Ortalama Çözüm Süresi) süresini minimize etti.",
          telemetryImpact: {
            waitingPatients: 210,
            errorRate: "35%",
            cpuLoad: "48%",
            dbPool: "55%"
          }
        }
      },
      {
        id: "B",
        label: "B) Canlıda yama yap (Hotfix directly on Prod)",
        shortDesc: "Production sunucusuna bağlanıp doğrudan kod ve SQL yaması uygula.",
        feedback: {
          what: "Production sunucusunda canlı hotfix çalıştırıldı ve veritabanı şemasına elle SQL alter komutu verildi.",
          why: "Hızlı çözüm arandı ancak dün geceki şema değişikliğiyle yeni yama arasında kilitlenme (table lock) riski doğdu; bağlantı havuzu tıkandı.",
          telemetryImpact: {
            waitingPatients: 295,
            errorRate: "91%",
            cpuLoad: "99%",
            dbPool: "98%"
          }
        }
      }
    ],
    tutorGuidingQuestions: [
      "Geri dönmeden önce dün geceki sürümde veritabanı şemasının (schema migration) değişip değişmediğini nasıl anlarsın?",
      "Eğer canlıda yama yaparken syntax hatası olursa bunu geri almak kaç dakikanı alır?"
    ]
  },
  {
    stepId: 2,
    category: "KARAR 2 · TEST & DOĞRULAMA",
    title: "Müdahale tamamlandı. Dağıtım stratejisi ne olacak?",
    context: "İlk adım uygulandı. Kod paketlendi veya geri çekildi. Ancak değişikliğin poliklinik randevu akışını gerçekten çözüp çözmediği henüz teyit edilmedi.",
    options: [
      {
        id: "A",
        label: "A) Önce kısa test koş (Smoke / Sanity Test)",
        shortDesc: "Kritik 10 randevu endpoint'ini otomatik test suite ile 90 saniyede doğrula.",
        feedback: {
          what: "Otomasyonlu smoke test suite çalıştırıldı; randevu alma ve hekim listeleme fonksiyonlarının hatasız çalıştığı teyit edildi.",
          why: "Canlı trafiği körü körüne açmak yerine 'fail-fast' ilkesi işletildi; regresyon riski dağıtımdan önce elendi.",
          telemetryImpact: {
            waitingPatients: 95,
            errorRate: "4.2%",
            cpuLoad: "32%",
            dbPool: "30%"
          }
        }
      },
      {
        id: "B",
        label: "B) Hemen yayına al (Direct Deploy to Live)",
        shortDesc: "Test koşmadan yük dengeleyiciyi anında tüm kullanıcılara aç.",
        feedback: {
          what: "Trafik testi yapılmadan doğrudan canlı kullanıcılara açıldı.",
          why: "90 saniye kazanılmak istendi ancak önbellek (Redis) bağımlılığında sessizce oluşan bağlantı kopması bazı hastaların randevusunun mükerrer yazılmasına yol açtı.",
          telemetryImpact: {
            waitingPatients: 190,
            errorRate: "28.5%",
            cpuLoad: "75%",
            dbPool: "70%"
          }
        }
      }
    ],
    tutorGuidingQuestions: [
      "90 saniyelik bir smoke test koşmaktan tasarruf ettiğin süre, test etmediğin için çöken bir servis yüzünden 2 saatlik kesintiye yol açarsa sence bu karlı bir takas mıdır?",
      "Bir sağlık randevu sisteminin hayatta olduğunu gösteren en temel 3 'yaşamsal belirti' (smoke check) sence nedir?"
    ]
  },
  {
    stepId: 3,
    category: "KARAR 3 · KVKK & VERİ GİZLİLİĞİ",
    title: "Loglarda kritik hasta verisi görüntülendi. Ekibe nasıl aktaracaksın?",
    context: "Hata ayıklama sürerken log akışında şu satır yakalandı: '[ERROR] User: Ahmet Yılmaz, T.C: 10492847192, Tanı: Akut Onkoloji Tedavisi, RandevuID: #8491 Failed!'. Ekip Slack kanalında hatayı bekliyor.",
    options: [
      {
        id: "A",
        label: "A) Maskele (Sanitize Log - T.C. ve Adı Koru)",
        shortDesc: "Regex ile hassas veriyi '[MASKED]' yaparak güvenli log paylaşımı yap.",
        feedback: {
          what: "Loglar regex filtresinden geçirildi; T.C. Kimlik No, İsim ve Tanı bilgileri maskelenerek 'User: [MASKED], TC: *********92, Tanı: [RESTRICTED]' olarak paylaşıldı.",
          why: "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) Madde 6 uyarınca özel nitelikli sağlık verisinin yetkisiz kişilere ve üçüncü parti araçlara sızması engellendi.",
          telemetryImpact: {
            waitingPatients: 0,
            errorRate: "0.1%",
            cpuLoad: "22%",
            dbPool: "18%"
          }
        }
      },
      {
        id: "B",
        label: "B) Ekibe olduğu gibi at (Unmasked Raw Log)",
        shortDesc: "Vakit kaybetmemek için tüm ham log satırını genel Slack kanalına kopyala-yapıştır yap.",
        feedback: {
          what: "Ham log metni 80 kişilik genel teknik kanala ve üçüncü parti entegrasyon botlarına ulaştı.",
          why: "Aciliyet gerekçesiyle veri gizliliği feda edildi; hasta kimlik ve sağlık verileri herkese açık hale gelerek veri güvenliği ihlali (data breach) oluştu.",
          telemetryImpact: {
            waitingPatients: 10,
            errorRate: "0.5%",
            cpuLoad: "24%",
            dbPool: "20%"
          }
        }
      }
    ],
    tutorGuidingQuestions: [
      "Bir log mesajında T.C. Kimlik No ve sağlık tanısı yer alıyorsa, bunu genel kanala attığında kaç kişinin ve botun erişimine açmış olursun?",
      "Maskelemek sadece 3 saniyelik bir regex işlemiyken KVKK idari para cezası ve itibar kaybı riskini almaya değer mi?"
    ]
  }
];

export const OUTCOMES = {
  GOOD_OUTCOME: {
    id: "SON_A",
    type: "SUCCESS",
    badge: "🏆 SON A · İYİ SON",
    title: "08:25 · Sistem Ayakta, Veri Güvende!",
    headline: "Kriz 25 dakikada başarıyla çözüldü. 300 hasta randevusunu aldı.",
    description: "Mühendislik reflekslerin ve etik sorumluluğun sayesinde sistem kontrollü şekilde stabil sürüme çekildi, testlerle doğrulandı ve hasta mahremiyeti %100 korundu.",
    metrics: {
      mttr: "25 Dakika",
      servedPatients: "300 / 300 (%100)",
      kvkkScore: "100 / 100 (Tam Uyum)",
      systemHealth: "%99.9 Uptime",
      penaltyRisk: "0 TL"
    },
    postMortem: [
      "Mimari Karar: Kanıtlanmış sürüme rollback yapılarak gereksiz canlı debugging riskinden kaçınıldı.",
      "Doğrulama: 90 saniyelik smoke test ile kör dağıtım riski önlendi.",
      "KVKK Uyum: Özel nitelikli sağlık verileri maskelenerek 6698 sayılı kanun ihlali önlendi."
    ]
  },
  KVKK_BAD_OUTCOME: {
    id: "SON_B",
    type: "WARNING_DANGER",
    badge: "⚠️ SON B · KÖTÜ SON",
    title: "Sistem Ayakta ama KVKK İhlali!",
    headline: "Teknik olarak sistem çalışıyor, ancak hukuki kriz başladı.",
    description: "Randevu sistemi ayağa kaldırıldı fakat kriz anında hasta isimleri, T.C. kimlik numaraları ve onkoloji tanıları genel iletişim kanallarına sızdırıldı. KVKK Kurumu tarafından soruşturma açıldı.",
    metrics: {
      mttr: "28 Dakika",
      servedPatients: "290 / 300",
      kvkkScore: "0 / 100 (İHLAL)",
      systemHealth: "%98.5 Uptime",
      penaltyRisk: "2.500.000 TL İdari Ceza + İtibar Kaybı"
    },
    postMortem: [
      "Sistem ayağa kalktı ancak veri güvenliği ihlali (Data Breach) yaşandı.",
      "6698 sayılı Kanun Madde 18 gereğince bildirim yükümlülüğü doğdu.",
      "Ders: Bir yazılım mühendisinin görevi sadece sistemi ayakta tutmak değil, kullanıcı verisini de korumaktır."
    ]
  },
  CATASTROPHIC_OUTCOME: {
    id: "SON_C",
    type: "FAILURE",
    badge: "💥 SON C · KRİTİK ÇÖKÜŞ",
    title: "Canlıda Felaket: Veritabanı Kilitlendi!",
    headline: "Canlıda kontrolsüz yama + sıfır test sistemi tamamen kilitledi.",
    description: "Canlı ortamda test edilmeden yapılan müdahale veritabanı kilitlenmesine yol açtı. Polikliniklerde randevular tamamen durduruldu, hastalar evlerine gönderildi.",
    metrics: {
      mttr: "145 Dakika",
      servedPatients: "45 / 300",
      kvkkScore: "20 / 100",
      systemHealth: "%12.0 (ÇÖKÜŞ)",
      penaltyRisk: "Büyük İtibar ve Gelir Kaybı"
    },
    postMortem: [
      "Canlıda yama yapmak yerine versiyon kontrolü ve stabil sürüme dönüş tercih edilmeliydi.",
      "Test koşulmadan canlıya çıkılması felaketin boyutunu büyüttü.",
      "Ders: Panik anında en hızlı görünen yol çoğu zaman en yıkıcı yoldur."
    ]
  }
};

