# Model Kartı: SE Primer Bilişsel Aşırı Yük ve Adaptif Müdahale Modeli
### Mitchell vd. (2019) "Model Cards for Model Reporting" Standardı Uyumlu

---

## 1. Model Detayları (Model Details)
- **Model Adı:** `se-primer-cognitive-intervention`
- **Sürüm:** `v2.0.0`
- **Tarih:** Kasım 2026
- **Model Tipi:** Dikey Topluluk Karar Ağacı Sınıflandırıcısı (`RandomForestClassifier`, 50 ağaç, derinlik 5)
- **Dışa Aktarım Biçimi:** ONNX (Opset 12, Float32 tensör girdisi)
- **Geliştirici:** SE Primer Ekibi (YZM301 - Yazılım Mühendisliği)
- **Lisans:** MIT
- **İletişim & Kod Deposu:** [https://github.com/mlkaydemir/SE-Primer](https://github.com/mlkaydemir/SE-Primer)

---

## 2. Kullanım Amacı (Intended Use)
- **Birincil Amaç:** Yazılım mühendisliği acil durum simülasyonunda (08:00 randevu krizi) nöbetçi öğrencinin bilişsel mikro-davranışlarını (karar süresi, butonlar arası kararsızlık, hata geçmişi) gerçek zamanlı izleyerek **bilişsel felç ve aşırı yüklenme (cognitive overload)** durumunu tespit etmek.
- **Kullanım Şekli:**
  - $P(y=1) \ge 0.50$ olduğunda arayüzde oyuncuyu bunaltmadan düşündürücü **Sokratik Adaptif Müdahale** kartı belirir.
  - $P(y=1) < 0.40$ olduğunda oyuncunun otonom akışına dokunulmaz.
- **Hedef Kitle:** Yazılım mühendisliği öğrencileri, junior ve senior geliştiriciler.

---

## 3. Eğitim ve Doğrulama Verisi (Data)
- **Veri Kaynağı:** `data/oturumlar.csv` (Toplam 240 satır)
  - **Gerçek Oturumlar:** 3 farklı insan denek tarafından oynanan 15 gerçek kriz oturumu (45 karar satırı, `%18.75`).
  - **Sentetik Veri:** `seed=42` sabit tohumlu ve Gauss/üstel dağılımlı kural motoruyla üretilen 195 satır (`%81.25`).
- **Girdi Nitelikleri (7 Boyut):**
  1. `seviye_kod` (Junior: 0, Senior: 1)
  2. `rol_kod` (Backend: 0, DevOps: 1, Fullstack: 2)
  3. `sahne_no` (1: Mimari, 2: Test, 3: KVKK)
  4. `karar_suresi_sn` (Saniye cinsinden düşünme süresi)
  5. `karar_degistirme_sayisi` (Tereddüt adedi)
  6. `onceki_hata_sayisi` (Önceki sahnelerdeki kriz hatası)
  7. `ipucu_tiklama_sayisi` (Öğrencinin ipucu talep sıklığı)
- **Hedef:** `mudahale_gerekli` $\in \{0, 1\}$

---

## 4. Değerlendirme Metrikleri ve Eval Kapısı (Evaluation)
Eğitimden önce `spec.md` dokümanında belirlenen altın standart kabul eşikleri ve test kümesinde (`N=60`) elde edilen sonuçlar:

| Metrik | Kabul Eşiği (Minimum) | Test Kümesi Sonucu | Durum |
|---|:---:|:---:|:---:|
| **Accuracy (Doğruluk)** | $\ge 0.8500$ | **%86.67** ($0.8667$) | ✅ GEÇTİ |
| **F1-Score (Ağırlıklı)** | $\ge 0.8200$ | **0.8648** | ✅ GEÇTİ |
| **ROC-AUC Skoru** | $\ge 0.8500$ | **0.9556** | ✅ GEÇTİ |
| **Diferansiyel ONNX Paritesi** | $< 10^{-4}$ ($0.0001$) | **$1.8 \times 10^{-7}$** | ✅ GEÇTİ |

*(Not: `train.py` eval kapısı mimarisi gereği bu metriklerin altına inildiğinde model derhal derleme sürecini durdurur; kusurlu model yayına alınamaz).*

---

## 5. Model Sınırları ve Hata Payı (Limitations)
1. **Oyun Senaryosu Bağımlılığı:** Model, sağlık krizinin 3 temel karar sahnesi için eğitilmiştir; tamamen farklı bir kriz alanında (örn. IoT firmware güncellemesi) karar süreleri değişebileceğinden yeniden kalibrasyon gerektirir.
2. **Cihaz Gecikmesi Yanılgısı:** Düşük donanımlı eski cihazlarda tarayıcı donması nedeniyle oluşan bekleme süresi, model tarafından bilişsel tereddüt gibi algılanabilir.

---

## 6. Kullanılmaması Gereken Durumlar (Out-of-Scope & Misuse)
- **Akademik Not Verme:** Bu model bir sınav notlandırma veya insan eleme sistemi değildir; amacı cezalandırmak değil, öğrenciye doğru anda pedagojik ipucu uzatmaktır.
- **Tıbbi Karar Destek:** Gerçek bir hastanenin triyaj veya kriz yönetiminde doğrudan karar mercii olarak kullanılamaz.
- **Kişisel Veri Profillemesi:** Oyuncunun gerçek kimliğini tahmin etmek, parmak izi çıkarmak veya kişisel veri toplamak için kullanılamaz.

