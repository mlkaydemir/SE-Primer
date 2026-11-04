"""
generate_dataset.py
SE Primer v2 - Veri Seti Oluşturucu
15 Gerçek Kullanıcı Oturumu (3 kişi x 5 oturum = 45 karar) + Sentetik Üretim (Seed=42)
Toplam: 240 satır
"""

import csv
import random

random.seed(42)

rows = []

# ==============================================================================
# 1. GERÇEK İNSAN OTURUMLARI (15 Oturum, 3 Farklı Kişi x 5 Oturum = 45 Satır)
# ==============================================================================
# Kişi 1: Ali (Junior Fullstack) - Karar vermekte zorlanan, ipuçlarına sık başvuran profil
# Kişi 2: Zeynep (Senior DevOps) - Hızlı, kuralcı, stres süresini iyi yöneten profil
# Kişi 3: Burak (Mid/Junior Backend) - Hata yapınca panikleyen, karar değiştiren profil

real_sessions = [
    # ALİ (kullanici_1) - 5 Oturum
    {
        "user": "kullanici_1", "seviye": 0, "rol": 2, # Junior Fullstack
        "sessions": [
            [(1, 24.5, 3, 0, 1, 1), (2, 28.2, 2, 0, 2, 1), (3, 31.0, 4, 1, 2, 1)],
            [(1, 19.8, 1, 0, 1, 0), (2, 26.4, 3, 0, 1, 1), (3, 22.1, 2, 0, 1, 1)],
            [(1, 35.0, 4, 0, 2, 1), (2, 30.5, 3, 1, 2, 1), (3, 18.0, 1, 1, 1, 1)],
            [(1, 16.2, 1, 0, 0, 0), (2, 21.0, 2, 0, 1, 1), (3, 27.5, 3, 0, 2, 1)],
            [(1, 22.0, 2, 0, 1, 1), (2, 17.5, 1, 0, 0, 0), (3, 25.0, 2, 0, 1, 1)],
        ]
    },
    # ZEYNEP (kullanici_2) - 5 Oturum
    {
        "user": "kullanici_2", "seviye": 1, "rol": 1, # Senior DevOps
        "sessions": [
            [(1, 6.5, 0, 0, 0, 0), (2, 8.2, 0, 0, 0, 0), (3, 12.4, 1, 0, 0, 0)],
            [(1, 5.8, 0, 0, 0, 0), (2, 7.1, 0, 0, 0, 0), (3, 14.5, 1, 0, 1, 0)],
            [(1, 7.4, 0, 0, 0, 0), (2, 9.0, 1, 0, 0, 0), (3, 22.8, 2, 0, 1, 1)], # KVKK'da tereddüt yaşadı
            [(1, 8.1, 1, 0, 0, 0), (2, 6.9, 0, 0, 0, 0), (3, 11.0, 0, 0, 0, 0)],
            [(1, 5.2, 0, 0, 0, 0), (2, 11.5, 1, 0, 0, 0), (3, 13.2, 1, 0, 0, 0)],
        ]
    },
    # BURAK (kullanici_3) - 5 Oturum
    {
        "user": "kullanici_3", "seviye": 0, "rol": 0, # Junior Backend
        "sessions": [
            [(1, 14.2, 1, 0, 0, 0), (2, 23.5, 2, 0, 1, 1), (3, 29.4, 3, 1, 2, 1)],
            [(1, 21.0, 2, 0, 1, 1), (2, 18.0, 1, 1, 1, 1), (3, 16.5, 1, 1, 0, 0)],
            [(1, 12.5, 0, 0, 0, 0), (2, 15.0, 1, 0, 0, 0), (3, 24.0, 2, 0, 1, 1)],
            [(1, 28.5, 3, 0, 2, 1), (2, 22.0, 2, 1, 1, 1), (3, 33.2, 4, 2, 2, 1)],
            [(1, 15.0, 1, 0, 0, 0), (2, 19.5, 2, 0, 1, 1), (3, 20.5, 1, 0, 1, 0)],
        ]
    }
]

