import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);


  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', skillLevel: 'beginner' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/auth/profile');
        setProfileData(response.data);
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isOpen]);

  const handleUpdatePicture = () => {
    toast("Picture upload mapping pending comprehensive backend AWS S3 support.");
  };

  const handleLogout = async () => {
    toast.success("Logged out successfully");
    await logout();
    onClose();
    navigate('/login', { replace: true });
  };

  const openEditModal = () => {
    const data = profileData || user || {};
    setEditForm({
      username: data.username || '',
      bio: data.bio || '',
      skillLevel: data.skillLevel || 'beginner'
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await axios.put('/api/auth/profile', editForm);
      setProfileData(response.data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="profile-overlay" onClick={onClose}>
        <div className="profile-page loading" onClick={(e) => e.stopPropagation()}>
          <div className="profile-skeleton-card"></div>
        </div>
      </div>
    );
  }

  const data = profileData || user || {};
  const progress = data.progress || {};
  
  const videosWatched = progress.videosWatched || [];
  const quizzesCompleted = progress.quizzesCompleted || [];
  
  let avgScore = 0;
  if (quizzesCompleted.length > 0) {
    const totalPercentage = quizzesCompleted.reduce((acc, q) => {
      return acc + (q.totalQuestions ? (q.score / q.totalQuestions) * 100 : 0);
    }, 0);
    avgScore = Math.round(totalPercentage / quizzesCompleted.length);
  }

  const totalActivity = quizzesCompleted.length + videosWatched.length;
  const level = Math.floor(totalActivity / 5) + 1;
  const userSkill = data.skillLevel ? data.skillLevel.charAt(0).toUpperCase() + data.skillLevel.slice(1) : "Beginner";

  const currentStreak = progress.streak?.current || 0;
  const journeyProgress = totalActivity === 0 ? 0 : Math.min(100, Math.round(((totalActivity % 5) / 5) * 100));
  
  const uniqueVideos = [];
  const seenVideoIds = new Set();
  const sortedVideos = [...videosWatched].sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
  
  for (const vid of sortedVideos) {
    if (!seenVideoIds.has(vid.videoId)) {
      uniqueVideos.push(vid);
      seenVideoIds.add(vid.videoId);
    }
  }
  const recentVideos = uniqueVideos.slice(0, 3);

  const recentQuizzes = [...quizzesCompleted]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 3);

  return (
    <div className="profile-overlay" onClick={onClose}>
    <div className="profile-page" onClick={(e) => e.stopPropagation()}>
      <button className="profile-close-btn" onClick={onClose}>×</button>
      <div className="profile-container">
        
        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <div className="edit-modal-header">
                <h2>Edit Profile</h2>
                <button className="close-modal-btn" onClick={() => setIsEditing(false)}>×</button>
              </div>
              <form onSubmit={handleSaveProfile} className="edit-modal-form">
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={editForm.username} 
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    required
                    minLength={3}
                  />
                </div>
                <div className="form-group">
                  <label>Skill Level</label>
                  <select 
                    value={editForm.skillLevel} 
                    onChange={(e) => setEditForm({...editForm, skillLevel: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bio (Optional)</label>
                  <textarea 
                    value={editForm.bio} 
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about your coding journey..."
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
              <p className="profile-title">Level {level} {userSkill}</p>
              {data.bio && <p className="profile-bio">{data.bio}</p>}
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
            <div className={`streak-badge ${currentStreak === 0 ? 'zero-streak' : ''}`}>
              {currentStreak > 0 ? (
                 <>
                   <span className="streak-fire">🔥</span>
                   <span className="streak-count">{currentStreak} day streak</span>
                 </>
              ) : (
                 <span className="streak-count">Start your streak today 🔥</span>
              )}
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
            <button className="btn-primary" onClick={() => navigate('/youtube')}>
              Find Next Lesson →
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
                      <img 
                        src={`https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`} 
                        alt="thumbnail" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }} 
                      />
                      <div className="activity-thumb-fallback" style={{display: 'none'}}>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                    <div className="activity-details">
                      <p className="activity-title" title={vid.title}>{vid.title}</p>
                      <p className="activity-date">{new Date(vid.watchedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-action">
                <p className="empty-text">No videos watched yet.</p>
                <button className="btn-secondary" onClick={() => navigate('/youtube')}>Start Exploring →</button>
              </div>
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
                        <p className="activity-title" title={quiz.topic}>{quiz.topic}</p>
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
              <div className="empty-state-action">
                <p className="empty-text">No quizzes yet.</p>
                <button className="btn-secondary" onClick={() => navigate('/youtube')}>Generate your first quiz →</button>
              </div>
            )}
          </div>
        </div>

        {/* 6. Settings */}
        <div className="profile-section settings-card">
          <button className="settings-btn edit-btn" onClick={openEditModal}>
            Edit Profile
          </button>
          <button className="settings-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </div>
    </div>
    </div>
  );
};

export default Profile;
