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
      // 은욱님 IP와 엔드포인트 확인
      const response = await axios.post('http://192.168.0.102:8000/analyze', {
        content: message 
      }, { timeout: 10000 });
      // 은욱 가이드: response.data 안에 score, type, keywords가 있어야 함
      navigate('/result', { state: { text: message, analysisResult: response.data } });
    } catch (error) {
      console.error("서버 통신 실패:", error);
      alert("연결 실패!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#f8f9fa] font-sans">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes pulseScale { 
          0%, 100% { opacity: 0.15; transform: scale(0.9); } 
          50% { opacity: 0.45; transform: scale(1.3); } 
        }
        .animate-title { animation: float 4s ease-in-out infinite; }
        .animate-bg-pulse { animation: pulseScale 10s ease-in-out infinite; }
        .input-expand { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .input-expand:focus { transform: scale(1.03); box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
      `}</style>

      <div className="fixed top-[-5%] left-[-5%] w-[600px] h-[600px] bg-[#00e5cc] blur-[130px] rounded-full pointer-events-none animate-bg-pulse" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-black blur-[150px] rounded-full pointer-events-none animate-bg-pulse" style={{ animationDelay: '-3s' }} />

      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
          <div className="w-12 h-12 border-4 border-[#00e5cc]/20 border-t-[#00e5cc] rounded-full animate-spin mb-4"></div>
          <p className="text-[#00e5cc] font-black animate-pulse">AI 분석 중...</p>
        </div>
      )}

      <div className="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-20 px-10">
        <div className="flex-1 text-left">
          <div className="bg-black text-[#00e5cc] px-5 py-2 rounded-full text-[14px] font-bold mb-8 inline-block italic">LIVE SECURITY SERVICE</div>
          <h1 className="text-[72px] md:text-[84px] font-[900] leading-[1.1] tracking-[-0.04em] mb-4 text-[#1a1a1a]">
            <div className="animate-title">Don't <br /><span className="text-[#00e5cc]">Smishing!</span></div>
          </h1>
          <h2 className="text-[24px] font-bold text-[#333] mb-6">우리방범대와 함께하는 스미싱 피해예방</h2>
          <p className="text-[18px] text-[#666] leading-[1.6] max-w-[400px]">의심스러운 문자 메시지를 AI가 분석하여 실시간으로 위험도를 판단해드립니다.</p>
        </div>

        <div className="flex-1 w-full max-w-[500px]">
          <div className="p-10 bg-white/60 backdrop-blur-[30px] rounded-[40px] shadow-2xl border border-white">
            <textarea 
              className="input-expand w-full bg-white/50 border border-black/[0.05] outline-none p-6 rounded-[24px] text-[16px] text-[#333] h-44 resize-none mb-8"
              placeholder="의심되는 TEXT 내용을 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleAnalyze} className="w-full bg-[#00e5cc] hover:bg-[#00d1ba] text-[#1a1a1a] font-black py-5 rounded-[22px] text-[20px] transition-all active:scale-[0.95] shadow-lg shadow-cyan-400/20">분석하기 →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() { return ( <BrowserRouter><Routes><Route path="/" element={<SmishingMain />} /><Route path="/result" element={<ResultDashboard />} /></Routes></BrowserRouter> ); }