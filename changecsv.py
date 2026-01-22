import pandas as pd
import random
from datetime import datetime, timedelta

# 1. 파일 불러오기
# 파일명은 실제 가지고 계신 파일명으로 수정하세요.
input_file = 'lgaidataset_all_classified.csv' 
output_file = 'woori_safe_dataset_final.csv'

try:
    # 한국어 데이터이므로 encoding='utf-8-sig'를 사용하는 것이 안전합니다.
    df = pd.read_csv(input_file, encoding='utf-8-sig')
    print(f"✅ 파일을 성공적으로 불러왔습니다. (행 개수: {len(df)})")

    # 2. 랜덤 날짜 생성 함수 정의
    def generate_random_date(start_year=2025, start_month=11, start_day=1):
        start_date = datetime(start_year, start_month, start_day)
        end_date = datetime.now() # 현재 시간까지
        
        # 시작일과 종료일 사이의 초(seconds) 차이를 계산
        time_between = end_date - start_date
        seconds_between = time_between.total_seconds()
        
        # 무작위 초를 선택하여 시작일에 더함
        random_second = random.randrange(int(seconds_between))
        return start_date + timedelta(seconds=random_second)

    # 3. 'created_at' 컬럼 추가
    print("📅 날짜 데이터를 생성 중입니다...")
    df['created_at'] = [generate_random_date().strftime('%Y-%m-%d %H:%M:%S') for _ in range(len(df))]

    # 4. 결과 저장
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"🚀 변환 완료! 파일이 '{output_file}'로 저장되었습니다.")

except FileNotFoundError:
    print("❌ 파일을 찾을 수 없습니다. 파일명이 정확한지 확인해 주세요.")
except Exception as e:
    print(f"❌ 오류 발생: {e}")