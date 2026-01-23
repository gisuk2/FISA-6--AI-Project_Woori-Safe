import pymysql
import json
from datetime import datetime
from openai import OpenAI

# 1. API 및 DB 설정21
SOLAR_API_KEY = "up_X71x8vGnF9IbwyLQl8wZUmdKJD2LI"
client = OpenAI(api_key=SOLAR_API_KEY, base_url="https://api.upstage.ai/v1/solar")

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

# 2. AI 분석 함수 (위험도 산정 + 월별 날짜 추론 포함)
def analyze_and_get_news(text):
    prompt = f"""
    당신은 대한민국 최고의 스미싱 분석 전문가입니다. 
    다음 기준에 따라 문자의 위험도 점수와 연관된 가상의 날짜를 산출하여 JSON으로 응답하세요.

    [위험도 산정 기준 (최대 10점)]
    1. 출처 불명 URL 포함 여부 (+4점)
    2. 긴급한 행동 유도 (예: "즉시 확인", "미납", "정지 예정") (+2점)
    3. 금전적 손실 언급 또는 개인정보 요구 (+2점)
    4. 사회적 공신력 사칭 (예: 검찰, 은행, 우체국) (+2점)
    * 정상적인 일상 대화나 단순 광고는 0~3점 사이를 부여합니다.
    * 합계가 5점 이상인 경우 반드시 위험한 스미싱으로 분류하세요.

    [월별 발생 트렌드 (날짜 추론 기준)]
    문자의 내용을 보고 아래 시기 중 가장 적절한 날짜(2025년 기준)를 YYYY-MM-DD 형식으로 생성하세요.
    - 1~2월: 설날, 명절 선물 관련 (택배/배송, 부고/경조사)
    - 3월: 신학기, 입학 관련 (지인/자녀 사칭)
    - 4~5월: 종합소득세, 선거, 결혼 관련 (기관 사칭, 부고/경조사)
    - 8월: 휴가철 관련 (교통위반, 범칙금)
    - 9~10월: 추석, 이사철 관련 (택배/배송, 허위 결제)
    - 12월: 연말정산, 건강검진 관련 (기관 사칭, 금융/대출)
    * 해당하지 않으면 2025-01-23 부근으로 생성하세요.

    [응답 형식(JSON 필수)]
    {{
      "analysis": {{
        "type": "지인 사칭/기관 사칭/택배/배송 등",
        "score": 점수(정수),
        "inferred_date": "YYYY-MM-DD",
        "reason": "점수 및 날짜 추론 근거",
        "keywords": ["단어1", "단어2"]
      }}
    }}

    문자 내용: {text}
    """
    
    response = client.chat.completions.create(
        model="solar-1-mini-chat",
        messages=[
            {"role": "system", "content": "당신은 논리적인 분석기입니다. 트렌드 표를 참고하여 가장 발생 가능성이 높은 날짜를 할당하세요."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    return json.loads(response.choices[0].message.content)

# 3. DB 저장 함수 (analysis_reason 제외됨)
def save_normalized_data(content, result):
    if 'analysis' not in result:
        return
    
    conn = pymysql.connect(**db_config)
    try:
        with conn.cursor() as cursor:
            analysis = result['analysis']
            score = analysis.get('score', 0)
            inferred_date = analysis.get('inferred_date', datetime.now().strftime('%Y-%m-%d'))
            is_smishing = 1 if score >= 5 else 0

            # [테이블 1] smishing_logs_final 저장
            sql_log = """
                INSERT INTO smishing_logs_final 
                (content, created_date, risk_score, is_smishing) 
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_log, (content, inferred_date, score, is_smishing))
            log_id = cursor.lastrowid

            # [테이블 2] smishing_keywords_final 저장
            keywords = analysis.get('keywords', [])
            smishing_type = analysis.get('type', '일반/기타')
            sql_keyword = """
                INSERT INTO smishing_keywords_final (log_id, keyword, smishing_type) 
                VALUES (%s, %s, %s)
            """
            for kw in keywords:
                cursor.execute(sql_keyword, (log_id, kw.strip(), smishing_type))

        conn.commit()
        print(f"✅ 저장 완료! [날짜: {inferred_date}] [점수: {score}] [유형: {smishing_type}]")
    except Exception as e:
        print(f"❌ DB 오류: {e}")
        conn.rollback()
    finally:
        conn.close()

# 4. 실행부 (리스트 기반 테스트)
if __name__ == "__main__":
    # 분석하고 싶은 문자들을 리스트에 넣으세요
    test_messages = [
        "[CJ대한통운] 고객님 설 명절 선물 주소지 불명으로 배송 지연. http://bit.ly/cj-gift",
        "[국민건강보험] 2025년도 연말정산 건강검진 대상자입니다. 확인: http://nhis.go.kr",
        "엄마 나 폰 고장나서 수리비 급해. 이 계좌로 50만원만 보내줘.",
        "오늘 점심 뭐 먹을래? 김치찌개 어때?"
    ]

    print("🚀 AI 분석 및 DB 적재를 시작합니다...")
    
    for i, msg in enumerate(test_messages):
        print(f"\n🔄 [{i+1}/{len(test_messages)}] 분석 중: {msg[:20]}...")
        try:
            result = analyze_and_get_news(msg)
            save_normalized_data(msg, result)
        except Exception as e:
            print(f"❌ 처리 중 에러: {e}")

    print("\n✨ 모든 작업이 완료되었습니다.")