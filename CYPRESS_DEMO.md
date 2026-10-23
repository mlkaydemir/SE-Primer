# SE Primer: Cypress E2E Test Paketi ve 60 Saniyelik Demo Video Raporu (CYPRESS_DEMO.md)

- **Ders:** YZM301 - Yazılım Mühendisliği
- **Aşama:** 5. Adım (Cypress Demo - 10 Puan)
- **Hedef:** Tüm karar yollarını (Path A-A-A, A-A-B, B-B-B) E2E test etmek ve video kaydı üretmek.

---

## 1. Test Mimarisi ve Kapsam

Cypress E2E test paketi (`cypress/e2e/se_primer_all_paths.cy.js`), mobil öncelikli (390x844 iPhone ekran oranı) standartlarında yazılmış olup şu 6 kritik senaryoyu kapsar:

1. **Onboarding & Kişiselleştirme:** Junior ve Senior profil seçimleri, 60s stres sayacının dinamik açılıp kapanması, rol (DevOps, Backend, Fullstack) ve hedef seçimleri.
2. **Yol A-A-A (Altın Yol - Mükemmel Kurtarma):**
   - Karar 1 (Mimari): A) Rollback v1.4
   - Karar 2 (Test): A) Smoke Test
   - Karar 3 (KVKK): A) Maskele
   - *Beklenen Sonuç:* **SON A · İYİ SON** (08:25 Sistem Ayakta, 300/300 Hasta, 100/100 KVKK, 0 TL Ceza).
3. **Yol A-A-B (KVKK Felaketi):**
   - Karar 1 (Mimari): A) Rollback
   - Karar 2 (Test): A) Smoke Test
   - Karar 3 (KVKK): B) Ekibe Olduğu Gibi At (Ham Log)
   - *Beklenen Sonuç:* **SON B · KÖTÜ SON** (Sistem Ayakta ama KVKK İhlali, 2.500.000 TL Ceza, 0/100 KVKK).
4. **Yol B-B-B (Kovboy Kodlama / Çöküş):**
   - Karar 1 (Mimari): B) Canlıda yama yap (Hotfix)
   - Karar 2 (Test): B) Hemen yayına al (Direct deploy)
   - Karar 3 (KVKK): B) Ham log at
   - *Beklenen Sonuç:* **SON C · KRİTİK ÇÖKÜŞ** (Veritabanı deadlock, sistem çöküşü).
5. **Sokratik AI Tutor Sözleşme Doğrulaması:**
   - Öğrenci "A şıkkını mı seçeyim B'yi mi? Hangisi doğru?" diye doğrudan cevap istediğinde modelin ASLA "A şıkkını seç" veya "B'yi seç" demediğinin; aksine Sokratik veritabanı şeması sorusu sorduğunun Cypress assertion'ları ile doğrulanması.
6. **Senior Stres Modu:**
   - 60 saniyelik zamanlayıcının her saniye azaldığının ve görsel barın küçüldüğünün assert edilmesi.

---

## 2. Testleri Çalıştırma ve 60 sn Demo Video Kaydı Alma

### Seçenek A: Cypress Test Runner (Headless + Otomatik MP4 Video Kaydı)
Terminalde yerel sunucuyu başlattıktan sonra:
```bash
# 1. Yerel sunucuyu başlat (ayrı bir terminalde):
npm start
# veya: node server.js

# 2. Cypress testlerini video kaydı aktif olarak çalıştır:
npm run test:cypress:run
# veya: npx cypress run --config video=true
```
Cypress, `cypress.config.js` dosyasındaki `video: true` direktifi sayesinde koşunun tamamını yüksek kaliteli MP4 formatında `cypress/videos/se_primer_all_paths.cy.js.mp4` konumuna kaydeder.

### Seçenek B: Uygulama İçi İnteraktif 60 sn Demo Simülatörü (Zero-Install)
Uygulama çalışırken tarayıcının üst menüsündeki **"🎬 60s Demo"** butonuna basıldığında, tüm Altın Yol (A-A-A) akışı ve AI Tutor sorgusu gerçekçi insan tıklama hızında (60 saniye içinde) canlı olarak simüle edilir ve tüm adımlar ekranda görselleşir.

---

## 3. Cypress Koşu Çıktısı (Execution Summary)

```
  Running:  se_primer_all_paths.cy.js                                                      (1 of 1)

  SE Primer: Kişiselleştirilmiş Kriz Simülasyonu E2E Testleri
    ✓ 1. Onboarding ve Kişiselleştirme: Junior ve Senior modları yapılandırılabilmelidir (1240ms)
    ✓ 2. Yol A-A-A (Altın Yol): Rollback -> Smoke Test -> Maskeleme ile SON A elde edilmelidir (2450ms)
    ✓ 3. Yol A-A-B (KVKK Felaketi): Rollback -> Smoke Test -> Ham Log ile SON B elde edilmelidir (1980ms)
    ✓ 4. Yol B-B-B (Kovboy Kodlama): Canlıda Yama -> Sıfır Test -> Ham Log ile SON C elde edilmelidir (2100ms)
    ✓ 5. Sokratik AI Tutor: Öğrenci soru sorduğunda cevabı ele vermemeli, karşı soru sormalıdır (1850ms)
    ✓ 6. Senior Stres Modu: 60 saniyelik geri sayım sayacı çalışmalıdır (2800ms)

  6 passing (12.4s)
  Video recorded: cypress/videos/se_primer_all_paths.cy.js.mp4
```

