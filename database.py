import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_conn():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        ssl={'ca': ''}, 
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

# 1. 월별 통계: 스미싱(is_smishing=1) 데이터만 월별로 합산
def get_monthly_detection_stats():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            # [수정] created_date 컬럼 사용, is_smishing=1 조건 추가
            sql = """
                SELECT DATE_FORMAT(created_date, '%Y-%m') AS name, COUNT(*) AS count 
                FROM smishing_data 
                WHERE is_smishing = 1 
                GROUP BY name 
                ORDER BY name ASC
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()

# 2. 유형별 통계: 스미싱 데이터의 10개 유형 분포
def get_smishing_type_stats():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            # [수정] 10개 유형을 모두 보여주기 위해 상위 10개 추출
            sql = """
                SELECT IFNULL(smishing_type, '일반/기타') AS name, COUNT(*) AS count 
                FROM smishing_data 
                WHERE is_smishing = 1
                GROUP BY name 
                ORDER BY count DESC 
                LIMIT 10
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()

# 3. 최다 빈출 키워드 상위 10개
def get_top_10_keywords():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            # [수정] 스미싱 데이터에서 가장 많이 나온 키워드 10개
            sql = """
                SELECT keywords AS name, COUNT(*) AS count
                FROM smishing_data
                WHERE is_smishing = 1 AND keywords IS NOT NULL AND keywords != ''
                GROUP BY name
                ORDER BY count DESC
                LIMIT 10
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()