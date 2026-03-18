import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { customToast } from '../../utils/toastUtils';
import './Quiz.css';

const Quiz = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const video = location.state?.video;
  const initialQuiz = location.state?.quiz;

  const [quiz, setQuiz] = useState(initialQuiz || null);
  const [loading, setLoading] = useState(!initialQuiz);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState(null);
  
  // Pagination State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Timer State
  const [timePassed, setTimePassed] = useState(0);

  useEffect(() => {
    if (!quiz) {
      if (video) {
        generateQuiz(video);
      } else {
        fetchExistingQuiz();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (quiz && !submitted && !loading) {
      timer = setInterval(() => {
        setTimePassed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quiz, submitted, loading]);

  const fetchExistingQuiz = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${videoId}`);
      setQuiz(res.data);
    } catch (error) {
      console.error(error);
      customToast.error("No quiz found. Please select a video first.");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (videoData) => {
    try {
      const res = await axios.post('/api/quizzes/generate', { 
        videoId: videoData.videoId,
        title: videoData.title
      });
      setQuiz(res.data);
    } catch (error) {
      customToast.error(error.response?.data?.message || "Failed to generate quiz");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (optionValue) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionValue
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || Object.keys(answers).length < quiz.questions.length) {
      customToast.error("Please answer all questions before submitting.");
      return;
    }

    const answersArray = quiz.questions.map((_, index) => answers[index]);

    try {
      const res = await axios.post('/api/quizzes/submit', {
        videoId: quiz.videoId,
        answers: answersArray
      });
      setScore(res.data.score);
      setResults(res.data.results);
      setSubmitted(true);
      customToast.success(`Quiz Completed! You scored ${res.data.score}/${res.data.totalQuestion}`);
    } catch (error) {
      customToast.error(error.response?.data?.message || "Submission failed");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="quiz-loading-overlay">
        <div className="quiz-spinner"></div>
        <p>AI is analyzing the video and generating your quiz...</p>
      </div>
    );
  }

  if (!quiz) return null;

  const totalQuestions = quiz.questions.length;
  const currentQ = quiz.questions[currentQuestionIndex];
  
  const scorePercent = Math.round((score / totalQuestions) * 100);
  const statusStr = scorePercent >= 50 ? 'Passed' : 'Failed';
  const statusColor = scorePercent >= 50 ? '#10b981' : '#ef4444';

  return (
    <div className="quiz-page-overlay animate-fade-in">
      <div className="quiz-card-container">
        
        {/* Results View */}
        {submitted && results ? (
          <div className="quiz-results-card animate-slide-up">
            
            <div className="results-header">
              <h2>Quiz Results</h2>
              <button className="quiz-close-btn" onClick={() => navigate('/youtube')} aria-label="Close Quiz">&times;</button>
            </div>

            <div className="results-stats-row">
              <div className="stat-circle-box">
                <svg width="80" height="80" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={`${scorePercent}, 100`}
                    stroke={statusColor}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{scorePercent}%</text>
                </svg>
              </div>

              <div className="stat-item">
                <span className="stat-label">Correct Answers</span>
                <span className="stat-value">{score}/{totalQuestions}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Time Spent</span>
                <span className="stat-value">{formatTime(timePassed)}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value" style={{ color: statusColor }}>{statusStr}</span>
              </div>
            </div>

            <div className="results-review-section">
              <h3>Question Review</h3>
              
              <div className="review-list">
                {quiz.questions.map((q, idx) => {
                  const res = results[idx];
                  const userAnswer = answers[idx];
                  const isCorrect = res.isCorrect;
                  const cardClass = isCorrect ? 'review-item correct' : 'review-item incorrect';

                  return (
                    <div key={idx} className={cardClass}>
                      <div className="review-item-header">
                        <span className="review-q-num">Q{idx + 1}</span>
                        {isCorrect ? (
                          <svg className="icon-success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        ) : (
                          <svg className="icon-error" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                        )}
                      </div>
                      
                      <p className="review-question">{q.question}</p>
                      
                      <div className="review-answers">
                        <p><strong>Your answer:</strong> {userAnswer || 'Skipped'}</p>
                        {!isCorrect && <p><strong>Correct answer:</strong> {res.correctAnswer}</p>}
                      </div>
                      
                      {res.explanation && (
                        <p className="review-explanation">
                          <em>{res.explanation}</em>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="results-footer">
              <button className="btn-continue" onClick={() => navigate('/youtube')}>
                Continue Learning
              </button>
            </div>
            
          </div>
        ) : (
          
          /* Active Quiz View */
          <div className="quiz-active-card animate-slide-up">
            <div className="quiz-card-header">
              <div className="quiz-header-left">
                <h2>Quiz: {quiz.topic || video?.title || 'Tutorial'}</h2>
                <span className="quiz-progress-text">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              </div>
              <div className="quiz-header-right">
                <div className="quiz-timer">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="12" cy="12" r="10"></circle>
                     <polyline points="12 6 12 12 16 14"></polyline>
                   </svg>
                   {formatTime(timePassed)}
                </div>
                <button className="quiz-close-btn" onClick={() => navigate(-1)} aria-label="Close Quiz">
                  &times;
                </button>
              </div>
            </div>

            <div className="quiz-card-body">
              <h3 className="question-text">
                {currentQ.question}
              </h3>
              
              <div className="options-grid">
                {currentQ.options.map((option, oIndex) => {
                  const isSelected = answers[currentQuestionIndex] === option;
                  const labelLetters = ['A', 'B', 'C', 'D', 'E'];
                  return (
                    <label 
                      key={oIndex} 
                      className={`quiz-option ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleOptionChange(option)}
                      />
                      <div className="option-letter">{labelLetters[oIndex]}</div>
                      <span className="option-label-text">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="quiz-card-footer">
              <button 
                className="quiz-nav-btn" 
                onClick={handlePrevious} 
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>

              <div className="quiz-pagination-dots">
                {quiz.questions.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`dot ${idx === currentQuestionIndex ? 'active' : ''} ${answers[idx] ? 'answered' : ''}`}
                  />
                ))}
              </div>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button 
                  className="quiz-nav-btn primary" 
                  onClick={handleNext}
                >
                  Next
                </button>
              ) : (
                <button 
                  className="quiz-nav-btn submit" 
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
