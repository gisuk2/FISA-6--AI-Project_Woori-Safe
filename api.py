from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import db_chaeyeong  
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stats/types")
def get_types():
    return database.get_smishing_type_stats()

@app.get("/stats/monthly")
def get_monthly():
    return database.get_monthly_detection_stats()

@app.get("/stats/keywords")
def get_top_keywords():
    return database.get_top_10_keywords()

@app.post("/analyze")
async def analyze_message(request: dict):
    user_text = request.get("content")
    
    if not user_text:
        return {"status": "error", "message": "분석할 내용이 없습니다."}

    print(f"📩 실시간 분석 요청 수신: {user_text}")

    try:
        # A. Solar AI 분석 및 뉴스 추출
        analysis_result = db_chaeyeong.analyze_and_get_news(user_text)
        
        # B. DB 저장 (smishing_data 테이블)
        db_chaeyeong.save_normalized_data(user_text, analysis_result)
        
        # C. 리액트에게 전달할 데이터 정리
        res = analysis_result.get('analysis', {})
        
        print(f"✅ 분석 및 DB 저장 완료: {res.get('type')}")

        return {
            "status": "success", 
            "data": {
                "type": res.get("type"),
                "score": res.get("score"),
                "keywords": res.get("keywords"),
                "reason": res.get("reason"),
                "date": res.get("inferred_date"), # 여기에 콤마 추가됨!
                "related_news": res.get("related_news") 
                
            }
        }
        
    except Exception as e:
        print(f"❌ 분석 프로세스 오류: {e}")
        return {"status": "error", "message": "AI 분석 중 오류가 발생했습니다."}

@app.get("/logs/recent")
def get_recent_logs():
    return database.get_recent_logs(limit=10)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)