import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/auth/profile');
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdatePicture = () => {
    toast("Picture upload map pending backend support");
  };

  const handleLogout = async () => {
    toast.success("Logged out successfully");
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="profile-page loading">
        <div className="profile-skeleton-card"></div>
      </div>
    );
  }

  const data = profileData || user || {};
  const progress = data.progress || {};
  
  // 1. Header Stats
  const videosWatched = progress.videosWatched || [];
  const quizzesCompleted = progress.quizzesCompleted || [];
  
  let avgScore = 0;
  if (quizzesCompleted.length > 0) {
    const totalPercentage = quizzesCompleted.reduce((acc, q) => {
      return acc + (q.totalQuestions ? (q.score / q.totalQuestions) * 100 : 0);
    }, 0);
    avgScore = Math.round(totalPercentage / quizzesCompleted.length);
  }

  // 2. Learning Progress
  const currentStreak = progress.streak?.current || 0;
  const totalActivity = quizzesCompleted.length + videosWatched.length;
  // Let's say every milestone is 10 activities for the progress bar
  const journeyProgress = totalActivity === 0 ? 0 : Math.min(100, Math.round((totalActivity % 10) * 10));
  
  // 3. Recent Activity (Last 3 videos)
  const recentVideos = [...videosWatched]
    .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
    .slice(0, 3);

  // 4. Quiz Performance (Last 3 quizzes)
  const recentQuizzes = [...quizzesCompleted]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 3);

  // 5. Recommended Next Step
  // If they watched a video recently but didn't take a quiz -> recommend quiz
  // Otherwise -> Next video in path

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        {/* 1. Profile Header */}
        <div className="profile-section header-card">
          <div className="header-top">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-neutral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <button className="update-pic-btn" onClick={handleUpdatePicture} title="Update Picture">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </button>
            </div>
            <div className="header-info">
              <h1 className="profile-name">{data.username}</h1>
              <p className="profile-title">{data.skillLevel === "beginner" ? "Aspiring Learner" : "Full Stack Learner"}</p>
            </div>
          </div>
          
          <div className="header-stats-row">
            <div className="header-stat">
              <span className="stat-value">{videosWatched.length}</span>
              <span className="stat-label">Videos Watched</span>
            </div>
            <div className="header-stat divider"></div>
            <div className="header-stat">
              <span className="stat-value">{quizzesCompleted.length}</span>
              <span className="stat-label">Quizzes Taken</span>
            </div>
            <div className="header-stat divider"></div>
            <div className="header-stat">
              <span className="stat-value">{avgScore}%</span>
              <span className="stat-label">Avg Score</span>
            </div>
          </div>
        </div>

        {/* 2. Learning Progress */}
        <div className="profile-section progress-card">
          <div className="progress-header">
            <div className="progress-text">
              <h2 className="section-title">Your Progress</h2>
              <p className="progress-subtitle">You're {journeyProgress}% through your next milestone</p>
            </div>
            <div className="streak-badge">
              <span className="streak-fire">🔥</span>
              <span className="streak-count">{currentStreak} day streak</span>
            </div>
          </div>
          <div className="journey-bar-bg">
            <div className="journey-bar-fill" style={{ width: `${journeyProgress}%` }}></div>
          </div>
        </div>

        {/* 5. Recommended Next Step */}
        <div className="profile-section recommend-card">
          <div className="recommend-content">
            <span className="recommend-label">Recommended Next:</span>
            <h3 className="recommend-title">Continue React Roadmap</h3>
          </div>
          <div className="recommend-action">
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Start Next Lesson →
            </button>
          </div>
        </div>

        <div className="profile-grid">
          {/* 3. Recent Activity */}
          <div className="profile-section list-card">
            <h2 className="section-title">Recently Watched</h2>
            {recentVideos.length > 0 ? (
              <div className="activity-list">
                {recentVideos.map((vid, i) => (
                  <div className="activity-item" key={i} onClick={() => navigate(`/tutorial/${vid.videoId}`)}>
                    <div className="activity-thumb">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div className="activity-details">
                      <p className="activity-title">{vid.title}</p>
                      <p className="activity-date">{new Date(vid.watchedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No videos watched yet. Time to start learning!</p>
            )}
          </div>

          {/* 4. Quiz Performance */}
          <div className="profile-section list-card">
            <h2 className="section-title">Quiz History</h2>
            {recentQuizzes.length > 0 ? (
              <div className="activity-list">
                {recentQuizzes.map((quiz, i) => {
                  const scoreColor = (quiz.score / quiz.totalQuestions) >= 0.8 ? 'good' : (quiz.score / quiz.totalQuestions) >= 0.5 ? 'okay' : 'bad';
                  return (
                    <div className="activity-item quiz-item" key={i}>
                      <div className="activity-details">
                        <p className="activity-title">{quiz.topic}</p>
                        <p className="activity-date">{new Date(quiz.completedAt).toLocaleDateString()}</p>
                      </div>
                      <div className={`quiz-score ${scoreColor}`}>
                        {quiz.score}/{quiz.totalQuestions}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-text">Take your first quiz to see performance here.</p>
            )}
          </div>
        </div>

        {/* 6. Settings */}
        <div className="profile-section settings-card">
          <button className="settings-btn edit-btn" onClick={() => toast("Edit Profile coming soon!")}>
            Edit Profile
          </button>
          <button className="settings-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
