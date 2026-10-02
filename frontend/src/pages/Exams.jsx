import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherLayout from "../components/TeacherLayout";

function Exams() {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [schoolClass, setSchoolClass] = useState("");
    const [duration, setDuration] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const token = localStorage.getItem("access");

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const fetchData = async () => {
        try {
            const [examResponse, subjectResponse, classResponse] = await Promise.all([
                api.get("exams/list/", {
                    headers,
                }),
                api.get("subjects/list/", {
                    headers,
                }),
                api.get("classes/", { headers }),
            ]);

            setExams(examResponse.data);
            setSubjects(subjectResponse.data);
            setClasses(classResponse.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);

            setError(
                error.response?.data?.detail ||
                "Failed to load exam data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ---------------------------------------
    // CREATE EXAM
    // ---------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.post(
                "exams/",
                {
                    title,
                    description,
                    subject: Number(subject),
                    school_class: Number(schoolClass),
                    duration: Number(duration),
                    status: "draft",
                },
                {
                    headers,
                }
            );

            setExams((previous) => [
                ...previous,
                response.data,
            ]);

            setTitle("");
            setDescription("");
            setSubject("");
            setSchoolClass("");
            setDuration("");

            setMessage(
                "Exam created as Draft. Add questions before publishing."
            );
        } catch (error) {
            console.error("Failed to create exam:", error);

            const data = error.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else {
                setError(
                    "Failed to create exam. Please check your details."
                );
            }
        }
    };

    // ---------------------------------------
    // PUBLISH / UNPUBLISH
    // ---------------------------------------

    const handleStatusChange = async (examId, newStatus) => {
        setMessage("");
        setError("");

        try {
            const response = await api.patch(
                `exams/${examId}/update/`,
                {
                    status: newStatus,
                },
                {
                    headers,
                }
            );

            setExams((previous) =>
                previous.map((exam) =>
                    exam.id === examId
                        ? {
                              ...exam,
                              ...response.data,
                          }
                        : exam
                )
            );

            setMessage(
                newStatus === "published"
                    ? "Exam published successfully!"
                    : "Exam unpublished successfully!"
            );
        } catch (error) {
            console.error(
                "Failed to change exam status:",
                error
            );

            const data = error.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else {
                setError("Failed to change exam status.");
            }
        }
    };

    const handleClassChange = async (examId, classId) => {
        setMessage(""); setError("");
        try {
            const response = await api.patch(`exams/${examId}/update/`, { school_class: Number(classId) }, { headers });
            setExams((items) => items.map((exam) => exam.id === examId ? { ...exam, ...response.data } : exam));
            setMessage("Exam class updated successfully.");
        } catch (err) {
            setError(err.response?.data?.school_class?.[0] || err.response?.data?.detail || "Unable to update exam class.");
        }
    };

    // ---------------------------------------
    // STATISTICS
    // ---------------------------------------

    const totalExams = exams.length;

    const draftExams = exams.filter(
        (exam) => exam.status === "draft"
    ).length;

    const publishedExams = exams.filter(
        (exam) => exam.status === "published"
    ).length;

    return (
        <TeacherLayout>

            {/* TOPBAR */}
            <header className="dashboard-topbar">

                <div>
                    <p className="eyebrow">
                        Exam Management
                    </p>

                    <h1>
                        Exams
                    </h1>
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate("/teacher/dashboard")
                    }
                >
                    {"\u2190"} Dashboard
                </button>

            </header>


            {/* HERO */}
            <section className="teacher-hero">

                <div>

                    <span className="hero-label">
                        EXAM WORKSPACE
                    </span>

                    <h2>
                        Create and manage your exams.
                    </h2>

                    <p>
                        Build assessments, add questions,
                        and control when they become available
                        to students.
                    </p>

                </div>

                <div className="hero-decoration">

                    <div className="hero-circle">
                        Q
                    </div>

                </div>

            </section>


            {/* STATS */}
            <section className="teacher-card-grid exam-stats-grid">

                <div className="teacher-management-card">

                    <div className="management-icon">
                        ◫
                    </div>

                    <div>
                        <span>Total Exams</span>
                        <strong>{totalExams}</strong>
                    </div>

                </div>


                <div className="teacher-management-card">

                    <div className="management-icon">
                        ◷
                    </div>

                    <div>
                        <span>Draft Exams</span>
                        <strong>{draftExams}</strong>
                    </div>

                </div>


                <div className="teacher-management-card">

                    <div className="management-icon">
                        ✓
                    </div>

                    <div>
                        <span>Published</span>
                        <strong>{publishedExams}</strong>
                    </div>

                </div>

            </section>


            {/* ALERTS */}
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


            {/* CREATE EXAM */}
            <section className="management-section">

                {classes.length === 0 && !loading && <div className="alert alert-error">No classes available. <button type="button" className="btn btn-secondary" onClick={() => navigate("/teacher/classes")}>Create a class first</button></div>}

                <div className="section-heading">

                    <div>

                        <span className="section-label">
                            CREATE
                        </span>

                        <h2>
                            Create New Exam
                        </h2>

                        <p>
                            Start with a draft and add questions
                            before publishing it.
                        </p>

                    </div>

                </div>


                <div className="exam-create-card">

                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            <div className="form-field form-field-wide">

                                <label>
                                    Exam Title
                                </label>

                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    placeholder="Enter exam title"
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>Class</label>

                                <select value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} required disabled={classes.length === 0}>
                                    <option value="">Select Class</option>
                                    {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                </select>

                            </div>

                            <div className="form-field">

                                <label>
                                    Subject
                                </label>

                                <select
                                    value={subject}
                                    onChange={(e) =>
                                        setSubject(e.target.value)
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Subject
                                    </option>

                                    {subjects.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Duration
                                </label>

                                <div className="input-with-suffix">

                                    <input
                                        type="number"
                                        min="1"
                                        value={duration}
                                        onChange={(e) =>
                                            setDuration(e.target.value)
                                        }
                                        placeholder="30"
                                        required
                                    />

                                    <span>
                                        min
                                    </span>

                                </div>

                            </div>


                            <div className="form-field form-field-wide">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Describe what this exam covers..."
                                    rows="4"
                                />

                            </div>

                        </div>


                        <div className="form-footer">

                            <span className="draft-hint">

                                <span>●</span>

                                New exams are created as Draft

                            </span>


                            <button
                                type="submit"
                                className="primary-button"
                                disabled={classes.length === 0}
                            >
                                + Create Exam
                            </button>

                        </div>

                    </form>

                </div>

            </section>


            {/* EXAM LIST */}
            <section className="management-section">

                <div className="section-heading section-heading-row">

                    <div>

                        <span className="section-label">
                            MANAGE
                        </span>

                        <h2>
                            My Exams
                        </h2>

                        <p>
                            View, configure and publish your
                            examinations.
                        </p>

                    </div>


                    <div className="exam-count">

                        {totalExams}{" "}

                        {totalExams === 1
                            ? "exam"
                            : "exams"}

                    </div>

                </div>


                {loading ? (

                    <div className="loading-panel">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading exams...
                        </p>

                    </div>

                ) : exams.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ◫
                        </div>

                        <h3>
                            No exams yet
                        </h3>

                        <p>
                            Create your first exam using the
                            form above.
                        </p>

                    </div>

                ) : (

                    <div className="exam-list">

                        {exams.map((exam) => (

                            <article
                                className="exam-management-card"
                                key={exam.id}
                            >

                                <div className="exam-card-main">

                                    <div className="exam-card-top">

                                        <span className="exam-subject-badge">
                                            {exam.subject_name ||
                                                "Subject"}
                                        </span>
                                        <span className="exam-subject-badge">{exam.class_name || "Unassigned"}</span>

                                        <span
                                            className={`status-badge ${
                                                exam.status ===
                                                "published"
                                                    ? "status-published"
                                                    : "status-draft"
                                            }`}
                                        >

                                            <span></span>

                                            {exam.status ===
                                            "published"
                                                ? "Published"
                                                : "Draft"}

                                        </span>

                                    </div>


                                    <h3>
                                        {exam.title}
                                    </h3>


                                    <p className="exam-description">
                                        {exam.description ||
                                            "No description provided."}
                                    </p>

                                    {exam.status === "draft" && (
                                        <div className="exam-class-select">
                                            <label htmlFor={`exam-class-${exam.id}`}>Class</label>
                                            <select id={`exam-class-${exam.id}`} value={exam.school_class || ""} onChange={(event) => handleClassChange(exam.id, event.target.value)}>
                                                <option value="" disabled>Select Class</option>
                                                {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                            </select>
                                        </div>
                                    )}


                                    <div className="exam-meta">

                                        <span>
                                            <b>◷</b>
                                            {exam.duration} min
                                        </span>

                                        <span>
                                            <b>☷</b>
                                            {exam.question_count ??
                                                0}{" "}
                                            questions
                                        </span>

                                        <span>
                                            <b>#</b>
                                            Exam {exam.id}
                                        </span>

                                    </div>

                                </div>


                                <div className="exam-card-actions">

                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            navigate(
                                                `/teacher/questions?exam=${exam.id}`
                                            )
                                        }
                                    >
                                        Questions
                                    </button>


                                    {exam.status === "draft" ? (

                                        <button
                                            className="publish-button"
                                            onClick={() =>
                                                handleStatusChange(
                                                    exam.id,
                                                    "published"
                                                )
                                            }
                                        >
                                            Publish
                                        </button>

                                    ) : (

                                        <button
                                            className="unpublish-button"
                                            onClick={() =>
                                                handleStatusChange(
                                                    exam.id,
                                                    "draft"
                                                )
                                            }
                                        >
                                            Unpublish
                                        </button>

                                    )}

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>

        </TeacherLayout>
    );
}

export default Exams;
