import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import ArticlePreview from './pages/ArticlePreview';
import Community from './pages/dashboard/Community';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import WriteArticle from './pages/dashboard/WriteArticle';
import BlogTitles from './pages/dashboard/BlogTitles';
import GenerateImages from './pages/dashboard/GenerateImages';
import RemoveBackground from './pages/dashboard/RemoveBackground';
import RemoveObject from './pages/dashboard/RemoveObject';
import ReviewResume from './pages/dashboard/ReviewResume';
import { useAuth } from '@clerk/clerk-react';

export default function App() {

  const {getToken} = useAuth()

  // Ensure Clerk session is available once on app load
  void getToken()


  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/preview" element={<ArticlePreview />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="community" element={<Community />} />
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="blog-titles" element={<BlogTitles />} />
          <Route path="generate-images" element={<GenerateImages />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="remove-object" element={<RemoveObject />} />
          <Route path="review-resume" element={<ReviewResume />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
