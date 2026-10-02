import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Register from "./pages/Register";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Exams from "./pages/Exams";
import StudentResult from "./pages/StudentResult";
import Questions from "./pages/Questions";
import TeacherResults from "./pages/TeacherResults";
import Classes from "./pages/Classes";
import Exam from "./pages/Exam";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/teacher/dashboard"
                    element={
                        <ProtectedRoute role="teacher">
                            <TeacherDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/students"
                    element={
                        <ProtectedRoute role="teacher">
                            <Students />
                        </ProtectedRoute>
                    }
                />
                <Route path="/teacher/classes" element={<ProtectedRoute role="teacher"><Classes /></ProtectedRoute>} />
                <Route
                    path="/teacher/subjects"
                    element={
                        <ProtectedRoute role="teacher">
                            <Subjects />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/exams"
                    element={
                        <ProtectedRoute role="teacher">
                            <Exams />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/questions"
                    element={
                        <ProtectedRoute role="teacher">
                            <Questions />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/results"
                    element={
                        <ProtectedRoute role="teacher">
                            <TeacherResults />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/dashboard"
                    element={
                        <ProtectedRoute role="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/exam/:examId"
                    element={
                        <ProtectedRoute role="student">
                            <Exam />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/student/result/:attemptId"
                    element={
                        <ProtectedRoute role="student">
                            <StudentResult />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
