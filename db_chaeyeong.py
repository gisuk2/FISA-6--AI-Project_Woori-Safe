import pymysql
import json
from datetime import datetime
import random
from openai import OpenAI

# 1. API 및 DB 설정
SOLAR_API_KEY = "up_MvK9gICmaBP29ogCFgzQ64QACYTyJ"
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

# 2. AI 분석 함수 (위험도 기준 + 월별 트렌드 기반 날짜 생성 로직 포함)
def analyze_and_get_news(text):
    prompt = f"""
    당신은 대한민국 최고의 스미싱 분석 전문가입니다. 
    다음 기준에 따라 문자의 위험도 점수와 연관된 가상의 날짜를 산출하여 JSON으로 응답하세요.

    [위험도 산정 기준 (최대 10점)]
    1. 출처 불명 URL 포함 여부 (+4점)
    2. 긴급한 행동 유도 (예: "즉시 확인", "정지 예정") (+2점)
    3. 금전 요구 또는 개인정보 요구 (+2점)
    4. 공신력 있는 기관 사칭 (+2점)
    * 합계 5점 이상은 반드시 스미싱으로 분류.

    [월별 발생 트렌드 (날짜 추론 기준)]
    문자의 내용을 보고 아래 시기 중 가장 적절한 날짜(2025년 기준)를 YYYY-MM-DD 형식으로 생성하세요.
    - 1~2월: 설날, 명절 선물 관련 (택배/배송, 부고/경조사)
    - 3월: 신학기, 입학 관련 (지인/자녀 사칭)
    - 4~5월: 종합소득세, 선거, 결혼 관련 (기관 사칭, 부고/경조사)
    - 8월: 휴가철 관련 (교통위반, 범칙금)
    - 9~10월: 추석, 이사철 관련 (택배/배송, 허위 결제)
    - 12월: 연말정산, 건강검진 관련 (기관 사칭, 금융/대출)
    * 위 케이스에 해당하지 않으면 현재 날짜인 2025-01-23 부근으로 생성하세요.

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
            {"role": "system", "content": "당신은 논리적인 분석기입니다. 트렌드 표를 참고하여 가장 통계적으로 발생 가능성이 높은 날짜를 할당하세요."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    return json.loads(response.choices[0].message.content)

# 3. DB 저장 함수
def save_normalized_data(content, result):
    if 'analysis' not in result:
        return
    
    conn = pymysql.connect(**db_config)
    try:
        with conn.cursor() as cursor:
            analysis = result['analysis']
            score = analysis.get('score', 0)
            # AI가 추론한 날짜 사용 (없으면 오늘 날짜)
            inferred_date = analysis.get('inferred_date', datetime.now().strftime('%Y-%m-%d'))
            is_smishing = 1 if score >= 5 else 0

            # [테이블 1] 저장 (inferred_date 사용)
            sql_log = """
                INSERT INTO smishing_logs_final 
                (content, created_date, risk_score, is_smishing, analysis_reason) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql_log, (content, inferred_date, score, is_smishing, analysis.get('reason')))
            log_id = cursor.lastrowid

            # [테이블 2] 저장
            keywords = analysis.get('keywords', [])
            smishing_type = analysis.get('type', '일반/기타')
            sql_keyword = "INSERT INTO smishing_keywords_final (log_id, keyword, smishing_type) VALUES (%s, %s, %s)"
            for kw in keywords:
                cursor.execute(sql_keyword, (log_id, kw.strip(), smishing_type))

        conn.commit()
        print(f"✅ 저장 완료! [추론날짜: {inferred_date}] [점수: {score}] [유형: {smishing_type}]")
    except Exception as e:
        print(f"❌ 오류: {e}")
        conn.rollback()
    finally:
        conn.close()

# 4. 테스트 실행
if __name__ == "__main__":
    # 테스트 1: 명절 관련 문자 (1~2월 추론 예상)
    test_1 = "[CJ대한통운] 설 명절 선물 주소지 불명으로 배송 지연. 확인 부탁드립니다. http://bit.ly/cj-gift"
    # 테스트 2: 건강검진 관련 문자 (12월 추론 예상)
    test_2 = "[국민건강보험] 2025년도 건강검진 대상자입니다. 검진 예약 확인: http://nhis.go.kr.v"

    for msg in [test_1, test_2]:
        print(f"\n🔍 분석 중: {msg[:30]}...")
        res = analyze_and_get_news(msg)
        save_normalized_data(msg, res)
        