import pandas as pd
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

# 1. 환경 변수 로드 (.env 파일이 main.py와 같은 폴더에 있어야 함)
load_dotenv()

# 2. TiDB 연결 설정
def get_engine():
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    database = os.getenv("DB_NAME")
    
    # ssl_ca=true 대신 ssl_verify_cert=False 등을 지원하는 커넥션 방식 사용
    # 아래는 가장 호환성이 높은 연결 문자열입니다.
    db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
    
    # connect_args를 통해 SSL 설정을 직접 전달합니다.
    return create_engine(
        db_url,
        connect_args={
            "ssl": {
                "fake_option_to_enable_ssl": True # SSL을 활성화하되 파일 경로를 찾지 않게 함
            }
        }
    )
def upload_data():
    # 3. 경로 설정 (현재 실행되는 main.py와 같은 폴더의 CSV를 찾음)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "lgaidataset_all_classified.csv")
    
    # 파일 존재 여부 확인
    if not os.path.exists(file_path):
        print(f"❌ 파일을 찾을 수 없습니다: {file_path}")
        print("현재 폴더에 있는 파일 목록:", os.listdir(current_dir))
        return

    try:
        # 4. CSV 데이터 읽기
        print(f"📂 데이터를 읽는 중: {file_path}")
        # 한글 깨짐 방지를 위해 encoding 설정 (필요시 utf-8-sig 또는 cp949)
        df = pd.read_csv(file_path, encoding='utf-8-sig') 
        
        print(f"📊 총 {len(df)}건의 데이터를 확인했습니다.")
        print(df.head(3)) # 데이터 샘플 출력

        # 5. DB 업로드
        engine = get_engine()
        table_name = "lgaidataset_all_classified"
        
        print(f"🚀 TiDB의 '{table_name}' 테이블로 업로드 시작...")
        
        # 데이터가 많을 경우 chunksize를 주면 안정적입니다.
        df.to_sql(
            name=table_name, 
            con=engine, 
            if_exists='replace', # 기존 테이블 삭제 후 생성
            index=False,
            chunksize=1000 
        )
        
        print("✅ 모든 데이터가 성공적으로 업로드되었습니다!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    upload_data()