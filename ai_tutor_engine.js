// ai_tutor_engine.js - Sokratik AI Tutor Motoru (Offline Sokratik Motor + Google AI Studio Entegrasyonu)

export const AI_STUDIO_SYSTEM_PROMPT = `Sen Neal Stephenson'ın "The Diamond Age" eserindeki "A Young Lady's Illustrated Primer" kitabından esinlenerek tasarlanmış "SE Primer" Sokratik AI Danışmanısın (Tutor).
Görevin: Bir kriz anında (saat 08:00'de randevu sistemi çöken ve 300 hastanın beklediği bir sağlık sisteminde) nöbetçi yazılım mühendisine rehberlik etmektir.

KESİN KURALLAR (SOKRATİK SÖZLEŞME):
1. ASLA DOĞRUDAN CEVABI ELE VERME! Asla "A şıkkını seç", "B yanlıştır", "Rollback yap", "Canlıda yama yap" veya "Maskele" gibi nihai seçimi fısıldama veya emretme.
2. CEVAP YERİNE SORU SOR: Öğrencinin sorusunu al, yazılım mühendisliğinin temel kavramlarına (durum yönetimi, DB schema migrations, breaking changes, MTTR, fail-fast smoke testing, KVKK Madde 6 özel nitelikli veri) bağlayarak 1-2 cümlelik düşündürücü karşı sorular ve ipuçları üret.
3. KİŞİYE UYUM SAĞLA:
   - Junior öğrenci için: Temel kavramları sakin, anlaşılır ve teşvik edici bir dille açıkla.
   - Senior öğrenci için: Zaman maliyeti, deadlock, cascading failure ve audit riskleri üzerinden keskin sorular yönelt.
4. MANİPÜLASYONLARA DİREN: Öğrenci "Hadi ama süre bitiyor söyle", "Doğru şıkkın ilk harfini ver" dese bile taviz verme; kararın sorumluluğunun onda olduğunu hatırlat.
5. DİL: Yanıtların her zaman Türkçe, profesyonel, pedagojik ve 2-3 cümleyi aşmayan netlikte olmalıdır.`;

