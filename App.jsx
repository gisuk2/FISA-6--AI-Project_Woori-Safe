import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, Activity, Database, RefreshCcw } from 'lucide-react';
import './App.css';

const App = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 1. 백엔드(server.py)에서 데이터 가져오기
  const fetchStats = async () => {
    setLoading(true);
    setIsAnimating(true); // 애니메이션 시작
    try {
      const response = await axios.get('http://localhost:8000/api/smishing-stats');
      if (response.data.status === "success") {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
      // 애니메이션을 잠시 보여주기 위해 2초 후 해제
      setTimeout(() => setIsAnimating(false), 2000);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="glass-bg min-h-screen p-8 font-pretendard">
      {/* 애니메이션 공 요소 (CSS에서 정의한 클래스 사용) */}
      {isAnimating && (
        <>
          <div className="ball ball-black"></div>
          <div className="ball ball-cyan"></div>
        </>
      )}

      {/* 상단 헤더 영역 */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-woori-blue rounded-full flex items-center justify-center">
            <ShieldAlert className="text-white" />
          </div>
          <span className="text-xl font-bold text-woori-blue">Woori Smishing Guard</span>
        </div>
        <button onClick={fetchStats} className="clean-button flex items-center gap-2">
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          최신 데이터 갱신
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* 요청하신 메인 텍스트 및 바운더리 영역 */}
        <section className="relative h-[400px] flex items-center justify-between mb-20">
          <div className={`transition-all duration-500 ${isAnimating ? 'liquid-absorb' : ''}`}>
            <h1 className="text-8xl font-black leading-tight tracking-tighter text-black">DON'T</h1>
            <h1 className="text-8xl font-black leading-tight tracking-tighter neon-text">SMISHING</h1>
          </div>

          {/* 오른쪽 바운더리 박스 (부딪히는 지점) */}
          <div className="w-64 h-80 minimal-card flex flex-col items-center justify-center p-6 border-2 border-dashed border-woori-blue">
            <Activity className="text-woori-blue mb-4 animate-pulse" size={48} />
            <p className="text-center font-bold text-woori-blue leading-relaxed">
              실시간 문자 메시지<br />이상 징후 분석 바운더리
            </p>
            <div className="mt-6 w-full h-1 bg-woori-light-blue overflow-hidden">
              <div className="h-full bg-woori-blue animate-shimmer"></div>
            </div>
          </div>
        </section>

        {/* 데이터 시각화 영역 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 minimal-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Database size={20} /> 유형별 스미싱 통계
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <XAxis dataKey="smishing_type" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0E4C96' : '#00E5CC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="minimal-card p-8 flex flex-col justify-center items-center gray-section">
            <p className="text-gray-500 font-medium mb-2">총 분석 데이터</p>
            <h2 className="text-5xl font-black text-woori-blue">
              {stats.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
            </h2>
            <p className="mt-4 text-sm text-center text-gray-400">
              TiDB 클라우드 데이터베이스에서<br />실시간으로 집계된 수치입니다.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
