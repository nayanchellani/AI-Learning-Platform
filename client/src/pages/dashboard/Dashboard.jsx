import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [goalChecks, setGoalChecks] = useState({ videos: false, quiz: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get('/api/auth/profile');
        setProfileData(profileRes.data);

        const pd = profileRes.data;
        const watched = pd?.progress?.videosWatched || [];
        let recQuery = 'programming tutorial for beginners';

        if (watched.length > 0) {
          const sorted = [...watched].sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
          const lastTitle = sorted[0]?.title || '';
          const words = lastTitle.split(' ').filter(w => w.length > 3).slice(0, 3);
          if (words.length > 0) recQuery = words.join(' ') + ' tutorial';
        }

        const recRes = await axios.get(`/api/videos/search?q=${encodeURIComponent(recQuery)}`);
        setRecommendedVideos((recRes.data || []).slice(0, 4));
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

  const skillLevel = data.skillLevel || 'beginner';
  const skillCapitalized = skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const videosThisWeek = videosWatched.filter(v => new Date(v.watchedAt) >= oneWeekAgo).length;

  const videosToday = videosWatched.filter(v => new Date(v.watchedAt).toDateString() === new Date().toDateString()).length;
  const quizzesToday = quizzesCompleted.filter(q => new Date(q.completedAt).toDateString() === new Date().toDateString()).length;

  const goalVideosDone = goalChecks.videos || videosToday >= 2;
  const goalQuizDone = goalChecks.quiz || quizzesToday >= 1;
  const dailyGoalProgress = (goalVideosDone ? 2 : 0) + (goalQuizDone ? 1 : 0);

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

  const codingHours = Math.floor(codingTimeTotal / 60);
  const codingMins = codingTimeTotal % 60;
  const codingDisplay = codingTimeTotal === 0 ? '0h' : codingHours > 0 ? `${codingHours}h ${codingMins}m` : `${codingMins}m`;

  const isNewUser = videosWatched.length === 0 && quizzesCompleted.length === 0;
  let heroTitle = 'Start Your Coding Journey';
  let heroSubtitle = 'Python or Java? Maybe JavaScript? Or C++?';
  let heroLabel = 'Get Started';
  let heroNav = '/youtube';

  if (!isNewUser && recentVideos.length > 0) {
    heroTitle = recentVideos[0].title || 'Continue Learning';
    heroSubtitle = `Last watched • ${new Date(recentVideos[0].watchedAt).toLocaleDateString()}`;
    heroLabel = 'Continue Learning';
    heroNav = `/tutorial/${recentVideos[0].videoId}`;
  }

  const totalActivities = videosWatched.length + quizzesCompleted.length;
  const progressPercent = Math.min(100, Math.round((totalActivities / 50) * 100));

  return (
    <div className="dashboard-page">

      <div className="dash-welcome-row">
        <div className="welcome-text">
          <h1>Welcome back, {data.username || 'Learner'}!</h1>
          <p>Here's your learning progress and achievements</p>
        </div>
      </div>

      <div className="bento-grid">

        <div className="bento-card bento-hero">
          <div className="hero-content">
            <span className="hero-label">{heroLabel}</span>
            <h1 className="hero-title">{heroTitle}</h1>
            <div className="hero-meta">
              <span className="hero-meta-item">{heroSubtitle}</span>
            </div>
          </div>
          <button className="bento-btn-primary" onClick={() => navigate(heroNav)}>
            {isNewUser ? 'Explore Tutorials' : 'Resume Learning'} &rarr;
          </button>
        </div>

        <div className="bento-card bento-stat">
          <div className="stat-top-row">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </div>
          <div className="stat-main">
            <span className="stat-val">{videosWatched.length}</span>
            <span className="stat-lbl">Videos Watched</span>
          </div>
          <span className="stat-sub">+{videosThisWeek} this week</span>
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
            <span className="stat-val">{codingDisplay}</span>
            <span className="stat-lbl">Coding Time</span>
          </div>
          <span className="stat-sub">+0m this week</span>
        </div>

        <div className="bento-card bento-stat streak-stat">
          <div className="stat-top-row fire">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>
          </div>
          <div className="stat-main">
            <span className="stat-val fire">{streak} Days</span>
            <span className="stat-lbl">Streak</span>
          </div>
          <span className="stat-sub">{streak > 0 ? 'Keep going!' : 'Start today!'}</span>
        </div>

        <div className="bento-card bento-medium progress-split">
          <div className="split-header">
            <h2>Your Learning Progress</h2>
            <span className="skill-badge">{skillCapitalized} Level</span>
          </div>
          <div className="progress-content">
            <div className="bar-wrapper">
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="bar-text">{progressPercent}%</span>
            </div>
            <p className="progress-next-text">{totalActivities < 10 ? 'Next: Complete 10 activities' : totalActivities < 25 ? 'Next: Reach 25 activities' : 'Next: Master 50 activities'}</p>
          </div>
        </div>

        <div className="bento-card bento-medium daily-goal-split">
          <h2>Daily Goal</h2>
          <div className="goal-list">
            <div className="goal-item clickable" onClick={() => !goalVideosDone && setGoalChecks(prev => ({ ...prev, videos: !prev.videos }))}>
              <span className={`goal-check ${goalVideosDone ? 'done' : ''}`}></span>
              <span className={goalVideosDone ? 'goal-done-text' : ''}>Watch 2 videos</span>
            </div>
            <div className="goal-item clickable" onClick={() => !goalQuizDone && setGoalChecks(prev => ({ ...prev, quiz: !prev.quiz }))}>
              <span className={`goal-check ${goalQuizDone ? 'done' : ''}`}></span>
              <span className={goalQuizDone ? 'goal-done-text' : ''}>Take 1 quiz</span>
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
                      <div className="watch-red-fill" style={{ width: `${vid.completed ? 100 : Math.floor(Math.random() * 60) + 20}%` }}></div>
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
            {recentQuizzes.length > 0 && <span className="resume-quiz-link" onClick={() => navigate('/youtube')}>Take Quiz &rarr;</span>}
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
              <p>Take your first quiz to track results &rarr;</p>
              <button onClick={() => navigate('/youtube')}>Find Tutorials</button>
            </div>
          )}
        </div>

        <div className="bento-card bento-medium flex-col">
          <h2>Recommended For You</h2>
          {recommendedVideos.length > 0 ? (
            <div className="bento-rec-list">
              {recommendedVideos.map((vid, idx) => (
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
              <p>Watch tutorials to get personalized recommendations &rarr;</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
