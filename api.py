from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import database
import uvicorn

app = FastAPI()

# 리액트 접속 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 리액트에서 보낼 데이터 규격
class MessageRequest(BaseModel):
    content: str

@app.get("/")
def home():
    return {"message": "서버가 정상 작동 중입니다."}

@app.get("/stats/overview")
def overview():
    return database.get_class_stats()

@app.get("/stats/types")
def types():
    return database.get_type_stats()

@app.get("/messages/recent")
def recent():
    return database.get_recent_messages()

# api.py의 해당 함수만 이렇게 교체해 보세요
# api.py의 analyze_message 함수를 아래처럼 잠시 바꿔서 테스트
@app.post("/analyze")
async def analyze_message(request: dict): # 규격을 dict로 유연하게 변경
    # 1. 리액트에서 보낸 데이터 중 content나 text 등 어떤 이름이든 찾아봅니다.
    user_text = request.get("content") or request.get("text") or request.get("message")
    
    print(f"📩 리액트 수신: {user_text}")

    if not user_text:
        return {"status": "error", "message": "데이터의 'content' 키를 찾을 수 없습니다.", "received": request}

    # 2. DB 저장 로직
    try:
        conn = database.get_db_conn()
        with conn.cursor() as cursor:
            sql = "INSERT INTO user_logs (content, ai_class, smishing_type) VALUES (%s, %s, %s)"
            cursor.execute(sql, (user_text, 0, "검사 대기"))
            conn.commit()
            print("💾 DB 저장 성공!")
        conn.close()
    except Exception as e:
        print(f"❌ DB 오류: {e}")

    return {"status": "success", "received_text": user_text}

if __name__ == "__main__":
    # 0.0.0.0으로 설정해야 0.50이든 0.71이든 모든 IP로 들어오는 요청을 받습니다.
    uvicorn.run(app, host="0.0.0.0", port=8000)