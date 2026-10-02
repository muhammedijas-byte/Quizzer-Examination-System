import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherLayout from "../components/TeacherLayout";

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // ---------------------------------------
    // FETCH SUBJECTS
    // ---------------------------------------

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem("access");

            const response = await api.get(
                "subjects/list/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSubjects(response.data);
        } catch (error) {
            console.error(
                "Failed to fetch subjects:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to load subjects."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // ---------------------------------------
    // CREATE SUBJECT
    // ---------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("access");

            const response = await api.post(
                "subjects/",
                {
                    name,
                    description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSubjects((previous) => [
                ...previous,
                response.data,
            ]);

            setName("");
            setDescription("");

            setMessage(
                "Subject created successfully!"
            );
        } catch (error) {
            console.error(
                "Failed to create subject:",
                error
            );

            const data = error.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else {
                setError(
                    "Failed to create subject. Please check your details."
                );
            }
        }
    };

    return (
        <TeacherLayout>

            {/* HEADER */}

            <header className="dashboard-topbar">

                <div>
                    <p className="eyebrow">
                        SUBJECT MANAGEMENT
                    </p>

                    <h1>
                        Subjects
                    </h1>

                    <p className="page-subtitle">
                        Organize your examinations by
                        subject and keep your content
                        structured.
                    </p>
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate(
                            "/teacher/dashboard"
                        )
                    }
                >
                    ← Dashboard
                </button>

            </header>


            {/* STATS */}

            <section className="subject-overview">

                <div className="stat-card">

                    <div className="stat-icon purple">
                        ◈
                    </div>

                    <div>

                        <span>
                            Total Subjects
                        </span>

                        <strong>
                            {subjects.length}
                        </strong>

                    </div>

                </div>


                <div className="subject-overview-info">

                    <div className="subject-overview-icon">
                        +
                    </div>

                    <div>

                        <strong>
                            Build your exam library
                        </strong>

                        <p>
                            Create subjects first,
                            then organize your exams
                            around them.
                        </p>

                    </div>

                </div>

            </section>


            {/* ADD SUBJECT + SUBJECT LIST */}

            <section className="subject-workspace">

                {/* CREATE SUBJECT */}

                <div className="subject-form-card card">

                    <div className="subject-form-header">

                        <div className="form-heading-icon">
                            +
                        </div>

                        <div>

                            <h2>
                                Add Subject
                            </h2>

                            <p>
                                Create a new subject for
                                your examination library.
                            </p>

                        </div>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label className="form-label">
                                Subject Name
                            </label>

                            <input
                                className="form-input"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter subject name"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label className="form-label">
                                Description
                            </label>

                            <textarea
                                className="form-textarea"
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                placeholder="Add a short description..."
                            />

                        </div>


                        {error && (
                            <div className="alert alert-error">
                                <span>!</span>
                                {error}
                            </div>
                        )}


                        {message && (
                            <div className="alert alert-success">
                                <span>✓</span>
                                {message}
                            </div>
                        )}


                        <button
                            className="btn btn-primary subject-submit"
                            type="submit"
                        >
                            Create Subject →
                        </button>

                    </form>

                </div>


                {/* SUBJECT LIST */}

                <div className="subject-list-area">

                    <div className="section-header">

                        <div>

                            <h2>
                                My Subjects
                            </h2>

                            <p>
                                Your examination subject
                                library
                            </p>

                        </div>

                        {subjects.length > 0 && (
                            <span className="section-count">
                                {subjects.length}{" "}
                                {subjects.length === 1
                                    ? "subject"
                                    : "subjects"}
                            </span>
                        )}

                    </div>


                    {loading ? (

                        <div className="loading-panel card">

                            <div className="loading-spinner"></div>

                            <p>
                                Loading subjects...
                            </p>

                        </div>

                    ) : subjects.length === 0 ? (

                        <div className="empty-state card">

                            <div className="empty-icon">
                                ◈
                            </div>

                            <h3>
                                No subjects yet
                            </h3>

                            <p>
                                Create your first subject
                                using the form.
                            </p>

                        </div>

                    ) : (

                        <div className="subject-grid">

                            {subjects.map((subject) => (

                                <article
                                    className="subject-card"
                                    key={subject.id}
                                >

                                    <div className="subject-card-top">

                                        <div className="subject-large-icon">
                                            ◈
                                        </div>

                                        <span className="id-badge">
                                            #{subject.id}
                                        </span>

                                    </div>


                                    <h3>
                                        {subject.name}
                                    </h3>


                                    <p>
                                        {subject.description ||
                                            "No description provided for this subject."}
                                    </p>


                                    <div className="subject-card-footer">

                                        <span>
                                            Subject
                                        </span>

                                        <span>
                                            Active
                                        </span>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </div>

            </section>


            <footer className="dashboard-footer">
                Quizzer · Subject Management
            </footer>

        </TeacherLayout>
    );
}

export default Subjects;