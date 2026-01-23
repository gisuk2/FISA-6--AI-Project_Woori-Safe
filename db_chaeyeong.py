import pymysql
import json
from openai import OpenAI

# 1. Solar API 설정
SOLAR_API_KEY = "up_MvK9gICmaBP29ogCFgzQ64QACYTyJ"
client = OpenAI(api_key=SOLAR_API_KEY, base_url="https://api.upstage.ai/v1/solar")

# 2. TiDB 연결 설정
db_config = {
    'host': 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    'port': 4000,
    'user': '33UAambkPnmoZXs.root',
    'password': 'kAAMSgxZiqST7ooJ',
    'db': 'test',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
    'ssl': {'fake_flag_to_enable_tls': True} 
}

# 3. 고정된 10가지 페르소나 리스트
PERSONA_LIST = [
    "지인 사칭", "기관 사칭", "택배/배송", "허위 결제", "투자/코인", 
    "부고/경조사", "이벤트/경품", "금융/대출", "교통/범칙금", "일반/기타"
]

def analyze_and_get_news(text):
    prompt = f"""
    당신은 대한민국 최고의 스미싱 분류 전문가입니다.
    주어진 문장을 분석하여 아래 [카테고리] 중 하나를 선택하고 반드시 JSON 형식으로 응답하세요.
    
    [카테고리]: {", ".join(PERSONA_LIST)}
    
    응답 형식(필수):
    {{
      "analysis": {{
        "type": "카테고리 중 하나",
        "score": 0~100점수,
        "reason": "분석 근거",
        "keywords": ["키워드1", "키워드2", "키워드3"]
      }},
      "live_news": {{
        "title": "뉴스제목",
        "url": "뉴스링크"
      }}
    }}
    
    문자 내용: {text}
    """
    
    response = client.chat.completions.create(
        model="solar-1-mini-chat",
        messages=[
            {"role": "system", "content": "You are a professional analyst. You must respond in the specified JSON format using 'analysis' and 'live_news' keys."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    # AI 응답 파싱
    result = json.loads(response.choices[0].message.content)
    
    # [안전장치] AI가 대문자나 다른 키를 사용했을 경우를 대비
    if 'analysis' not in result and 'Analysis' in result:
        result['analysis'] = result.pop('Analysis')
        
    return result

def save_normalized_data(content, result):
    # JSON 구조가 맞는지 다시 한 번 확인
    if 'analysis' not in result:
        print("❌ 에러: AI 응답에 'analysis' 키가 없습니다. 응답 내용:", result)
        return None

    conn = pymysql.connect(**db_config)
    try:
        with conn.cursor() as cursor:
            # AI가 판단한 결과 추출
            analysis_data = result['analysis']
            analyzed_type = analysis_data.get('type', '일반/기타')
            
            # A. 로그 저장 (woori_safe_logs)
            sql_log = "INSERT INTO woori_safe_logs (content, smishing_type, risk_score, analysis_reason) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql_log, (
                content, 
                analyzed_type, 
                analysis_data.get('score', 0), 
                analysis_data.get('reason', '분석 불가')
            ))
            log_id = cursor.lastrowid

            # B. 키워드 저장 (smishing_keywords)
            sql_keyword = "INSERT INTO smishing_keywords (log_id, keyword, smishing_type) VALUES (%s, %s, %s)"
            keywords = analysis_data.get('keywords', [])
            for kw in keywords:
                cursor.execute(sql_keyword, (log_id, kw.strip(), analyzed_type))

        conn.commit()
        print(f"✅ AI 분석 및 DB 저장 완료! [타입: {analyzed_type}]")
        return result.get('live_news')
    except Exception as e:
        print(f"❌ DB 저장 중 오류 발생: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    test_text = "아빠, 나 핸드폰 액정 깨져서 수리 맡겼어. 지금 이 번호로 답장 줘."
    
    print("🔍 AI 분석 중...")
    full_result = analyze_and_get_news(test_text)
    
    print("💾 DB 저장 중...")
    save_normalized_data(test_text, full_result)