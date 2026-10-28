# SE Primer: Mobil Arayüz ve Tasarım Spesifikasyonu (DESIGN.md)
## Google Stitch Tasarım Sistemi ve 3 Mobil Ekran Mimarisi

- **Ders:** YZM301 - Yazılım Mühendisliği
- **Tasarım Aracı & İlham:** Google Stitch (`stitch.withgoogle.com`) · Material Design 3 · Retro-Futuristic Terminal / Modern HealthTech
- **Platform:** Mobil Öncelikli Web (Mobile-First Web App, 375px - 430px iPhone & Android referans ekranları)

---

## 1. Tasarım Felsefesi ve Stitch Entegrasyonu

*The Diamond Age* eserinde genç kıza rehberlik eden Primer kitabının modern yazılım mühendisi versiyonu olarak tasarlanan SE Primer arayüzü şu üç prensibe dayanır:

1. **Bilişsel Yükü Yöneten Minimalizm:** Kriz anında mühendisin dikkati dağılmamalıdır. Ekranda aynı anda tek bir karar ve ilgili telemetri verileri yer alır.
2. **Kişiselleştirilmiş Gerilim & Güvenlik:** Junior mühendis için sıcak, öğretici ve korumalı bir atmosfer sunulurken; Senior mühendis için 60 saniyelik görsel bir nabız (stress ticker) ve keskin teknik log dili devreye girer.
3. **Sokratik Etkileşim Odaklılığı:** AI Tutor bir kenar süsü değil, karar ekranının merkezinde düşündüren ve yönlendiren canlı bir pedagojik ortaktır.

---

## 2. Tasarım Sistemi ve Tokenlar (Apple Pro Design Tokens)

### 2.1. Renk Paleti (Cupertino OLED Dark Palette)
| Token Adı | Değer | Kullanım Alanı | Anlamsal Karşılığı |
|---|---|---|---|
| `--apple-black` | `#000000` | Saf OLED arka plan | Apple Pro derin kontrast |
| `--apple-card` | `rgba(28, 28, 30, 0.65)` | Frosted glass kartlar | Apple akrilik yüzey |
| `--apple-border` | `rgba(255, 255, 255, 0.12)` | Mikro çerçeveler | Fırçalanmış titanyum kenar |
| `--apple-blue` | `#2997ff` | Birincil aksiyonlar | Apple System Blue |
| `--apple-purple` | `#bf5af2` | Sokratik AI Tutor | Apple Intelligence / Siri Aurora |
| `--apple-red` | `#ff453a` | Kriz telemetrisi, 08:00 çöküşü | Apple System Red aciliyet |
| `--apple-green` | `#30d158` | İyi Son (Son A), kurtarılan hasta | Apple Health / Fitness Green |
| `--apple-text-primary`| `#f5f5f7` | Başlıklar ve birincil metin | Apple Platinum White |
| `--apple-text-secondary`| `#86868b` | Alt metinler ve açıklamalar | Apple Space Gray |

### 2.2. Tipografi (Typography)
- **Ana Yazı Tipi:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif`
- **Monospace Yazı Tipi:** `"SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`
- **Ölçekler ve Efektler:**
  - `Hero Title`: 26px / Bold / Brushed Titanium Gradient (`linear-gradient(180deg, #FFFFFF 0%, #A1A1A6 100%)`)
  - `Card Header`: 14px / Semi-Bold (Letter-spacing: -0.015em)
  - `Body Text`: 13px / Regular (Line-height: 1.45, Color: `#86868b`)
  - `Apple Pill Badges`: 11px / Medium (Letter-spacing: 0.04em)

### 2.3. Donanım ve Etkileşim Öğeleri
- **Apple Dynamic Island:** Üst çentik yerine 126x32px boyutunda interaktif kamera/sensör adacığı.
- **Titanium Bezel:** iPhone 16 Pro referanslı 4px `#2c2c2e` fırçalanmış çerçeve ve yumuşak derin gölge.
- **Apple Pill CTA:** 980px yuvarlatılmış hap formunda birincil aksiyon butonları.

