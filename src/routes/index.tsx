import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy load page components
const About = lazy(() => import("../pages/AboutPage"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Resources = lazy(() => import("../pages/Resources"));
const Terms = lazy(() => import("../pages/TermsPage"));
const Privacy = lazy(() => import("../pages/PrivacyPolicyPage"));
const Blogs = lazy(() => import("../pages/Blogs"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const NotFound = lazy(() => import("../pages/NotFoundPage"));

// Auth components
const AuthCallback = lazy(
  () => import("../components/auth/GoogleOAuthCallback")
);
const AuthScreen = lazy(() => import("../components/auth/AuthScreen"));

// Main application pages
const Interviews = lazy(() => import("../pages/InterviewsPage"));
const InterviewDetail = lazy(() => import("../pages/InterviewPage"));
const Profile = lazy(() => import("../pages/ProfilePage")); 
const RealtimeSession = lazy(
  () => import("../components/call/RealtimeConnect")
);
const RealtimeDemo = lazy(() => import("../pages/RealtimeConnectDemo"));
const PostQuestion = lazy(
  () => import("../components/interview/PostQuestionScreen")
);
const ResourceLibraryPage = lazy(() => import("../pages/ResourceLibraryPage"));
const CaseMathPage = lazy(() => import("../pages/CaseMathPage"));
// Checkout pages
const CheckoutSuccess = lazy(() => import("../pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("../pages/CheckoutCancel"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth handler routes - accessible without layout */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/signup" element={<AuthScreen />} />

        {/* Main application routes */}
        <Route element={<AuthenticatedLayout />}>
          {/* Redirect from landing page to interviews */}
          <Route path="/" element={<Navigate to="/interviews" replace />} />

          {/* Core application routes */}
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/interview/:id" element={<InterviewDetail />} />
          <Route
            path="/interview/session/:sessionId"
            element={<RealtimeSession />}
          />
          <Route
            path="/lesson/session/:sessionId"
            element={<RealtimeSession />}
          />
          <Route
            path="/interview/analytics/:interviewId"
            element={<PostQuestion />}
          />
          <Route path="/profile" element={<Profile />} />

          {/* Demo route for styling work */}
          <Route path="/demo/realtime" element={<RealtimeDemo />} />

          {/* Checkout routes */}
          <Route path="/checkout" element={<CheckoutSuccess />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />

          {/* Information pages */}
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/library" element={<ResourceLibraryPage />} />
          <Route path="/casemath-braingame" element={<CaseMathPage />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
