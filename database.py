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

# database.py 수정

# [유형별] smishing_type -> name, total_count -> count
def get_smishing_type_stats():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT smishing_type AS name, COUNT(*) AS count 
                FROM test2 
                WHERE class = 2 
                GROUP BY name 
                ORDER BY count DESC 
                LIMIT 10
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()

# [월별] month -> name, monthly_count -> count
def get_monthly_detection_stats():
    conn = get_db_conn()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT DATE_FORMAT(created_at, '%Y-%m') AS name, COUNT(*) AS count 
                FROM test2 
                WHERE class = 2 
                GROUP BY name 
                ORDER BY name ASC
            """
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()