import pandas as pd
import pymysql
import os
import numpy as np  # NaN 처리를 위해 추가
from dotenv import load_dotenv

# 1. 환경 변수 로드
load_dotenv()

def upload_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_name = "woori_safe_dataset_final.csv"
    file_path = os.path.join(current_dir, file_name)
    
    try:
        # 2. CSV 데이터 읽기
        print(f"📂 데이터를 읽는 중: {file_path}")
        df = pd.read_csv(file_path, encoding='utf-8-sig')
        
        # [핵심 수정] NaN(결측치)을 MySQL이 이해할 수 있는 None(NULL)으로 완벽하게 변환
        # 모든 데이터를 객체 타입으로 바꾼 후, 값이 없는 부분(NaN)을 None으로 교체합니다.
        df = df.replace({np.nan: None})
        data_list = df.values.tolist()
        
        print(f"📊 총 {len(data_list)}건의 데이터를 확인했습니다.")

        # 3. TiDB 접속
        conn = pymysql.connect(
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT")),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            ssl={'ca': ''},  # SSL 보안 접속 강제
            charset='utf8mb4'
        )

        with conn.cursor() as cursor:
            # 4. test2 테이블 생성 (초기화)
            print("🔨 'test2' 테이블 생성/초기화 중...")
            cursor.execute("DROP TABLE IF EXISTS test2")
            cursor.execute("""
                CREATE TABLE test2 (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    `index` FLOAT,
                    content TEXT,
                    class INT,
                    smishing_type VARCHAR(100),
                    created_at DATETIME
                )
            """)
            
            # 5. 데이터 삽입 SQL
            sql = "INSERT INTO test2 (`index`, content, class, smishing_type, created_at) VALUES (%s, %s, %s, %s, %s)"
            
            print(f"🚀 TiDB 'test2'로 {len(data_list)}건 업로드 시작...")
            
            # 1000건씩 분할 업로드
            for i in range(0, len(data_list), 1000):
                batch = data_list[i:i+1000]
                cursor.executemany(sql, batch)
                conn.commit()
                print(f"✅ {min(i + 1000, len(data_list))}건 완료...")

        print("✨ [성공] 19,009건의 모든 데이터가 성공적으로 업로드되었습니다!")
        conn.close()

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    upload_data()