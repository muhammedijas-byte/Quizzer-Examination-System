import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const formRef = useRef(null);

    // Keep the page blank after a refresh while retaining browser suggestions
    // when the user focuses either credential field.
    useEffect(() => {
        const clearAutofill = () => {
            formRef.current?.reset();
            setEmail("");
            setPassword("");
        };

        clearAutofill();
        const timer = window.setTimeout(clearAutofill, 100);

        return () => window.clearTimeout(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await api.post("login/", {
                email,
                password,
                role,
            });

            const data = response.data;

            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.role === "teacher") {
                window.location.href = "/teacher/dashboard";
            } else {
                window.location.href = "/student/dashboard";
            }

        } catch (error) {
            console.log("Login failed:", error.response?.data);

            setError(
                error.response?.data?.detail ||
                "Invalid email, password, or designation."
            );
        }
    };

    return (
        <div className="login-container">

            <div className="login-card">

                {/* Brand */}

                <div className="login-brand">
                    <div className="login-brand-icon">
                        Q
                    </div>

                    <div>
                        <strong>Quizzer</strong>
                        <span>Examination System</span>
                    </div>
                </div>

                <div className="login-heading">
                    <h1>Welcome back</h1>
                    <p>Login to continue to your examination portal.</p>
                </div>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit}>

                    <div className="login-field">
                        <label>Designation</label>

                        <select
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                setError("");
                            }}
                        >
                            <option value="student">
                                Student
                            </option>

                            <option value="teacher">
                                Teacher
                            </option>
                        </select>
                    </div>

                    <div className="login-field">
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            autoComplete="username"
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            autoComplete="current-password"
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                    >
                        Login
                    </button>

                </form>

                <div className="login-register">
                    <span>Don't have an account?</span>

                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                    >
                        Create Student Account
                    </button>
                </div>

            </div>

            <div className="login-footer">
                Quizzer · Examination System
            </div>

        </div>
    );
}

export default Login;
