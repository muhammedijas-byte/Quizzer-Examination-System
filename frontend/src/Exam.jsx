import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Exam() {
    const { examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [attemptId, setAttemptId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const startCalled = useRef(false);
    const submitCalled = useRef(false);

    // -----------------------------------
    // START / RESUME EXAM
    // -----------------------------------
    const startExam = async (examData) => {
        if (startCalled.current) return;

        startCalled.current = true;

        try {
            const response = await api.post("results/attempts/", {
                exam: examData.id,
            });

            const attempt = response.data;

            setAttemptId(attempt.id);

            // Calculate remaining time from backend started_at
            const startedAt = new Date(attempt.started_at);
            const now = new Date();

            const elapsedSeconds = Math.floor(
                (now - startedAt) / 1000
            );

            const totalSeconds = examData.duration * 60;

            const remainingSeconds = Math.max(
                totalSeconds - elapsedSeconds,
                0
            );

            setTimeLeft(remainingSeconds);
        } catch (error) {
            console.error("Failed to start exam:", error);

            setError(
                error.response?.data?.detail ||
                "Unable to start this exam."
            );

            startCalled.current = false;
        }
    };

    // -----------------------------------
    // FETCH EXAM + START ATTEMPT
    // -----------------------------------
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const token = localStorage.getItem("access");

                const examResponse = await api.get(
                    `exams/${examId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const examData = examResponse.data;

                setExam(examData);

                await startExam(examData);

                // Fetch student-safe questions
                const questionsResponse = await api.get(
                    `exams/${examId}/questions/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setQuestions(questionsResponse.data);
            } catch (error) {
                console.error("Failed to load exam:", error);

                setError(
                    error.response?.data?.detail ||
                    "Unable to load this exam."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId]);

    // -----------------------------------
    // COUNTDOWN TIMER
    // -----------------------------------
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((previous) => {
                if (previous <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // -----------------------------------
    // AUTO SUBMIT WHEN TIME EXPIRES
    // -----------------------------------
    useEffect(() => {
        if (
            timeLeft === 0 &&
            attemptId &&
            questions.length > 0 &&
            !submitCalled.current
        ) {
            handleSubmit(true);
        }
    }, [timeLeft, attemptId, questions]);

    // -----------------------------------
    // SELECT ANSWER
    // -----------------------------------
    const handleAnswerChange = (questionId, answer) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: answer,
        }));
    };

    // -----------------------------------
    // SUBMIT EXAM
    // -----------------------------------
    const handleSubmit = async (autoSubmit = false) => {
        if (submitCalled.current || submitting) {
            return;
        }

        if (!autoSubmit) {
            const confirmed = window.confirm(
                "Are you sure you want to submit the exam?"
            );

            if (!confirmed) {
                return;
            }
        }

        submitCalled.current = true;
        setSubmitting(true);

        try {
            const token = localStorage.getItem("access");

            const submittedAnswers = questions.map((question) => ({
                question: question.id,
                selected_option:
                    answers[question.id] || null,
            }));

            const response = await api.post(
                `results/attempts/${attemptId}/submit/`,
                {
                    answers: submittedAnswers,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (autoSubmit) {
                alert(
                    "Time expired. Your exam has been submitted automatically."
                );
            } else {
                alert(
                    response.data.message ||
                    "Exam submitted successfully."
                );
            }

            navigate("/student/dashboard");
        } catch (error) {
            console.error("Failed to submit exam:", error);

            submitCalled.current = false;
            setSubmitting(false);

            alert(
                error.response?.data?.detail ||
                "Failed to submit exam."
            );
        }
    };

    // -----------------------------------
    // FORMAT TIME
    // -----------------------------------
    const formatTime = (seconds) => {
        if (seconds === null) {
            return "--:--";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    // -----------------------------------
    // LOADING
    // -----------------------------------
    if (loading) {
        return <p>Loading exam...</p>;
    }

    // -----------------------------------
    // ERROR
    // -----------------------------------
    if (error) {
        return (
            <div>
                <p>{error}</p>

                <button
                    onClick={() =>
                        navigate("/student/dashboard")
                    }
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // -----------------------------------
    // NO EXAM
    // -----------------------------------
    if (!exam) {
        return <p>Exam not found.</p>;
    }

    // -----------------------------------
    // CURRENT QUESTION
    // -----------------------------------
    const question = questions[currentQuestion];

    const answeredCount = Object.keys(answers).length;

    // -----------------------------------
    // UI
    // -----------------------------------
    return (
        <div>
            <h1>{exam.title}</h1>

            <p>
                Subject: {exam.subject_name || exam.subject}
            </p>

            <p>
                Duration: {exam.duration} minutes
            </p>

            <hr />

            {/* TIMER */}
            <h2
                style={{
                    color:
                        timeLeft <= 60
                            ? "red"
                            : "black",
                }}
            >
                Time Left: {formatTime(timeLeft)}
            </h2>

            {timeLeft <= 60 && timeLeft > 0 && (
                <p
                    style={{
                        color: "red",
                        fontWeight: "bold",
                    }}
                >
                    ⚠️ Less than one minute remaining!
                </p>
            )}

            <p>
                Answered: {answeredCount} /{" "}
                {questions.length}
            </p>

            <hr />

            {questions.length === 0 ? (
                <p>No questions available for this exam.</p>
            ) : (
                <div>
                    {/* QUESTION NUMBER */}
                    <h3>
                        Question {currentQuestion + 1} of{" "}
                        {questions.length}
                    </h3>

                    {/* QUESTION */}
                    <p>{question.question_text}</p>

                    <br />

                    {/* OPTION A */}
                    <label>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value="A"
                            checked={
                                answers[question.id] === "A"
                            }
                            onChange={() =>
                                handleAnswerChange(
                                    question.id,
                                    "A"
                                )
                            }
                        />

                        {" "}A. {question.option_a}
                    </label>

                    <br />
                    <br />

                    {/* OPTION B */}
                    <label>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value="B"
                            checked={
                                answers[question.id] === "B"
                            }
                            onChange={() =>
                                handleAnswerChange(
                                    question.id,
                                    "B"
                                )
                            }
                        />

                        {" "}B. {question.option_b}
                    </label>

                    <br />
                    <br />

                    {/* OPTION C */}
                    <label>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value="C"
                            checked={
                                answers[question.id] === "C"
                            }
                            onChange={() =>
                                handleAnswerChange(
                                    question.id,
                                    "C"
                                )
                            }
                        />

                        {" "}C. {question.option_c}
                    </label>y

                    <br />
                    <br />

                    {/* OPTION D */}
                    <label>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value="D"
                            checked={
                                answers[question.id] === "D"
                            }
                            onChange={() =>
                                handleAnswerChange(
                                    question.id,
                                    "D"
                                )
                            }
                        />

                        {" "}D. {question.option_d}
                    </label>

                    <hr />

                    {/* QUESTION NAVIGATION */}
                    <div>
                        <button
                            disabled={
                                currentQuestion === 0
                            }
                            onClick={() =>
                                setCurrentQuestion(
                                    currentQuestion - 1
                                )
                            }
                        >
                            Previous
                        </button>

                        {" "}

                        {currentQuestion <
                            questions.length - 1 ? (
                            <button
                                onClick={() =>
                                    setCurrentQuestion(
                                        currentQuestion + 1
                                    )
                                }
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={() =>
                                    handleSubmit(false)
                                }
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Exam"}
                            </button>
                        )}
                    </div>

                    <br />

                    {/* QUESTION NAVIGATION NUMBERS */}
                    <div>
                        {questions.map(
                            (item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() =>
                                        setCurrentQuestion(
                                            index
                                        )
                                    }
                                    style={{
                                        margin: "3px",
                                        fontWeight:
                                            answers[item.id]
                                                ? "bold"
                                                : "normal",
                                    }}
                                >
                                    {index + 1}
                                </button>
                            )
                        )}
                    </div>
                </div>
            )}

            <br />

            <button
                onClick={() =>
                    navigate("/student/dashboard")
                }
                disabled={submitting}
            >
                Exit Exam
            </button>
        </div>
    );
}

export default Exam;