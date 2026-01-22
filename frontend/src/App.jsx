import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ResultDashboard from './ResultDashboard';

function SmishingMain() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!message.trim()) {
      alert("분석할 문자 내용을 입력해주세요!");
      return;
    }

    setLoading(true);
    try {
      // 1. 입력 텍스트를 JSON 형식으로 은욱님 서버에 전송
      const response = await axios.post('http://192.168.0.71:8000/analyze', {
        text: message 
      });
      
      // 2. 서버 응답(JSON) 결과를 가지고 대시보드로 이동
      navigate('/result', { 
        state: { 
          text: message, 
          analysisResult: response.data 
        } 
      });
    } catch (error) {
      console.error("서버 통신 에러:", error);
      alert("서버 연결에 실패했습니다. 서버가 켜져 있는지 확인하세요!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-gradient-bg min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans px-[5%]">
      <div className="ball ball-black !fixed !top-[20%] !left-[10%] opacity-20 blur-[100px]" />
      <div className="ball ball-cyan !fixed !bottom-[15%] !right-[10%] opacity-30 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-20">
        <div className="flex-1 text-left">
          <div className="bg-black text-[#00e5cc] px-5 py-2 rounded-full text-[14px] font-bold inline-block mb-8">스미싱 피해예방 서비스</div>
          <h1 className="text-[72px] md:text-[84px] font-[900] leading-[1.1] tracking-[-0.04em] mb-4 text-[#1a1a1a]">Don't <br /><span className="text-[#00e5cc] neon-text">Smishing!</span></h1>
          <h2 className="text-[24px] font-bold text-[#333] mb-6">신은욱과 함께하는 스미싱 피해예방</h2>
        </div>

        <div className="flex-1 w-full max-w-[500px]">
          <div className="minimal-card p-10 bg-white/60 backdrop-blur-[30px] rounded-[40px] shadow-2xl border border-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#0a1b2e] rounded-2xl flex items-center justify-center text-[#00e5cc] font-bold">Q</div>
              <div>
                <h3 className="text-[20px] font-bold text-[#1a1a1a]">문자 메시지 분석</h3>
                <p className="text-[14px] text-[#999]">의심스러운 문자를 입력하세요</p>
              </div>
            </div>
            <div className="bg-[#f4f6f8] rounded-[24px] p-6 mb-8 border border-black/[0.03]">
              <textarea 
                className="w-full bg-transparent border-none outline-none text-[16px] h-[150px] resize-none"
                placeholder="내용을 입력하세요..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#00e5cc] hover:bg-[#00d1ba]'} text-black font-black py-5 rounded-[20px] text-[18px] transition-all active:scale-[0.98] shadow-lg shadow-cyan-400/20`}
            >
              {loading ? 'AI 분석 중...' : '분석하기 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmishingMain />} />
        <Route path="/result" element={<ResultDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}