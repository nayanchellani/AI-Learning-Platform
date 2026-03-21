import { useState } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import './CodeReview.css';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const DEFAULT_CODE = `function greet(name) {
  console.log("Hello " + name)
  return name
}

greet("World")`;

const CodeReview = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }
    setError('');
    setLoading(true);
    setFeedback(null);

    try {
      const res = await axios.post('/api/code/review', { code, language });
      setFeedback(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review code');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = () => {
    if (!code.trim()) {
      setOutput('Error: No code to run.');
      return;
    }
    setRunning(true);
    setOutput('');

    setTimeout(() => {
      try {
        if (language === 'javascript') {
          const logs = [];
          const fakeConsole = { log: (...args) => logs.push(args.join(' ')), error: (...args) => logs.push('Error: ' + args.join(' ')), warn: (...args) => logs.push('Warning: ' + args.join(' ')) };
          const fn = new Function('console', code);
          fn(fakeConsole);
          setOutput(logs.length > 0 ? logs.join('\n') : '(No console output)');
        } else {
          setOutput(`Run is only available for JavaScript in-browser.\nFor ${language}, use your local environment.`);
        }
      } catch (err) {
        setOutput('Runtime Error: ' + err.message);
      } finally {
        setRunning(false);
      }
    }, 300);
  };

  const scoreNum = feedback?.score ? parseInt(feedback.score) : 0;

  return (
    <div className="cr-page">
      <div className="cr-top-bar">
        <div className="cr-top-left">
          <button className="cr-run-btn" onClick={handleRun} disabled={running}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
        <button className="cr-review-btn" onClick={handleReview} disabled={loading}>
          {loading ? 'Analyzing...' : 'Review Code'}
        </button>
      </div>

      <div className="cr-split">
        <div className="cr-panel cr-editor-panel">
          <div className="cr-panel-header">
            <span className="cr-panel-title">Code Editor</span>
            <div className="cr-editor-controls">
              <span className="cr-char-count">{code.length} / 5000</span>
              <div className="cr-select-wrapper">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="cr-lang-select">
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <svg className="cr-select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div className="cr-editor-body">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
              }}
            />
          </div>
        </div>

        <div className="cr-panel cr-review-panel">
          <div className="cr-panel-header">
            <span className="cr-panel-title">Code Review</span>
          </div>

          <div className="cr-review-body">
            {!feedback && !loading && !error && (
              <div className="cr-empty-state">
                <h3>No review yet</h3>
                <p>Click "Review Code" to analyze:</p>
                <ul className="cr-empty-checklist">
                  <li>Errors & issues</li>
                  <li>Improvements</li>
                  <li>Best practices</li>
                  <li>Code quality score</li>
                </ul>
              </div>
            )}

            {loading && (
              <div className="cr-loading-state">
                <div className="cr-loading-ring"></div>
                <h3>Analyzing your code...</h3>
                <p>Checking for issues and improvements</p>
              </div>
            )}

            {error && (
              <div className="cr-card cr-card-error">
                <div className="cr-card-header">
                  <span className="cr-card-dot dot-red"></span>
                  Error
                </div>
                <p>{error}</p>
              </div>
            )}

            {feedback && (
              <div className="cr-feedback-grid">
                <div className="cr-score-card">
                  <div className="cr-score-bar-wrap">
                    <div className="cr-score-bar-bg">
                      <div className="cr-score-bar-fill" style={{ width: `${scoreNum * 10}%` }}></div>
                    </div>
                    <span className="cr-score-value">{feedback.score || '?/10'}</span>
                  </div>
                  <span className="cr-score-label">Code Quality</span>
                </div>

                {feedback.issues && feedback.issues.length > 0 && (
                  <div className="cr-card cr-card-issues">
                    <div className="cr-card-header">
                      <span className="cr-card-dot dot-red"></span>
                      Issues
                    </div>
                    <div className="cr-card-content">
                      {feedback.issues.map((issue, i) => (
                        <div className="cr-issue-item" key={i}>
                          <div className="cr-issue-top">
                            {issue.line && <span className="cr-issue-line">L{issue.line}</span>}
                            <span className="cr-issue-problem">{issue.problem}</span>
                          </div>
                          {issue.fix && <span className="cr-issue-fix">{issue.fix}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback.improvements && feedback.improvements.length > 0 && (
                  <div className="cr-card cr-card-improvements">
                    <div className="cr-card-header">
                      <span className="cr-card-dot dot-yellow"></span>
                      Improvements
                    </div>
                    <div className="cr-card-content">
                      {feedback.improvements.map((item, i) => (
                        <div className="cr-list-item" key={i}>{item}</div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback.bestPractices && feedback.bestPractices.length > 0 && (
                  <div className="cr-card cr-card-best">
                    <div className="cr-card-header">
                      <span className="cr-card-dot dot-green"></span>
                      Best Practices
                    </div>
                    <div className="cr-card-content">
                      {feedback.bestPractices.map((item, i) => (
                        <div className="cr-list-item" key={i}>{item}</div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback.explanation && (
                  <div className="cr-card cr-card-explanation">
                    <div className="cr-card-header">
                      <span className="cr-card-dot dot-blue"></span>
                      Explanation
                    </div>
                    <div className="cr-card-content">
                      <p>{feedback.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cr-output-panel">
        <div className="cr-panel-header">
          <span className="cr-panel-title">Output</span>
          {output && (
            <button className="cr-clear-btn" onClick={() => setOutput('')}>Clear</button>
          )}
        </div>
        <pre className="cr-output-content">{output || 'Run your code to see output here...'}</pre>
      </div>
    </div>
  );
};

export default CodeReview;
