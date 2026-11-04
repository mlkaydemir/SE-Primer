"""
tests/parite.py
SE Primer v2 - Test Kahini (Python Oracle) ve Diferansiyel Parite Doğrulayıcı
Bu betik:
1. model/model.onnx modelini yükler
2. tests/parite.json dosyasındaki 5 referans test girdisini çalıştırır
3. Python Oracle sonuçları ile parite.json değerlerini karşılaştırır
4. Hata farkının < 1e-4 (0.0001) olduğunu matematiksel olarak kanıtlar.
"""

import os
import sys
import json
import numpy as np
import onnxruntime as rt

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

MODEL_PATH = "model/model.onnx"
PARITE_JSON_PATH = "tests/parite.json"
TOLERANCE = 1e-4

def run_oracle_verification():
    print("=" * 70)
    print("🔮 SE PRIMER v2: TEST KAHİNİ (PYTHON ORACLE) PARİTE DOĞRULAMA")
    print("=" * 70)

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model dosyası bulunamadı: {MODEL_PATH}")
    if not os.path.exists(PARITE_JSON_PATH):
        raise FileNotFoundError(f"Parite JSON dosyası bulunamadı: {PARITE_JSON_PATH}")

    # ONNX Modelini Yükle
    sess = rt.InferenceSession(MODEL_PATH)
    input_name = sess.get_inputs()[0].name
    label_name = sess.get_outputs()[0].name
    prob_name = sess.get_outputs()[1].name

    with open(PARITE_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    test_cases = data["test_cases"]
    all_passed = True
    max_observed_diff = 0.0

    print(f"📋 Toplam Referans Test Sayısı: {len(test_cases)}")
    print(f"🎯 Kabul Edilebilir Hata Toleransı: < {TOLERANCE} (1e-4)\n")

    for idx, case in enumerate(test_cases, 1):
        cid = case["id"]
        inp = np.array([case["input"]], dtype=np.float32)
        expected_p1 = case["oracle_probability_class_1"]

        # ONNX Runtime ile Çıkarım
        out = sess.run([label_name, prob_name], {input_name: inp})
        pred_label = int(out[0][0])
        pred_probs = out[1][0] # dict veya array
        
        # Sınıf 1 olasılığı
        if isinstance(pred_probs, dict):
            calc_p1 = float(pred_probs[1])
        else:
            calc_p1 = float(pred_probs[1])

        diff = abs(calc_p1 - expected_p1)
        if diff > max_observed_diff:
            max_observed_diff = diff

        is_ok = diff < TOLERANCE
        if not is_ok:
            all_passed = False

        status_emoji = "✅" if is_ok else "❌"
        print(f"{status_emoji} [{idx}/{len(test_cases)}] {cid}:")
        print(f"    Girdi          : {case['input']}")
        print(f"    Beklenen P(1)  : {expected_p1:.6f}")
        print(f"    Hesaplanan P(1): {calc_p1:.6f}")
        print(f"    Fark (Delta)   : {diff:.8f} (Tolerans < {TOLERANCE})")
        print(f"    Tahmin Sınıfı  : {pred_label} ({case['description']})\n")

    print("-" * 70)
    print(f"📊 Maksimum Gözlemlenen Fark: {max_observed_diff:.8f}")

    if all_passed and max_observed_diff < TOLERANCE:
        print("🏆 SONUÇ: TÜM REFERANS GİRDİLER PYTHON ORACLE İLE %100 UYUMLU!")
        print("=" * 70)
        return True
    else:
        print("❌ HATA: Bazı testler hata toleransını aştı!")
        print("=" * 70)
        sys.exit(1)

if __name__ == "__main__":
    run_oracle_verification()
