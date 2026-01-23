# 🛡️ Don't Smishing
> **Solar LLM 기반 지능형 스미싱 탐지 및 실시간 트렌드 시각화 플랫폼**

![메인 이미지](main.png)

최근 급증하는 지능형 스미싱(택배 사칭, 정부지원금 등) 문제를 해결하기 위해 키워드 매칭을 넘어 "Upstage Solar LLM"의 문맥 이해 능력을 활용한 실시간 분석 및 대용량 데이터 기반 대시보드를 제공합니다.

---

## 👨‍💻 팀원 소개 및 R&R
| 이름 | 역할 | 주요 업무 |
| :--- | :--- | :--- |
| 신은욱 | Backend / AI | FastAPI 아키텍처 설계, TiDB(MySQL) 연동 및 쿼리 최적화, Solar API 프롬프트 엔지니어링 |
| 김동현 | Frontend / Design | Figma UI/UX 디자인, React 기반 웹 화면 구현, Chart.js 데이터 시각화 |
| 최하은 | Data / DB | 1.9만 건의 스미싱 데이터 수집 및 정규화, 마스터 테이블 구축 |
| 민채영 | AI / Logic/ DB | 분석 로직 개발, 추출 데이터 DB 적재 프로세스, 스키마 설계 |

---

## 🛠 기술 스택 (Tech Stack)

### 1. Backend & AI
- **Language**: Python 3.11
- **Framework**: FastAPI
- **AI Model**: Upstage Solar LLM (Solar-1-mini-chat)
- **Database**: TiDB (Cloud-native MySQL Compatible)
- **Library**: SQLAlchemy, PyMySQL, OpenAI SDK, Pandas

### 2. Frontend
- **Framework**: React.js
- **State Management**: Context API
- **Visualization**: Recharts / Chart.js
- **Styling**: Tailwind CSS / Styled-components

---

## 🏗️ 시스템 아키텍처 (System Architecture)

우리Safe는 사용자가 입력한 메시지를 AI가 분석함과 동시에, 기존 1.9만 건의 데이터와 통합하여 실시간 통계를 산출합니다.



1. **Input**: 사용자가 의심 문자열 입력 (React)
2. **Analysis**: Solar API를 통해 문맥 분석, 위험 점수 및 유형 ID(1~10) 추출 (FastAPI)
3. **Storage**: 분석 결과 및 원본 데이터를 정규화된 규격으로 TiDB에 저장
4. **Dashboard**: 전체 통계 및 실시간 트렌드 시각화

---

## 🗄️ 데이터베이스 설계 (DB Design)
"2-Key 정규화 전략"을 통해 데이터 일관성과 조회 성능을 최적화했습니다.


- **`smishing_data`** : 실시간 분석 로그 및 1.9만 건의 기존 데이터를 통합 관리하는 핵심 테이블입니다.
- **`analysis_logs`**: 실시간 분석 결과 및 수집된 메시지 저장 (type_id, risk_score 포함)
- **`smishing_types`**: 10대 스미싱 유형 정의 (지인 사칭, 공공기관 사칭 등)

---

## 🚀 핵심 기능 (Main Features)

### 1. 실시간 스미싱 탐지
- **AI Context Analysis**: Solar AI를 활용해 "의도"를 파악하여 변종 문구 탐지
- **Score Gauge**: 0~10 사이의 위험도를 직관적인 게이지 차트로 표현

### 2. 스미싱 트렌드 대시보드
- **Time-series Chart**: 일별/주별 스미싱 발생 추이 시각화
- **Type Ratio**: 1.9만 건의 데이터를 바탕으로 현재 가장 유행하는 스미싱 유형 비중 제공

### 3. 필터링 및 리포트
- **Smart Filter**: 유형별, 시기별 데이터 필터링 기능
- **Word Cloud**: 유형별 핵심 키워드 시각화 (예: 금융사칭 - '정부지원금', '승인완료')

---

## 💡 해결 과제 (Troubleshooting)

### 이슈: 대용량 데이터(1.9만 건)와 실시간 데이터의 통합 시각화
- **문제**: 기존 데이터는 텍스트 형식이라 실시간 AI 분석 데이터와 규격이 맞지 않음.
- **해결**: 
  - `type_id`(숫자) 기반의 마스터 테이블 시스템 도입.
  - 기존 텍스트 데이터를 Python 정규식을 통해 ID 기반으로 전처리 후 일괄 적재.
  - 이를 통해 대시보드 조회 시 복잡한 String 연산 없이 고속 Join 및 Group By 가능.


---

## 🏃 실행 방법 (How to Run)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
