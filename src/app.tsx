import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import AiChatPage from "@/pages/AiChatPage/AiChatPage";
import ImageRecognitionPage from "@/pages/ImageRecognitionPage/ImageRecognitionPage";
import KnowledgeGraphPage from "@/pages/KnowledgeGraphPage/KnowledgeGraphPage";
import ContentGeneratorPage from "@/pages/ContentGeneratorPage/ContentGeneratorPage";
import QuizPage from "@/pages/QuizPage/QuizPage";
import QuizResultPage from "@/pages/QuizResultPage/QuizResultPage";
import WrongAnswerBookPage from "@/pages/WrongAnswerBookPage/WrongAnswerBookPage";
import AboutPage from "@/pages/AboutPage/AboutPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/ai-chat" replace />} />
        <Route path="ai-chat" element={<AiChatPage />} />
        <Route path="image-recognition" element={<ImageRecognitionPage />} />
        <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
        <Route path="content-generator" element={<ContentGeneratorPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="quiz/result" element={<QuizResultPage />} />
        <Route path="quiz/wrong-answers" element={<WrongAnswerBookPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
