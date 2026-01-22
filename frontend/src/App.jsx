import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ResultDashboard from './ResultDashboard'; // 방금 만든 2페이지 파일

// --- [Page 1] 메인 분석 페이지 컴포넌트 ---
function SmishingMain() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!message.trim()) {
      alert("분석할 문자 내용을 입력해주세요!");
      return;
    }
    // 2페이지(ResultDashboard)로 이동하면서 사용자가 입력한 메시지를 전달합니다.
    navigate('/result', { state: { text: message } });
  };

return (
    <div className="animated-gradient-bg min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans px-[5%] md:px-[10%]">
      {/* 배경 애니메이션 볼 */}
      <div className="ball ball-black !fixed !top-[20%] !left-[10%] opacity-20 blur-[100px]" />
      <div className="ball ball-cyan !fixed !bottom-[15%] !right-[10%] opacity-30 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-20">
        
        {/* 좌측 콘텐츠 */}
        <div className="flex-1 flex flex-col items-start text-left">
          <div className="bg-black text-[#00e5cc] px-5 py-2 rounded-full text-[14px] font-bold mb-8">
            스미싱 피해예방 서비스
          </div>
          <h1 className="text-[72px] md:text-[84px] font-[900] leading-[1.1] tracking-[-0.04em] mb-4 text-[#1a1a1a]">
            Don't <br />
            <span className="text-[#00e5cc] neon-text">Smishing!</span>
          </h1>
          <h2 className="text-[24px] font-bold text-[#333] mb-6">신은욱과 함께하는 스미싱 피해예방</h2>
          <p className="text-[18px] text-[#666] leading-[1.6] mb-12 max-w-[400px]">
            의심스러운 문자 메시지를 AI가 분석하여 실시간으로 위험도를 판단해드립니다.
          </p>
        </div>

        {/* 우측 입력 폼 카드 */}
        <div className="flex-1 w-full max-w-[500px]">
          <div className="minimal-card p-10 bg-white/60 backdrop-blur-[30px] rounded-[40px] shadow-2xl shadow-black/5 border border-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#0a1b2e] rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00e5cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#1a1a1a]">문자 메시지 분석</h3>
                <p className="text-[14px] text-[#999]">의심스러운 문자를 입력하세요</p>
              </div>
            </div>

            {/* 실제 텍스트 입력창 (textarea) */}
            <div className="bg-[#f4f6f8] rounded-[24px] p-6 mb-8 border border-black/[0.03]">
              <textarea 
                className="w-full bg-transparent border-none outline-none text-[16px] text-[#333] placeholder-[#bbb] resize-none h-[150px]"
                placeholder={`예시:\n[Web발신]\n고객님의 택배가 주소 불명으로 보관중입니다.\n확인: https://example.com`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button 
              onClick={handleAnalyze}
              className="w-full bg-[#00e5cc] hover:bg-[#00d1ba] text-black font-black py-5 rounded-[20px] text-[18px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-cyan-400/20"
            >
              분석하기 <span className="text-[22px]">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- [Main App] 라우터 설정 ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로(/)는 1페이지(입력창)를 보여줍니다. */}
        <Route path="/" element={<SmishingMain />} />
        {/* 결과 경로(/result)는 2페이지(대시보드)를 보여줍니다. */}
        <Route path="/result" element={<ResultDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}