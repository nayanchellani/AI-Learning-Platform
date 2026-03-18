import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './YoutubePage.css';

const placeholders = [
  "What would you like to learn today?",
  "Which tutorial are you looking for?",
  "Search for best tutorials all over youtube"
];

const YoutubePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typingPlaceholder, setTypingPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;
    const currentText = placeholders[placeholderIndex];
    
    if (isDeleting) {
      if (typingPlaceholder.length === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        timeout = setTimeout(() => {}, 500);
      } else {
        timeout = setTimeout(() => {
          setTypingPlaceholder(currentText.substring(0, typingPlaceholder.length - 1));
        }, 50);
      }
    } else {
      if (typingPlaceholder.length === currentText.length) {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      } else {
        timeout = setTimeout(() => {
          setTypingPlaceholder(currentText.substring(0, typingPlaceholder.length + 1));
        }, 70);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [typingPlaceholder, isDeleting, placeholderIndex]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/videos/trending');
      setVideos(res.data);
    } catch (error) {
      console.error("Error fetching trending:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchTrending();
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/videos/search?q=${encodeURIComponent(searchQuery)}`);
      setVideos(res.data);
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ptString) => {
    if (!ptString || ptString === 'PT0S') return '0:00';
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

  return (
    <div className="youtube-page">
      <div className="youtube-header">
        <h1 className="youtube-title">Explore Tutorials</h1>
        <p className="youtube-subtitle">Find the best YouTube content curated for your learning journey.</p>
        
        <form onSubmit={handleSearch} className="search-container">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={typingPlaceholder || "Search..."}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => { setSearchQuery(''); fetchTrending(); }}
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="search-submit-btn">Search</button>
        </form>
      </div>

      <div className="youtube-content">
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="video-skeleton">
                <div className="skeleton-thumb"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="video-grid">
            {videos.map((video) => (
              <div key={video.videoId} className="video-card">
                <div className="video-thumb-container">
                  <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                  <span className="video-duration">{formatDuration(video.duration)}</span>
                </div>
                
                <div className="video-info">
                  <h3 className="video-card-title">{video.title}</h3>
                  <div className="video-meta">
                    <span className="video-channel">{video.channelTitle}</span>
                    <span className="video-dot">•</span>
                    <span className="video-views">{formatViews(video.views)} views</span>
                  </div>
                  
                  <div className="video-actions">
                    <button 
                      className="btn-watch" 
                      onClick={() => navigate(`/tutorial/${video.videoId}`, { state: { video } })}
                    >
                      Watch
                    </button>
                    <button 
                      className="btn-quiz" 
                      onClick={() => navigate(`/quiz/${video.videoId}`, { state: { video } })}
                    >
                      Generate Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No tutorials found</h2>
            <p>Try searching for a different topic.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YoutubePage;
