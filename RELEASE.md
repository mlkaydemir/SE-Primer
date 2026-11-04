# SE Primer v2.0: Yayın, Dağıtım ve Mimari Ödünleşim Raporu (RELEASE.md)
### Üretimde Makine Öğrenmesi (3V: Velocity, Validation, Versioning) ve Sürümleme Stratejisi

- **Ürün:** SE Primer (The Diamond Age Adaptive Engineering Simulator)
- **Sürüm:** `v2.0.0`
- **Model Tipi:** Göreve Özel Dikey Makine Öğrenmesi Modeli (`model.onnx` + `config.json`)
- **Hugging Face Model Deposu:** `https://huggingface.co/mlkaydemir/se-primer-cognitive-intervention`
- **Commit-Pinned Sabitlenmiş Model URL:**
  `https://huggingface.co/mlkaydemir/se-primer-cognitive-intervention/resolve/7d9b41a3c5e8864f1e09a32c25608d1f04561234/model.onnx`

---

## 1. v2.0 Sürümünde Ne Değişti? (Changelog)

| Bileşen | v1.0 (Önceki Sürüm) | v2.0 (Yeni Sürüm) |
|---|---|---|
| **Uyum Mekanizması** | Girişteki 3 soruya dayalı statik kurallar (hardcoded rules) | Oyuncunun mikro-davranışlarından (süre, tereddüt, hata) öğrenen **ONNX ML Modeli** |
| **Model Formatı** | Yok (Saf JavaScript algoritmik kural) | Taşınabilir Açık Format: `model.onnx` (Opset 12) + `config.json` Sözleşmesi |
| **Doğrulama Kapısı (Gatekeeper)** | Manuel testler | `train.py` içinde Accuracy $\ge 0.85$, F1 $\ge 0.82$, Tolerans $< 10^{-4}$ katı eval eşikleri |
| **Çıkarım Yeri** | - | İstemci tarafı (`onnxruntime-web`) + Referans Python Oracle (`onnxruntime`) |
| **Test Mimarisi** | Standart E2E Cypress | Çift Tüketici Diferansiyel Parite Testi (`|P_{web} - P_{oracle}| < 10^{-4}`) + Regresyon |

---

## 2. Model Sürümleme ve Geri Alma Planı (Rollback Strategy)

Sommerville Bölüm 25 (Konfigürasyon Yönetimi) ve Shankar vd. (2022) 3V prensiplerine uygun olarak modeller asla `latest` veya `main` gibi değişken etiketlerden tüketilmez.

### 2.1. Commit'e Sabitleme (Pinned Commit Resolution)
- Tüketiciler (web arayüzü, mobil veya sunucu) modeli doğrudan hash kimliği kilitli URL'den çeker:
  ```
  https://huggingface.co/mlkaydemir/se-primer-cognitive-intervention/resolve/7d9b41a3c5e8864f1e09a32c25608d1f04561234/model.onnx
  ```
- **Neden?** `main` dalına ileride yanlışlıkla atılabilecek hatalı bir commit üretim ortamını bozamayacaktır; sürüm tam olarak deterministiktir.

### 2.2. Geri Alma (Rollback) Protokolü
Eğer `v2.0` modelinde canlı üretimde beklenmedik bir sapma (concept drift) veya cihaz uyumsuzluğu gözlemlenirse:
1. **Anında İstemci Konfigürasyon Rollback'i (T < 30 saniye):** `app.js` veya istemci config dosyasındaki `MODEL_VERSION` anahtarı bir önceki kararlı `v1.0.0` (kural tabanlı motor) veya `v1.9-commit` hash'ine geri çekilir.
2. **Statik Fallback Güvencesi:** Eğer ONNX Runtime başlatılamazsa (ağ kesintisi, bellek yetersizliği), uygulama sessizce `ai_tutor_engine.js` içindeki deterministik kurallara düşer (graceful degradation).

---

## 3. Yeni Sürümü Güvenle Devreye Alma (Deployment Strategy)

Yeni eğitilen bir modelin doğrudan tüm kullanıcılara açılması felaketle sonuçlanabilir. SE Primer senaryosunda 3 aşamalı dağıtım hattı uygulanır:

```
[1. Shadow Deployment (%100 Görünmez)] ──> [2. Canary (%5 Gerçek Kullanıcı)] ──> [3. Progressive Rollout (%25 -> %50 -> %100)]
```

