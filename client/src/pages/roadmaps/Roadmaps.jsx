import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Roadmaps.css';

const CATEGORIES = [
  "Web Development", "Mobile Development", "Data Science", "Machine Learning",
  "DevOps", "Cybersecurity", "Game Development", "Desktop Applications",
  "API Development", "Database Design", "UI/UX Design", "Cloud Computing"
];

const Roadmaps = () => {
  const [myRoadmaps, setMyRoadmaps] = useState([]);
  const [publicRoadmaps, setPublicRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    category: '',
    level: 'beginner',
    timeCommitment: 'moderate',
    learningGoals: []
  });
  const [goalInput, setGoalInput] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const [myRes, publicRes] = await Promise.all([
        axios.get('/api/roadmaps/my'),
        axios.get('/api/roadmaps/public')
      ]);
      setMyRoadmaps(myRes.data);
      setPublicRoadmaps(publicRes.data);
    } catch (err) {
      console.error('Failed to fetch roadmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category || generating) return;

    setGenerating(true);
    try {
      const res = await axios.post('/api/roadmaps/generate', {
        title: form.title.trim(),
        category: form.category,
        level: form.level,
        timeCommitment: form.timeCommitment,
        learningGoals: form.learningGoals
      });
      setShowModal(false);
      navigate(`/roadmaps/${res.data._id}`);
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setGenerating(false);
    }
  };

  const addGoal = () => {
    if (goalInput.trim() && form.learningGoals.length < 5) {
      setForm({ ...form, learningGoals: [...form.learningGoals, goalInput.trim()] });
      setGoalInput('');
    }
  };

  const removeGoal = (index) => {
    setForm({ ...form, learningGoals: form.learningGoals.filter((_, i) => i !== index) });
  };

  const handleClone = async (roadmapId) => {
    try {
      const res = await axios.post(`/api/roadmaps/${roadmapId}/clone`);
      navigate(`/roadmaps/${res.data._id}`);
    } catch (err) {
      if (err.response?.data?.roadmapId) {
        navigate(`/roadmaps/${err.response.data.roadmapId}`);
      }
    }
  };

  const openModal = () => {
    setForm({ title: '', category: '', level: 'beginner', timeCommitment: 'moderate', learningGoals: [] });
    setGoalInput('');
    setShowModal(true);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return '#4ade80';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const getProgress = (rm) => {
    const total = rm.nodeCount || rm.nodes?.length || 0;
    const completed = rm.completedNodes?.length || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const displayedRoadmaps = activeTab === 'my' ? myRoadmaps : publicRoadmaps;

  return (
    <div className="roadmaps-page">
      {/* Header */}
      <div className="rm-header">
        <div>
          <h1 className="rm-page-title">Learning Roadmaps</h1>
          <p className="rm-page-subtitle">Follow structured learning paths tailored to your goals</p>
        </div>
        <button className="rm-create-btn" onClick={openModal}>+ Create Roadmap</button>
      </div>

      {/* Tabs */}
      <div className="rm-tabs">
        <button className={`rm-tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>
          My Roadmaps ({myRoadmaps.length})
        </button>
        <button className={`rm-tab ${activeTab === 'public' ? 'active' : ''}`} onClick={() => setActiveTab('public')}>
          Browse Public ({publicRoadmaps.length})
        </button>
      </div>

      {/* Roadmap Cards */}
      <div className="rm-content">
        {loading ? (
          <div className="rm-loading">
            <div className="rm-spinner"></div>
            <p>Loading roadmaps...</p>
          </div>
        ) : displayedRoadmaps.length === 0 ? (
          <div className="rm-empty">
            <h3>{activeTab === 'my' ? 'No roadmaps yet' : 'No public roadmaps found'}</h3>
            <p>{activeTab === 'my' ? 'Create your first learning roadmap!' : 'Be the first to share a roadmap.'}</p>
          </div>
        ) : (
          <div className="rm-grid">
            {displayedRoadmaps.map((rm) => {
              const progress = getProgress(rm);
              const nodeCount = rm.nodeCount || rm.nodes?.length || 0;
              const isOwn = activeTab === 'my';
              return (
                <div key={rm._id} className="rm-card">
                  <div className="rm-card-top">
                    <h3 className="rm-card-title">{rm.title}</h3>
                    <div className="rm-card-badges">
                      <span className="rm-badge-level" style={{ backgroundColor: getLevelColor(rm.level) }}>
                        {rm.level?.toUpperCase()}
                      </span>
                      {rm.category && (
                        <span className="rm-badge-category">{rm.category}</span>
                      )}
                    </div>
                  </div>
                  <p className="rm-card-desc">{rm.description}</p>

                  {isOwn && (
                    <div className="rm-card-progress">
                      <div className="rm-progress-header">
                        <span>Progress: {progress}%</span>
                        <span className="rm-nodes-avail">{nodeCount - (rm.completedNodes?.length || 0)} nodes available</span>
                      </div>
                      <div className="rm-progress-bg">
                        <div className="rm-progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="rm-card-stats">
                    <div className="rm-stat">
                      <span className="rm-stat-val">{nodeCount}</span>
                      <span className="rm-stat-lbl">Nodes</span>
                    </div>
                    {rm.createdBy?.username && !isOwn && (
                      <div className="rm-stat">
                        <span className="rm-stat-val">{rm.createdBy.username}</span>
                        <span className="rm-stat-lbl">Author</span>
                      </div>
                    )}
                  </div>

                  {isOwn ? (
                    <button className="rm-continue-btn" onClick={() => navigate(`/roadmaps/${rm._id}`)}>
                      Continue Learning
                    </button>
                  ) : (
                    <div className="rm-public-actions">
                      <button className="rm-view-btn" onClick={() => navigate(`/roadmaps/${rm._id}`)}>
                        View Roadmap
                      </button>
                      <button className="rm-add-btn" onClick={() => handleClone(rm._id)}>
                        Add to My Roadmaps
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Roadmap Modal ── */}
      {showModal && (
        <div className="rm-modal-overlay" onClick={() => !generating && setShowModal(false)}>
          <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rm-modal-header">
              <h2>Create Learning Roadmap</h2>
              <button className="rm-modal-close" onClick={() => !generating && setShowModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleGenerate} className="rm-modal-form">
              {/* Title */}
              <label className="rm-label">Roadmap Title <span className="rm-req">*</span></label>
              <input
                type="text"
                className="rm-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Full Stack JavaScript Development"
                disabled={generating}
              />

              {/* Category */}
              <label className="rm-label">Category <span className="rm-req">*</span></label>
              <select
                className="rm-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                disabled={generating}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Skill Level */}
              <label className="rm-label">Skill Level <span className="rm-req">*</span></label>
              <div className="rm-radio-group">
                {[
                  { value: 'beginner', label: 'Beginner', sub: 'New to programming' },
                  { value: 'intermediate', label: 'Intermediate', sub: 'Some experience' },
                  { value: 'advanced', label: 'Advanced', sub: 'Experienced developer' }
                ].map(opt => (
                  <label key={opt.value} className={`rm-radio-card ${form.level === opt.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="level"
                      value={opt.value}
                      checked={form.level === opt.value}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      disabled={generating}
                    />
                    <div>
                      <strong>{opt.label}</strong>
                      <span>{opt.sub}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Time Commitment */}
              <label className="rm-label">Time Commitment</label>
              <div className="rm-radio-group">
                {[
                  { value: 'light', label: 'Light', sub: '1-2 hours/week' },
                  { value: 'moderate', label: 'Moderate', sub: '3-5 hours/week' },
                  { value: 'intensive', label: 'Intensive', sub: '6+ hours/week' }
                ].map(opt => (
                  <label key={opt.value} className={`rm-radio-card ${form.timeCommitment === opt.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="timeCommitment"
                      value={opt.value}
                      checked={form.timeCommitment === opt.value}
                      onChange={(e) => setForm({ ...form, timeCommitment: e.target.value })}
                      disabled={generating}
                    />
                    <div>
                      <strong>{opt.label}</strong>
                      <span>{opt.sub}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Learning Goals */}
              <label className="rm-label">Learning Goals</label>
              <div className="rm-goals-input">
                <input
                  type="text"
                  className="rm-input"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  placeholder="Add a learning goal (e.g., Build REST APIs)"
                  disabled={generating}
                />
                <button type="button" className="rm-goal-add-btn" onClick={addGoal} disabled={generating}>Add</button>
              </div>
              {form.learningGoals.length > 0 && (
                <div className="rm-goals-tags">
                  {form.learningGoals.map((goal, i) => (
                    <span key={i} className="rm-goal-tag">
                      {goal}
                      <button type="button" onClick={() => removeGoal(i)}>&times;</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="rm-modal-footer">
                <button type="button" className="rm-cancel-btn" onClick={() => setShowModal(false)} disabled={generating}>Cancel</button>
                <button type="submit" className="rm-submit-btn" disabled={generating || !form.title.trim() || !form.category}>
                  {generating ? (
                    <>
                      <span className="rm-btn-spinner"></span>
                      Generating...
                    </>
                  ) : 'Create Roadmap'}
                </button>
              </div>

              {/* AI info */}
              <div className="rm-ai-info">
                <span className="rm-ai-icon">✦</span>
                <div>
                  <strong>AI-Generated Content</strong>
                  <p>Our AI will create a personalized learning path with curated resources, practice exercises, and milestone projects based on your preferences.</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmaps;
