import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const readStoredUser = () => {
    try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser || typeof parsedUser !== "object") {
            return null;
        }

        if (parsedUser.role !== "teacher") {
            return null;
        }

        return parsedUser;
    } catch (error) {
        console.error("Failed to parse stored user:", error);
        return null;
    }
};

function TeacherDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = readStoredUser();

        if (!storedUser) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");
            navigate("/");
            return;
        }

        setUser(storedUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        navigate("/");
    };

    const displayName =
        user?.name ||
        user?.username ||
        user?.email ||
        "Teacher";

    return (
        <div className="teacher-layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        Q
                    </div>

                    <div>
                        <strong>Quizzer</strong>
                        <span>Examination System</span>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <button
                        className="nav-item active"
                        onClick={() =>
                            navigate("/teacher/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/teacher/students")
                        }
                    >
                        <span>♙</span>
                        Students
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/teacher/classes")}
                    >
                        <span>▦</span>
                        Classes
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/teacher/subjects")
                        }
                    >
                        <span>◈</span>
                        Subjects
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/teacher/exams")
                        }
                    >
                        <span>▣</span>
                        Exams
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/teacher/results")
                        }
                    >
                        <span>◷</span>
                        Results
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="user-avatar">
                            {displayName[0].toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                Teacher
                            </span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        ↪
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* MAIN CONTENT */}

            <main className="dashboard-main">

                {/* TOP BAR */}

                <header className="dashboard-topbar">

                    <div>
                        <p className="eyebrow">
                            TEACHER PORTAL
                        </p>

                        <h1>
                            Welcome back, {displayName} 👋
                        </h1>
                    </div>

                    <div className="topbar-profile">

                        <div className="user-avatar">
                            {displayName[0].toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                {user?.email || ""}
                            </span>
                        </div>

                    </div>

                </header>

                {/* HERO */}

                <section className="teacher-hero">

                    <div>

                        <span className="hero-label">
                            TEACHER WORKSPACE
                        </span>

                        <h2>
                            Manage your examinations
                            with ease.
                        </h2>

                        <p>
                            Create exams, organize students,
                            manage questions and track
                            performance from one place.
                        </p>

                        <button
                            className="hero-button"
                            onClick={() =>
                                navigate("/teacher/exams")
                            }
                        >
                            Manage Exams →
                        </button>

                    </div>

                    <div className="teacher-hero-visual">

                        <div className="hero-stat-card">
                            <span>EXAM CENTER</span>
                            <strong>Q</strong>
                            <small>
                                Create · Manage · Analyze
                            </small>
                        </div>

                    </div>

                </section>
                <br />

                {/* MANAGEMENT SECTION */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>
                            <h2>
                                Management Center
                            </h2>

                            <p>
                                Everything you need to manage
                                your examination system.
                            </p>
                        </div>

                    </div>

                    <div className="teacher-card-grid">

                        {/* STUDENTS */}

                        <article className="management-card">

                            <div className="management-icon purple">
                                ♙
                            </div>

                            <div className="management-content">

                                <h3>
                                    Students
                                </h3>

                                <p>
                                    Add and manage students
                                    enrolled in your exams.
                                </p>

                                <button
                                    className="card-link"
                                    onClick={() =>
                                        navigate(
                                            "/teacher/students"
                                        )
                                    }
                                >
                                    Manage Students →
                                </button>

                            </div>

                        </article>

                        {/* CLASSES */}

                        <article className="management-card">

                            <div className="management-icon purple">
                                ▦
                            </div>

                            <div className="management-content">

                                <h3>Classes</h3>

                                <p>
                                    Create classes and organize
                                    students and exams.
                                </p>

                                <button
                                    className="card-link"
                                    onClick={() => navigate("/teacher/classes")}
                                >
                                    Manage Classes →
                                </button>

                            </div>

                        </article>

                        {/* SUBJECTS */}

                        <article className="management-card">

                            <div className="management-icon blue">
                                ◈
                            </div>

                            <div className="management-content">

                                <h3>
                                    Subjects
                                </h3>

                                <p>
                                    Organize your examinations
                                    by subject.
                                </p>

                                <button
                                    className="card-link"
                                    onClick={() =>
                                        navigate(
                                            "/teacher/subjects"
                                        )
                                    }
                                >
                                    Manage Subjects →
                                </button>

                            </div>

                        </article>

                        {/* EXAMS */}

                        <article className="management-card featured">

                            <div className="management-icon green">
                                ▣
                            </div>

                            <div className="management-content">

                                <div className="card-heading-row">

                                    <h3>
                                        Exams
                                    </h3>

                                    <span className="mini-badge">
                                        CORE
                                    </span>

                                </div>

                                <p>
                                    Create exams, manage
                                    questions and publish them
                                    for students.
                                </p>

                                <button
                                    className="card-link"
                                    onClick={() =>
                                        navigate(
                                            "/teacher/exams"
                                        )
                                    }
                                >
                                    Manage Exams →
                                </button>

                            </div>

                        </article>

                        {/* RESULTS */}

                        <article className="management-card">

                            <div className="management-icon orange">
                                ◷
                            </div>

                            <div className="management-content">

                                <h3>
                                    Results
                                </h3>

                                <p>
                                    Review student performance
                                    and examination results.
                                </p>

                                <button
                                    className="card-link"
                                    onClick={() =>
                                        navigate(
                                            "/teacher/results"
                                        )
                                    }
                                >
                                    View Results →
                                </button>

                            </div>

                        </article>

                    </div>

                </section>

                {/* QUICK ACTIONS */}

                <section className="quick-actions">

                    <div>
                        <h2>
                            Quick Actions
                        </h2>

                        <p>
                            Jump directly into your most
                            frequently used tools.
                        </p>
                    </div>

                    <div className="quick-action-buttons">

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate("/teacher/exams")
                            }
                        >
                            + Create Exam
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate("/teacher/students")
                            }
                        >
                            + Add Student
                        </button>

                    </div>

                </section>

                <footer className="dashboard-footer">
                    Quizzer · Teacher Workspace
                </footer>

            </main>

        </div>
    );
}

export default TeacherDashboard;
