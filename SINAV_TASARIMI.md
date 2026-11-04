# Sizinle Uyumlanan Klasik Vize Sınavı Tasarımı (SINAV_TASARIMI.md)
### Yazılım Mühendisliği Temelleri ve Canlı ML Sistemleri · 1 Sayfalık Klasik Vize Sorusu

---

## 1. Vize Sınav Sorusu Senaryosu (Özgün Soru Metni)

> **Süre:** 40 Dakika | **Kaynak:** Kapalı Kitap / Klasik Yazılı  
> **Senaryo:** Bir kamu hastanesinin acil servis triyajında, hastaların hayati riskini (`0: Yeşil/Stabil`, `1: Kırmızı/Kritik`) saniyeler içinde kestiren eski bir kural tabanlı triyaj sistemi (Legacy Triyaj v1), yeni eğitilen hafif bir ONNX makine öğrenmesi modeli (v2) ile modernize edilmektedir.  
> Yeni model hem acil servis kioskundaki tarayıcıda (`onnxruntime-web`), hem sahadaki doktorun tabletinde (`onnxruntime-react-native`), hem de bakanlık sunucusunda (`Python onnxruntime`) paralel çalıştırılacaktır.  
> 
> Bir yazılım kalitesi mühendisi olarak sizden bu geçişi doğrulamanız istenmektedir. Elinizde 300 adet geçmiş hasta telemetri girdisi bulunmaktadır.

### Sorular:

1. **Test Kahini (Test Oracle) ve Karakterizasyon:** Elinizdeki 300 girdiyi hem eski sisteme hem yeni ONNX modeline verdiğinizde, eski sistemin ürettiği kararları bir **"Karakterizasyon Testi (Characterization Test)"** olarak kullanabilir misiniz? Eski sistem hatalı kararlar vermişse, bu sistem bir "Test Kahini (Oracle)" işlevi görebilir mi? Açıklayınız.
2. **Diferansiyel Test ve Sayısal Hata Toleransı:** Doktorun tabletindeki yerel çıkarım (Inference) ile Bakanlık sunucusundaki Python çıkarımının ürettiği risk olasılıkları ($P_{tablet}$ vs $P_{sunucu}$) arasında bir fark gözlemlenmiştir. İki ortamın matematiksel olarak "aynı ürünü" çalıştırdığını kanıtlamak için bir **hata toleransı ($\epsilon = 10^{-4}$)** tanımlanmıştır. Neden doğrudan `P_tablet == P_sunucu` (katı eşitlik) yerine bir tolerans eşiği kullanılır? Donanım ve mimari seviyesinde (IEEE 754, CPU SIMD vs WebAssembly) gerekçelendiriniz.
3. **Doğrulama (Verification) vs. Geçerleme (Validation):**
   - Modelin Python referans çıktısı ile tarayıcı ONNX çıktısının farkının $10^{-4}$'ten küçük olduğunu kanıtlamanız **Doğrulama mıdır, Geçerleme midir?**
   - Acil serviste doktorların bu model sayesinde daha az hata yaptığını ve kritik hastaların daha hızlı yoğun bakıma alındığını kanıtlamanız **Doğrulama mıdır, Geçerleme midir?** (Boehm ve Sommerville ilkeleriyle yanıtlayınız).
4. **Regresyon ve Güvenli Dağıtım:** 300 hastanın ilk 20'sinde model eski sistemle tam uyumlu iken, 21. hastada eski sistem "Yeşil" derken model "Kırmızı" (Kritik) demiştir. Bu durum bir **Regresyon Hatası mıdır**, yoksa modelin daha üstün bir örüntü yakalaması mıdır? Canlıya almadan önce hastane yönetimini riske atmamak için **Gölge Dağıtım (Shadow Deployment)** bu belirsizliği nasıl çözer?

---

## 2. Beklenen Cevaplar ve Anahtar Kavramlar

| Soru | Beklenen Mühendislik Özü (Ground-Truth) |
|---|---|
| **1. Oracle & Karakterizasyon** | **Karakterizasyon testi**, sistemin *doğruluğunu* değil, mevcut *davranışını* belgeler. Eğer eski sistem hatalıysa, o bir "Doğruluk Kahini (True Oracle)" olamaz; yalnızca bir "Davranışsal Referans" olabilir. Test Kahini, bağımsız ve hatasız kabul edilen harici bir doğruluk kaynağı (ör. uzman hekim heyeti konsensüsü) olmak zorundadır. |
| **2. Tolerans & IEEE 754** | Farklı derleyiciler, çip mimarileri (ARM Neon, x86 AVX) ve WASM yürütme katmanları kayan nokta (floating point) işlemlerinde farklı yuvarlama (rounding mode) ve FMA (Fused Multiply-Add) optimizasyonları uygular. `P1 == P2` beklemek donanım gerçekliğine aykırıdır; bu yüzden $\epsilon = 10^{-4}$ gibi katı ama gerçekçi bir diferansiyel tolerans şarttır. |
| **3. V & V Ayrımı** | - *Parite farkının $< 10^{-4}$ olması:* **DOĞRULAMA (Verification)** — *"Ürünü şartnamesine ve matematiğine uygun doğru yaptık mı? (Are we building the product right?)"*<br/>- *Doktorların işine yaraması ve hayat kurtarması:* **GEÇERLEME (Validation)** — *"Kullanıcının gerçek ihtiyacını karşılayan doğru ürünü yaptık mı? (Are we building the right product?)"* |
| **4. Regresyon vs Shadow** | Tek bir girdi farkı otomatik olarak bir hata (bug) değildir; yeni modelin daha derin bir semptom korelasyonu keşfetmiş olma ihtimali vardır. **Gölge Dağıtım (Shadow Deployment)** sayesinde model canlı trafiği dinler, tahmin üretir ancak eyleme geçmez. Uzman hekimler 21. hastanın gerçek epikrizini inceleyerek modelin haklılığını kanıtlar; böylece kör regresyon paniği önlenir. |

---

## 3. Akıllı Çeldiriciler (Ezber Bozan Sorular)
- **Çeldirici 1:** *"Model test kümesinde %99 doğruluk aldı, o halde hemen canlıya alabiliriz."* (Hatalı: Eğitim-test sızıntısı -data leakage- veya sınıf dengesizliği olabilir; model kartı ve shadow deployment olmaksızın alınamaz).
- **Çeldirici 2:** *"Sunucudaki model ile mobildeki model aynı `.onnx` dosyasıdır, o halde diferansiyel test gereksizdir."* (Hatalı: Dosya aynı olsa bile çalışma zamanı motorları -runtime engines- ve donanım mimarileri farklı sonuç üretebilir; diferansiyel parite şarttır).

