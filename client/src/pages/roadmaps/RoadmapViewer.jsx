import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoadmapViewer.css';

const RoadmapViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const flowchartRef = useRef(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axios.get(`/api/roadmaps/${id}`);
        setRoadmap(res.data);
        if (res.data.nodes?.length > 0) {
          setSelectedNode(res.data.nodes[0]);
        }
      } catch (err) {
        console.error('Failed to fetch roadmap:', err);
        navigate('/roadmaps');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [id, navigate]);

  const scrollFlowchart = (direction) => {
    const container = flowchartRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.6;
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return '#4ade80';
      case 'intermediate': return '#fbbf24';
      case 'advanced': return '#f87171';
      default: return '#94a3b8';
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
      <div className="viewer-loading">
        <div className="viewer-spinner"></div>
        <p>Loading roadmap...</p>
      </div>
    );
  }

  if (!roadmap) return null;

  const sortedNodes = [...(roadmap.nodes || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="roadmap-viewer">
      {/* Header */}
      <div className="viewer-header">
        <button className="viewer-back-btn" onClick={() => navigate('/roadmaps')}>
          &larr; Back to Roadmaps
        </button>
        <div className="viewer-title-row">
          <div>
            <h1 className="viewer-title">{roadmap.title}</h1>
            <p className="viewer-desc">{roadmap.description}</p>
          </div>
          <span
            className="viewer-level-pill"
            style={{ backgroundColor: `${getLevelColor(roadmap.level)}20`, color: getLevelColor(roadmap.level) }}
          >
            {roadmap.level}
          </span>
        </div>
      </div>

      {/* Horizontal Flowchart */}
      <div className="flowchart-section">
        <div className="flowchart-controls">
          <span className="flowchart-label">{sortedNodes.length} Steps</span>
          <div className="flowchart-arrows">
            <button className="flow-arrow" onClick={() => scrollFlowchart('left')} aria-label="Scroll left">
              &lsaquo;
            </button>
            <button className="flow-arrow" onClick={() => scrollFlowchart('right')} aria-label="Scroll right">
              &rsaquo;
            </button>
          </div>
        </div>

        <div className="flowchart-track" ref={flowchartRef}>
          {sortedNodes.map((node, index) => (
            <div className="flowchart-item" key={node.id || index}>
              <div
                className={`flow-node ${selectedNode?.id === node.id ? 'selected' : ''}`}
                onClick={() => setSelectedNode(node)}
              >
                <span className="flow-order">{node.order || index + 1}</span>
                <span className="flow-node-title">{node.title}</span>
                <span className={`flow-type-badge ${node.type}`}>{node.type}</span>
              </div>
              {index < sortedNodes.length - 1 && (
                <div className="flow-connector">
                  <div className="flow-line"></div>
                  <div className="flow-arrow-head"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Detail */}
      {selectedNode && (
        <div className="node-detail">
          <div className="node-detail-main">
            <div className="node-detail-header">
              <span className="node-detail-order">Step {selectedNode.order}</span>
              <span className={`node-detail-type ${selectedNode.type}`}>{selectedNode.type}</span>
            </div>
            <h2 className="node-detail-title">{selectedNode.title}</h2>
            <p className="node-detail-desc">{selectedNode.description}</p>
          </div>

          {/* Curated Video */}
          {selectedNode.video && selectedNode.video.videoId && (
            <div className="node-video-card">
              <h4 className="node-video-label">Recommended Video</h4>
              <div
                className="node-video-inner"
                onClick={() => navigate(`/tutorial/${selectedNode.video.videoId}`, {
                  state: {
                    video: {
                      videoId: selectedNode.video.videoId,
                      title: selectedNode.video.title,
                      thumbnail: selectedNode.video.thumbnail,
                      channelTitle: selectedNode.video.channelTitle,
                      duration: selectedNode.video.duration,
                      views: selectedNode.video.views
                    }
                  }
                })}
              >
                <div className="node-video-thumb">
                  <img src={selectedNode.video.thumbnail} alt={selectedNode.video.title} />
                  {selectedNode.video.duration && (
                    <span className="node-video-duration">{formatDuration(selectedNode.video.duration)}</span>
                  )}
                </div>
                <div className="node-video-info">
                  <h5 className="node-video-title">{selectedNode.video.title}</h5>
                  <div className="node-video-meta">
                    <span>{selectedNode.video.channelTitle}</span>
                    {selectedNode.video.views && (
                      <>
                        <span className="meta-dot">•</span>
                        <span>{formatViews(selectedNode.video.views)} views</span>
                      </>
                    )}
                  </div>
                  <span className="node-video-cta">Watch Tutorial &rarr;</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapViewer;