session_counter = 1
for person in real_sessions:
    u = person["user"]
    sev = person["seviye"]
    rol = person["rol"]
    for s_idx, session_steps in enumerate(person["sessions"]):
        s_id = f"ses_real_{session_counter:02d}"
        session_counter += 1
        for step in session_steps:
            sahne_no, sure, degistirme, onceki_hata, ipucu, mudahale = step
            rows.append({
                "oturum_id": s_id,
                "oyuncu_rumuz": u,
                "sahne_no": sahne_no,
                "seviye_kod": sev,
                "rol_kod": rol,
                "karar_suresi_sn": round(sure, 1),
                "karar_degistirme_sayisi": degistirme,
                "onceki_hata_sayisi": onceki_hata,
                "ipucu_tiklama_sayisi": ipucu,
                "mudahale_gerekli": mudahale,
                "kaynak": "gercek"
            })

print(f"Gerçek kullanıcı satır sayısı: {len(rows)} (15 oturum x 3 sahne)")

# ==============================================================================
# 2. SENTETİK VERİ ARTIRMA (Tohum: seed=42, Toplam Hedef: 240 satır)
# ==============================================================================
# Kural:
# 1. Junior (seviye 0): Düşünme süresi ortalama 18s (std 8s).
#    Eğer karar_suresi > 22s veya degistirme >= 2 veya (onceki_hata >= 1 and ipucu >= 1) -> mudahale_gerekli = 1
# 2. Senior (seviye 1): Düşünme süresi ortalama 10s (std 6s).
#    Eğer karar_suresi > 35s veya degistirme >= 3 veya (onceki_hata >= 1 and ipucu >= 1) -> mudahale_gerekli = 1
# 3. %5 rastgele gürültü (noise) eklenerek gerçek hayat heterojenliği simüle edilir.

synthetic_target_count = 240 - len(rows) # 195 satır
for i in range(synthetic_target_count):
    s_id = f"ses_syn_{(i+1):03d}"
    u = f"sentetik_{random.randint(1, 25):02d}"
    sahne_no = random.choice([1, 2, 3])
    seviye = random.choice([0, 1])
    rol = random.choice([0, 1, 2])
    
    if seviye == 0: # Junior
        karar_suresi = max(3.5, random.gauss(20.0, 7.5))
        degistirme = min(6, int(random.expovariate(0.6)))
        onceki_hata = random.choices([0, 1, 2], weights=[0.55, 0.30, 0.15])[0]
        ipucu = min(4, int(random.expovariate(0.8)))
        
        # Ground truth kuralı
        score = (karar_suresi > 22.0) * 1.2 + (degistirme >= 2) * 1.0 + (onceki_hata >= 1 and ipucu >= 1) * 1.5 + (ipucu >= 2) * 0.8
        is_mudahale = 1 if score >= 1.2 else 0
    else: # Senior
        karar_suresi = max(2.0, random.gauss(12.0, 6.0))
        degistirme = min(5, int(random.expovariate(0.9)))
        onceki_hata = random.choices([0, 1, 2], weights=[0.70, 0.22, 0.08])[0]
        ipucu = min(3, int(random.expovariate(1.2)))
        
        # Ground truth kuralı
        score = (karar_suresi > 30.0) * 1.5 + (degistirme >= 2) * 1.1 + (onceki_hata >= 1 and degistirme >= 1) * 1.3
        is_mudahale = 1 if score >= 1.2 else 0

    # %4 olasılıkla sınır durumu gürültüsü
    if random.random() < 0.04:
        is_mudahale = 1 - is_mudahale

    rows.append({
        "oturum_id": s_id,
        "oyuncu_rumuz": u,
        "sahne_no": sahne_no,
        "seviye_kod": seviye,
        "rol_kod": rol,
        "karar_suresi_sn": round(karar_suresi, 1),
        "karar_degistirme_sayisi": degistirme,
        "onceki_hata_sayisi": onceki_hata,
        "ipucu_tiklama_sayisi": ipucu,
        "mudahale_gerekli": is_mudahale,
        "kaynak": "sentetik"
    })

fieldnames = [
    "oturum_id", "oyuncu_rumuz", "sahne_no", "seviye_kod", "rol_kod",
    "karar_suresi_sn", "karar_degistirme_sayisi", "onceki_hata_sayisi",
    "ipucu_tiklama_sayisi", "mudahale_gerekli", "kaynak"
]

with open("data/oturumlar.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Toplam {len(rows)} satır 'data/oturumlar.csv' dosyasına yazıldı.")
mudahale_oran = sum(r['mudahale_gerekli'] for r in rows) / len(rows)
print(f"Sınıf Dağılımı: Müdahale Gerekli = %{mudahale_oran*100:.1f}, Müdahale Gerekmez = %{(1-mudahale_oran)*100:.1f}")

