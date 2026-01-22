import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar 
} from 'recharts';

export default function ResultDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawText = location.state?.text || "입력된 메시지가 없습니다.";
  
  // 그래프 전환 상태 ('trend' 또는 'type')
  const [viewType, setViewType] = useState('type'); 
  const [selectedCat, setSelectedCat] = useState(1);

  // --- 시뮬레이션 데이터 ---
  const riskData = [{ value: 85 }, { value: 15 }];
  
  // 1. 추이 데이터 (Line)
  const trendData = [
    { name: '7월', value: 12000 }, { name: '8월', value: 14000 },
    { name: '9월', value: 15500 }, { name: '10월', value: 16500 },
    { name: '11월', value: 18000 }, { name: '12월', value: 19500 },
    { name: '1월', value: 19800 }
  ];

  // 2. 유형별 건수 데이터 (Bar) - 디자인 수치 반영
  const barData = [
    { name: '일반/기타', count: 14000 }, { name: '택배/배송', count: 2800 },
    { name: '이벤트/경품', count: 1200 }, { name: '지인 사칭', count: 600 },
    { name: '허위 결제', count: 400 }, { name: '투자/코인', count: 300 },
    { name: '기관 사칭', count: 250 }, { name: '금융/대출', count: 200 },
    { name: '부고/경조사', count: 150 }, { name: '교통/범칙금', count: 100 },
  ];

  const categories = [
    { id: 1, name: "일반/기타", keywords: ["무료", "지급", "당첨", "링크", "확인", "긴급", "즉시", "클릭"] },
    { id: 2, name: "택배/배송", keywords: ["주소지", "미확인", "보관중", "재배송", "송장번호"] },
    { id: 3, name: "이벤트/경품", keywords: ["경품수령", "본인인증", "이벤트참여", "쿠폰지급"] },
    { id: 4, name: "지인 사칭", keywords: ["엄마나야", "폰고장", "문화상품권", "급전필요"] },
    { id: 5, name: "허위 결제", keywords: ["결제완료", "해외직구", "주문취소", "본인확인"] },
    { id: 6, name: "투자/코인", keywords: ["수익보장", "급등주", "리딩방", "비공개"] },
    { id: 7, name: "기관 사칭", keywords: ["검찰", "출석요구", "범죄연루", "자산보호"] },
    { id: 8, name: "금융/대출", keywords: ["저금리", "정부지원", "한도승인", "신청가능"] },
    { id: 9, name: "부고/경조사", keywords: ["부고장", "모바일청첩장", "일시장소"] },
    { id: 10, name: "교통/범칙금", keywords: ["과태료", "미납안내", "범칙금조회"] },
  ];

  const COLORS = ['#00e5cc', '#f1f5f9'];

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 md:p-12 font-sans text-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">← 돌아가기</button>
            <div>
              <h1 className="text-2xl font-black">분석 결과</h1>
              <p className="text-xs font-bold text-gray-400">스미싱 위험도 분석 대시보드</p>
            </div>
          </div>
          <div className="bg-[#00e5cc] text-black text-xs font-black px-4 py-2 rounded-lg shadow-sm">AI 분석 완료</div>
        </div>

        {/* 1. 분석된 메시지 */}
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider">분석된 메시지</p>
          <div className="bg-[#f8fafc] p-6 rounded-2xl border border-black/[0.02] italic text-gray-600 font-medium">
            "{rawText}"
          </div>
        </div>

        {/* 2. 위험도 / 위험유형 / 관련뉴스 (3컬럼) */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-[24px] shadow-sm flex flex-col items-center">
            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">위험도</p>
            <div className="relative w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskData} innerRadius={70} outerRadius={95} startAngle={225} endAngle={-45} dataKey="value" stroke="none">
                    <Cell fill="#00e5cc" cornerRadius={10} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-center">
                <p className="text-[52px] font-black leading-none">85%</p>
                <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase">높은 위험 감지</p>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">위험 유형</p>
            <div className="w-20 h-20 border-[3px] border-black rounded-[24px] flex items-center justify-center mb-6">
               <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-[32px] font-black italic">택배/배송</h3>
          </div>

          <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-[24px] shadow-sm">
            <p className="text-sm font-bold text-gray-400 mb-6 flex items-center gap-2 tracking-widest">📰 관련 뉴스</p>
            <div className="space-y-4">
              {["스미싱 피해 급증.... 국민은행 사칭", "택배 스미싱 새로운 수법 등장", "금융감독원 스미싱 예방 가이드"].map((news, i) => (
                <div key={i} className="border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50 transition-all cursor-pointer">
                  <h4 className="text-[14px] font-bold text-[#333] mb-1 leading-tight">{news}</h4>
                  <p className="text-[11px] text-gray-400">2026.01.22</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. 대시보드 - 그래프 전환 (추이/유형별) */}
        <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black flex items-center gap-2">
              {viewType === 'trend' ? '📈 최근 스미싱 검색량 추이' : '📊 스미싱 유형별 건수'}
            </h3>
            
            <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
              <button 
                onClick={() => setViewType('trend')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'trend' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                추이
              </button>
              <button 
                onClick={() => setViewType('type')}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'type' ? 'bg-[#00e5cc] text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                유형별
              </button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              {viewType === 'trend' ? (
                <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#00e5cc" strokeWidth={4} dot={{r: 5, fill: '#000', strokeWidth: 2, stroke: '#fff'}} />
                </LineChart>
              ) : (
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999', fontWeight: 600 }} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="count" fill="#00e5cc" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. 유형별 관련 키워드 */}
        <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black mb-8 flex items-center gap-2">🛡️ 유형별 관련 키워드</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`py-4 rounded-xl text-[13px] font-bold border transition-all ${selectedCat === cat.id ? 'bg-[#00e5cc] border-[#00e5cc] text-black shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
              >
                <p className="text-[9px] opacity-40 mb-1">{cat.id}</p>
                {cat.name}
              </button>
            ))}
          </div>
          <div className="bg-[#f8fafc] p-8 rounded-3xl border border-black/[0.02] relative overflow-hidden">
            <p className="text-[13px] font-black text-[#00e5cc] mb-6 uppercase tracking-widest">{categories.find(c => c.id === selectedCat).name}</p>
            <div className="flex flex-wrap gap-4">
              {categories.find(c => c.id === selectedCat).keywords.map((word, i) => (
                <span key={i} className="px-6 py-3 bg-white rounded-full text-[15px] font-bold border border-gray-100 shadow-sm text-gray-600 hover:scale-105 transition-transform cursor-default">
                  #{word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
