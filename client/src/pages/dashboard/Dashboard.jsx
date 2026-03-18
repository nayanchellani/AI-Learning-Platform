import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get('/api/auth/profile');
        setProfileData(profileRes.data);
        const trendingRes = await axios.get('/api/videos/trending');
        setTrendingVideos(trendingRes.data.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bento-loading-container">
        <div className="bento-spinner"></div>
      </div>
    );
  }

  const data = profileData || user || {};
  const progress = data.progress || {};
  const videosWatched = progress.videosWatched || [];
  const quizzesCompleted = progress.quizzesCompleted || [];
  const streak = progress.streak?.current || 0;
  const codingTimeMin = progress.codingTime || 0;
  
  const skillLevel = data.skillLevel || 'beginner';
  const skillCapitalized = skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);

  // Time calculations
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const videosThisWeek = videosWatched.filter(v => new Date(v.watchedAt) >= oneWeekAgo).length;
  
  const videosToday = videosWatched.filter(v => new Date(v.watchedAt).toDateString() === new Date().toDateString()).length;
  const quizzesToday = quizzesCompleted.filter(q => new Date(q.completedAt).toDateString() === new Date().toDateString()).length;
  const dailyGoalProgress = Math.min(3, videosToday + quizzesToday);

  let avgScore = 0;
  if (quizzesCompleted.length > 0) {
    const totalPercentage = quizzesCompleted.reduce((acc, q) => acc + (q.totalQuestions ? (q.score / q.totalQuestions) * 100 : 0), 0);
    avgScore = Math.round(totalPercentage / quizzesCompleted.length);
  }

  const recentVideosMap = new Map();
  [...videosWatched].sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)).forEach(vid => {
    if (!recentVideosMap.has(vid.videoId)) recentVideosMap.set(vid.videoId, vid);
  });
  const recentVideos = Array.from(recentVideosMap.values());

  const recentQuizzes = [...quizzesCompleted]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 3);

  // Formatting coding time
  const codingHours = Math.floor(codingTimeMin / 60);
  const codingMins = codingTimeMin % 60;

  return (
    <div className="dashboard-page">
      
      {/* Welcome & Streak Header Based on Screenshot Reference */}
      <div className="dash-welcome-row">
        <div className="welcome-text">
          <h1>Welcome back, {data.username || 'Learner'}!</h1>
          <p>Here's your learning progress and achievements</p>
        </div>
        <div className="welcome-streak-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>
          <div className="streak-info">
            <span className="streak-num">{streak}</span>
            <span className="streak-lbl">Day Streak</span>
          </div>
        </div>
      </div>

      <div className="bento-grid">
        
        <div className="bento-card bento-hero">
          <div className="hero-content">
            <span className="hero-label">Continue Learning</span>
            <h1 className="hero-title">React Hooks Roadmap</h1>
            <div className="hero-meta">
              <span className="hero-meta-item">Progress: 65%</span>
              <span className="hero-meta-dot">&bull;</span>
              <span className="hero-meta-item">Last: useEffect</span>
            </div>
          </div>
          <button className="bento-btn-primary" onClick={() => navigate('/roadmaps')}>
            Resume Learning &rarr;
          </button>
        </div>

        {/* 4 Stat Cards Array (Videos, Quizzes, Coding, Roadmaps) */}
        <div className="bento-card bento-stat">
          <div className="stat-top-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </div>
          <div className="stat-main">
            <span className="stat-val">{videosWatched.length}</span>
            <span className="stat-lbl">Videos Watched</span>
          </div>
          <span className="stat-sub">+ {videosThisWeek} this week</span>
        </div>

        <div className="bento-card bento-stat">
          <div className="stat-top-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="stat-main">
            <span className="stat-val">{quizzesCompleted.length}</span>
            <span className="stat-lbl">Quizzes Completed</span>
          </div>
          <span className="stat-sub">{avgScore}% avg score</span>
        </div>

        <div className="bento-card bento-stat">
          <div className="stat-top-row">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          </div>
          <div className="stat-main">
            <span className="stat-val">{codingHours > 0 ? `${codingHours}h ${codingMins}m` : `${codingMins}m`}</span>
            <span className="stat-lbl">Coding Time</span>
          </div>
          <span className="stat-sub">+ 0m this week</span>
        </div>

        <div className="bento-card bento-stat">
          <div className="stat-top-row">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
          </div>
          <div className="stat-main">
            <span className="stat-val">0</span>
            <span className="stat-lbl">Active Roadmaps</span>
          </div>
          <span className="stat-sub">0% avg progress</span>
        </div>

        {/* Existing Layout Continuing */}
        <div className="bento-card bento-medium progress-split">
          <div className="split-header">
            <h2>Your Learning Progress</h2>
            <span className="skill-badge">{skillCapitalized} Level</span>
          </div>
          <div className="progress-content">
            <div className="bar-wrapper">
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: '65%' }}></div>
              </div>
              <span className="bar-text">65%</span>
            </div>
            <p className="progress-next-text">Next: Finish React Basics</p>
          </div>
        </div>

        <div className="bento-card bento-medium daily-goal-split">
          <h2>Daily Goal</h2>
          <div className="goal-list">
            <div className="goal-item">
              <span className={`goal-check ${videosToday >= 2 ? 'done' : ''}`}></span>
              <span>Watch 2 videos</span>
            </div>
            <div className="goal-item">
              <span className={`goal-check ${quizzesToday >= 1 ? 'done' : ''}`}></span>
              <span>Take 1 quiz</span>
            </div>
          </div>
          <div className="goal-footer">
            <span className="goal-progress-text">Progress: {dailyGoalProgress}/3</span>
            {dailyGoalProgress === 3 && <span className="goal-complete">Completed! 🎉</span>}
          </div>
        </div>

        <div className="bento-card bento-wide watching-bento">
          <div className="watching-header">
            <h2>Continue Watching</h2>
            {streak > 0 && <span className="streak-motivation">🔥 You're on a {streak}-day streak! Keep going!</span>}
          </div>
          {recentVideos.length > 0 ? (
            <div className="watching-scroller">
              {recentVideos.map((vid, idx) => (
                <div className="watch-card" key={idx} onClick={() => navigate(`/tutorial/${vid.videoId}`)}>
                  <div className="watch-thumb">
                    <img src={`https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`} alt="thumb" />
                    <div className="watch-red-bar">
                      <div className="watch-red-fill" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}></div>
                    </div>
                  </div>
                  <div className="watch-info">
                    <h3 className="watch-title">{vid.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bento-empty-state">
              <p>Start learning to see progress here &rarr;</p>
              <button onClick={() => navigate('/youtube')}>Find Tutorials</button>
            </div>
          )}
        </div>

        <div className="bento-card bento-medium flex-col">
          <div className="quiz-header-row">
            <h2>Recent Quiz Results</h2>
            {recentQuizzes.length > 0 && <span className="resume-quiz-link" onClick={() => navigate('/youtube')}>Resume Quiz &rarr;</span>}
          </div>
          {recentQuizzes.length > 0 ? (
            <div className="bento-quiz-list">
              {recentQuizzes.map((q, idx) => (
                <div className="bento-quiz-item" key={idx}>
                  <span className="quiz-name">{q.topic || 'Random Quiz'}</span>
                  <span className="quiz-score">{q.score}/{q.totalQuestions}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bento-empty-state small">
              <p>Start learning to see progress here &rarr;</p>
            </div>
          )}
        </div>

        <div className="bento-card bento-medium flex-col">
          <h2>Recommended For You</h2>
          {trendingVideos.length > 0 ? (
            <div className="bento-rec-list">
              {trendingVideos.map((vid, idx) => (
                <div className="bento-rec-item" key={idx} onClick={() => navigate(`/tutorial/${vid.videoId}`)}>
                  <div className="rec-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <span className="rec-title">{vid.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bento-empty-state small">
              <p>Start learning to see recommendations &rarr;</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
