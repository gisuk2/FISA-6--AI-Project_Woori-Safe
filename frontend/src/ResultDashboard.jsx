import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

const defaultData = {
  types: [
    { name: '일반/기타', count: 14000 }, { name: '금융/대출', count: 3200 }, { name: '기관 사칭', count: 1800 },
    { name: '지인 사칭', count: 900 }, { name: '택배/배송', count: 600 }, { name: '이벤트/경품', count: 450 },
    { name: '부고/경조사', count: 300 }, { name: '교통위반/과태료', count: 250 }, { name: '허위 결제', count: 150 }, { name: '계정 보안', count: 100 }
  ],
  monthly: [
    { name: '25.02', count: 15000 }, { name: '25.03', count: 14200 }, { name: '25.04', count: 13500 },
    { name: '25.05', count: 12800 }, { name: '25.06', count: 11000 }, { name: '25.07', count: 9500 },
    { name: '25.08', count: 8200 }, { name: '25.09', count: 7100 }, { name: '25.10', count: 5500 },
    { name: '25.11', count: 4200 }, { name: '25.12', count: 3100 }, { name: '26.01', count: 1200 }
  ],
  allKeywords: [
    { name: "무료", count: 100, type: "일반/기타" },
    { name: "저금리", count: 80, type: "금융/대출" },
    { name: "엄마", count: 90, type: "지인 사칭" }
  ],
  news: [
    { title: "최신 스미싱 수법 주의보", link: "https://www.fss.or.kr" },
    { title: "금융감독원 보안 수칙 배포", link: "https://www.fss.or.kr" },
    { title: "부고 문자 사칭 악성 앱 주의", link: "https://www.kisa.or.kr" },
    { title: "교통위반 과태료 사칭 주의", link: "https://www.police.go.kr" },
    { title: "계정 보안 정보 유출 대응법", link: "https://www.spo.go.kr" }
  ]
};

const categories = ["일반/기타", "금융/대출", "기관 사칭", "지인 사칭", "택배/배송", "이벤트/경품", "부고/경조사", "교통위반/과태료", "허위 결제", "계정 보안"];

