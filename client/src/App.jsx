import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './pages/navbar/Navbar';

import Signup from './pages/signup/Signup';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Roadmaps from './pages/roadmaps/Roadmaps';
import CodeReview from './pages/codereview/CodeReview';
import YoutubePage from './pages/youtubepage/YoutubePage';
import YtTutorial from './pages/yttutorial/YtTutorial';
import Quiz from './pages/quiz/Quiz';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-center" reverseOrder={false} />
        
        <div className="main-layout-wrapper">
          <Routes>
            <Route path="/" element={<YoutubePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/code-review" element={<CodeReview />} />
            <Route path="/youtube" element={<YoutubePage />} />
            <Route path="/tutorial/:id" element={<YtTutorial />} />
            <Route path="/quiz/:videoId" element={<Quiz />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
