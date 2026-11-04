"""
tests/test_server_bonus.py
SE Primer v2 - Bonus +10 İsteri Doğrulama Testi:
Sunucu Çıkarım Servisi (server_bonus.py) ile Python Oracle Arasında < 1e-4 Tolerans Testi
"""

import os
import sys
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server_bonus import predict, PredictRequest

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_bonus_server_parity():
    print("=" * 70)
    print("🌟 BONUS +10 TESTİ: SUNUCU ÇIKARIM SERVİSİ DİFERANSİYEL TESTİ")
    print("=" * 70)

    parite_file = os.path.join(os.path.dirname(__file__), "parite.json")
    with open(parite_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    test_cases = data["test_cases"]
    all_passed = True
    max_diff = 0.0

    for idx, case in enumerate(test_cases, 1):
        cid = case["id"]
        inp = case["input"]
        expected_p1 = case["oracle_probability_class_1"]

        # Sunucu endpoint fonksiyonunu çağır
        req = PredictRequest(features=inp)
        res = predict(req)

        calc_p1 = res.probability_class_1
        diff = abs(calc_p1 - expected_p1)
        if diff > max_diff:
            max_diff = diff

        is_ok = diff < 1e-4
        if not is_ok:
            all_passed = False

        status = "✅" if is_ok else "❌"
        print(f"{status} [{idx}/{len(test_cases)}] {cid}:")
        print(f"    Girdi          : {inp}")
        print(f"    Sunucu P(1)    : {calc_p1:.6f}")
        print(f"    Oracle P(1)    : {expected_p1:.6f}")
        print(f"    Fark (Delta)   : {diff:.8f} (Tolerans < 0.0001)")
        print(f"    Tahmin         : {res.predicted_class} (Müdahale: {res.intervention_recommended})\n")

    print("-" * 70)
    print(f"📊 Maksimum Sunucu Parite Farkı: {max_diff:.8f} (Eşik: < 0.0001)")

    if all_passed and max_diff < 1e-4:
        print("🏆 BONUS +10 TAM PUAN DOĞRULANDI: Kendi sunucumuzdaki tüketici < 1e-4 toleransla aynı sonucu veriyor!")
        print("=" * 70)
        return True
    else:
        print("❌ HATA: Tolerans aşıldı!")
        sys.exit(1)

if __name__ == "__main__":
    test_bonus_server_parity()
