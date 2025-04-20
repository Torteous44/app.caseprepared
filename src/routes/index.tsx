import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PublicLayout from "../layouts/PublicLayout";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy load page components
const Landing = lazy(() => import("../pages/landingPage"));
const About = lazy(() => import("../pages/AboutPage"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Resources = lazy(() => import("../pages/Resources"));
const Terms = lazy(() => import("../pages/TermsPage"));
const Privacy = lazy(() => import("../pages/PrivacyPolicyPage"));
const Blogs = lazy(() => import("../pages/Blogs"));
const BlogPost = lazy(() => import("../pages/BlogPost"));
const NotFound = lazy(() => import("../pages/NotFoundPage"));

// Authenticated pages
const Interviews = lazy(() => import("../pages/AuthenticatedInterviewsPage"));
const InterviewDetail = lazy(
  () => import("../pages/AuthenticatedInterviewPage")
);
const Profile = lazy(() => import("../pages/ProfilePage"));
const Subscription = lazy(() => import("../pages/SubscriptionPage"));
const RealtimeSession = lazy(
  () => import("../components/call/AuthenticatedRealtimeConnect")
);
const PostQuestion = lazy(
  () => import("../components/interview/PostQuestionScreen")
);

// Public variants
const PublicInterviews = lazy(() => import("../pages/InterviewsPage"));
const PublicInterviewDetail = lazy(() => import("../pages/InterviewPage"));
const DemoSession = lazy(
  () => import("../components/call/DemoRealtimeConnect")
);

// Checkout pages
const CheckoutSuccess = lazy(() => import("../pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("../pages/CheckoutCancel"));

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Authenticated Routes */}
        {isAuthenticated ? (
          <Route element={<AuthenticatedLayout />}>
            {/* Redirect from landing page to interviews */}
            <Route path="/" element={<Navigate to="/interviews" replace />} />

            {/* Authenticated-specific routes */}
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/my-interview/:id" element={<InterviewDetail />} />
            <Route
              path="/interview/authenticated-session/:sessionId"
              element={<RealtimeSession />}
            />
            <Route
              path="/interview/post-question/:interviewId"
              element={<PostQuestion />}
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<Subscription />} />

            {/* Demo interview routes for authenticated users */}
            <Route path="/interview/:id" element={<PublicInterviewDetail />} />
            <Route
              path="/interview/session/:sessionId"
              element={<DemoSession />}
            />
            <Route
              path="/interview/demo-session/:demoTypeId"
              element={<DemoSession />}
            />

            {/* Public pages accessible to authenticated users */}
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          </Route>
        ) : (
          /* Public Routes */
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/interviews" element={<PublicInterviews />} />
            <Route path="/interview/:id" element={<PublicInterviewDetail />} />
            <Route
              path="/interview/session/:sessionId"
              element={<DemoSession />}
            />
            <Route
              path="/interview/demo-session/:demoTypeId"
              element={<DemoSession />}
            />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          </Route>
        )}

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
