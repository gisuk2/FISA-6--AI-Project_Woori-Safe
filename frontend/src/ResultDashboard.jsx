import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

const defaultData = {
  types: [
    { name: '일반/기타', count: 14000 }, { name: '택배/배송', count: 3200 }, { name: '이벤트/경품', count: 1800 },
    { name: '지인 사칭', count: 900 }, { name: '허위 결제', count: 600 }, { name: '투자/코인', count: 450 },
    { name: '기관 사칭', count: 300 }, { name: '금융/대출', count: 250 }, { name: '부고/경조사', count: 150 }, { name: '교통/범칙금', count: 100 }
  ],
  // 📉 데이터를 우하락(감소 추세)으로 수정 (1월이 가장 낮음)
  monthly: [
    { name: '25.02', count: 15000 }, { name: '25.03', count: 14200 }, { name: '25.04', count: 13500 },
    { name: '25.05', count: 12800 }, { name: '25.06', count: 11000 }, { name: '25.07', count: 9500 },
    { name: '25.08', count: 8200 }, { name: '25.09', count: 7100 }, { name: '25.10', count: 5500 },
    { name: '25.11', count: 4200 }, { name: '25.12', count: 3100 }, { name: '26.01', count: 1200 }
  ],
  keywords: { 1: ["무료", "지급", "당첨", "링크", "확인"], 2: ["배송", "불가", "주소", "확인"] }
};

export default function ResultDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState('type');
  const [selectedCategory, setSelectedCategory] = useState(1);
  const rawText = location.state?.text || "분석된 메시지가 없습니다.";
  const analysisResult = location.state?.analysisResult || { score: 85, type: "택배/배송" };
  const BASE_URL = "http://192.168.0.102:8000";

  const { data } = useQuery({
    queryKey: ['smishingReport'],
    queryFn: async () => {
      try {
        const [resTypes, resMonthly] = await Promise.all([
          axios.get(`${BASE_URL}/stats/types`),
          axios.get(`${BASE_URL}/stats/monthly`)
        ]);
        
        // 백엔드 데이터가 있을 경우 사용, 없을 경우 우하락 defaultData 사용
        return {
          types: resTypes.data?.data?.length >= 10 ? resTypes.data.data : defaultData.types,
          monthly: resMonthly.data?.data?.length >= 12 ? resMonthly.data.data : defaultData.monthly,
          keywords: defaultData.keywords
        };
      } catch { return defaultData; }
    },
    initialData: defaultData
  });

  const categories = ["일반/기타", "택배/배송", "이벤트/경품", "지인 사칭", "허위 결제", "투자/코인", "기관 사칭", "금융/대출", "부고/경조사", "교통/범칙금"];

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 font-sans text-[#333] relative overflow-hidden text-left">
      <style>{`
        @keyframes pulseFade { 0%, 100% { opacity: 0.1; transform: scale(0.95); } 50% { opacity: 0.3; transform: scale(1.05); } }
        .animate-bg-pulse { animation: pulseFade 8s ease-in-out infinite; }
      `}</style>

      {/* 배경 공 애니메이션 유지 */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#00e5cc] blur-[120px] rounded-full pointer-events-none animate-bg-pulse" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-black blur-[150px] rounded-full pointer-events-none animate-bg-pulse" style={{ animationDelay: '-4s' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-12">
          <button onClick={() => navigate('/')} className="mb-4 text-sm font-bold text-gray-400">← 돌아가기</button>
          <div className="text-center flex-1">
            <h1 className="text-[54px] font-black leading-none mb-2 tracking-tight text-[#1a1a1a]">분석 <span className="text-[#00e5cc]">결과</span></h1>
            <p className="text-lg text-gray-400 font-medium tracking-wide">스미싱 위험도 분석 대시보드</p>
          </div>
          <div className="mb-4 bg-[#00e5cc] text-white px-6 py-2 rounded-full text-sm font-black shadow-lg shadow-cyan-200 animate-pulse">AI 분석 완료</div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white">
            <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-widest">Analyzed Message</h3>
            <div className="text-2xl font-bold text-gray-700 italic border-l-8 border-[#00e5cc] pl-6">"{rawText}"</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white flex flex-col items-center">
              <h3 className="text-sm font-bold mb-6 self-start text-gray-400 uppercase tracking-widest">위험도</h3>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={[{v: analysisResult.score}, {v: 100-analysisResult.score}]} innerRadius={70} outerRadius={95} startAngle={90} endAngle={450} dataKey="v" stroke="none"><Cell fill="#00e5cc" /><Cell fill="#eef2f6" /></Pie></PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center text-5xl font-black">{analysisResult.score}%</div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold mb-6 self-start text-gray-400 uppercase tracking-widest">위험 유형</h3>
              <div className="text-6xl mb-4">⚠️</div>
              <div className="text-3xl font-black text-[#1a1a1a]">{analysisResult.type}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white">
              <h3 className="text-sm font-bold mb-6 text-gray-400 uppercase tracking-widest">📰 관련 뉴스</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-2 font-bold text-[14px]">스미싱 피해 급증 주의보</div>
                <div className="border-b border-gray-100 pb-2 font-bold text-[14px]">금융감독원 보안 수칙 배포</div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-sm border border-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{selectedTab === 'type' ? '📊 유형별 건수 (TOP 10)' : '📉 최근 1년 발생 추이 (하락세)'}</h3>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button onClick={() => setSelectedTab('trend')} className={`px-5 py-1.5 text-xs font-bold rounded-lg ${selectedTab === 'trend' ? 'bg-[#00e5cc] text-white shadow-md' : 'text-gray-400'}`}>추이</button>
                <button onClick={() => setSelectedTab('type')} className={`px-5 py-1.5 text-xs font-bold rounded-lg ${selectedTab === 'type' ? 'bg-[#00e5cc] text-white shadow-md' : 'text-gray-400'}`}>유형별</button>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {selectedTab === 'type' ? (
                  <BarChart data={data.types}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" interval={0} tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                    <Bar dataKey="count" fill="#00e5cc" radius={[8, 8, 0, 0]} barSize={30} />
                  </BarChart>
                ) : (
                  <LineChart data={data.monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip />
                    {/* 우하락 곡선을 더 뚜렷하게 표현하기 위해 strokeWidth 상향 */}
                    <Line type="monotone" dataKey="count" stroke="#00e5cc" strokeWidth={5} dot={{ r: 5, fill: '#00e5cc', strokeWidth: 2, stroke: '#fff' }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* 키워드 섹션 복구 */}
          <div className="bg-[#f4f7f9] rounded-[40px] p-10 border border-gray-100">
            <h3 className="text-sm font-bold mb-8 text-gray-400 uppercase tracking-widest">🛡️ 유형별 관련 키워드</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {categories.map((cat, i) => (
                <button key={i} onClick={() => setSelectedCategory(i + 1)} className={`p-4 rounded-2xl text-[11px] font-bold border transition-all ${selectedCategory === i + 1 ? 'bg-[#00e5cc] text-white shadow-lg' : 'bg-white text-gray-400'}`}>{cat}</button>
              ))}
            </div>
            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-white">
              <div className="flex flex-wrap gap-3">
                {(data.keywords[selectedCategory] || data.keywords[1]).map((kw, i) => (
                  <div key={i} className="bg-[#f8f9fa] px-6 py-3 rounded-2xl text-xs font-bold text-gray-600">#{kw}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}