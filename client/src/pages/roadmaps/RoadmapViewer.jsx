import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './RoadmapViewer.css';

const RoadmapViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeVideo, setNodeVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isOwner = roadmap && user && roadmap.createdBy?._id === user._id;

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axios.get(`/api/roadmaps/${id}`);
        setRoadmap(res.data);
      } catch (err) {
        console.error('Failed to fetch roadmap:', err);
        navigate('/roadmaps');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [id, navigate]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectNode = async (node) => {
    setSelectedNode(node);
    setNodeVideo(null);

    // Check if video already cached on node
    if (node.video && node.video.videoId) {
      setNodeVideo(node.video);
      return;
    }

    // Lazy load video
    setVideoLoading(true);
    try {
      const res = await axios.get(`/api/roadmaps/${id}/node/${node.id}/video`);
      if (res.data.video) {
        setNodeVideo(res.data.video);
        // Update local state cache
        setRoadmap(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => n.id === node.id ? { ...n, video: res.data.video } : n)
        }));
      }
    } catch (err) {
      console.error('Failed to load video:', err);
    } finally {
      setVideoLoading(false);
    }
  };

  const toggleComplete = async (nodeId, e) => {
    e.stopPropagation();
    if (!isOwner) return;

    try {
      const res = await axios.post(`/api/roadmaps/${id}/complete-node`, { nodeId });
      setRoadmap(prev => ({ ...prev, completedNodes: res.data.completedNodes }));
    } catch (err) {
      console.error('Failed to toggle node:', err);
    }
  };

  const togglePublic = async () => {
    try {
      const res = await axios.patch(`/api/roadmaps/${id}/visibility`);
      setRoadmap(prev => ({ ...prev, isPublic: res.data.isPublic }));
      setMenuOpen(false);
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const handleClone = async () => {
    try {
      const res = await axios.post(`/api/roadmaps/${id}/clone`);
      navigate(`/roadmaps/${res.data._id}`);
    } catch (err) {
      if (err.response?.data?.roadmapId) {
        navigate(`/roadmaps/${err.response.data.roadmapId}`);
      }
    }
  };

  const formatDuration = (ptString) => {
    if (!ptString || ptString === 'PT0S') return '';
    const match = ptString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return ptString;
    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;
    const s = parseInt(match[3]) || 0;
    let result = '';
    if (h > 0) result += `${h}:`;
    result += `${h > 0 ? m.toString().padStart(2, '0') : m}:${s.toString().padStart(2, '0')}`;
    return result;
  };

  const formatViews = (views) => {
    const num = parseInt(views);
    if (isNaN(num)) return views;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="rv-loading">
        <div className="rv-spinner"></div>
        <p>Loading roadmap...</p>
      </div>
    );
  }

  if (!roadmap) return null;

  const sortedNodes = [...(roadmap.nodes || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedSet = new Set(roadmap.completedNodes || []);
  const progress = sortedNodes.length > 0
    ? Math.round((completedSet.size / sortedNodes.length) * 100)
    : 0;

  // Arrange nodes into rows for the flowchart (5 per row)
  const NODES_PER_ROW = 5;
  const rows = [];
  for (let i = 0; i < sortedNodes.length; i += NODES_PER_ROW) {
    const row = sortedNodes.slice(i, i + NODES_PER_ROW);
    const rowIndex = Math.floor(i / NODES_PER_ROW);
    // Only log the reversed status for CSS styling, DON'T reverse the actual array 
    // since flex-direction: row-reverse handles the visual reversing
    rows.push({ nodes: row, reversed: rowIndex % 2 === 1 });
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return '#4ade80';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="rv-page">
      {/* Header */}
      <div className="rv-header">
        <div className="rv-header-left">
          <button className="rv-back" onClick={() => navigate('/roadmaps')}>&larr; Back to Roadmaps</button>
          <h1 className="rv-title">{roadmap.title}</h1>
          <p className="rv-desc">{roadmap.description}</p>
        </div>
        <div className="rv-header-right">
          <div className="rv-meta-badges">
            <span className="rv-level-badge" style={{ background: getLevelColor(roadmap.level) }}>
              {roadmap.level}
            </span>
            {roadmap.category && <span className="rv-cat-badge">{roadmap.category}</span>}
          </div>
          <div className="rv-progress-block">
            <span className="rv-progress-text">Progress: {progress}%</span>
            <div className="rv-progress-bar">
              <div className="rv-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="rv-menu-wrapper" ref={menuRef}>
            <button className="rv-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              ⋮
            </button>
            {menuOpen && (
              <div className="rv-menu-dropdown">
                {isOwner && (
                  <button onClick={togglePublic}>
                    {roadmap.isPublic ? 'Make Private' : 'Make Public'}
                  </button>
                )}
                {!isOwner && (
                  <button onClick={handleClone}>Add to My Roadmaps</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flowchart Area */}
      <div className="rv-flowchart-area">
        <div className="rv-grid-bg"></div>
        <div className="rv-flowchart">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx}>
              <div className={`rv-flow-row ${row.reversed ? 'reversed' : ''}`}>
                {row.nodes.map((node, nodeIdx) => {
                  const isCompleted = completedSet.has(node.id);
                  const isSelected = selectedNode?.id === node.id;
                  const showConnector = nodeIdx < row.nodes.length - 1;

                  return (
                    <div key={node.id} style={{ display: 'contents' }}>
                      <div
                        className={`rv-node ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => selectNode(node)}
                      >
                        <div className="rv-node-check" onClick={(e) => toggleComplete(node.id, e)}>
                          {isCompleted ? '✓' : (node.order || nodeIdx + 1)}
                        </div>
                        <span className="rv-node-title">{node.title}</span>
                        <span className={`rv-node-type ${node.type}`}>{node.type}</span>
                      </div>
                      {showConnector && <div className="rv-h-connector"></div>}
                    </div>
                  );
                })}
              </div>
              {rowIdx < rows.length - 1 && (
                <div className={`rv-slant-connector ${row.reversed ? 'slant-left' : 'slant-right'}`}>
                  <svg viewBox="0 0 100 80" preserveAspectRatio="none">
                    <line
                      x1={row.reversed ? "8.5" : "91.5"}
                      y1="0"
                      x2={row.reversed ? "8.5" : "91.5"}
                      y2="80"
                      stroke="rgba(255,192,0,0.35)"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Node Detail Panel */}
      {selectedNode && (
        <div className="rv-detail-panel">
          <div className="rv-detail-main">
            <div className="rv-detail-top">
              <span className="rv-detail-step">Step {selectedNode.order}</span>
              <span className={`rv-detail-type ${selectedNode.type}`}>{selectedNode.type}</span>
              {completedSet.has(selectedNode.id) && <span className="rv-detail-done">Completed</span>}
            </div>
            <h2 className="rv-detail-title">{selectedNode.title}</h2>
            <p className="rv-detail-desc">{selectedNode.description}</p>
            {isOwner && (
              <button
                className={`rv-mark-btn ${completedSet.has(selectedNode.id) ? 'un-mark' : ''}`}
                onClick={(e) => toggleComplete(selectedNode.id, e)}
              >
                {completedSet.has(selectedNode.id) ? 'Mark as Incomplete' : 'Mark as Complete'}
              </button>
            )}
          </div>

          {/* Video section — lazy loaded */}
          <div className="rv-detail-video">
            <h4 className="rv-video-label">Recommended Video</h4>
            {videoLoading ? (
              <div className="rv-video-loading">
                <div className="rv-spinner-sm"></div>
                <p>Finding best video...</p>
              </div>
            ) : nodeVideo ? (
              <div
                className="rv-video-card"
                onClick={() => navigate(`/tutorial/${nodeVideo.videoId}`, {
                  state: { video: nodeVideo }
                })}
              >
                <div className="rv-video-thumb">
                  <img src={nodeVideo.thumbnail} alt={nodeVideo.title} />
                  {nodeVideo.duration && (
                    <span className="rv-video-dur">{formatDuration(nodeVideo.duration)}</span>
                  )}
                </div>
                <div className="rv-video-info">
                  <h5>{nodeVideo.title}</h5>
                  <div className="rv-video-meta">
                    <span>{nodeVideo.channelTitle}</span>
                    {nodeVideo.views && (
                      <>
                        <span className="rv-dot">•</span>
                        <span>{formatViews(nodeVideo.views)} views</span>
                      </>
                    )}
                  </div>
                  <span className="rv-video-cta">Watch Tutorial &rarr;</span>
                </div>
              </div>
            ) : (
              <p className="rv-no-video">Click a node to load its recommended video</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapViewer;
