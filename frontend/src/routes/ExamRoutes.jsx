import ReadingExamPage from "../pages/ExamPages/ReadingExamPage.jsx";
import ReadingResultPage from "../pages/ExamPages/ReadingResultPage.jsx";
import ListeningExamPage from "../pages/ExamPages/ListeningExamPage.jsx";
import ListeningResultPage from "../pages/ExamPages/ListeningResultPage.jsx";
import WritingExamPage from "../pages/ExamPages/WritingExamPage.jsx";
import WritingResultPage from "../pages/ExamPages/WritingResultPage.jsx";
import SpeakingExamPage from "../pages/ExamPages/SpeakingExamPage.jsx";
import SpeakingResultPage from "../pages/ExamPages/SpeakingResultPage.jsx";

export const examRoutes = [
    { path: '/exams/:examId/submissions/:submissionId/reading', element: <ReadingExamPage /> },
    { path: '/exams/:examId/submissions/:submissionId/reading/result', element: <ReadingResultPage /> },
    { path: '/exams/:examId/submissions/:submissionId/listening', element: <ListeningExamPage /> },
    { path: '/exams/:examId/submissions/:submissionId/listening/result', element: <ListeningResultPage /> },
    { path: '/exams/:examId/submissions/:submissionId/writing', element: <WritingExamPage /> },
    { path: '/exams/:examId/submissions/:submissionId/writing/result', element: <WritingResultPage /> },
    { path: '/exams/:examId/submissions/:submissionId/speaking', element: <SpeakingExamPage /> },
    { path: '/exams/:examId/submissions/:submissionId/speaking/result', element: <SpeakingResultPage /> },
]
