from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import db_chaeyeong  # 채영님이 작성한 AI 분석/저장 모듈
import uvicorn

app = FastAPI()

# 1. CORS 설정 (리액트 연동 필수)
# 모든 주소(*)에서의 요청을 허용하여 협업 시 발생할 수 있는 보안 차단을 방지합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. 대시보드 통계 API (동현님 Recharts/차트 대응)
@app.get("/stats/types")
def get_types():
    # 유형별 빈도수: [{"name": "택배", "count": 120}, ...]
    return database.get_smishing_type_stats()

@app.get("/stats/monthly")
def get_monthly():
    # 월별 탐지 추이: [{"name": "2025-10", "count": 200}, ...]
    return database.get_monthly_detection_stats()

@app.get("/stats/keywords")
def get_top_keywords():
    # 키워드 Top 10: [{"name": "결제", "count": 85}, ...]
    return database.get_top_10_keywords()

# 3. 실시간 AI 분석 및 자동 저장 API
@app.post("/analyze")
async def analyze_message(request: dict):
    user_text = request.get("content")
    
    if not user_text:
        return {"status": "error", "message": "분석할 내용이 없습니다."}

    print(f"📩 실시간 분석 요청 수신: {user_text}")

    try:
        # A. 채영님의 Solar AI 분석 함수 호출
        # 결과 구조: {"analysis": {"type": "...", "score": 8, "keywords": [...], "reason": "..."}}
        analysis_result = db_chaeyeong.analyze_and_get_news(user_text)
        
        # B. 채영님의 DB 저장 함수 호출 (smishing_logs_final, smishing_keywords_final 테이블)
        db_chaeyeong.save_normalized_data(user_text, analysis_result)
        
        # C. 리액트에게 최종 분석 결과 전달 (Flattening 적용)
        # 동현님이 response.data.type 처럼 바로 꺼내 쓸 수 있도록 보따리를 풀어서 줍니다.
        res = analysis_result.get('analysis', {})
        
        print(f"✅ 분석 및 DB 저장 완료: {res.get('type')}")

        return {
            "status": "success", 
            "data": {
                "type": res.get("type"),      # 위험유형
                "score": res.get("score"),    # 위험도 점수
                "keywords": res.get("keywords"), # 키워드 배열
                "reason": res.get("reason"),  # 분석 근거
                "date": res.get("inferred_date") # 추론된 날짜
            }
        }
        
    except Exception as e:
        print(f"❌ 분석 프로세스 오류: {e}")
        return {"status": "error", "message": "AI 분석 중 오류가 발생했습니다."}

# 4. 최근 분석 로그 리스트 API
@app.get("/logs/recent")
def get_recent_logs():
    # 대시보드 하단 실시간 리스트용 (최근 10건)
    return database.get_recent_logs(limit=10)

if __name__ == "__main__":
    # uvicorn 실행: 모든 IP(0.0.0.0) 개방으로 터널링 환경 완벽 대응
    uvicorn.run(app, host="0.0.0.0", port=8000)