### 3.1. Gölge Dağıtım (Shadow Deployment)
- **Nasıl Çalışır?** Model arka planda sessizce çalıştırılır. Oyuncunun kararları hem eski kural motoruna hem de `model.onnx`'e gönderilir. Ancak ekrana **yalnızca eski sistemin kararı** yansıtılır.
- **Amaç:** Modelin gerçek kullanıcı verisi üzerindeki gecikmesi, bellek tüketimi ve tahmin dağılımı kullanıcıyı etkilemeden gözlemlenir.

### 3.2. Kanarya Dağıtımı (Canary Deployment - %5 Trafik)
- **Nasıl Çalışır?** Gelen oturumların rastgele `%5`'i (örneğin oturum UUID'sinin son basamağına göre) yeni v2.0 ONNX modeline yönlendirilir.
- **İzleme Kriterleri:** Erken terk oranı (bounce rate), şikayet/destek çağrıları ve Sokratik ipucu memnuniyeti.

### 3.3. Aşamalı Geçiş (Progressive Rollout)
- Kanarya aşamasında regresyon görülmezse trafik sırayla genişletilir:
  - **1. Gün:** `%25` Trafik
  - **3. Gün:** `%50` Trafik
  - **5. Gün:** `%100` Tam Canlı Dağıtım (Full Production)

---

## 4. Mimari Dağıtım Kararı ve Ödünleşim (Trade-off) Matrisi

Derste incelenen üç temel mühendislik sorusuna göre modelin çalıştırılabileceği 3 farklı mimari değerlendirilmiştir:

### 4.1. Üç Temel Soruya Göre Karşılaştırma Matrisi

| Değerlendirme Kriteri | A) Tarayıcı İçi Çıkarım (`onnxruntime-web`) | B) Cihaz İçi Mobil (`React Native / Expo`) | C) Kendi Sunucumuz (`FastAPI / Rails API`) |
|---|---|---|---|
| **1. İnternet Zorunlu mu & Gecikme (Latency) Davranışı?** | **İnternet Sadece İlk Açılışta Gerekli (64 KB).** Model bir kez önbelleğe (CacheStorage) alındıktan sonra sıfır ağ gecikmesi ile yerel CPU/WASM üzerinde anında (< 5ms) çalışır. | **İnternetsiz (%100 Offline) Çalışır.** Model uygulama paketine (`.apk` / `.ipa`) gömülüdür. Uçakta veya metroda bile sıfır gecikmeyle yanıt üretir. | **Sürekli İnternet Zorunlu.** Her karar anında istemci sunucuya HTTP POST isteği atar. Ağ gecikmesi (Round-trip time: 100ms - 400ms) hissedilir. |
| **2. Veri Cihazdan Çıkar mı? (Gizlilik & KVKK)** | **Veri Cihazdan Asla Çıkmaz.** Oyuncunun fare hareketleri, tereddüt süreleri ve kararları tarayıcı RAM'inde kalır. KVKK Madde 6 açısından sıfır yasal risk. | **Veri Cihazdan Asla Çıkmaz.** Tüm telemetri telefonun yerel sandbox'ında işlenir. | **Veri Cihazdan Çıkar.** Tereddüt süresi ve karar örüntüleri ağ üzerinden harici sunucuya taşınır; veri aktarım güvenliği ve TLS zorunludur. |
| **3. Model Gizli Kalır mı? (Fikri Mülkiyet / IP & Güvenlik)** | **Model Açıktır (İstemciye İner).** Gelişmiş bir kullanıcı Network panelinden `model.onnx` dosyasını indirebilir. Küçük modeller için sorun değildir; ticari sırlar için risklidir. | **Model Yarı-Gizlidir.** Binary içine gömülüdür ancak decompile / reverse-engineering (tersine mühendislik) ile çıkarılabilir. | **Model %100 Gizlidir.** Model sunucu belleğinde kapalı tutulur. İstemci sadece girdiyi gönderir ve sonucu alır; ağırlıklar çalınamaz. |

### 4.2. Bizim Tercihimiz ve Mühendislik Gerekçesi (Architectural Verdict)
SE Primer projesinde birincil olarak **"Tarayıcı İçi Çıkarım (onnxruntime-web)"** mimarisi seçilmiştir.
- **Gerekçe:** 64 KB'lık modelimiz hem kullanıcı gizliliğini (KVKK) cihaz içinde korumakta, hem sunucu barındırma maliyetlerini sıfırlamakta, hem de sıfır kurulumla her akıllı telefonda anında çalışabilmektedir.
- *(Ayrıca Bonus +10 isterine tam uyum için Python FastAPI tabanlı bir sunucu alternatifi de `server_bonus.py` olarak sisteme dahil edilmiş ve diferansiyel paritesi kanıtlanmıştır).*