---

## 3. Üç Mobil Ekranın Detaylı Mimarisi

```
+--------------------------+    +--------------------------+    +--------------------------+
|  EKRAN 1: GİRİŞ (ONBOARD) |    |   EKRAN 2: SAHNE & KRİZ  |    |   EKRAN 3: SON & RAPOR   |
+--------------------------+    +--------------------------+    +--------------------------+
| [SE Primer Logosu]       |    | 08:00 | [300 Hasta] [STRES]|  | [SON A: İYİ SON] (Yeşil) |
| "Kişiye uyum sağlayan    |    | [Senaryo & Kriz Kartı]   |    | "08:25 Sistem Ayakta,    |
|  kitap, yazılımcı için"  |    | ------------------------ |    |  Veri Güvende"           |
|                          |    | [KARAR SEÇENEKLERİ]      |    | ------------------------ |
| 1. Seviye:               |    | [ A) Eski Sürüme Dön   ] |    | METRİKLER:               |
|  [Junior]  [Senior]      |    | [ B) Canlıda Yama Yap  ] |    | - MTTR: 4 Dakika         |
|                          |    | ------------------------ |    | - KVKK Skoru: 100/100    |
| 2. Rol:                  |    | [TEKNİK GERİ BİLDİRİM]   |    | - Hasta Kaybı: 0         |
|  [Backend][DevOps][Full] |    | Ne Oldu? / Neden Oldu?   |    | ------------------------ |
|                          |    | ------------------------ |    | POST-MORTEM ANALİZİ:     |
| 3. Hedef:                |    | [AI TUTOR SOHBETİ]       |    | Kararların Teknik Özeti  |
|  [Güvenlik][Hız][Öğrenme]|    | Tutor: "DB şemasını      |    |                          |
|                          |    |  nasıl kontrol edersin?" |    | [YENİDEN DENE / KEŞFET]  |
| [Krize Başla (08:00)]    |    | [Öğrenci Soru Alanı]     |    |                          |
+--------------------------+    +--------------------------+    +--------------------------+
```

---

### 3.1. Ekran 1: Giriş ve Kişiselleştirme Ekranı (Onboarding)
- **Bileşenler:**
  - `HeaderBanner`: Retro-illüstrasyon ve "The Young Engineer's Illustrated Primer" alt başlığı.
  - `ProfileCard`: 3 adımlı interaktif seçim alanı:
    - **Soru 1 (Seviye):** `[Yeni Başladım (Junior)]` (Sokratik rehber modu) vs `[Deneyimliyim (Senior)]` (60s geri sayım stres modu).
    - **Soru 2 (Rol):** `[Backend Mimarisi]`, `[DevOps & SRE]`, `[Fullstack]`.
    - **Soru 3 (Öncelikli Hedef):** `[Sistem Güvenilirliği (%99.9 Uptime)]`, `[Maksimum Hız (En Erken Açılış)]`, `[Mimari Öğrenme]`.
  - `DynamicPreviewBadge`: Seçilen profile göre oyun dinamiklerinin nasıl değişeceğini anlık gösteren mikro-ipucu kartı (Örn: "Senior seçildi: 60 saniyelik geri sayım sayacı aktif edilecek!").
  - `CTAButton`: "Nöbeti Devral: Krize Başla (08:00)" geniş yeşil/mavi buton.

---

