# SE Primer v2: Veri Sözlüğü (data/SOZLUK.md)
### Bilişsel Aşırı Yük ve Adaptif Müdahale Veri Seti Standartları

Bu doküman, `data/oturumlar.csv` veri tablosunda yer alan tüm sütunların anlamsal karşılıklarını, veri tiplerini, geçerli değer aralıklarını ve KVKK veri gizliliği standartlarını tanımlar.

---

## 1. Veri Gizliliği ve KVKK Sözleşmesi
> **"Bu çağın madeni veridir."** Ancak kişisel veri madenciliği etik ve yasal sınırlar içinde yürütülmelidir.
- Veri setinde **hiçbir özel nitelikli kişisel veri** (isim, T.C. kimlik, e-posta, IP adresi, kesin coğrafi konum veya donanım parmak izi) yer almaz.
- Her oyuncu rastgele ve anonim bir takma ad (`oyuncu_rumuz`: örn. `kullanici_alpha`, `kullanici_beta`) ve kriptografik oturum kimliği (`oturum_id`: örn. `ses_real_01_s1`) ile temsil edilir.

---

## 2. Değişkenler Tablosu (Features & Target)

| Sütun Adı | Veri Tipi | Birim / Format | Değer Aralığı | Rolü | Açıklama |
|---|---|---|---|---|---|
| `oturum_id` | `string` | UUID / Kod | `ses_...` | Meta | Kararın ait olduğu anonim oturumun benzersiz kimliği. |
| `oyuncu_rumuz` | `string` | Metin | `kullanici_[1-3]`, `sentetik_...` | Meta | Anonim denek etiketi (Gerçek veri: 3 farklı kişi × 5 oturum). |
| `sahne_no` | `integer` | İndeks | `1`, `2`, `3` | Girdi ($x_1$) | 1: Mimari Kriz (Rollback vs Hotfix)<br/>2: Test & Doğrulama (Smoke vs Deploy)<br/>3: KVKK & Veri Gizliliği (Maskele vs Raw Log) |
| `seviye_kod` | `integer` | Kategorik Kod | `0`, `1` | Girdi ($x_2$) | `0`: Yeni Başladım (Junior - stressiz, öğretici)<br/>`1`: Deneyimliyim (Senior - 60 sn süre baskısı) |
| `rol_kod` | `integer` | Kategorik Kod | `0`, `1`, `2` | Girdi ($x_3$) | `0`: Backend Mühendisi<br/>`1`: DevOps & SRE<br/>`2`: Fullstack Geliştirici |
| `karar_suresi_sn` | `float` | Saniye | `[1.2, 60.0]` | Girdi ($x_4$) | Sahne yüklendikten sonra nihai kararın onaylanmasına kadar geçen net düşünme/tereddüt süresi. |
| `karar_degistirme_sayisi` | `integer` | Adet | `[0, 8]` | Girdi ($x_5$) | Oyuncunun butonlar arasında gidip gelme, bir seçeneği tıklayıp vazgeçerek diğerini seçme (kararsızlık) adedi. |
| `onceki_hata_sayisi` | `integer` | Adet | `[0, 2]` | Girdi ($x_6$) | Bu sahneye gelinene kadar simülasyon içinde yapılan hatalı/riskli seçim sayısı. |
| `ipucu_tiklama_sayisi` | `integer` | Adet | `[0, 5]` | Girdi ($x_7$) | Oyuncunun sahnede Sokratik AI Tutor'a veya hızlı ipucu düğmelerine tıklama sayısı. |
| `mudahale_gerekli` | `integer` | İkili Bayrak | `0`, `1` | **Hedef ($y$)** | `0`: Müdahale Yok (Oyuncu otonom ve kararlı)<br/>`1`: Bilişsel Aşırı Yüklenme / Sokratik Müdahale Gerekli |
| `kaynak` | `string` | Etiket | `gercek`, `sentetik` | Meta | Verinin kaynağı (`gercek`: 15 gerçek insan oturumu, `sentetik`: kural tabanlı sentetik artırma). |

---

## 3. Hedef Değişken Belirleme Mantığı (Ground-Truth Annotation Rule)
Bir karar satırında `mudahale_gerekli = 1` olarak etiketlenmesinin pedagojik ve bilişsel şartı:
1. **Yüksek Karar Süresi:** Junior modunda $karar\_suresi\_sn > 22.0$ sn veya Senior modunda $karar\_suresi\_sn > 38.0$ sn olması,
2. **VE/VEYA Yüksek Kararsızlık:** $karar\_degistirme\_sayisi \ge 2$,
3. **VE/VEYA Zincirleme Hata Riski:** $onceki\_hata\_sayisi \ge 1$ iken $ipucu\_tiklama\_sayisi \ge 1$ olması.

Bu koşulları sağlayan oyuncu bilişsel yük altında sıkışmış kabul edilir ve modelin $P(y=1) \ge 0.50$ üreterek proaktif Sokratik soru sorması hedeflenir.
