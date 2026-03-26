import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './pages/navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Signup from './pages/signup/Signup';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';

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
        <Toaster position="bottom-center" reverseOrder={false} toastOptions={{ style: { marginBottom: '20px' } }} />
        
        <div className="main-layout-wrapper">
          <Routes>
            {/* Public Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/roadmaps" element={<Roadmaps />} />
              <Route path="/code-review" element={<CodeReview />} />
              <Route path="/youtube" element={<YoutubePage />} />
              <Route path="/tutorial/:id" element={<YtTutorial />} />
              <Route path="/quiz/:videoId" element={<Quiz />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
