import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { customToast } from '../../utils/toastUtils';
import './Quiz.css';

ChartJS.register(ArcElement, Tooltip, Legend);

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

  useEffect(() => {
    if (!quiz) {
      if (video) {
        generateQuiz(video);
      } else {
        fetchExistingQuiz();
      }
    }
  }, []);

  const fetchExistingQuiz = async () => {
    try {
      const res = await axios.get(`/api/quizzes/${videoId}`);
      setQuiz(res.data);
    } catch (error) {
      customToast.error("No quiz found. Please select a video first.");
      navigate('/youtube');
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

  const handleOptionChange = (questionIndex, optionValue) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionIndex]: optionValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  if (loading) {
    return (
      <div className="quiz-loading-container">
        <div className="quiz-spinner"></div>
        <p>AI is analyzing the video and generating your quiz...</p>
      </div>
    );
  }

  if (!quiz) return null;

  const totalQuestions = quiz.questions.length;
  const chartData = submitted ? {
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      data: [score, totalQuestions - score],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4
    }],
  } : null;

  const chartOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ededed',
          font: { family: 'Inter', size: 14 }
        }
      }
    }
  };

  return (
    <div className="quiz-page animate-fade-in">
      <div className="quiz-header-container">
        <button className="quiz-back-btn" onClick={() => navigate(-1)}>
          &larr; Back to Tutorial
        </button>
        <h1 className="quiz-page-title">Knowledge Check</h1>
        <p className="quiz-page-subtitle">Based on: {video?.title || quiz.title}</p>
      </div>

      <div className="quiz-content-wrapper">
        <div className="quiz-form-col">
          <form className="quiz-form" onSubmit={handleSubmit}>
            {quiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="quiz-question-card">
                <h3 className="question-text">
                  <span className="question-number">{qIndex + 1}.</span> {q.question}
                </h3>
                
                <div className="options-grid">
                  {q.options.map((option, oIndex) => {
                    const isSelected = answers[qIndex] === option;
                    let optionClass = "quiz-option";
                    
                    if (submitted && results) {
                      const result = results[qIndex];
                      if (option === result.correctAnswer) {
                        optionClass += " correct";
                      } else if (isSelected && option !== result.correctAnswer) {
                        optionClass += " incorrect";
                      } else {
                        optionClass += " disabled";
                      }
                    } else if (isSelected) {
                      optionClass += " selected";
                    }

                    return (
                      <label 
                        key={oIndex} 
                        className={optionClass}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleOptionChange(qIndex, option)}
                          disabled={submitted}
                        />
                        <span className="option-label-text">{option}</span>
                      </label>
                    );
                  })}
                </div>

                {submitted && results && results[qIndex].explanation && (
                  <div className={`explanation-box ${results[qIndex].isCorrect ? 'correct' : 'incorrect'}`}>
                    <p>{results[qIndex].explanation}</p>
                  </div>
                )}
              </div>
            ))}

            {!submitted && (
              <button type="submit" className="quiz-submit-btn">
                Submit Answers
              </button>
            )}
          </form>
        </div>

        {submitted && chartData && (
          <div className="quiz-results-col animate-slide-left">
            <div className="results-card">
              <h2>Your Results</h2>
              <div className="score-display">
                <span className="score-big">{score}</span>
                <span className="score-out-of">/ {totalQuestions}</span>
              </div>
              
              <div className="chart-container">
                <Doughnut data={chartData} options={chartOptions} />
                <div className="chart-center-text">
                  {Math.round((score / totalQuestions) * 100)}%
                </div>
              </div>

              <div className="results-actions">
                <button className="action-btn retry" onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setScore(0);
                  setResults(null);
                }}>
                  Retry Quiz
                </button>
                <button className="action-btn continue" onClick={() => navigate('/youtube')}>
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
