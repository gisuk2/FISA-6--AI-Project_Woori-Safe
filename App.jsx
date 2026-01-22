import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, Activity, RefreshCcw } from 'lucide-react';
import './App.css';

const App = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 5174 포트 대응을 위해 주소 확인 필요
      const response = await axios.get('http://localhost:8000/api/smishing-stats');
      if (response.data.status === "success") {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const timer = setTimeout(() => setIsAnimating(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="main-container">
      {/* 애니메이션 요소 */}
      {isAnimating && (
        <>
          <div className="ball ball-black"></div>
          <div className="ball ball-cyan"></div>
        </>
      )}

      <header className="header">
        <div className="logo-area">
          <div className="logo-icon"><ShieldAlert size={24} color="white" /></div>
          <span className="logo-text">Woori Safe Guard</span>
        </div>
        <button onClick={fetchStats} className="clean-button">
          <RefreshCcw size={18} className={loading ? "spin" : ""} />
          업데이트
        </button>
      </header>

      <div className="content-wrapper">
        <section className="hero-section">
          <div className={`text-group ${isAnimating ? 'liquid-absorb' : ''}`}>
            <h1 className="title-dont">DON'T</h1>
            <h1 className="title-smishing">SMISHING</h1>
          </div>

          <div className="boundary-box">
            <Activity className="pulse-icon" size={40} />
            <p className="boundary-text">메시지 분석<br/>바운더리</p>
            <div className="shimmer-line"></div>
          </div>
        </section>

        <section className="stats-section">
          <div className="chart-card">
            <h3 className="chart-title">📊 실시간 스미싱 통계</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <XAxis dataKey="smishing_type" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0E4C96' : '#00E5CC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
