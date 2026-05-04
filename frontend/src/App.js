import React, { useState } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

const API_URL = 'http://localhost:8003';

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'java',
  'cpp', 'go', 'rust', 'ruby', 'php', 'swift'
];

const FOCUS_OPTIONS = [
  { value: 'general', label: '🔍 General Review', desc: 'Bugs, best practices, readability' },
  { value: 'security', label: '🔒 Security Audit', desc: 'Vulnerabilities and unsafe practices' },
  { value: 'performance', label: '⚡ Performance', desc: 'Optimization opportunities' },
  { value: 'beginner', label: '🎓 Beginner Friendly', desc: 'Clear explanations for learners' },
];

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [focus, setFocus] = useState('general');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please paste some code to review!');
      return;
    }
    setLoading(true);
    setError(null);
    setReview(null);

    try {
      const response = await axios.post(`${API_URL}/review`, {
        code,
        language,
        focus,
      });
      setReview(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleClear = () => {
    setCode('');
    setReview(null);
    setError(null);
    setCharCount(0);
  };

  const handleExample = () => {
    const examples = {
      python: `def calculate_discount(price, discount):
    result = price - (price * discount / 100)
    query = "SELECT * FROM users WHERE id = " + str(price)
    password = "admin123"
    for i in range(1000000):
        result += i
    return result`,
      javascript: `function getUserData(userId) {
    var data = null;
    $.ajax({
        url: '/api/users/' + userId,
        async: false,
        success: function(response) {
            data = response;
        }
    });
    eval(data.script);
    return data;
}`,
      java: `public class UserService {
    public String getPassword(int userId) {
        String query = "SELECT password FROM users WHERE id = " + userId;
        Statement stmt = connection.createStatement();
        ResultSet rs = stmt.executeQuery(query);
        return rs.getString("password");
    }
}`,
    };
    setCode(examples[language] || examples.python);
    setCharCount((examples[language] || examples.python).length);
  };

  const formatReview = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h3 key={index} className="review-heading">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="review-item">{line.replace(/^[-*] /, '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="review-text">{line}</p>;
    });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>🔍 reviewr</h1>
          <span className="badge">AI Powered</span>
        </div>
        <p className="header-subtitle">Instant AI code reviews powered by Groq + Llama 3</p>
      </header>

      <div className="main-grid">
        <div className="left-panel">
          <div className="panel-header">
            <h2>Your Code</h2>
            <div className="panel-actions">
              <button className="btn-example" onClick={handleExample}>
                Load Example
              </button>
              <button className="btn-clear" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>

          <div className="options-row">
            <div className="option-group">
              <label>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="option-group">
              <label>Review Focus</label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
              >
                {FOCUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="focus-cards">
            {FOCUS_OPTIONS.map(opt => (
              <div
                key={opt.value}
                className={`focus-card ${focus === opt.value ? 'active' : ''}`}
                onClick={() => setFocus(opt.value)}
              >
                <div className="focus-label">{opt.label}</div>
                <div className="focus-desc">{opt.desc}</div>
              </div>
            ))}
          </div>

          <div className="code-area-container">
            <textarea
              className="code-area"
              value={code}
              onChange={handleCodeChange}
              placeholder={`Paste your ${language} code here...`}
              spellCheck={false}
            />
            <div className="char-count">{charCount} characters</div>
          </div>

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn-review"
            onClick={handleReview}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                Analyzing your code...
              </span>
            ) : (
              '🔍 Review My Code'
            )}
          </button>
        </div>

        <div className="right-panel">
          <div className="panel-header">
            <h2>AI Review</h2>
            {review && (
              <span className="review-badge">
                {FOCUS_OPTIONS.find(o => o.value === review.focus)?.label}
              </span>
            )}
          </div>

          {!review && !loading && (
            <div className="empty-review">
              <div className="empty-icon">🤖</div>
              <h3>Ready to review your code!</h3>
              <p>Paste your code on the left and click "Review My Code"</p>
              <div className="features-list">
                <div className="feature">🐛 Bug Detection</div>
                <div className="feature">🔒 Security Audit</div>
                <div className="feature">⚡ Performance Tips</div>
                <div className="feature">📝 Best Practices</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-review">
              <div className="loading-animation">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p>AI is reviewing your code...</p>
              <p className="loading-sub">This takes 3-5 seconds</p>
            </div>
          )}

          {review && (
            <div className="review-content">
              <div className="review-meta">
                <span>📝 {review.language}</span>
                <span>🎯 {review.focus}</span>
              </div>
              <div className="review-body">
                {formatReview(review.review)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;