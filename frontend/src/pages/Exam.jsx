import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Exam() {
    const { examId } = useParams();
    const navigate = useNavigate();

    const startCalled = useRef(false);
    const submitCalled = useRef(false);
    const countdownExpired = useRef(false);

    const [duration, setDuration] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [attemptId, setAttemptId] = useState(null);

    const [timeLeft, setTimeLeft] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [answersLoaded, setAnswersLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ---------------------------------------
    // START / RESUME EXAM
    // ---------------------------------------

    const startExam = async () => {
        try {
            const token = localStorage.getItem("access");

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            // Get exam details
            const examResponse = await api.get(
                `exams/${examId}/`,
                { headers }
            );

            setDuration(examResponse.data.duration);

            // Create or resume exam attempt
            const attemptResponse = await api.post(
                "results/attempts/",
                {
                    exam: examId,
                },
                { headers }
            );

            const currentAttemptId =
                attemptResponse.data.id;

            setAttemptId(currentAttemptId);

            // ---------------------------------------
            // RESTORE SAVED ANSWERS
            // ---------------------------------------

            const savedAnswers =
                sessionStorage.getItem(
                    `exam-answers-${currentAttemptId}`
                );

            if (savedAnswers) {
                try {
                    setAnswers(
                        JSON.parse(savedAnswers)
                    );
                } catch (error) {
                    console.error(
                        "Failed to restore saved answers:",
                        error
                    );

                    sessionStorage.removeItem(
                        `exam-answers-${currentAttemptId}`
                    );
                }
            }

            setAnswersLoaded(true);

            // ---------------------------------------
            // BACKEND-BASED TIMER
            // ---------------------------------------

            const startedAt = new Date(
                attemptResponse.data.started_at
            );

            const now = new Date();

            const elapsedSeconds = Math.floor(
                (now - startedAt) / 1000
            );

            const totalSeconds =
                examResponse.data.duration * 60;

            const remainingSeconds = Math.max(
                totalSeconds - elapsedSeconds,
                0
            );

            setTimeLeft(remainingSeconds);

            // ---------------------------------------
            // GET QUESTIONS
            // ---------------------------------------

            const questionsResponse = await api.get(
                `exams/${examId}/questions/`,
                { headers }
            );

            setQuestions(
                questionsResponse.data
            );

        } catch (error) {
            console.log(
                "Failed to start exam:",
                error.response?.data
            );

            setError(
                error.response?.data?.detail ||
                "Unable to start this exam."
            );
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------
    // START ONLY ONCE
    // ---------------------------------------

    useEffect(() => {
        if (startCalled.current) {
            return;
        }

        startCalled.current = true;
        startExam();
    }, [examId]);

    // ---------------------------------------
    // COUNTDOWN
    // ---------------------------------------

    useEffect(() => {
        if (
            timeLeft === null ||
            timeLeft <= 0
        ) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((previousTime) => {
                if (previousTime <= 1) {
                    countdownExpired.current = true;
                    return 0;
                }

                return previousTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // ---------------------------------------
    // ANSWER CHANGE
    // ---------------------------------------

    const handleAnswerChange = (
        questionId,
        option
    ) => {
        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [questionId]: option,
        }));
    };

    // ---------------------------------------
    // SAVE ANSWERS TO SESSION
    // ---------------------------------------

    useEffect(() => {
        if (
            !attemptId ||
            !answersLoaded
        ) {
            return;
        }

        sessionStorage.setItem(
            `exam-answers-${attemptId}`,
            JSON.stringify(answers)
        );
    }, [
        answers,
        attemptId,
        answersLoaded,
    ]);

    // ---------------------------------------
    // QUESTION NAVIGATION
    // ---------------------------------------

    const goToNext = () => {
        if (
            currentQuestion <
            questions.length - 1
        ) {
            setCurrentQuestion(
                currentQuestion + 1
            );
        }
    };

    const goToPrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(
                currentQuestion - 1
            );
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestion(index);
    };

    // ---------------------------------------
    // SUBMIT EXAM
    // ---------------------------------------

    const handleSubmit = async (
        autoSubmit = false
    ) => {
        if (submitting || submitCalled.current) {
            return;
        }

        // Manual submission confirmation
        if (!autoSubmit) {
            const unanswered =
                questions.filter(
                    (question) =>
                        !answers[question.id]
                ).length;

            if (unanswered > 0) {
                const confirmSubmit =
                    window.confirm(
                        `You have ${unanswered} unanswered question(s). Do you want to submit anyway?`
                    );

                if (!confirmSubmit) {
                    return;
                }
            } else {
                const confirmSubmit =
                    window.confirm(
                        "Are you sure you want to submit the exam?"
                    );

                if (!confirmSubmit) {
                    return;
                }
            }
        }

        submitCalled.current = true;
        setSubmitting(true);

        try {
            const token =
                localStorage.getItem("access");

            const formattedAnswers =
                questions.map((question) => ({
                    question: question.id,
                    selected_option:
                        answers[question.id] ||
                        null,
                }));

            const response = await api.post(
                `results/attempts/${attemptId}/submit/`,
                {
                    answers: formattedAnswers,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            sessionStorage.removeItem(
                `exam-answers-${attemptId}`
            );

            navigate(
                `/student/result/${attemptId}`,
                {
                    replace: true,
                    state: {
                        autoSubmitted: autoSubmit,
                        score: response.data.score,
                        totalQuestions:
                            response.data.total_questions,
                        percentage:
                            response.data.percentage,
                    },
                }
            );

        } catch (error) {
            submitCalled.current = false;
            setSubmitting(false);

            console.log(
                "Exam submission failed:",
                error.response?.data
            );

            setError(
                error.response?.data?.detail ||
                "Failed to submit exam."
            );
        }
    };

    // ---------------------------------------
    // AUTO SUBMIT
    // ---------------------------------------

    useEffect(() => {
        if (
            timeLeft !== 0 ||
            !countdownExpired.current
        ) {
            return;
        }

        if (
            !attemptId ||
            questions.length === 0
        ) {
            return;
        }

        if (submitCalled.current) {
            return;
        }

        handleSubmit(true);
    }, [
        timeLeft,
        attemptId,
        questions.length,
    ]);

    // ---------------------------------------
    // LOGOUT / EXIT
    // ---------------------------------------

    const handleExit = () => {
        const confirmed = window.confirm(
            "Are you sure you want to exit the exam? Your attempt will remain in progress."
        );

        if (confirmed) {
            navigate("/student/dashboard");
        }
    };

    // ---------------------------------------
    // LOADING
    // ---------------------------------------

    if (loading) {
        return (
            <div className="exam-page-state">

                <div className="exam-state-card">

                    <div className="exam-state-icon">
                        Q
                    </div>

                    <div className="loading-spinner"></div>

                    <h2>
                        Starting examination
                    </h2>

                    <p>
                        Preparing your examination...
                    </p>

                </div>

            </div>
        );
    }

    // ---------------------------------------
    // ERROR
    // ---------------------------------------

    if (error && questions.length === 0) {
        return (
            <div className="exam-page-state">

                <div className="exam-state-card">

                    <div className="exam-state-icon error">
                        !
                    </div>

                    <h2>
                        Unable to start exam
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="exam-secondary-button"
                        onClick={() =>
                            navigate(
                                "/student/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </div>
        );
    }

    // ---------------------------------------
    // NO QUESTIONS
    // ---------------------------------------

    if (questions.length === 0) {
        return (
            <div className="exam-page-state">

                <div className="exam-state-card">

                    <div className="exam-state-icon">
                        ?
                    </div>

                    <h2>
                        No questions found
                    </h2>

                    <p>
                        This examination does not
                        contain any questions yet.
                    </p>

                    <button
                        className="exam-secondary-button"
                        onClick={() =>
                            navigate(
                                "/student/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>

                </div>

            </div>
        );
    }

    // ---------------------------------------
    // CURRENT QUESTION
    // ---------------------------------------

    const question =
        questions[currentQuestion];

    const answeredCount =
        Object.keys(answers).length;

    const progress =
        ((currentQuestion + 1) /
            questions.length) *
        100;

    const remainingQuestions =
        questions.length - answeredCount;

    const minutes = Math.floor(
        timeLeft / 60
    );

    const seconds = String(
        timeLeft % 60
    ).padStart(2, "0");

    const isLowTime =
        timeLeft <= 60 && timeLeft > 0;

    const isLastQuestion =
        currentQuestion ===
        questions.length - 1;

    // ---------------------------------------
    // MAIN UI
    // ---------------------------------------

    return (
        <div className="exam-page">

            {/* =================================
                HEADER
            ================================= */}

            <header className="exam-header">

                <div className="exam-brand">

                    <div className="exam-brand-icon">
                        Q
                    </div>

                    <div>
                        <strong>
                            Quizzer
                        </strong>

                        <span>
                            Examination System
                        </span>
                    </div>

                </div>

                <div className="exam-header-center">

                    <span>
                        EXAMINATION
                    </span>

                    <strong>
                        Exam #{examId}
                    </strong>

                </div>

                <button
                    className="exam-exit-button"
                    onClick={handleExit}
                    disabled={submitting}
                >
                    Exit Exam
                </button>

            </header>

            {/* =================================
                TIMER BAR
            ================================= */}

            <div
                className={`exam-timer-bar ${
                    isLowTime
                        ? "timer-warning"
                        : ""
                }`}
            >

                <div className="exam-timer-content">

                    <div className="timer-label">

                        <span className="timer-icon">
                            ◷
                        </span>

                        <div>
                            <span>
                                TIME REMAINING
                            </span>

                            <strong>
                                {minutes}:{seconds}
                            </strong>
                        </div>

                    </div>

                    <div className="timer-progress">

                        <div
                            className="timer-progress-fill"
                            style={{
                                width: `${Math.min(
                                    Math.max(
                                        (timeLeft /
                                            (duration *
                                                60)) *
                                            100,
                                        0
                                    ),
                                    100
                                )}%`,
                            }}
                        ></div>

                    </div>

                    <div className="timer-status">

                        {isLowTime ? (
                            <span className="timer-warning-text">
                                Warning: Less than one
                                minute remaining
                            </span>
                        ) : (
                            <span>
                                Stay focused
                            </span>
                        )}

                    </div>

                </div>

            </div>

            {/* =================================
                MAIN EXAM CONTENT
            ================================= */}

            <main className="exam-content">

                {/* PAGE INTRO */}

                <div className="exam-page-heading">

                    <div>

                        <p className="eyebrow">
                            EXAMINATION
                        </p>

                        <h1>
                            Question{" "}
                            {currentQuestion + 1}
                            <span>
                                {" "}of{" "}
                                {questions.length}
                            </span>
                        </h1>

                    </div>

                    <div className="exam-progress-summary">

                        <strong>
                            {answeredCount}
                        </strong>

                        <span>
                            / {questions.length}
                            {" "}answered
                        </span>

                    </div>

                </div>

                {/* ERROR BANNER */}

                {error && (
                    <div className="alert alert-error">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {/* =================================
                    TWO COLUMN AREA
                ================================= */}

                <div className="exam-layout">

                    {/* QUESTION AREA */}

                    <section className="exam-question-section">

                        <div className="question-card-main">

                            <div className="question-card-label">
                                QUESTION{" "}
                                {currentQuestion + 1}
                            </div>

                            <h2>
                                {
                                    question.question_text
                                }
                            </h2>

                            <p className="question-help-text">
                                Select one answer from
                                the options below.
                            </p>

                            {/* OPTIONS */}

                            <div className="exam-options">

                                {[
                                    [
                                        "A",
                                        question.option_a,
                                    ],
                                    [
                                        "B",
                                        question.option_b,
                                    ],
                                    [
                                        "C",
                                        question.option_c,
                                    ],
                                    [
                                        "D",
                                        question.option_d,
                                    ],
                                ].map(
                                    ([
                                        option,
                                        text,
                                    ]) => {

                                        const selected =
                                            answers[
                                                question.id
                                            ] ===
                                            option;

                                        return (
                                            <label
                                                key={
                                                    option
                                                }
                                                className={`exam-option ${
                                                    selected
                                                        ? "selected"
                                                        : ""
                                                }`}
                                            >

                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={
                                                        option
                                                    }
                                                    checked={
                                                        selected
                                                    }
                                                    onChange={() =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            option
                                                        )
                                                    }
                                                />

                                                <span className="option-radio">
                                                    {selected
                                                        ? "✓"
                                                        : ""}
                                                </span>

                                                <span className="option-letter">
                                                    {
                                                        option
                                                    }
                                                </span>

                                                <span className="option-text">
                                                    {
                                                        text
                                                    }
                                                </span>

                                            </label>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                        {/* QUESTION NAVIGATION */}

                        <div className="exam-navigation">

                            <button
                                className="exam-secondary-button"
                                onClick={
                                    goToPrevious
                                }
                                disabled={
                                    currentQuestion ===
                                    0 ||
                                    submitting
                                }
                            >
                                ← Previous
                            </button>

                            <span>
                                {currentQuestion + 1}{" "}
                                /{" "}
                                {questions.length}
                            </span>

                            {!isLastQuestion ? (

                                <button
                                    className="exam-primary-button"
                                    onClick={
                                        goToNext
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Next →
                                </button>

                            ) : (

                                <button
                                    className="exam-submit-button"
                                    onClick={() =>
                                        handleSubmit()
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Exam ✓"}
                                </button>

                            )}

                        </div>

                    </section>

                    {/* =================================
                        QUESTION PALETTE
                    ================================= */}

                    <aside className="question-palette">

                        <div className="palette-header">

                            <div>

                                <span className="section-label">
                                    QUESTIONS
                                </span>

                                <h3>
                                    Question Navigator
                                </h3>

                            </div>

                        </div>

                        <div className="palette-stats">

                            <div>
                                <strong>
                                    {answeredCount}
                                </strong>

                                <span>
                                    Answered
                                </span>
                            </div>

                            <div>
                                <strong>
                                    {remainingQuestions}
                                </strong>

                                <span>
                                    Remaining
                                </span>
                            </div>

                        </div>

                        <div className="palette-grid">

                            {questions.map(
                                (q, index) => {

                                    const isCurrent =
                                        currentQuestion ===
                                        index;

                                    const isAnswered =
                                        Boolean(
                                            answers[q.id]
                                        );

                                    return (
                                        <button
                                            key={q.id}
                                            className={`palette-button ${
                                                isCurrent
                                                    ? "current"
                                                    : ""
                                            } ${
                                                isAnswered
                                                    ? "answered"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                goToQuestion(
                                                    index
                                                )
                                            }
                                            disabled={
                                                submitting
                                            }
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                }
                            )}

                        </div>

                        <div className="palette-legend">

                            <div>
                                <span className="legend-dot current"></span>
                                Current
                            </div>

                            <div>
                                <span className="legend-dot answered"></span>
                                Answered
                            </div>

                            <div>
                                <span className="legend-dot unanswered"></span>
                                Unanswered
                            </div>

                        </div>

                        <div className="palette-note">

                            <span>
                                !
                            </span>

                            <p>
                                You can navigate between
                                questions at any time.
                            </p>

                        </div>

                    </aside>

                </div>

            </main>

            {/* =================================
                FOOTER
            ================================= */}

            <footer className="exam-footer">
                Quizzer · Examination System
            </footer>

        </div>
    );
}

export default Exam;