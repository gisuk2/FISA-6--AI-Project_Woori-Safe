# 🛡️ 우리Safe (Woori-Safe)
> **Solar LLM 기반 지능형 스미싱 탐지 및 통계 시각화 플랫폼**

우리Safe는 날로 교묘해지는 스미싱 범죄로부터 사용자를 보호하기 위해, **Upstage Solar LLM**의 문맥 이해 능력을 활용하여 의심스러운 문자를 실시간으로 분석하고, 수집된 데이터를 대시보드로 시각화하여 제공하는 통합 보안 솔루션입니다.

---

## 👨‍💻 팀원 소개
- **신은욱 (Backend / AI)**: FastAPI 서버 구축, TiDB 데이터베이스 설계 및 관리, Solar API 프롬프트 엔지니어링 및 데이터 전처리
- **[팀원 성함] (Frontend)**: React 기반 UI/UX 개발, Figma 디자인 시스템 구현, Chart.js/Recharts를 이용한 데이터 시각화

---

## 🛠 기술 스택 (Tech Stack)
### Backend & AI
- **Language**: Python 3.11
- **Framework**: FastAPI
- **AI 모델**: Upstage Solar LLM (Solar-1-mini-chat)
- **Database**: TiDB (MySQL Compatible Cloud DB)
- **Library**: Pandas, SQLAlchemy, PyMySQL

### Frontend
- **Framework**: React.js
- **Design**: Figma
- **State Management**: Context API / TanStack Query (추천)
- **Visualization**: Chart.js or Recharts

---

## 🚀 핵심 기능 (Main Features)
1. **실시간 스미싱 탐지**: 사용자가 입력한 문자 메시지를 Solar LLM이 분석하여 위험도 점수(0-100%)와 사유를 반환
2. **유형별 자동 분류**: 지인 사칭, 투자 유도, 공공기관 사칭 등 10대 스미싱 유형으로 자동 분류
3. **데이터 대시보드**: 19,000건 이상의 학습 데이터를 기반으로 한 스미싱 발생 트렌드 시각화
4. **위험도 게이지**: 분석 결과를 한눈에 파악할 수 있는 직관적인 게이지 차트 UI

---

## 📂 폴더 구조 (Project Structure)
```text
Woori-Safe-Smishing/
├── backend/          # Python FastAPI 서버
│   ├── main.py       # API 엔트리 포인트
│   ├── database.py   # TiDB 연동 로직
│   └── .env          # 환경 변수 (DB 정보, API Key)
├── frontend/         # React 프로젝트
│   ├── src/
│   └── public/
└── README.md         # 프로젝트 가이드

화이팅