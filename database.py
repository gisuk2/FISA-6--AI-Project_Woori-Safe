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

def get_class_stats():
    conn = get_db_conn()
    with conn.cursor() as cursor:
        cursor.execute("SELECT class, COUNT(*) as count FROM test2 GROUP BY class")
        result = cursor.fetchall()
    conn.close()
    return result

def get_type_stats():
    conn = get_db_conn()
    with conn.cursor() as cursor:
        cursor.execute("SELECT smishing_type, COUNT(*) as count FROM test2 WHERE class = 2 GROUP BY smishing_type ORDER BY count DESC")
        result = cursor.fetchall()
    conn.close()
    return result

def get_recent_messages():
    conn = get_db_conn()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM test2 ORDER BY created_at DESC LIMIT 10")
        result = cursor.fetchall()
    conn.close()
    return result