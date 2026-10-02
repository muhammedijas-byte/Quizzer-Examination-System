import { useLocation, useNavigate } from "react-router-dom";

function TeacherLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        navigate("/");
    };

    const isActive = (path) => {
        if (path === "/teacher/exams") {
            return location.pathname.startsWith("/teacher/exams") ||
                   location.pathname.startsWith("/teacher/questions")
                ? "nav-item active"
                : "nav-item";
        }

        return location.pathname === path
            ? "nav-item active"
            : "nav-item";
    };

    return (
        <div className="teacher-layout">

            {/* SIDEBAR */}
            <aside className="sidebar">

                {/* BRAND */}
                <div className="sidebar-brand">

                    <div className="brand-icon">
                        Q
                    </div>

                    <div>
                        <strong>Quizzer</strong>
                        <span>Examination System</span>
                    </div>

                </div>

                {/* NAVIGATION */}
                <nav className="sidebar-nav">

                    <button
                        className={isActive("/teacher/dashboard")}
                        onClick={() =>
                            navigate("/teacher/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className={isActive("/teacher/students")}
                        onClick={() =>
                            navigate("/teacher/students")
                        }
                    >
                        <span>♙</span>
                        Students
                    </button>

                    <button className={isActive("/teacher/classes")} onClick={() => navigate("/teacher/classes")}>
                        <span>▦</span>
                        Classes
                    </button>

                    <button
                        className={isActive("/teacher/subjects")}
                        onClick={() =>
                            navigate("/teacher/subjects")
                        }
                    >
                        <span>◆</span>
                        Subjects
                    </button>

                    <button
                        className={isActive("/teacher/exams")}
                        onClick={() =>
                            navigate("/teacher/exams")
                        }
                    >
                        <span>▣</span>
                        Exams
                    </button>

                    <button
                        className={isActive("/teacher/results")}
                        onClick={() =>
                            navigate("/teacher/results")
                        }
                    >
                        <span>◷</span>
                        Results
                    </button>

                </nav>

                {/* SIDEBAR BOTTOM */}
                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="sidebar-user-avatar">
                            T
                        </div>

                        <div>
                            <strong>Teacher</strong>
                            <span>Teacher Portal</span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* PAGE CONTENT */}
            <main className="dashboard-main">
                {children}
            </main>

        </div>
    );
}

export default TeacherLayout;
