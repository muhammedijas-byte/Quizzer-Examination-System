import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const readStoredUser = () => {
    try {
        const rawUser = localStorage.getItem("user");

        if (!rawUser) {
            return null;
        }

        const parsedUser = JSON.parse(rawUser);

        if (!parsedUser || typeof parsedUser !== "object") {
            return null;
        }

        if (parsedUser.role !== "student") {
            return null;
        }

        return parsedUser;
    } catch (error) {
        console.error("Failed to parse stored user:", error);
        return null;
    }
};

function StudentDashboard() {
    const navigate = useNavigate();

    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = readStoredUser() || {};

    const firstName =
        user.first_name ||
        user.name?.trim().split(/\s+/)[0] ||
        user.username ||
        "Student";

    // ---------------------------------------
    // COMPLETED EXAMS
    // ---------------------------------------

    const completedExamIds = new Set(
        results.map((result) => result.exam)
    );

    const availableExams = exams.filter(
        (exam) => !completedExamIds.has(exam.id)
    );

    const completedExams = results;

    // ---------------------------------------
    // FETCH DASHBOARD
    // ---------------------------------------

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("access");

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [examResponse, resultResponse] =
                    await Promise.all([
                        api.get("exams/available/", {
                            headers,
                        }),
                        api.get("results/my-results/", {
                            headers,
                        }),
                    ]);

                setExams(examResponse.data);
                setResults(resultResponse.data);
            } catch (error) {
                console.error(
                    "Failed to load dashboard:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    // ---------------------------------------
    // NAVIGATION
    // ---------------------------------------

    const scrollToSection = (sectionId) => {
        document
            .getElementById(sectionId)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    };

    // ---------------------------------------
    // LOGOUT
    // ---------------------------------------

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        navigate("/");
    };

    // ---------------------------------------
    // LOADING
    // ---------------------------------------

    if (loading) {
        return (
            <div className="student-layout">

                <aside className="sidebar">

                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            Q
                        </div>

                        <div>
                            <strong>Quizzer</strong>
                            <span>
                                Examination System
                            </span>
                        </div>
                    </div>

                </aside>

                <main className="dashboard-main">

                    <div className="dashboard-loading">
                        <div className="loading-spinner"></div>

                        <p>
                            Loading your dashboard...
                        </p>
                    </div>

                </main>

            </div>
        );
    }

    // ---------------------------------------
    // ERROR
    // ---------------------------------------

    if (error) {
        return (
            <div className="student-layout">

                <aside className="sidebar">

                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            Q
                        </div>

                        <div>
                            <strong>Quizzer</strong>
                            <span>
                                Examination System
                            </span>
                        </div>
                    </div>

                    <div className="sidebar-bottom">

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            <span>↪</span>
                            Logout
                        </button>

                    </div>

                </aside>

                <main className="dashboard-main">

                    <div className="page-container">

                        <div className="alert alert-error">
                            <span>!</span>
                            {error}
                        </div>

                        <button
                            className="primary-button"
                            onClick={handleLogout}
                        >
                            Back to Login
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    // ---------------------------------------
    // STATISTICS
    // ---------------------------------------

    const availableCount =
        availableExams.length;

    const completedCount =
        completedExams.length;

    const resultCount =
        results.length;

    return (
        <div className="student-layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        Q
                    </div>

                    <div>
                        <strong>Quizzer</strong>
                        <span>
                            Examination System
                        </span>
                    </div>

                </div>

                <nav className="sidebar-nav">

                    <button
                        className="nav-item active"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            })
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            scrollToSection(
                                "available-exams"
                            )
                        }
                    >
                        <span>▣</span>
                        Available Exams
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            scrollToSection(
                                "completed-exams"
                            )
                        }
                    >
                        <span>✓</span>
                        Completed Exams
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            scrollToSection(
                                "my-results"
                            )
                        }
                    >
                        <span>◷</span>
                        My Results
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="user-avatar">
                            {(
                                user.username ||
                                user.email ||
                                "S"
                            )[0].toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {user.username ||
                                    "Student"}
                            </strong>

                            <span>
                                Student
                            </span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                {/* TOP BAR */}

                <header className="dashboard-topbar">

                    <div>

                        <p className="eyebrow">
                            STUDENT PORTAL
                        </p>

                        <h1>
                            Welcome back,{" "}
                            {firstName} 👋
                        </h1>

                    </div>

                    <div className="topbar-profile">

                        <div className="user-avatar">
                            {(
                                user.username ||
                                user.email ||
                                "S"
                            )[0].toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {user.username ||
                                    "Student"}
                            </strong>

                            <span>
                                {user.email || ""}
                            </span>
                        </div>

                    </div>

                </header>

                {/* HERO */}

                <section className="student-hero">

                    <div>

                        <span className="hero-label">
                            KEEP LEARNING
                        </span>

                        <h2>
                            Ready for your next
                            challenge?
                        </h2>

                        <p>
                            Take an available exam,
                            track your progress and
                            review your results.
                        </p>

                        <button
                            className="hero-button"
                            onClick={() =>
                                scrollToSection(
                                    "available-exams"
                                )
                            }
                        >
                            Explore Exams →
                        </button>

                    </div>

                    <div className="hero-decoration">

                        <div className="hero-circle">
                            ?
                        </div>

                    </div>

                </section>

                {/* STATISTICS */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon purple">
                            ◈
                        </div>

                        <div>
                            <span>
                                Available Exams
                            </span>

                            <strong>
                                {availableCount}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon green">
                            ✓
                        </div>

                        <div>
                            <span>
                                Completed Exams
                            </span>

                            <strong>
                                {completedCount}
                            </strong>
                        </div>

                    </div>

                    <div className="stat-card">

                        <div className="stat-icon orange">
                            %
                        </div>

                        <div>
                            <span>
                                Results
                            </span>

                            <strong>
                                {resultCount}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* =======================================
                    AVAILABLE EXAMS
                ======================================= */}

                <section
                    id="available-exams"
                    className="dashboard-section"
                >

                    <div className="section-header">

                        <div>

                            <h2>
                                Available Exams
                            </h2>

                            <p>
                                Exams currently available
                                for you to take.
                            </p>

                        </div>

                        <span className="section-count">
                            {availableCount}{" "}
                            {availableCount === 1
                                ? "exam"
                                : "exams"}
                        </span>

                    </div>

                    {availableExams.length === 0 ? (

                        <div className="empty-state card">

                            <div className="empty-icon">
                                ✓
                            </div>

                            <h3>
                                No exams available
                            </h3>

                            <p>
                                There are currently no new
                                examinations available
                                for you.
                            </p>

                        </div>

                    ) : (

                        <div className="exam-grid">

                            {availableExams.map(
                                (exam) => (

                                    <article
                                        className="exam-card"
                                        key={exam.id}
                                    >

                                        <div className="exam-card-top">

                                            <span className="subject-badge">
                                                {
                                                    exam.subject_name
                                                }
                                            </span>

                                        </div>

                                        <h3>
                                            {exam.title}
                                        </h3>

                                        <p className="exam-description">
                                            {exam.description ||
                                                "Test your knowledge with this examination."}
                                        </p>

                                        <div className="exam-meta">

                                            <span>
                                                ◉{" "}
                                                {
                                                    exam.question_count
                                                }{" "}
                                                Questions
                                            </span>

                                            <span>
                                                ◷{" "}
                                                {exam.duration}{" "}
                                                min
                                            </span>

                                        </div>

                                        <div className="exam-card-footer">

                                            <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    navigate(
                                                        `/student/exam/${exam.id}`
                                                    )
                                                }
                                            >
                                                Start Exam →
                                            </button>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

                </section>

                {/* =======================================
                    COMPLETED EXAMS
                ======================================= */}

                <section
                    id="completed-exams"
                    className="dashboard-section"
                >

                    <div className="section-header">

                        <div>

                            <h2>
                                Completed Exams
                            </h2>

                            <p>
                                Examinations you have
                                already completed.
                            </p>

                        </div>

                        <span className="section-count">
                            {completedCount}{" "}
                            {completedCount === 1
                                ? "exam"
                                : "exams"}
                        </span>

                    </div>

                    {completedExams.length === 0 ? (

                        <div className="empty-state card">

                            <div className="empty-icon">
                                ◷
                            </div>

                            <h3>
                                No completed exams
                            </h3>

                            <p>
                                Exams you complete will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="exam-grid">

                            {completedExams.map(
                                (result) => {
                                    return (
                                        <article
                                            className="exam-card"
                                            key={result.id}
                                        >

                                            <div className="exam-card-top">

                                                <span className="subject-badge">
                                                    {
                                                        result.subject_name
                                                    }
                                                </span>

                                                <span className="status-badge status-published">
                                                    ✓ Completed
                                                </span>

                                            </div>

                                            <h3>
                                                {result.exam_name}
                                            </h3>

                                            <p className="exam-description">
                                                You have already completed this examination.
                                            </p>

                                            <div className="exam-meta">

                                                <span>
                                                    ◉{" "}
                                                    {
                                                        result.total_questions
                                                    }{" "}
                                                    Questions
                                                </span>

                                                <span>
                                                    ◷{" "}
                                                    Score: {result.score}/{result.total_questions}
                                                </span>

                                            </div>

                                            <div className="exam-card-footer">

                                                {result && (
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() =>
                                                            navigate(
                                                                `/student/result/${result.id}`
                                                            )
                                                        }
                                                    >
                                                        View Result →
                                                    </button>
                                                )}

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

                {/* =======================================
                    MY RESULTS
                ======================================= */}

                <section
                    id="my-results"
                    className="dashboard-section"
                >

                    <div className="section-header">

                        <div>

                            <h2>
                                My Results
                            </h2>

                            <p>
                                Review your completed
                                examination results.
                            </p>

                        </div>

                        <span className="section-count">
                            {resultCount}{" "}
                            {resultCount === 1
                                ? "result"
                                : "results"}
                        </span>

                    </div>

                    {results.length === 0 ? (

                        <div className="empty-state card">

                            <div className="empty-icon">
                                ◷
                            </div>

                            <h3>
                                No results yet
                            </h3>

                            <p>
                                Complete an exam to see
                                your results here.
                            </p>

                        </div>

                    ) : (

                        <div className="data-table-wrapper">

                            <table className="data-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Exam
                                        </th>

                                        <th>
                                            Subject
                                        </th>

                                        <th>
                                            Score
                                        </th>

                                        <th>
                                            Performance
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {results.map(
                                        (result) => (

                                            <tr
                                                key={
                                                    result.id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            result.exam_name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        result.subject_name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        result.score
                                                    }{" "}
                                                    /{" "}
                                                    {
                                                        result.total_questions
                                                    }
                                                </td>

                                                <td>

                                                    <div className="performance-cell">

                                                        <strong>
                                                            {
                                                                result.percentage
                                                            }%
                                                        </strong>

                                                        <div className="progress-bar">

                                                            <div
                                                                className="progress-fill"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Math.max(
                                                                            Number(
                                                                                result.percentage ||
                                                                                0
                                                                            ),
                                                                            0
                                                                        ),
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            ></div>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="status-badge status-published">
                                                        {
                                                            result.status
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="table-action"
                                                        onClick={() =>
                                                            navigate(
                                                                `/student/result/${result.id}`
                                                            )
                                                        }
                                                    >
                                                        View →
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

                {/* FOOTER */}

                <footer className="dashboard-footer">
                    Quizzer · Examination System
                </footer>

            </main>

        </div>
    );
}

export default StudentDashboard;
