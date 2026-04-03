import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Roadmaps.css';

const Roadmaps = () => {
  const [topic, setTopic] = useState('');
  const [myRoadmaps, setMyRoadmaps] = useState([]);
  const [publicRoadmaps, setPublicRoadmaps] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
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
    if (!topic.trim() || generating) return;

    setGenerating(true);
    try {
      const res = await axios.post('/api/roadmaps/generate', { topic: topic.trim() });
      navigate(`/roadmaps/${res.data._id}`);
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return '#4ade80';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const displayedRoadmaps = activeTab === 'my' ? myRoadmaps : publicRoadmaps;

  return (
    <div className="roadmaps-page">

      {/* Hero / Generate Section */}
      <div className="roadmaps-hero">
        <h1 className="roadmaps-title">Roadmaps</h1>
        <p className="roadmaps-subtitle">Generate an AI-powered learning roadmap with curated video recommendations for any topic.</p>
        
        <form onSubmit={handleGenerate} className="generate-form">
          <div className="generate-input-wrapper">
            <input
              type="text"
              className="generate-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to learn? (e.g., Machine Learning, React, DSA...)"
              disabled={generating}
            />
            <button type="submit" className="generate-btn" disabled={generating || !topic.trim()}>
              {generating ? (
                <span className="generate-spinner"></span>
              ) : (
                'Generate Roadmap'
              )}
            </button>
          </div>
        </form>

        {generating && (
          <div className="generating-status">
            <div className="generating-loader"></div>
            <p>Generating your roadmap & finding curated videos...</p>
            <span className="generating-hint">This may take 15-30 seconds</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="roadmaps-tabs">
        <button
          className={`roadmap-tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Roadmaps ({myRoadmaps.length})
        </button>
        <button
          className={`roadmap-tab ${activeTab === 'public' ? 'active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          Discover ({publicRoadmaps.length})
        </button>
      </div>

      {/* Roadmap Cards */}
      <div className="roadmaps-content">
        {loading ? (
          <div className="roadmaps-loading">
            <div className="simple-loader"></div>
            <p>Loading roadmaps...</p>
          </div>
        ) : displayedRoadmaps.length === 0 ? (
          <div className="roadmaps-empty">
            <h3>{activeTab === 'my' ? 'No roadmaps yet' : 'No public roadmaps found'}</h3>
            <p>{activeTab === 'my' ? 'Generate your first roadmap above!' : 'Be the first to generate and share a roadmap.'}</p>
          </div>
        ) : (
          <div className="roadmaps-grid">
            {displayedRoadmaps.map((roadmap) => (
              <div
                key={roadmap._id}
                className="roadmap-card"
                onClick={() => navigate(`/roadmaps/${roadmap._id}`)}
              >
                <div className="roadmap-card-header">
                  <span
                    className="level-pill"
                    style={{ backgroundColor: `${getLevelColor(roadmap.level)}20`, color: getLevelColor(roadmap.level) }}
                  >
                    {roadmap.level}
                  </span>
                  <span className="node-count">{roadmap.nodeCount || roadmap.nodes?.length || 0} steps</span>
                </div>
                <h3 className="roadmap-card-title">{roadmap.title}</h3>
                <p className="roadmap-card-desc">{roadmap.description}</p>
                <div className="roadmap-card-footer">
                  <span className="roadmap-date">{formatDate(roadmap.createdAt)}</span>
                  <span className="roadmap-view-btn">View &rsaquo;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
