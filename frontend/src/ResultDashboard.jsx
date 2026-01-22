import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar 
} from 'recharts';

export default function ResultDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawText = location.state?.text || "분석된 메시지가 없습니다.";
  
  const [viewType, setViewType] = useState('type'); 
  const [selectedCat, setSelectedCat] = useState(1);
  
  // --- 서버에서 받아올 실제 데이터 상태(State) ---
  const [pieData, setPieData] = useState([]);      // 전체 통계
  const [barData, setBarData] = useState([]);      // 유형별 통계
  const [recentMsgs, setRecentMsgs] = useState([]); // 최신 문자 리스트
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://192.168.0.71:8000";

  // 페이지가 열릴 때 은욱님 서버에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 3개의 API를 동시에 호출
        const [resOverview, resTypes, resRecent] = await Promise.all([
          axios.get(`${BASE_URL}/stats/overview`),
          axios.get(`${BASE_URL}/stats/types`),
          axios.get(`${BASE_URL}/messages/recent`)
        ]);

        setPieData(resOverview.data); // 예: [{name: '위험', value: 85}, {name: '안전', value: 15}]
        setBarData(resTypes.data);    // 예: [{name: '택배', count: 2800}, ...]
        setRecentMsgs(resRecent.data); // 예: [{title: '...', date: '...'}, ...]
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { id: 1, name: "일반/기타", keywords: ["무료", "지급", "당첨", "링크"] },
    { id: 2, name: "택배/배송", keywords: ["주소지", "미확인", "보관중", "재배송"] },
    { id: 3, name: "이벤트/경품", keywords: ["경품수령", "본인인증", "이벤트참여"] },
    { id: 4, name: "지인 사칭", keywords: ["엄마나야", "폰고장", "급전필요"] },
    { id: 5, name: "허위 결제", keywords: ["결제완료", "해외직구", "주문취소"] },
    { id: 6, name: "투자/코인", keywords: ["수익보장", "급등주", "리딩방"] },
    { id: 7, name: "기관 사칭", keywords: ["검찰", "출석요구", "자산보호"] },
    { id: 8, name: "금융/대출", keywords: ["저금리", "정부지원", "한도승인"] },
    { id: 9, name: "부고/경조사", keywords: ["부고장", "모바일청첩장", "일시장소"] },
    { id: 10, name: "교통/범칙금", keywords: ["과태료", "미납안내", "범칙금조회"] },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">데이터 분석 중...</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 md:p-12 font-sans text-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-sm font-bold shadow-sm hover:bg-gray-50">← 돌아가기</button>
            <div>
              <h1 className="text-2xl font-black">분석 결과</h1>
              <p className="text-xs font-bold text-gray-400">실시간 서버 데이터 연동 중</p>
            </div>
          </div>
          <div className="bg-[#00e5cc] text-black text-xs font-black px-4 py-2 rounded-lg shadow-sm">LIVE</div>
        </div>

        {/* 1. 분석된 메시지 */}
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-400 mb-4 tracking-wider">분석된 메시지</p>
          <div className="bg-[#f8fafc] p-6 rounded-2xl border border-black/[0.02] italic text-gray-600 font-medium whitespace-pre-wrap">
            "{rawText}"
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 위험도 차트 (전체 통계 API 연동) */}
          <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-[24px] shadow-sm flex flex-col items-center">
            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">위험도</p>
            <div className="relative w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={70} outerRadius={95} startAngle={225} endAngle={-45} dataKey="value" stroke="none">
                    <Cell fill="#00e5cc" cornerRadius={10} />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] text-center">
                <p className="text-[52px] font-black leading-none">{pieData[0]?.value || 0}%</p>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">위험 유형</p>
            <div className="w-20 h-20 border-[3px] border-black rounded-[24px] flex items-center justify-center mb-6 text-4xl">⚠️</div>
            <h3 className="text-[32px] font-black italic">분석 완료</h3>
          </div>

          {/* 최신 문자 리스트 API 연동 */}
          <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-[24px] shadow-sm">
            <p className="text-sm font-bold text-gray-400 mb-6 flex items-center gap-2 tracking-widest">📰 최신 분석 리스트</p>
            <div className="space-y-4">
              {recentMsgs.map((msg, i) => (
                <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                  <h4 className="text-[14px] font-bold text-[#333] mb-1 truncate">{msg.title || msg.content}</h4>
                  <p className="text-[11px] text-gray-400">{msg.date || "방금 전"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 유형별 통계 차트 API 연동 */}
        <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black">📊 스미싱 통계 대시보드</h3>
            <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
              <button onClick={() => setViewType('type')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewType === 'type' ? 'bg-[#00e5cc] text-black shadow-sm' : 'text-gray-400'}`}>유형별</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="count" fill="#00e5cc" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 하단 키워드 리포트 */}
        <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-black mb-8">🛡️ 유형별 관련 키워드</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`py-4 rounded-xl text-[13px] font-bold border transition-all ${selectedCat === cat.id ? 'bg-[#00e5cc] border-[#00e5cc] text-black shadow-md' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                {cat.name}
              </button>
            ))}
          </div>
          <div className="bg-[#f8fafc] p-8 rounded-3xl border border-black/[0.02]">
            <p className="text-[13px] font-black text-[#00e5cc] mb-6 uppercase tracking-widest">{categories.find(c => c.id === selectedCat).name}</p>
            <div className="flex flex-wrap gap-4">
              {categories.find(c => c.id === selectedCat).keywords.map((word, i) => (
                <span key={i} className="px-6 py-3 bg-white rounded-full text-[15px] font-bold border border-gray-100 shadow-sm text-gray-600">#{word}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}