import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { customToast } from '../../utils/toastUtils';
import './YtTutorial.css';

const YtTutorial = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const video = location.state?.video;

  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    if (!video) {
      customToast.error("Video details not found. Please select a video from search.");
      navigate('/youtube');
    } else {
      trackProgress(video);
    }
  }, [video, navigate]);

  const parseDuration = (ptString) => {
    if (!ptString) return 0;
    if (typeof ptString === 'number') return ptString;
    const match = ptString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;
    const s = parseInt(match[3]) || 0;
    return h * 3600 + m * 60 + s;
  };

  const trackProgress = async (videoData) => {
    try {
      await axios.post('/api/videos/watch', {
        videoId: videoData.videoId,
        title: videoData.title,
        duration: parseDuration(videoData.duration),
        completed: false
      });
    } catch (error) {
      console.error("Failed to track progress", error);
    }
  };

  const generateQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await axios.post('/api/quizzes/generate', { 
        videoId: video.videoId,
        title: video.title
      });
      setQuizData(res.data);
      customToast.success("Quiz generated successfully!");
    } catch (error) {
      customToast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  if (!video) return null;

  return (
    <div className="tutorial-page animate-fade-in">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Back to Tutorials
      </button>

      <div className="tutorial-layout">
        <div className="tutorial-video-col">
          <div className="video-player-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="quiz-generation-section">
             <button 
                className={`generate-quiz-btn ${quizLoading ? 'loading' : ''}`}
                onClick={generateQuiz}
                disabled={quizLoading}
             >
                {quizLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    Generate AI Quiz for this Tutorial
                  </>
                )}
             </button>

             {quizData && (
                <div className="quiz-inline-container slide-down">
                    <h3>Quiz Ready!</h3>
                    <button className="start-quiz-btn" onClick={() => navigate(`/quiz/${video.videoId}`, { state: { video, quiz: quizData } })}>
                       Start Quiz Now
                    </button>
                </div>
             )}
          </div>
        </div>

        <div className="tutorial-info-col">
          <h1 className="tutorial-title">{video.title}</h1>
          <div className="tutorial-meta">
            <div className="channel-badge">
              {video.channelTitle}
            </div>
            <div className="views-badge">
              {parseInt(video.views).toLocaleString()} views
            </div>
          </div>
          
          <div className="tutorial-description-box">
            <h3>About this tutorial</h3>
            <p className="tutorial-desc-text">
              {video.description || "No description provided for this video."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YtTutorial;