export default function ResultDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState('type');
  
  // 분석 결과 가져오기
  const analysisResult = location.state?.analysisResult?.data || { 
    score: 0, 
    type: "일반/기타", 
    keywords: [], 
    reason: "데이터를 불러오는 중입니다." 
  };

  // 초기 카테고리는 분석 결과 타입으로 자동 세팅
  const [selectedCategoryName, setSelectedCategoryName] = useState(analysisResult.type);
  const [animatedScore, setAnimatedScore] = useState(0);
  const rawText = location.state?.text || "분석된 메시지가 없습니다.";
  const BASE_URL = "http://192.168.0.102:8000";

  useEffect(() => {
    const timer = setTimeout(() => { setAnimatedScore(analysisResult.score); }, 500);
    return () => clearTimeout(timer);
  }, [analysisResult.score]);

  const scoreColor = useMemo(() => {
    if (animatedScore >= 8) return "#ff4d4f"; 
    if (animatedScore >= 5) return "#ff9c6e"; 
    if (animatedScore >= 3) return "#ffec3d"; 
    return "#00e5cc"; 
  }, [animatedScore]);

  // 백엔드 통계 및 전체 키워드 데이터 가져오기
  const { data: stats } = useQuery({
    queryKey: ['smishingReport'],
    queryFn: async () => {
      try {
        const [resTypes, resMonthly, resKeywords] = await Promise.all([
          axios.get(`${BASE_URL}/stats/types`),
          axios.get(`${BASE_URL}/stats/monthly`),
          axios.get(`${BASE_URL}/stats/keywords`)
        ]);
        return {
          types: categories.map(cat => {
            const found = resTypes.data?.find(d => d.name === cat);
            return found || { name: cat, count: 0 };
          }),
          monthly: resMonthly.data?.length > 0 ? resMonthly.data : defaultData.monthly,
          allKeywords: resKeywords.data || [], // ✨ 은욱님이 준 전체 키워드 배열
          news: analysisResult.news || defaultData.news
        };
      } catch { return defaultData; }
    },
    initialData: defaultData
  });

  // 시연용 더미 데이터 (백엔드 데이터 없을 시 대비)
  const dummyKeywords = {
    "지인 사칭": ["엄마", "폰고장", "문화상품권", "급전", "편의점"],
    "택배/배송": ["배송불가", "주소확인", "운송장번호", "물품미배송", "반송"],
    "금융/대출": ["저금리", "정부지원", "대출승인", "긴급자금", "한도조과"],
    "기관 사칭": ["검찰청", "사건번호", "출석통지", "개인정보유출", "구속"],
    "부고/경조사": ["부고알림", "장례식장", "모바일청첩장", "참석바람", "화환"],
    "교통위반/과태료": ["법규위반", "과태료납부", "무인단속", "벌점", "납부기한"],
    "허위 결제": ["결제완료", "승인번호", "본인확인", "해외결제", "카드취소"],
    "계정 보안": ["비밀번호변경", "해외로그인", "계정잠금", "인증요청", "로그인시도"]
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans text-[#333] relative overflow-hidden text-left">
      <style>{`
        @keyframes pulseScale { 0%, 100% { opacity: 0.15; transform: scale(0.9); } 50% { opacity: 0.4; transform: scale(1.15); } }
        .animate-bg-pulse { animation: pulseScale 12s ease-in-out infinite; }
      `}</style>

      {/* 배경 디자인 */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#00e5cc] blur-[120px] rounded-full pointer-events-none animate-bg-pulse" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-black blur-[150px] rounded-full pointer-events-none animate-bg-pulse" style={{ animationDelay: '-4s' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12">
          <button onClick={() => navigate('/')} className="mb-4 text-sm font-bold text-gray-400">← 돌아가기</button>
          <div className="text-center flex-1">
            <h1 className="text-[54px] font-black leading-none mb-2 tracking-tight text-[#1a1a1a]">분석 <span className="text-[#00e5cc]">결과</span></h1>
          </div>
          <div className="mb-4 bg-[#00e5cc] text-white px-8 py-3 rounded-full text-lg font-black shadow-lg shadow-cyan-400/30">AI 분석 완료</div>
        </div>

        <div className="space-y-8">
          {/* 메시지 요약 카드 */}
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white">
            <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-widest">Analyzed Message</h3>
            <div className="text-3xl font-bold text-gray-800 italic border-l-8 border-[#00e5cc] pl-6 mb-6 leading-snug">"{rawText}"</div>
            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">Analysis Reason</p>
              <p className="text-xl text-gray-600 leading-relaxed font-semibold">{analysisResult.reason}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 위험 점수 */}
            <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white flex flex-col items-center">
              <h3 className="text-sm font-bold mb-6 self-start text-gray-400 uppercase tracking-widest">위험 점수</h3>
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{v: animatedScore}, {v: 10 - animatedScore}]} innerRadius={75} outerRadius={105} startAngle={90} endAngle={450} dataKey="v" stroke="none">
                      <Cell fill={scoreColor} />
                      <Cell fill="#eef2f6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-8xl font-black transition-colors duration-1000" style={{ color: scoreColor }}>{analysisResult.score}</span>
                  <span className="text-[10px] font-bold text-gray-400 mt-[-5px] uppercase tracking-widest">Risk Level</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-bold mb-6 self-start text-gray-400 uppercase tracking-widest">위험 유형</h3>
              <div className="text-7xl mb-6 animate-bounce">⚠️</div>
              <div className="text-4xl font-black text-[#1a1a1a]">{analysisResult.type}</div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white">
              <h3 className="text-sm font-bold mb-6 text-gray-400 uppercase tracking-widest">📰 관련 뉴스 리스트</h3>
              <div className="space-y-4">
                {stats.news?.slice(0, 5).map((n, i) => (
                  <a key={i} href={n.link} target="_blank" rel="noreferrer" className="block border-b border-gray-100 pb-3 hover:translate-x-1 transition-transform group">
                    <div className="font-bold text-base text-gray-700 group-hover:text-[#00e5cc] truncate">· {n.title}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 📊 통계 그래프 섹션 */}
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-12 shadow-sm border border-white">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-base font-bold text-gray-500 uppercase tracking-widest">
                {selectedTab === 'type' ? '📊 유형별 분포 (TOP 10)' : '📉 월별 발생 추이 (12개월)'}
              </h3>
              <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
                <button onClick={() => setSelectedTab('trend')} className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all ${selectedTab === 'trend' ? 'bg-[#00e5cc] text-white shadow-md' : 'text-gray-400'}`}>추이</button>
                <button onClick={() => setSelectedTab('type')} className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all ${selectedTab === 'type' ? 'bg-[#00e5cc] text-white shadow-md' : 'text-gray-400'}`}>유형별</button>
              </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {selectedTab === 'type' ? (
                  <BarChart data={stats.types}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" interval={0} tick={{fontSize: 12, fontWeight: 700}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                    <Bar dataKey="count" fill="#00e5cc" radius={[12, 12, 0, 0]} barSize={35} />
                  </BarChart>
                ) : (
                  <LineChart data={stats.monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 700}} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#00e5cc" strokeWidth={6} dot={{ r: 7, fill: '#00e5cc', stroke: '#fff', strokeWidth: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* 🛡️ 유형별 빈출 키워드 섹션 (가장 중요!) */}
          <div className="bg-[#f4f7f9] rounded-[50px] p-12 border border-gray-100 shadow-lg">
            <h3 className="text-base font-bold mb-10 text-gray-500 uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-8 bg-[#00e5cc] rounded-full"></span> 🛡️ 유형별 빈출 키워드
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
              {categories.map((cat, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedCategoryName(cat)} 
                  className={`py-6 px-4 rounded-[28px] text-[16px] font-black border-2 transition-all active:scale-95 ${selectedCategoryName === cat ? 'bg-[#00e5cc] border-[#00e5cc] text-white shadow-xl shadow-cyan-400/30' : 'bg-white border-transparent text-gray-400 hover:border-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-[40px] p-10 shadow-inner border border-white">
              <div className="flex flex-wrap gap-5 justify-center">
                {/* ✨ 로직 설명:
                  1. stats.allKeywords(백엔드 전체 키워드)에서 현재 누른 버튼(selectedCategoryName)의 type과 같은 것들만 필터링합니다.
                  2. 필터링된 결과가 있으면 그걸 3xl 크기로 보여줍니다.
                  3. 백엔드 데이터가 비어있으면 준비된 더미 데이터를 보여주어 시연이 끊기지 않게 합니다.
                */}
                {stats.allKeywords && stats.allKeywords.filter(kw => kw.type === selectedCategoryName).length > 0 ? (
                  stats.allKeywords
                    .filter(kw => kw.type === selectedCategoryName)
                    .map((kw, i) => (
                      <div key={i} className="bg-[#f0fdfa] px-10 py-5 rounded-[30px] text-3xl font-black text-[#00e5cc] border-2 border-[#00e5cc]/20 shadow-sm">
                        #{kw.name}
                      </div>
                    ))
                ) : (
                  dummyKeywords[selectedCategoryName]?.map((kw, i) => (
                    <div key={i} className="bg-gray-100 px-10 py-5 rounded-[30px] text-3xl font-black text-gray-400 border-2 border-gray-200/50 shadow-sm">
                      #{kw}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}