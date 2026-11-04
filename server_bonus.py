"""
server_bonus.py
SE Primer v2 - Bonus +10 Puan İsteri:
Kendi Sunucumuzda Çalışan ONNX Çıkarım API Servisi (FastAPI + onnxruntime)
Uç Nokta: POST /predict
"""

import os
import sys
import numpy as np
import onnxruntime as rt
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

MODEL_PATH = "model/model.onnx"

app = FastAPI(
    title="SE Primer v2 ONNX Inference API",
    version="2.0.0",
    description="Göreve özel ONNX modelini sunucu tarafında çalıştıran mikroservis (Bonus +10 Puan)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ONNX Modelini Yükle
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model dosyası bulunamadı: {MODEL_PATH}")

sess = rt.InferenceSession(MODEL_PATH)
input_name = sess.get_inputs()[0].name
label_name = sess.get_outputs()[0].name
prob_name = sess.get_outputs()[1].name

class PredictRequest(BaseModel):
    # 7 Girdi Özelliği: [seviye_kod, rol_kod, sahne_no, karar_suresi_sn, karar_degistirme_sayisi, onceki_hata_sayisi, ipucu_tiklama_sayisi]
    features: List[float] = Field(..., min_items=7, max_items=7, example=[0.0, 2.0, 1.0, 32.0, 4.0, 0.0, 2.0])

class PredictResponse(BaseModel):
    predicted_class: int
    probability_class_0: float
    probability_class_1: float
    intervention_recommended: bool
    status: str

@app.get("/")
def root():
    return {
        "service": "SE Primer v2 Bonus Inference API",
        "status": "online",
        "model_loaded": True,
        "input_tensor": input_name,
        "target": "mudahale_gerekli"
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        inp = np.array([req.features], dtype=np.float32)
        out = sess.run([label_name, prob_name], {input_name: inp})
        pred_label = int(out[0][0])
        pred_probs = out[1][0]

        if isinstance(pred_probs, dict):
            p0 = float(pred_probs[0])
            p1 = float(pred_probs[1])
        else:
            p0 = float(pred_probs[0])
            p1 = float(pred_probs[1])

        return PredictResponse(
            predicted_class=pred_label,
            probability_class_0=round(p0, 6),
            probability_class_1=round(p1, 6),
            intervention_recommended=(p1 >= 0.50),
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server_bonus:app", host="127.0.0.1", port=8000, reload=False)

