import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import LessonPlanGenerator from "./pages/LessonPlan/LessonPlanGenerator";
import QuizChecker from "./pages/QuizChecker";
import FileConverter from "./pages/FileConverter";
import Bamboozle from "./pages/Games/Bamboozle";
import ExamGenerator from "./pages/ExamGenerator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/lesson-plan" element={<LessonPlanGenerator />} />
        <Route
          path="/file-converter"
          element={
            <ProtectedRoute>
              <FileConverter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bamboozle"
          element={
            <ProtectedRoute>
              <Bamboozle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-checker"
          element={
            <ProtectedRoute>
              <QuizChecker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-generator"
          element={
            <ProtectedRoute>
              <ExamGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
