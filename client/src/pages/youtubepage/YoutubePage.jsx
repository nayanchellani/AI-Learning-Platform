import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Quiz from '../quiz/Quiz';
import ResourceSection from './components/ResourceSection';
import './YoutubePage.css';

const placeholders = [
  "What would you like to learn today?",
  "Search for React hooks, Python basics...",
  "Find the best videos, docs, and articles..."
];

const YoutubePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ videos: [], docs: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typingPlaceholder, setTypingPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [quizOpts, setQuizOpts] = useState({ isOpen: false, video: null });
  
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
        timeout = setTimeout(() => setTypingPlaceholder(currentText.substring(0, typingPlaceholder.length - 1)), 50);
      }
    } else {
      if (typingPlaceholder.length === currentText.length) {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      } else {
        timeout = setTimeout(() => setTypingPlaceholder(currentText.substring(0, typingPlaceholder.length + 1)), 70);
      }
    }
    return () => clearTimeout(timeout);
  }, [typingPlaceholder, isDeleting, placeholderIndex]);

  useEffect(() => {
    fetchDefaultFeed();
  }, []);

  const fetchDefaultFeed = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent('programming tutorials')}`);
      setResults(res.data);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data);
    } catch (error) {
      console.error("Error searching resources:", error);
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

  const hasEmptyResults = results.videos.length === 0 && results.docs.length === 0 && results.articles.length === 0;

  return (
    <div className="youtube-page">
      <div className="youtube-header">
        <h1 className="youtube-title">Search</h1>
        <p className="youtube-subtitle">Find the best YouTube videos, documentation, and articles curated specifically for your learning journey.</p>
        
        <form onSubmit={handleSearch} className="search-container">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={typingPlaceholder || "Search for tutorials (e.g., React hooks, Python basics...)"}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => { setSearchQuery(''); setActiveTab('all'); fetchDefaultFeed(); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button type="submit" className="search-submit-btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </form>

        {hasSearched && !loading && !hasEmptyResults && (
          <div className="search-tabs">
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Results</button>
            <button className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>Videos ({results.videos.length})</button>
            <button className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>Documentation ({results.docs.length})</button>
            <button className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}>Articles ({results.articles.length})</button>
          </div>
        )}
      </div>

      <div className="youtube-content">
        {!hasSearched && !loading ? (
           <div className="empty-state">
             <h2>Search anything to start learning</h2>
             <p>Access an AI-curated ecosystem of top-tier tutorials, official docs, and insightful articles.</p>
           </div>
        ) : loading ? (
          <div className="loading-state-wrapper">
            <div className="simple-loader"></div>
            <p className="searching-text">Searching across resources...</p>
          </div>
        ) : hasEmptyResults ? (
          <div className="empty-state">
            <h2>Search anything to start learning</h2>
            <p>No content found. Please try tweaking your keywords.</p>
          </div>
        ) : (
          <div className="search-results-layout">
            
            {(activeTab === 'all' || activeTab === 'videos') && results.videos.length > 0 && (
              <div className="resource-section">
                <h2 className="section-title">Top Video Tutorials</h2>
                <div className="video-grid">
                  {results.videos.map((video) => (
                    <div key={video.videoId} className="video-card">
                      <div className="video-thumb-container">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="video-thumb" 
                          onError={(e) => {
                            const fallback = `https://i.ytimg.com/vi/${video.videoId}/default.jpg`;
                            if (e.target.src !== fallback) {
                              e.target.src = fallback;
                            } else {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect fill="%231a1a2e" width="320" height="180"/><text x="50%" y="50%" fill="%23555" font-size="14" text-anchor="middle" dy=".3em">No Preview</text></svg>';
                            }
                          }}
                        />
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Watch
                          </button>
                          <button 
                            className="btn-quiz" 
                            onClick={() => setQuizOpts({ isOpen: true, video })}
                          >
                            Generate Quiz
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'docs') && (
              <ResourceSection title="Official Documentation" data={results.docs} />
            )}

            {(activeTab === 'all' || activeTab === 'articles') && (
              <ResourceSection title="Community Articles" data={results.articles} />
            )}

          </div>
        )}
      </div>

      <Quiz 
        isOpen={quizOpts.isOpen} 
        onClose={() => setQuizOpts({ ...quizOpts, isOpen: false })} 
        video={quizOpts.video} 
      />
    </div>
  );
};

export default YoutubePage;
