import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Components
import Navbar from './pages/navbar/Navbar';
import Toast from './pages/toast/Toast';

// Import Pages
import Signup from './pages/signup/Signup';
import Login from './pages/login/Login';
import Profile from './pages/profile/Profile';
import Roadmaps from './pages/roadmaps/Roadmaps';
import CodeReview from './pages/codereview/CodeReview';
import YoutubePage from './pages/youtubepage/YoutubePage';
import YtTutorial from './pages/yttutorial/YtTutorial';
import Quiz from './pages/quiz/Quiz';
import Logout from './pages/logout/Logout';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar stays rendered across all routes */}
      <Navbar />
      
      {/* Toast notifications component */}
      <Toast />

      {/* Main Page Layout */}
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<YoutubePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/roadmaps" element={<Roadmaps />} />
          <Route path="/code-review" element={<CodeReview />} />
          <Route path="/youtube" element={<YoutubePage />} />
          <Route path="/tutorial/:id" element={<YtTutorial />} />
          <Route path="/quiz/:videoId" element={<Quiz />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
