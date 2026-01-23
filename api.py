from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# api.py 수정

@app.get("/stats/types")
def get_types():
    # 동현님이 원하는 [{"name": "택배", "count": 100}, ...] 형식으로 바로 반환
    return database.get_smishing_type_stats()

@app.get("/stats/monthly")
def get_monthly():
    # [{"name": "2025-10", "count": 200}, ...] 형식으로 바로 반환
    return database.get_monthly_detection_stats()

# 3. 기존 분석 API (유연한 dict 방식 유지)
@app.post("/analyze")
async def analyze_message(request: dict):
    user_text = request.get("content")
    if user_text:
        # DB 저장 로직 (필요시 활성화)
        print(f"📩 실시간 분석 요청 수신: {user_text}")
    return {"status": "success", "received": user_text}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)