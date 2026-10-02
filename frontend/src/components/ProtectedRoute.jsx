import { Navigate } from "react-router-dom";

const clearSession = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
};

const parseStoredUser = () => {
    try {
        const rawUser = localStorage.getItem("user");

        if (!rawUser) {
            return null;
        }

        const parsedUser = JSON.parse(rawUser);

        if (!parsedUser || typeof parsedUser !== "object") {
            return null;
        }

        const safeRole = typeof parsedUser.role === "string"
            ? parsedUser.role
            : null;

        if (!safeRole || !["teacher", "student"].includes(safeRole)) {
            return null;
        }

        return { ...parsedUser, role: safeRole };
    } catch (error) {
        console.error("Failed to parse stored user:", error);
        return null;
    }
};

function ProtectedRoute({ children, role }) {
    const accessToken = localStorage.getItem("access");
    const user = parseStoredUser();

    if (!accessToken || !user) {
        clearSession();
        return <Navigate to="/" replace />;
    }

    if (user.role !== role) {
        if (user.role === "student" && role === "teacher") {
            return <Navigate to="/student/dashboard" replace />;
        }

        if (user.role === "teacher" && role === "student") {
            return <Navigate to="/teacher/dashboard" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
