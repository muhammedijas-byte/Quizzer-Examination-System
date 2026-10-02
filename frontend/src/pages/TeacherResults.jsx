import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherLayout from "../components/TeacherLayout";

function TeacherResults() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ---------------------------------------
    // FETCH EXAMS + RESULTS
    // ---------------------------------------

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access");

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [examResponse, resultResponse] =
                    await Promise.all([
                        api.get("exams/list/", {
                            headers,
                        }),
                        api.get("results/teacher-results/", {
                            headers,
                        }),
                    ]);

                setExams(examResponse.data);
                setResults(resultResponse.data);
            } catch (error) {
                console.error(
                    "Failed to load teacher results:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    "Unable to load results."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ---------------------------------------
    // SELECTED EXAM RESULTS
    // ---------------------------------------

    const filteredResults = selectedExam
        ? results.filter(
              (result) =>
                  String(result.exam_id) ===
                  String(selectedExam)
          )
        : [];

    // ---------------------------------------
    // SELECTED EXAM DETAILS
    // ---------------------------------------

    const selectedExamDetails = exams.find(
        (exam) =>
            String(exam.id) ===
            String(selectedExam)
    );

    // ---------------------------------------
    // STATISTICS
    // ---------------------------------------

    const totalAttempts = filteredResults.length;

    const totalStudents = new Set(
        filteredResults.map(
            (result) => result.student_id
        )
    ).size;

    const averagePercentage =
        filteredResults.length > 0
            ? (
                  filteredResults.reduce(
                      (sum, result) =>
                          sum +
                          Number(
                              result.percentage || 0
                          ),
                      0
                  ) / filteredResults.length
              ).toFixed(1)
            : "0.0";

    const totalCorrect = filteredResults.reduce(
        (sum, result) =>
            sum +
            Number(result.correct_answers || 0),
        0
    );

    return (
        <TeacherLayout>

            {/* TOPBAR */}

            <header className="dashboard-topbar">
                <div>
                    <p className="eyebrow">
                        RESULTS MANAGEMENT
                    </p>

                    <h1>
                        Results
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

            <section className="results-hero">
                <div>
                    <span className="hero-label">
                        PERFORMANCE CENTER
                    </span>

                    <h2>
                        Review your examination results.
                    </h2>

                    <p>
                        Select an examination to view
                        student performance, scores and
                        detailed results.
                    </p>
                </div>

                <div className="results-hero-visual">
                    <div className="results-hero-icon">
                        %
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="loading-panel results-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading student results...</p>
                </div>
            ) : (
                <>

            {/* ERROR */}

            {error && (
                <div className="alert alert-error">
                    <span>!</span>
                    {error}
                </div>
            )}

            {/* EXAM SELECTOR */}

            <section className="result-exam-selector">

                <div className="result-selector-content">

                    <div className="result-selector-icon">
                        ▤
                    </div>

                    <div className="result-selector-info">
                        <span className="section-label">
                            EXAMINATION
                        </span>

                        <h2>
                            Select an Exam
                        </h2>

                        <p>
                            Choose an exam to view its
                            student results.
                        </p>
                    </div>

                    <div className="result-selector-control">
                        <label htmlFor="exam-select">
                            Exam
                        </label>

                        <select
                            id="exam-select"
                            value={selectedExam}
                            onChange={(e) =>
                                setSelectedExam(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Select an exam
                            </option>

                            {exams.map((exam) => (
                                <option
                                    key={exam.id}
                                    value={exam.id}
                                >
                                    {exam.title}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

            </section>

            {/* NOTHING SELECTED */}

            {!selectedExam && (
                <section className="management-section">

                    <div className="empty-state results-empty">

                        <div className="empty-icon">
                            ◈
                        </div>

                        <h3>
                            Select an exam to continue
                        </h3>

                        <p>
                            Choose an examination from
                            the selector above to view
                            its student results.
                        </p>

                    </div>

                </section>
            )}

            {/* SELECTED EXAM */}

            {selectedExam && (
                <>
                    {/* SELECTED EXAM HEADER */}

                    <section className="selected-result-exam">

                        <div>
                            <span className="section-label">
                                SELECTED EXAM
                            </span>

                            <h2>
                                {selectedExamDetails?.title ||
                                    "Examination"}
                            </h2>

                            {selectedExamDetails?.subject_name && (
                                <p>
                                    {
                                        selectedExamDetails.subject_name
                                    }
                                </p>
                            )}
                        </div>

                        <div className="exam-count">
                            {totalAttempts}{" "}
                            {totalAttempts === 1
                                ? "attempt"
                                : "attempts"}
                        </div>

                    </section>

                    {/* STATISTICS */}

                    <section className="results-stats">

                        <div className="result-stat-card">
                            <div className="result-stat-icon purple">
                                ◈
                            </div>

                            <div>
                                <span>
                                    Total Attempts
                                </span>

                                <strong>
                                    {totalAttempts}
                                </strong>
                            </div>
                        </div>

                        <div className="result-stat-card">
                            <div className="result-stat-icon blue">
                                ♙
                            </div>

                            <div>
                                <span>
                                    Students Participated
                                </span>

                                <strong>
                                    {totalStudents}
                                </strong>
                            </div>
                        </div>

                        <div className="result-stat-card">
                            <div className="result-stat-icon green">
                                %
                            </div>

                            <div>
                                <span>
                                    Average Score
                                </span>

                                <strong>
                                    {averagePercentage}%
                                </strong>
                            </div>
                        </div>

                        <div className="result-stat-card">
                            <div className="result-stat-icon orange">
                                ✓
                            </div>

                            <div>
                                <span>
                                    Correct Answers
                                </span>

                                <strong>
                                    {totalCorrect}
                                </strong>
                            </div>
                        </div>

                    </section>

                    {/* RESULTS TABLE */}

                    <section className="management-section">

                        <div className="section-heading section-heading-row">

                            <div>
                                <span className="section-label">
                                    RESULTS
                                </span>

                                <h2>
                                    Student Results
                                </h2>

                                <p>
                                    Completed attempts for
                                    the selected examination.
                                </p>
                            </div>

                            <div className="exam-count">
                                {totalAttempts}{" "}
                                {totalAttempts === 1
                                    ? "student"
                                    : "students"}
                            </div>

                        </div>

                        {filteredResults.length === 0 ? (

                            <div className="empty-state results-empty">

                                <div className="empty-icon">
                                    ◈
                                </div>

                                <h3>
                                    No results yet
                                </h3>

                                <p>
                                    No student has completed
                                    this examination yet.
                                </p>

                            </div>

                        ) : (

                            <div className="results-table-wrapper">

                                <table className="results-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Student
                                            </th>

                                            <th>
                                                Score
                                            </th>

                                            <th>
                                                Performance
                                            </th>

                                            <th>
                                                Breakdown
                                            </th>

                                            <th>
                                                Submitted
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {filteredResults.map(
                                            (result) => {

                                                const percentage =
                                                    Number(
                                                        result.percentage ||
                                                        0
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            result.attempt_id
                                                        }
                                                    >

                                                        {/* STUDENT */}

                                                        <td>
                                                            <div className="result-student">

                                                                <div className="result-avatar">
                                                                    {(
                                                                        result.student_name ||
                                                                        "S"
                                                                    )
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>

                                                                <div>
                                                                    <strong>
                                                                        {
                                                                            result.student_name
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            result.student_email
                                                                        }
                                                                    </span>
                                                                </div>

                                                            </div>
                                                        </td>

                                                        {/* SCORE */}

                                                        <td>
                                                            <strong className="result-score">
                                                                {
                                                                    result.score
                                                                }
                                                                /
                                                                {
                                                                    result.total_questions
                                                                }
                                                            </strong>
                                                        </td>

                                                        {/* PERFORMANCE */}

                                                        <td>
                                                            <div className="result-performance">

                                                                <div className="result-percentage-row">

                                                                    <strong>
                                                                        {
                                                                            percentage
                                                                        }
                                                                        %
                                                                    </strong>

                                                                    <span>
                                                                        {percentage >=
                                                                        80
                                                                            ? "Excellent"
                                                                            : percentage >=
                                                                              60
                                                                            ? "Good"
                                                                            : percentage >=
                                                                              40
                                                                            ? "Average"
                                                                            : "Needs improvement"}
                                                                    </span>

                                                                </div>

                                                                <div className="result-progress">

                                                                    <div
                                                                        className="result-progress-fill"
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                Math.max(
                                                                                    percentage,
                                                                                    0
                                                                                ),
                                                                                100
                                                                            )}%`,
                                                                        }}
                                                                    ></div>

                                                                </div>

                                                            </div>
                                                        </td>

                                                        {/* BREAKDOWN */}

                                                        <td>
                                                            <div className="result-breakdown">

                                                                <span className="correct-count">
                                                                    ✓{" "}
                                                                    {
                                                                        result.correct_answers
                                                                    }
                                                                </span>

                                                                <span className="wrong-count">
                                                                    ✕{" "}
                                                                    {
                                                                        result.wrong_answers
                                                                    }
                                                                </span>

                                                                <span className="unanswered-count">
                                                                    —{" "}
                                                                    {
                                                                        result.unanswered
                                                                    }
                                                                </span>

                                                            </div>
                                                        </td>

                                                        {/* DATE */}

                                                        <td>
                                                            <span className="result-date">

                                                                {new Date(
                                                                    result.submitted_at
                                                                ).toLocaleDateString(
                                                                    undefined,
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}

                                                                <small>
                                                                    {new Date(
                                                                        result.submitted_at
                                                                    ).toLocaleTimeString(
                                                                        undefined,
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                </small>

                                                            </span>
                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </section>
                </>
            )}

                </>
            )}

        </TeacherLayout>
    );
}

export default TeacherResults;