### 3.2. Ekran 2: Sahne, Karar ve Sokratik AI Tutor Ekranı (Crisis & Decision)
- **Bileşenler:**
  - `TelemetryHeader`:
    - Simüle edilen saat (`08:00:14`).
    - Bekleyen hasta sayısı (`300 Hasta Bekliyor`).
    - Sistem Hata Oranı (`%98.4 (500 Internal Error)`).
    - *Senior Modu İçin:* Kırmızı/Sarı nabız animasyonlu **60s Geri Sayım Çubuğu (Stress Timer)**.
  - `CrisisNarrativeCard`:
    - "Dün gece yeni sürüm canlıya alındı. Saat 08:00 itibarıyla randevu servisi yanıt vermiyor. Poliklinik kapılarında 300 hasta sırada bekliyor."
  - `DecisionMatrix`:
    - Büyük dokunmatik A ve B butonları.
    - Seçim yapıldığında anında kilitlenir ve teknik geri bildirim paneli açılır.
  - `FeedbackPanel (Ne Oldu / Neden Oldu?)`:
    - İki sekmeli veya iki vurgu kutulu teknik özet:
      - 🔹 **Ne Oldu?**: Yapılan eylemin altyapıda gerçekleştirdiği somut işlem.
      - 🔸 **Neden Oldu?**: O eylemin altında yatan yazılım mühendisliği kök nedeni.
  - `AITutorDock`:
    - Mor temalı, asistan avatarı içeren konuşma alanı.
    - Hızlı Soru Hapları: `"Bu kararın riski ne?"`, `"Geri dönersek DB bozulur mu?"`, `"İpucu ver"`.
    - Soru giriş kutusu ve Gönder butonu.
    - Tutor Cevap Balonu: Öğrenciye cevabı vermeyen, Sokratik yöntemle düşündürücü soru yönelten canlı metin.

---

### 3.3. Ekran 3: Sonuç ve Post-Mortem Ekranı (Outcome & Post-Mortem)
- **Bileşenler:**
  - `OutcomeHeroCard`:
    - **Son A (İyi Son):** Zümrüt yeşili kart, kupa ikonu. "08:25 - Sistem Ayakta, Veri Güvende! 300 hasta muayenesine başladı."
    - **Son B (Kötü Son):** Koyu kırmızı/amber kart, uyarı ikonu. "Sistem Ayakta ama KVKK İhlali! T.C. kimlik numaraları ve sağlık verileri açık kanalda paylaşıldığı için KVKK Madde 18 uyarınca 2.500.000 TL idari para cezası ve soruşturma başlatıldı."
    - **Son C (Kritik Çöküş):** Canlıda kontrolsüz yama sonucu veritabanı kilitlendi, sistem kurtarılamadı.
  - `PostMortemMetricsGrid`:
    - 4 kritik KPI: Kurtarılan Hasta (örn. 300/300 veya 120/300), MTTR (4 dk vs 45 dk), KVKK Uyum Skoru (100% vs 0%), Mimari Kararlılık (A+ vs F).
  - `DecisionAuditTimeline`:
    - Karar 1 -> Karar 2 -> Karar 3 adımlarında oyuncunun hangi şıkları seçtiği ve bu seçimlerin birikimli etkisi.
  - `RestartAction`: "Farklı Bir Stratejiyle Yeniden Oyna" butonu.

---

## 4. Stitch Ekran Prototip Dosyaları ve Galeri

Proje bünyesinde Stitch mobil ekran prototipleri doğrudan bağımsız tam ekran HTML/CSS olarak ve uygulamanın içindeki **"🎨 Stitch Ekranları"** sekmesinde canlı olarak sunulmaktadır:
1. `stitch_screen_1_onboarding.html`: Giriş, profil ve hedef seçimi Stitch prototipi.
2. `stitch_screen_2_crisis.html`: 08:00 kriz ekranı, 60s geri sayım sayacı, telemetri, karar butonları ve Sokratik Tutor Stitch prototipi.
3. `stitch_screen_3_outcome.html`: Son A ve Son B post-mortem değerlendirme ekranı Stitch prototipi.
4. `stitch_gallery.html`: Üç mobil ekranı yan yana gösteren interaktif Stitch tasarım galerisi.

