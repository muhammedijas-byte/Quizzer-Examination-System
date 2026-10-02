import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import TeacherLayout from "../components/TeacherLayout";

function Questions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [questionText, setQuestionText] = useState("");
    const [optionA, setOptionA] = useState("");
    const [optionB, setOptionB] = useState("");
    const [optionC, setOptionC] = useState("");
    const [optionD, setOptionD] = useState("");
    const [correctOption, setCorrectOption] = useState("A");

    const [editingId, setEditingId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const examId = searchParams.get("exam");
    const token = localStorage.getItem("access");

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // ---------------------------------------
    // FETCH QUESTIONS
    // ---------------------------------------

    const fetchQuestions = async () => {
        try {
            const response = await api.get(
                `exams/questions/list/?exam=${examId}`,
                {
                    headers,
                }
            );

            setQuestions(response.data);
        } catch (error) {
            console.error(
                "Failed to fetch questions:",
                error
            );

            const data = error.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else {
                setError("Failed to load questions.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId) {
            fetchQuestions();
        } else {
            setLoading(false);
        }
    }, [examId]);

    // ---------------------------------------
    // RESET FORM
    // ---------------------------------------

    const resetForm = () => {
        setQuestionText("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setCorrectOption("A");
        setEditingId(null);
    };

    // ---------------------------------------
    // ADD / UPDATE QUESTION
    // ---------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const questionData = {
            exam: Number(examId),
            question_text: questionText,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            correct_option: correctOption,
        };

        try {
            let response;

            if (editingId) {
                response = await api.patch(
                    `exams/questions/${editingId}/`,
                    questionData,
                    {
                        headers,
                    }
                );

                setQuestions((previous) =>
                    previous.map((question) =>
                        question.id === editingId
                            ? response.data
                            : question
                    )
                );

                setMessage(
                    "Question updated successfully!"
                );
            } else {
                response = await api.post(
                    "exams/questions/",
                    questionData,
                    {
                        headers,
                    }
                );

                setQuestions((previous) => [
                    ...previous,
                    response.data,
                ]);

                setMessage(
                    "Question added successfully!"
                );
            }

            resetForm();
        } catch (error) {
            console.error(
                "Failed to save question:",
                error
            );

            const data = error.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else {
                setError(
                    editingId
                        ? "Failed to update question."
                        : "Failed to add question. Please check your details."
                );
            }
        }
    };

    // ---------------------------------------
    // EDIT QUESTION
    // ---------------------------------------

    const handleEdit = (question) => {
        setEditingId(question.id);

        setQuestionText(question.question_text);
        setOptionA(question.option_a);
        setOptionB(question.option_b);
        setOptionC(question.option_c);
        setOptionD(question.option_d);
        setCorrectOption(question.correct_option);

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ---------------------------------------
    // DELETE QUESTION
    // ---------------------------------------

    const handleDelete = async (questionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {
            await api.delete(
                `exams/questions/${questionId}/delete/`,
                {
                    headers,
                }
            );

            setMessage(
                "Question deleted successfully."
            );

            await fetchQuestions();
        } catch (error) {
            console.error(
                "Failed to delete question:",
                error
            );

            const data = error.response?.data;

            if (data?.detail) {
                setError(data.detail);
            } else {
                setError(
                    "Failed to delete question."
                );
            }
        }
    };

    // ---------------------------------------
    // NO EXAM SELECTED
    // ---------------------------------------

    if (!examId) {
        return (
            <TeacherLayout>
                <div className="empty-state">
                    <div className="empty-icon">
                        ?
                    </div>

                    <h3>No exam selected</h3>

                    <p>
                        Select an exam from Exam Management
                        to manage its questions.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/teacher/exams")
                        }
                    >
                        Back to Exams
                    </button>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>

            {/* TOPBAR */}

            <header className="dashboard-topbar">
                <div>
                    <p className="eyebrow">
                        QUESTION MANAGEMENT
                    </p>

                    <h1>
                        Questions
                    </h1>
                </div>

                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate("/teacher/exams")
                    }
                >
                    ← Back to Exams
                </button>
            </header>

            {/* HERO */}

            <section className="question-hero">
                <div>
                    <span className="hero-label">
                        QUESTION BUILDER
                    </span>

                    <h2>
                        Build your exam questions.
                    </h2>

                    <p>
                        Add multiple-choice questions,
                        define the correct answer, and
                        organize your assessment before
                        publishing it.
                    </p>
                </div>

                <div className="question-hero-number">
                    {questions.length}

                    <span>
                        Questions
                    </span>
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

            {/* FORM */}

            <section className="question-workspace">
                <div className="question-form-card">

                    <div className="question-form-header">
                        <div className="form-heading-icon">
                            {editingId ? "✎" : "+"}
                        </div>

                        <div>
                            <span className="section-label">
                                {editingId
                                    ? "EDIT"
                                    : "CREATE"}
                            </span>

                            <h2>
                                {editingId
                                    ? "Edit Question"
                                    : "Add Question"}
                            </h2>

                            <p>
                                Create a question with
                                four answer choices.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="question-main-field">
                            <label>
                                Question
                            </label>

                            <textarea
                                value={questionText}
                                onChange={(e) =>
                                    setQuestionText(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your question..."
                                rows="5"
                                required
                            />
                        </div>

                        <div className="options-grid">

                            <div className="option-field">
                                <span className="option-letter">
                                    A
                                </span>

                                <input
                                    type="text"
                                    value={optionA}
                                    onChange={(e) =>
                                        setOptionA(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Option A"
                                    required
                                />
                            </div>

                            <div className="option-field">
                                <span className="option-letter">
                                    B
                                </span>

                                <input
                                    type="text"
                                    value={optionB}
                                    onChange={(e) =>
                                        setOptionB(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Option B"
                                    required
                                />
                            </div>

                            <div className="option-field">
                                <span className="option-letter">
                                    C
                                </span>

                                <input
                                    type="text"
                                    value={optionC}
                                    onChange={(e) =>
                                        setOptionC(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Option C"
                                    required
                                />
                            </div>

                            <div className="option-field">
                                <span className="option-letter">
                                    D
                                </span>

                                <input
                                    type="text"
                                    value={optionD}
                                    onChange={(e) =>
                                        setOptionD(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Option D"
                                    required
                                />
                            </div>

                        </div>

                        <div className="correct-answer-row">

                            <div>
                                <label>
                                    Correct Answer
                                </label>

                                <p>
                                    Select which option
                                    should be marked correct.
                                </p>
                            </div>

                            <select
                                value={correctOption}
                                onChange={(e) =>
                                    setCorrectOption(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="A">
                                    Option A
                                </option>

                                <option value="B">
                                    Option B
                                </option>

                                <option value="C">
                                    Option C
                                </option>

                                <option value="D">
                                    Option D
                                </option>
                            </select>

                        </div>

                        <div className="question-form-footer">

                            {editingId && (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetForm}
                                >
                                    Cancel Edit
                                </button>
                            )}

                            <button
                                type="submit"
                                className="primary-button"
                            >
                                {editingId
                                    ? "Update Question"
                                    : "Add Question"}
                            </button>

                        </div>

                    </form>
                </div>
            </section>

            {/* QUESTION LIST */}

            <section className="management-section">

                <div className="section-heading section-heading-row">

                    <div>
                        <span className="section-label">
                            QUESTIONS
                        </span>

                        <h2>
                            Exam Questions
                        </h2>

                        <p>
                            Review and manage the questions
                            in this examination.
                        </p>
                    </div>

                    <div className="exam-count">
                        {questions.length}{" "}
                        {questions.length === 1
                            ? "question"
                            : "questions"}
                    </div>

                </div>

                {loading ? (

                    <div className="loading-panel">
                        <div className="loading-spinner"></div>

                        <p>
                            Loading questions...
                        </p>
                    </div>

                ) : questions.length === 0 ? (

                    <div className="empty-state">
                        <div className="empty-icon">
                            ?
                        </div>

                        <h3>
                            No questions yet
                        </h3>

                        <p>
                            Add your first question using
                            the form above.
                        </p>
                    </div>

                ) : (

                    <div className="question-list">

                        {questions.map(
                            (question, index) => (

                                <article
                                    className="question-card"
                                    key={question.id}
                                >

                                    <div className="question-card-header">

                                        <div className="question-number">
                                            {index + 1}
                                        </div>

                                        <span className="question-label">
                                            QUESTION
                                        </span>

                                        <div className="question-card-actions">

                                            <button
                                                className="edit-question-button"
                                                onClick={() =>
                                                    handleEdit(
                                                        question
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-question-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        question.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                    <div className="question-text-display">
                                        {question.question_text}
                                    </div>

                                    <div className="question-options">

                                        <div
                                            className={`question-option ${
                                                question.correct_option ===
                                                "A"
                                                    ? "correct"
                                                    : ""
                                            }`}
                                        >
                                            <span>A</span>

                                            <p>
                                                {
                                                    question.option_a
                                                }
                                            </p>

                                            {question.correct_option ===
                                                "A" && (
                                                <small>
                                                    Correct
                                                </small>
                                            )}
                                        </div>

                                        <div
                                            className={`question-option ${
                                                question.correct_option ===
                                                "B"
                                                    ? "correct"
                                                    : ""
                                            }`}
                                        >
                                            <span>B</span>

                                            <p>
                                                {
                                                    question.option_b
                                                }
                                            </p>

                                            {question.correct_option ===
                                                "B" && (
                                                <small>
                                                    Correct
                                                </small>
                                            )}
                                        </div>

                                        <div
                                            className={`question-option ${
                                                question.correct_option ===
                                                "C"
                                                    ? "correct"
                                                    : ""
                                            }`}
                                        >
                                            <span>C</span>

                                            <p>
                                                {
                                                    question.option_c
                                                }
                                            </p>

                                            {question.correct_option ===
                                                "C" && (
                                                <small>
                                                    Correct
                                                </small>
                                            )}
                                        </div>

                                        <div
                                            className={`question-option ${
                                                question.correct_option ===
                                                "D"
                                                    ? "correct"
                                                    : ""
                                            }`}
                                        >
                                            <span>D</span>

                                            <p>
                                                {
                                                    question.option_d
                                                }
                                            </p>

                                            {question.correct_option ===
                                                "D" && (
                                                <small>
                                                    Correct
                                                </small>
                                            )}
                                        </div>

                                    </div>

                                </article>
                            )
                        )}

                    </div>
                )}

            </section>

        </TeacherLayout>
    );
}

export default Questions;