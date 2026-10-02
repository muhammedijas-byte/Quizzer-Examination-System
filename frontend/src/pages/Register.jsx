import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        student_class: "",
        password: "",
        confirm_password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeField, setActiveField] = useState("");
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);

    useEffect(() => {
        api.get("classes/").then(({ data }) => setClasses(data)).catch(() => setError("Unable to load classes. Please try again later.")).finally(() => setClassesLoading(false));
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.dataset.field]: e.target.value,
        });
    };

    const unlockField = (event) => {
        setActiveField(event.target.dataset.field);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await api.post("register/", { ...formData, student_class: Number(formData.student_class) });

            setSuccess(
                "Account created successfully! You can now login."
            );

            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (error) {
            console.error(
                "Registration failed:",
                error.response?.data
            );

            const data = error.response?.data;

            if (data?.email) {
                setError(data.email[0]);
            } else if (data?.confirm_password) {
                setError(data.confirm_password[0]);
            } else if (data?.username) {
                setError(data.username[0]);
            } else {
                setError(
                    "Registration failed. Please check your details."
                );
            }
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                {/* Brand */}

                <div className="register-brand">
                    <div className="register-brand-icon">
                        Q
                    </div>

                    <div>
                        <strong>Quizzer</strong>
                        <span>Examination System</span>
                    </div>
                </div>

                {/* Heading */}

                <div className="register-heading">
                    <h1>Create Student Account</h1>
                    <p>
                        Register to take examinations and view
                        your results.
                    </p>
                </div>

                {error && (
                    <div className="register-message register-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="register-message register-success">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >

                    <div className="register-field">
                        <label>Username</label>

                        <input
                            type="text"
                            name="new-student-account-name"
                            data-field="username"
                            value={formData.username}
                            onChange={handleChange}
                            onFocus={unlockField}
                            readOnly={
                                activeField !== "username"
                            }
                            autoComplete="new-username"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="register-name-row">

                        <div className="register-field">
                            <label>First Name</label>

                            <input
                                type="text"
                                name="new-student-given-name"
                                data-field="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                onFocus={unlockField}
                                readOnly={
                                    activeField !== "first_name"
                                }
                                autoComplete="off"
                                placeholder="First name"
                                required
                            />
                        </div>

                        <div className="register-field">
                            <label>Last Name</label>

                            <input
                                type="text"
                                name="new-student-family-name"
                                data-field="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                onFocus={unlockField}
                                readOnly={
                                    activeField !== "last_name"
                                }
                                autoComplete="off"
                                placeholder="Last name"
                                required
                            />
                        </div>

                    </div>

                    <div className="register-field">
                        <label>Email</label>

                        <input
                            type="email"
                            name="new-student-contact-email"
                            data-field="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={unlockField}
                            readOnly={
                                activeField !== "email"
                            }
                            autoComplete="off"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-class">Class</label>
                        <select id="register-class" name="student_class" value={formData.student_class} onChange={(event) => setFormData({ ...formData, student_class: event.target.value })} required disabled={classesLoading || classes.length === 0}>
                            <option value="">{classesLoading ? "Loading classes..." : "Select Class"}</option>
                            {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        {!classesLoading && classes.length === 0 && <small>No classes are available yet. Registration will be available once a teacher creates a class.</small>}
                    </div>

                    <div className="register-field">
                        <label>Password</label>

                        <input
                            type="password"
                            name="new-student-secret"
                            data-field="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={unlockField}
                            readOnly={
                                activeField !== "password"
                            }
                            autoComplete="new-password"
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            name="new-student-secret-confirmation"
                            data-field="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            onFocus={unlockField}
                            readOnly={
                                activeField !== "confirm_password"
                            }
                            autoComplete="new-password"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={classesLoading || classes.length === 0}
                    >
                        Create Account
                    </button>

                </form>

                <div className="register-login">
                    <span>Already have an account?</span>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                    >
                        Login
                    </button>
                </div>

            </div>

            <div className="register-footer">
                Quizzer · Examination System
            </div>

        </div>
    );
}

export default Register;
