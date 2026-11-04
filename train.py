"""
train.py
SE Primer v2 - Tekrarlanabilir Model Eğitimi, Eval Kapısı ve ONNX Dönüşümü
Kullanım: python train.py
"""

import os
import sys
import json
import numpy as np
import pandas as pd

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import onnxruntime as rt

# ==============================================================================
# 1. KONFİGÜRASYON VE EĞİTİM ÖNCESİ KABUL EŞİKLERİ (spec.md Altın Standart)
# ==============================================================================
RANDOM_STATE = 42
DATA_PATH = "data/oturumlar.csv"
MODEL_DIR = "model"
TESTS_DIR = "tests"

FEATURE_NAMES = [
    "seviye_kod",
    "rol_kod",
    "sahne_no",
    "karar_suresi_sn",
    "karar_degistirme_sayisi",
    "onceki_hata_sayisi",
    "ipucu_tiklama_sayisi"
]
TARGET_NAME = "mudahale_gerekli"

# Katı Eval Kapısı Eşikleri (spec.md Bölüm 7.3)
THRESHOLDS = {
    "min_accuracy": 0.85,
    "min_f1": 0.82,
    "min_roc_auc": 0.85,
    "parity_tolerance": 1e-4
}

def train_and_export():
    print("=" * 70)
    print("🚀 SE PRIMER v2: MODEL EĞİTİMİ VE EVAL KAPISI BAŞLATILIYOR")
    print(f"📌 Sabit Tohum (Seed): {RANDOM_STATE}")
    print("=" * 70)

    # 1. Veri Setini Yükle
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Hata: {DATA_PATH} bulunamadı!")
    
    df = pd.read_csv(DATA_PATH)
    print(f"📊 Toplam Satır Sayısı: {len(df)}")
    print(f"   - Gerçek Oturumlar : {len(df[df['kaynak'] == 'gercek'])}")
    print(f"   - Sentetik Veri    : {len(df[df['kaynak'] == 'sentetik'])}")

    X = df[FEATURE_NAMES].values.astype(np.float32)
    y = df[TARGET_NAME].values.astype(np.int64)

    # 2. Tekrarlanabilir Bölümleme (Stratified Train-Test Split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=RANDOM_STATE, stratify=y
    )
    print(f"📈 Eğitim Kümesi: {len(X_train)} örnek | Test Kümesi: {len(X_test)} örnek")

    # 3. Model Eğitimi (Dikey, Yorumlanabilir ve Hafif Random Forest Sınıflandırıcı)
    # Karar ağaçları topluluğu, bilişsel mikro-davranışları (süre, kararsızlık, hata) yüksek doğrulukla yakalar
    model = RandomForestClassifier(
        n_estimators=50,
        max_depth=5,
        random_state=RANDOM_STATE
    )
    model.fit(X_train, y_train)

    # 4. Test Kümesinde Ölçüm
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred, average="weighted"))
    roc_auc = float(roc_auc_score(y_test, y_prob))

    print("\n" + "-" * 70)
    print("🎯 MODEL DEĞERLENDİRME METRİKLERİ (Test Kümesi):")
    print(f"   - Accuracy (Doğruluk) : %{acc*100:.2f} (Eşik: >= %{THRESHOLDS['min_accuracy']*100:.1f})")
    print(f"   - F1-Score (Ağırlıklı): {f1:.4f}  (Eşik: >= {THRESHOLDS['min_f1']:.2f})")
    print(f"   - ROC-AUC Skoru       : {roc_auc:.4f}  (Eşik: >= {THRESHOLDS['min_roc_auc']:.2f})")
    print("-" * 70)

    # 5. EVAL KAPISI (GATEKEEPER): Eşik Altındaysa Durdur!
    if acc < THRESHOLDS["min_accuracy"]:
        raise SystemExit(f"❌ EVAL KAPISI AŞILAMADI: Accuracy {acc:.4f} < {THRESHOLDS['min_accuracy']}. Artefakt üretilmeyecek!")
    if f1 < THRESHOLDS["min_f1"]:
        raise SystemExit(f"❌ EVAL KAPISI AŞILAMADI: F1-Score {f1:.4f} < {THRESHOLDS['min_f1']}. Artefakt üretilmeyecek!")
    if roc_auc < THRESHOLDS["min_roc_auc"]:
        raise SystemExit(f"❌ EVAL KAPISI AŞILAMADI: ROC-AUC {roc_auc:.4f} < {THRESHOLDS['min_roc_auc']}. Artefakt üretilmeyecek!")

    print("✅ TÜM KABUL EŞİKLERİ BAŞARIYLA GEÇİLDİ! Model artefaktı paketleniyor...")

    # 6. ONNX Formatına Dönüştür
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(TESTS_DIR, exist_ok=True)

    initial_type = [("float_input", FloatTensorType([None, len(FEATURE_NAMES)]))]
    onnx_model = convert_sklearn(model, initial_types=initial_type, target_opset=12)

    onnx_path = os.path.join(MODEL_DIR, "model.onnx")
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"📦 ONNX Modeli Kaydedildi: {onnx_path} ({os.path.getsize(onnx_path)} bayt)")

    # 7. PARİTE VE DİFERANSİYEL TEST (Python vs ONNX)
    sess = rt.InferenceSession(onnx_path)
    input_name = sess.get_inputs()[0].name
    label_name = sess.get_outputs()[0].name
    prob_name = sess.get_outputs()[1].name

    onnx_out = sess.run([label_name, prob_name], {input_name: X_test})
    onnx_probs = np.array([[p[0], p[1]] for p in onnx_out[1]], dtype=np.float32)
    sklearn_probs = model.predict_proba(X_test).astype(np.float32)

    max_diff = float(np.max(np.abs(sklearn_probs - onnx_probs)))
    print(f"🔍 Diferansiyel Parite Kontrolü: Maksimum Olasılık Farkı = {max_diff:.8f}")

    if max_diff > THRESHOLDS["parity_tolerance"]:
        raise SystemExit(f"❌ PARİTE HATASI: ONNX ve Sklearn farkı {max_diff} > {THRESHOLDS['parity_tolerance']}!")
    print(f"✅ Sayısal Parite Doğrulandı! (Fark < 1e-4)")

    # 8. config.json (Şema Sözleşmesi & Metrikler)
    config_data = {
        "model_name": "se-primer-cognitive-intervention",
        "version": "2.0.0",
        "task": "binary_classification",
        "description": "SE Primer v2 Bilişsel Aşırı Yüklenme ve Adaptif Müdahale Modeli",
        "framework": "scikit-learn 1.7.2 RandomForestClassifier -> ONNX Opset 12",
        "seed": RANDOM_STATE,
        "features": FEATURE_NAMES,
        "feature_types": ["float32"] * len(FEATURE_NAMES),
        "target": TARGET_NAME,
        "classes": [0, 1],
        "class_labels": {
            "0": "otonom_akis_mudahale_yok",
            "1": "bilissel_yuk_mudahale_gerekli"
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "parity_max_diff": round(max_diff, 8)
        },
        "thresholds": THRESHOLDS,
        "input_tensor_name": input_name,
        "output_tensor_names": [label_name, prob_name],
        "gatekeeper_status": "PASSED"
    }

    config_path = os.path.join(MODEL_DIR, "config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=2, ensure_ascii=False)
    print(f"📄 Sözleşme ve Şema Kaydedildi: {config_path}")

    # 9. tests/parite.json (5 Referans Senaryo ve Test Kahini Olasılıkları)
    reference_cases = [
        {
            "id": "CASE-1-JUNIOR-PANIK",
            "description": "Junior fullstack Karar 1'de 32s tereddüt edip 4 kez buton değiştirdi",
            "input": [0.0, 2.0, 1.0, 32.0, 4.0, 0.0, 2.0],
            "expected_class": 1
        },
        {
            "id": "CASE-2-SENIOR-HIZLI",
            "description": "Senior devops Karar 2'de 6s içinde tereddütsüz karar verdi",
            "input": [1.0, 1.0, 2.0, 6.0, 0.0, 0.0, 0.0],
            "expected_class": 0
        },
        {
            "id": "CASE-3-JUNIOR-STABIL",
            "description": "Junior backend Karar 2'de sakin ilerliyor, az tereddüt",
            "input": [0.0, 0.0, 2.0, 12.0, 1.0, 0.0, 0.0],
            "expected_class": 0
        },
        {
            "id": "CASE-4-SENIOR-KVKK-TEREDDUT",
            "description": "Senior Karar 3 KVKK sahnesinde önceki hatası var ve 34s bekledi",
            "input": [1.0, 0.0, 3.0, 34.0, 3.0, 1.0, 1.0],
            "expected_class": 1
        },
        {
            "id": "CASE-5-ORTA-SINIR-DURUMU",
            "description": "Junior Karar 1'de 21s bekledi, 2 kez buton değiştirdi",
            "input": [0.0, 1.0, 1.0, 21.0, 2.0, 0.0, 1.0],
            "expected_class": 1
        }
    ]

    for case in reference_cases:
        x_case = np.array([case["input"]], dtype=np.float32)
        p_case = sess.run([prob_name], {input_name: x_case})[0]
        prob_0 = float(p_case[0][0])
        prob_1 = float(p_case[0][1])
        case["oracle_probability_class_0"] = round(prob_0, 6)
        case["oracle_probability_class_1"] = round(prob_1, 6)
        case["oracle_predicted_class"] = 1 if prob_1 >= 0.50 else 0

    parite_path = os.path.join(TESTS_DIR, "parite.json")
    with open(parite_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated_by": "train.py",
            "oracle_framework": "Python onnxruntime 1.23.2",
            "tolerance": 1e-4,
            "test_cases": reference_cases
        }, f, indent=2, ensure_ascii=False)
    print(f"🧪 Referans Kahin Verileri Kaydedildi: {parite_path}")

    print("\n" + "=" * 70)
    print("🏆 EĞİTİM, EVAL KAPISI VE ARTEFAKT PAKETLEME TAM PUANLA TAMAMLANDI!")
    print("=" * 70)

if __name__ == "__main__":
    train_and_export()