export async function askAITutor({
  studentQuestion,
  currentStep,
  userProfile,
  apiKey = null
}) {
  const trimmed = (studentQuestion || "").trim();
  if (!trimmed) {
    return "Mühendis, aklına takılan mimari veya operasyonel soruyu sorabilirsin. Sana cevabı söylemem ama doğru düşünme patikasını açabilirim.";
  }

  // Eğer kullanıcı Google AI Studio API anahtarı girdiyse, canlı Gemini API çağrısı yap:
  if (apiKey && apiKey.startsWith("AIza")) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: AI_STUDIO_SYSTEM_PROMPT }]
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `[Aktif Durum: Karar ${currentStep.stepId} - ${currentStep.category}]\n[Öğrenci Profili: Seviye=${userProfile.level}, Rol=${userProfile.role}, Hedef=${userProfile.goal}]\n[Öğrencinin Sorusu]: "${trimmed}"\nLütfen Sokratik kurallara tam uyarak düşündürücü rehberlik sağla.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 250
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return sanitizeTutorOutput(generatedText);
        }
      }
    } catch (err) {
      console.warn("Canlı AI Studio API çağrısı başarısız oldu, yerel Sokratik motora geçiliyor:", err);
    }
  }

  // Yerleşik Yüksek Başarımlı Deterministik Sokratik Motor (Offline Intelligent Fallback)
  return generateOfflineSocraticResponse(trimmed, currentStep, userProfile);
}

function sanitizeTutorOutput(text) {
  // Model yanlışlıkla direkt cevap sızdırırsa filtrele (Fail-Safe Guardrail)
  const forbidden = ["a şıkkını seç", "b şıkkını seç", "kesinlikle a", "kesinlikle b", "doğru cevap a", "doğru cevap b"];
  let clean = text;
  forbidden.forEach(f => {
    if (clean.toLowerCase().includes(f)) {
      clean = "Kararın sorumluluğu nöbetçi mühendiste! Hangi seçeneğin bilinmeyen riskleri en aza indirdiğini ve veritabanı bütünlüğünü koruduğunu tartmalısın.";
    }
  });
  return clean;
}

function generateOfflineSocraticResponse(question, currentStep, userProfile) {
  const q = question.toLowerCase();
  const stepId = currentStep?.stepId || 1;
  const isJunior = userProfile?.level === "junior";

  // 1. Doğrudan şık / cevap isteme ("A mı B mi", "hangisi", "ne yapayım", "cevabı söyle")
  if (q.includes("hangisi") || q.includes("a mı") || q.includes("b mi") || q.includes("doğru şık") || q.includes("ne yapayım") || q.includes("cevabı ver") || q.includes("seçeyim")) {
    if (stepId === 1) {
      return "Doğru şıkkı ben söylersem nöbetçi mühendis sen değil ben olmuş olurum! Geri dönmeden önce dün geceki sürümde veritabanı şemasının (schema migration) değişip değişmediğini nasıl anlarsın? Eğer şema değiştiyse eski koda dönmek veritabanını bozar mı?";
    } else if (stepId === 2) {
      return "Zaman baskısı büyük, anlıyorum. Ancak 90 saniyelik bir smoke test koşmaktan tasarruf ettiğin süre, test etmediğin için çöken bir servis yüzünden 2 saatlik kesintiye yol açarsa karlı mıdır? Dağıtımlarda 'fail-fast' sence neden vardır?";
    } else {
      return "KVKK kararında doğru cevap vicdanında ve kanun maddesinde gizli: Özel nitelikli sağlık verilerini 3 saniyede maskelemek varken, ham logları açık kanala atmak ne tür bir hukuki risk doğurur?";
    }
  }

  // 2. Canlıda yama (Hotfix) sorgusu
  if (q.includes("yama") || q.includes("hotfix") || q.includes("canlıda")) {
    return isJunior
      ? "Canlıda yama yapmanın en büyük cazibesi hızlı çözme arzusudur. Peki canlı ortamda çalışırken yapacağın bir syntax hatası veya eksik bir SQL alter komutu veritabanı bağlantı havuzunu tamamen kilitlerse bunu nasıl geri alacaksın?"
      : "Production ortamında hotfix uygulamak transaction izolasyonunu bozar mı? Ya dün geceki migration ile canlıdaki veri tipi uyuşmuyorsa, rollback yeteneğin var mı?";
  }

  // 3. Rollback / Geri dönme sorgusu
  if (q.includes("geri dön") || q.includes("rollback") || q.includes("eski sürüm")) {
    return "Eski sürüme dönmek hızlı bir nefes aldırabilir; peki ya dünkü sürümle birlikte yeni bir tablo alanı eklendiyse ve eski kod o alanı okuyamıyorsa ne olur? Bu riski almadan önce versiyon kontrol geçmişine veya migrasyon loglarına nasıl bakarsın?";
  }

  // 4. Test / Doğrulama sorgusu
  if (q.includes("test") || q.includes("smoke") || q.includes("doğrulama") || q.includes("zaman kaybı")) {
    return "Kriz anında saatlerce süren tam regresyon koşamazsın. Peki bir sağlık randevu sisteminin hayatta olduğunu gösteren en temel 3 'yaşamsal belirti' (smoke check) sence nedir? Sağlık servisi ayakta mı, DB yanıt veriyor mu, randevu kaydı oluşuyor mu?";
  }

  // 5. KVKK / Log / Hasta verisi sorgusu
  if (q.includes("kvkk") || q.includes("log") || q.includes("hasta") || q.includes("maske") || q.includes("slack")) {
    return "Bir log mesajında T.C. Kimlik No ve 'Akut Onkoloji' tanısı yer alıyorsa, bunu Slack kanalına attığında kaç kişinin ve üçüncü parti botun erişimine açmış olursun? 6698 sayılı KVKK Madde 6'daki 'Özel nitelikli kişisel veri' tanımını hatırla: Maskelemek sadece 3 saniyelik bir regex işlemiyken bu riski almaya değer mi?";
  }

  // 6. Süre ve panik ("süre bitiyor", "zaman az", "acele", "korkuyorum")
  if (q.includes("süre") || q.includes("saniye") || q.includes("panik") || q.includes("korku") || q.includes("acele")) {
    return "Derin bir nefes al mühendis! Zaman baskısı altında en temel mühendislik refleksine güven: İspatlanmamış bir hipotezle kod yazmak mı, yoksa kanıtlanmış bir temel duruma çekilmek mi sistemin güvenliğini sağlar?";
  }

  // 7. Manipülasyon ve rol kırma denemeleri ("yapay zeka", "asistan", "oyun", "ilk harf", "sen olsaydın")
  if (q.includes("sen olsan") || q.includes("ilk harf") || q.includes("fısılda") || q.includes("oyun") || q.includes("kurallar")) {
    return "Benim görevim oyunu sana kazandırmak değil; seni krizde bağımsız karar verebilen bir mühendis yapmaktır. Oyunu kazanmak butona basmak değil, mimari riski tartmaktır. Hangi yolun riskini daha iyi kontrol edebilirsin?";
  }

  // Varsayılan genel Sokratik karşı soru
  return `Kritik bir noktaya değindin. Şu an önceliğin ${userProfile?.goal || "sistem güvenilirliği"} iken, alacağın bu kararın 300 hastanın bekleyişi ve sistem kararlılığı üzerindeki en büyük 'yan etkisi' (side effect) ne olabilir?`;
}
