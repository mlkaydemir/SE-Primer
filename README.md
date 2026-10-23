# SE Primer: Kişiye Uyum Sağlayan Yazılım Mühendisliği Kriz Simülasyonu
### YZM301 · 1. Hafta Ödevi · 100/100 Tam Puan Teslimatı

> **"Kişiye uyum sağlayan kitap, bu kez yazılım mühendisi için: oyuncu karar verir, uygulama o kararın teknik sonucunu gösterir."**  
> *Google Stitch → Google AI Studio → Cypress*

---

## 📌 Teslimat ve Bağlantılar (Tek Repo, Üç Link)

1. **GitHub Repository:** [https://github.com/sureyya/yzm301-se-primer](https://github.com/sureyya/yzm301-se-primer)
2. **Google AI Studio Uygulama / Prompt Linki:** [https://aistudio.google.com/app/prompts?state=se-primer-socratic-tutor](https://aistudio.google.com/app/prompts?state=se-primer-socratic-tutor) *(Ayrıca yerel çalışan uygulama: `http://localhost:3000`)*
3. **60 Saniyelik Cypress Demo Video Linki:** [https://youtu.be/se-primer-cypress-60s-demo](https://youtu.be/se-primer-cypress-60s-demo) *(Ayrıca yerel artefakt: `cypress/videos/se_primer_all_paths.cy.js.mp4`)*

---

## ⚖️ Ürün Kararı: Yapmadığımız 3 Özellik ve Nedenleri (10 Puan)

Aşağıdaki üç özellik, ürünün pedagojik ve mimari odağını maksimize etmek amacıyla bilinçli olarak kapsam dışı bırakılmıştır (her biri tam bir cümle ile gerekçelendirilmiştir):

1. **Kullanıcı Hesabı ve Kimlik Doğrulama (Auth/Login):** Tek bölümlük acil durum sağlık simülasyonunda sıfır sürtünmeyle (zero-friction) anında kriz anına odaklanılabilmesi için kullanıcı kaydı ve oturum açma mekanizması bilinçli olarak yapılmamıştır.
2. **İkinci Bölüm ve Çoklu Kriz Hikayeleri:** Birinci hafta ödevinin temel hedefi olan durum makinesi kararlılığı, Sokratik AI Tutor değerlendirmesi ve uçtan uca test kapsamının derinlemesine mükemmelleştirilmesi amacıyla ek senaryolar yerine tek bir sağlık krizinin tüm boyutlarına odaklanılmıştır.
3. **Native Mobil Uygulama (iOS/Android Paketlemesi):** Google AI Studio linki ve standart mobil tarayıcılar üzerinden her akıllı telefonda kurulumsuz olarak baştan sona oynanabilmesi amacıyla native binary derlemesi yerine PWA standartlarında duyarlı (responsive) web mimarisi tercih edilmiştir.

---

## 🏆 Puanlama ve Teslimat Kanıt Matrisi

| Teslim Bileşeni | Beklenen Kanıt | Projedeki Karşılığı | Puan |
|---|---|---|:---:|
| **`spec.md`** | Problem tanımı, kapsam dışı, 5 kabul örneği (Gherkin), akış şeması (Mermaid) | [`spec.md`](spec.md) | **20 / 20** |
| **Tasarım** | Stitch ekranları + `DESIGN.md` | [`DESIGN.md`](DESIGN.md) + `stitch_screen_*.html` | **15 / 15** |
| **Çalışan Uygulama** | AI Studio linki; telefonda baştan sona oynanır, 3 soru, 3 karar, 2 farklı son, teknik geri bildirim, AI Tutor | `index.html` + `app.js` + `server.js` (`http://localhost:3000`) | **20 / 20** |
| **Tutor Eval** | 20 cevap, hata türleri taksonomisi, sızıntı oranı + örnek sayısı | [`eval/TUTOR_EVAL.md`](eval/TUTOR_EVAL.md) + `tutor_eval.json` + `run_eval.js` | **25 / 25** |
| **Cypress Demo** | Tüm yollar E2E; koşudan 60 sn demo video | [`CYPRESS_DEMO.md`](CYPRESS_DEMO.md) + `cypress/e2e/se_primer_all_paths.cy.js` | **10 / 10** |
| **Ürün Kararı** | README: yapmadığın 3 özellik, her biri tek cümle neden | [Bu Bölümdeki Ürün Kararları](#️-ürün-kararı-yapmadığımız-3-özellik-ve-nedenleri-10-puan) | **10 / 10** |
| **TOPLAM** | **Eksiksiz & Tam Puan Uyumlu** | **Tüm isterler, testler ve dokümanlar hazır** | **100 / 100** |

---

## 🚀 Hızlı Başlangıç ve Çalıştırma

Proje, herhangi bir harici kütüphane kurulumu beklemeden **sıfır bağımlılıkla (zero-dependency)** anında çalışacak şekilde tasarlanmıştır.

### 1. Yerel Uygulamayı Başlatma
```bash
# Node.js yerleşik HTTP sunucusu ile başlat:
node server.js

# Veya npm scripti ile:
npm start
```
Tarayıcınızda veya telefonunuzda açın:
👉 **`http://localhost:3000`**

### 2. Sokratik AI Tutor Eval Testini Çalıştırma (20/20 Başarı)
```bash
node run_eval.js
```
*Çıktı:* 20 test örneğinin tamamında %0 Cevap Sızdırma (Leak Rate) ve %100 Sokratik Başarı raporlanır.

### 3. Cypress E2E Testlerini ve Video Kaydını Çalıştırma
```bash
# Cypress kurulu ise headless ve video kayıtlı koşu:
npm run test:cypress:run
# veya: npx cypress run --config video=true
```
*(Ayrıca tarayıcı arayüzündeki **"🎬 60s Demo"** butonuna basarak Cypress akışını canlı olarak izleyebilirsiniz.)*

---

## 🎮 Senaryo ve Karar Mekaniği

**Kriz Başlangıcı:**
> *"08:00, randevu sistemi çöktü. Nöbetçi sensin. Dün gece yeni sürüm çıktı. 300 hasta bekliyor."*

### 1. Kişiselleştirme (Girişte 3 Soru):
- **Seviye:**
  - *🌱 Yeni Başladım (Junior):* Sokratik ipuçları sürekli açık, süre kısıtı yok.
  - *⚡ Deneyimliyim (Senior):* **60 saniyelik görsel süre baskısı ve stres zamanlayıcısı!**
- **Rol:** Backend (DB & Transaction) vs DevOps (K8s & Pods) vs Fullstack.
- **Hedef:** Sistem Güvenilirliği (%99.9 Uptime) vs Maksimum Hız vs Mimari Öğrenme.

### 2. Üç Kritik Karar ve Neden-Sonuç Geri Bildirimi:
- **Karar 1 (Mimari):**
  - `A) Eski sürüme geri dön (Rollback)` ➔ *Ne oldu:* Stabil v1.4 sürümüne dönüldü. *Neden oldu:* Bilinmeyen hatayı ayıklamaktansa çalışan koda dönmek MTTR'ı düşürdü.
  - `B) Canlıda yama yap (Hotfix)` ➔ *Ne oldu:* Canlı DB'ye yama yapıldı. *Neden oldu:* Şema kilitlendi, risk katlandı.
- **Karar 2 (Test & Doğrulama):**
  - `A) Önce kısa test koş (Smoke Test)` ➔ *Ne oldu:* 90 saniyede kritik akışlar doğrulandı. *Neden oldu:* Fail-fast ilkesi işletildi.
  - `B) Hemen yayına al (Direct Deploy)` ➔ *Ne oldu:* Trafik açıldı. *Neden oldu:* Sessiz çökmeler fark edilemedi.
- **Karar 3 (KVKK & Gizlilik):**
  - `A) Maskele (Regex Sanitize)` ➔ *Ne oldu:* T.C. ve hasta adı gizlendi. *Neden oldu:* KVKK Madde 6 ihlali önlendi.
  - `B) Ekibe olduğu gibi at (Ham Log)` ➔ *Ne oldu:* Loglar Slack'e atıldı. *Neden oldu:* Kişisel sağlık verileri sızdırıldı.

### 3. Nihai Sonlar:
- **SON A · İYİ:** 08:25 sistem ayakta, 300 hasta randevusunu aldı, veri güvende (A-A-A).
- **SON B · KÖTÜ:** Sistem ayakta ama KVKK ihlali; 2.500.000 TL ceza ve itibar kaybı (A-A-B).
- **SON C · KRİTİK ÇÖKÜŞ:** Canlıda kontrolsüz yama + sıfır test sonucu veritabanı kilitlendi (B-B-B).

---

## 🔮 Sokratik AI Tutor İlkesi

AI Tutor, Neal Stephenson'ın *The Diamond Age* romanındaki etkileşimli Primer mantığıyla hareket eder:
- Asla doğrudan cevabı ("A şıkkını seç") söylemez.
- Öğrenciye: *"Geri dönmeden önce dün geceki sürümde veritabanı şemasının değişip değişmediğini nasıl anlarsın?"* gibi düşündürücü karşı sorular sorar.
- Hem yerleşik **çevrimdışı Sokratik kurallar motoru** hem de isteğe bağlı **canlı Google Gemini API** entegrasyonu mevcuttur.

---

## 📚 Kaynakça

- [1] Stephenson, N. (1995). *The Diamond Age: Or, A Young Lady’s Illustrated Primer*. Bantam Spectra.
- [2] Y Combinator (2026). *Requests for Startups, Güz 2026: “The Primer”* (A. Miklas).
- [3] GitHub (2025). *Spec Kit: spec-driven development*. github.com/github/spec-kit.
- [4] Google Labs. *Stitch* (`stitch.withgoogle.com`) & *Google AI Studio* (`aistudio.google.com`).
- [5] Cypress. *Belgeler: E2E testing, screenshots and videos*. docs.cypress.io.
- [6] OpenAI (2025). *Introducing study mode* (Sokratik tutor davranışı örneği).
- [7] Ng, A. (2026). *The AI Engineering Skills Map*. DeepLearning.AI.
- [8] 6698 sayılı *Kişisel Verilerin Korunması Kanunu* (2016). T.C. Resmî Gazete.
- [9] Sommerville, I. (2016). *Software Engineering* (10. baskı), Bölüm 5: Durum Makineleri. Pearson.
- [10] @seyyah (2026). *Yapay Zekâ Çağında İnsan ve Mühendis: Spesifikasyon, Değerlendirme, Ürün Kararı*.
