import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollerRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('learnflow_custom_goals');
    if (saved) return JSON.parse(saved);
    return [{ text: "Watch 2 tutorial videos", done: false }, { text: "Take 1 coding quiz", done: false }];
  });

  useEffect(() => {
    localStorage.setItem('learnflow_custom_goals', JSON.stringify(goals));
  }, [goals]);

  const toggleGoal = (index) => {
    const newGoals = [...goals];
    newGoals[index].done = !newGoals[index].done;
    setGoals(newGoals);
  };

  const updateGoalText = (index, text) => {
    const newGoals = [...goals];
    newGoals[index].text = text;
    setGoals(newGoals);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get('/api/auth/profile');
        setProfileData(profileRes.data);
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
  const codingTimeTotal = (typeof progress.codingTime === 'object' ? progress.codingTime?.total : progress.codingTime) || 0;
  const codeReviews = progress.codeReviews || [];

  let avgCodeScore = 0;
  if (codeReviews.length > 0) {
    avgCodeScore = Math.round(codeReviews.reduce((acc, r) => acc + (r.score || 0), 0) / codeReviews.length);
  }

  const skillLevel = data.skillLevel || 'beginner';
  const skillCapitalized = skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const videosThisWeek = videosWatched.filter(v => new Date(v.watchedAt) >= oneWeekAgo).length;

  const videosToday = videosWatched.filter(v => new Date(v.watchedAt).toDateString() === new Date().toDateString()).length;
  const quizzesToday = quizzesCompleted.filter(q => new Date(q.completedAt).toDateString() === new Date().toDateString()).length;

  const dailyGoalProgress = goals.filter(g => g.done).length;

  let avgScore = 0;
  let scoreText = '0%';
  if (quizzesCompleted.length > 0) {
    const totalPercentage = quizzesCompleted.reduce((acc, q) => acc + (q.totalQuestions ? (q.score / q.totalQuestions) * 100 : 0), 0);
    avgScore = Math.round(totalPercentage / quizzesCompleted.length);
    scoreText = `${avgScore}%`;
  }

  const recentVideosMap = new Map();
  [...videosWatched].sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)).forEach(vid => {
    if (!recentVideosMap.has(vid.videoId)) recentVideosMap.set(vid.videoId, vid);
  });
  const recentVideos = Array.from(recentVideosMap.values());

  const codingHours = Math.floor(codingTimeTotal / 60);
  const codingMins = codingTimeTotal % 60;
  const codingDisplay = codingTimeTotal === 0 ? '0h' : codingHours > 0 ? `${codingHours}h ${codingMins}m` : `${codingMins}m`;

  const isNewUser = videosWatched.length === 0 && quizzesCompleted.length === 0;
  let heroTitle = 'Python for Beginners - Master Coding with Python in 1 Hour';
  let heroSubtitle = `Last watched • ${new Date().toLocaleDateString()}`;
  let heroVideo = recentVideos.length > 0 ? recentVideos[0] : null;

  if (isNewUser) {
    heroTitle = 'Start Your Coding Journey by Searching for a Tutorial';
    heroSubtitle = 'Explore the tutorials tab';
  } else if (heroVideo) {
    heroTitle = heroVideo.title;
    heroSubtitle = `Last watched • ${new Date(heroVideo.watchedAt).toLocaleDateString()}`;
  }

  const totalActivities = videosWatched.length + quizzesCompleted.length;
  const progressPercent = Math.min(100, Math.round((totalActivities / 50) * 100));

  const handleResume = () => {
    if (isNewUser || !heroVideo) {
      navigate('/youtube');
    } else {
      navigate(`/tutorial/${heroVideo.videoId}`, { state: { video: heroVideo } });
    }
  };

  let heroProgressValue = 0;
  let timeRemaining = '0m';
  let moduleText = 'No videos yet';

  if (heroVideo) {
    heroProgressValue = heroVideo.completed ? 100 : 0;
    const durSeconds = heroVideo.duration || 0;
    const remainingSeconds = heroVideo.completed ? 0 : durSeconds;
    const remainingMins = Math.floor(remainingSeconds / 60);
    const remainingHours = Math.floor(remainingMins / 60);
    const finalMins = remainingMins % 60;
    
    timeRemaining = remainingMins === 0 ? '0m' : remainingHours > 0 ? `${remainingHours}h ${finalMins}m` : `${finalMins}m`;
    moduleText = heroVideo.completed ? 'Tutorial Completed' : 'Current Tutorial';
  }
  const doughnutData = {
    datasets: [{
      data: [heroProgressValue, 100 - heroProgressValue],
      backgroundColor: ['#FFC000', 'rgba(255,255,255,0.08)'],
      borderWidth: 0,
      cutout: '75%',
    }]
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { enabled: false }, legend: { display: false } }
  };

  const scrollLeft = () => {
    if (scrollerRef.current) scrollerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollerRef.current) scrollerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-page">

      <div className="dash-welcome-row">
        <div className="welcome-text">
          <h1>Welcome back, {data.username || 'Learner'}!</h1>
        </div>
      </div>

      <div className="bento-grid">
        
        <div className="bento-col bento-col-left">
          
          <div className="bento-card progress-card">
            <h3>Your Progress</h3>
            <div className="level-badge-box">
              <div className="level-text">
                <div className="level-name">{skillCapitalized} LEVEL</div>
                <div className="level-sub">Current Status</div>
              </div>
            </div>
            
            <div className="progress-content">
              <div className="bar-wrapper">
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="bar-text">{progressPercent}%</span>
              </div>
              <p className="progress-next-text">Next: Complete {isNewUser ? '10 activities' : '50 activities'}</p>
            </div>
          </div>

          <div className="bento-card goal-card">
            <h3>Daily Goal</h3>
            <div className="goal-list">
              {goals.map((goal, idx) => (
                <div className="goal-item" key={idx}>
                  <span className={`goal-check ${goal.done ? 'done' : ''} clickable`} onClick={() => toggleGoal(idx)}></span>
                  <input type="text" className={`goal-input ${goal.done ? 'goal-done-text' : ''}`} value={goal.text} onChange={(e) => updateGoalText(idx, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="goal-footer">
              <span className="goal-progress-text">Goal tracker: {dailyGoalProgress}/{goals.length}</span>
            </div>
          </div>
        </div>


        <div className="bento-col bento-col-center">
          
          <div className="bento-card hero-card">
            <div className="hero-thumb">
              {heroVideo ? (
                <img src={`https://img.youtube.com/vi/${heroVideo.videoId}/maxresdefault.jpg`} onError={(e) => e.target.src = `https://img.youtube.com/vi/${heroVideo.videoId}/hqdefault.jpg`} alt="Course Thumbnail" />
              ) : (
                <div className="hero-thumb-placeholder">Search for tutorials to see them here</div>
              )}
            </div>
            <h1 className="hero-title">{heroTitle}</h1>
            <div className="hero-meta">{heroSubtitle}</div>
            
            <div className="hero-action-row">
              <div className="hero-stats-row">
                <div style={{ width: '45px', height: '45px', position: 'relative' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>
                    {heroProgressValue}%
                  </div>
                </div>
                <div className="hero-time-left">
                <span style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600'}}>{moduleText}</span>
                  <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>{timeRemaining} left</span>
                </div>
              </div>

              <button className="bento-btn-primary" onClick={handleResume}>
                {isNewUser ? 'Find Tutorials' : 'Resume Learning'} &rarr;
              </button>
            </div>
          </div>
        </div>


        <div className="bento-col bento-col-right">
          
          <div className="snapshot-row">
            <div className="bento-card bento-stat">
              <div className="stat-top-right">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              </div>
              <div className="stat-main">
                <span className="stat-val">{codeReviews.length}</span>
                <span className="stat-lbl">Code Reviews</span>
              </div>
              <span className="stat-sub" style={{color: 'var(--accent-gold)'}}>{avgCodeScore > 0 ? `${avgCodeScore}/10 avg` : 'No reviews yet'}</span>
            </div>

            <div className="bento-card bento-stat">
              <div className="stat-top-right">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              </div>
              <div className="stat-main">
                <span className="stat-val">{streak}</span>
                <span className="stat-lbl">Day Streak</span>
              </div>
              <span className="stat-sub" style={{color: 'var(--accent-gold)'}}>{streak > 0 ? 'Keep going!' : 'Start today!'}</span>
            </div>
          </div>
          
          <div className="bento-card summary-card">
            <div className="summary-col">
              <div className="summary-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <div className="summary-val">{videosWatched.length}</div>
              <div className="summary-lbl">Videos<br/>Watched</div>
              <div className="summary-sub" style={{color: '#10b981'}}>+{videosThisWeek} this week</div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-col">
               <div className="summary-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div className="summary-val">{quizzesCompleted.length}</div>
              <div className="summary-lbl">Quizzes<br/>Completed</div>
              <div className="summary-sub" style={{color: 'var(--accent-gold)'}}>{scoreText} avg score</div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-col">
               <div className="summary-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
              </div>
              <div className="summary-val">{scoreText}</div>
              <div className="summary-lbl">Avg Score</div>
              <div className="summary-sub">&nbsp;</div>
            </div>
          </div>
        </div>

        <div className="bento-wide watching-bento">
          <div className="watching-header">
            <h2>Continue Watching</h2>
            {recentVideos.length > 0 && (
              <div className="watching-controls">
                <button className="scroll-arrow" onClick={scrollLeft}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button className="scroll-arrow" onClick={scrollRight}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>
          {recentVideos.length > 0 ? (
            <div className="watching-scroller" ref={scrollerRef}>
              {recentVideos.map((vid, idx) => (
                <div className="watch-card" key={idx} onClick={() => navigate(`/tutorial/${vid.videoId}`, { state: { video: vid } })}>
                  <div className="watch-thumb">
                    <img src={`https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`} alt="thumb" />
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
              <button className="bento-btn-primary" onClick={() => navigate('/youtube')}>Find Tutorials</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
