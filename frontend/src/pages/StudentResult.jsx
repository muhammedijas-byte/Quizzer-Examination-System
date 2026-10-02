import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function StudentResult() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = localStorage.getItem("access");
                const response = await api.get(
                    `results/my-results/${attemptId}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setResult(response.data);
            } catch (requestError) {
                console.error(
                    "Failed to load result:",
                    requestError
                );

                setError(
                    requestError.response?.data?.detail ||
                    "Unable to load the result."
                );
            }
        };

        fetchResult();
    }, [attemptId]);

    if (error) {
        return (
            <div>
                <h2>Result</h2>
                <p style={{ color: "red" }}>{error}</p>
                <button
                    onClick={() => navigate("/student/dashboard")}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!result) {
        return <p>Loading result...</p>;
    }

    return (
        <div className="student-result-page">
            <h1>Exam Result</h1>
            <h2>{result.exam_name}</h2>
            <p>Subject: {result.subject_name}</p>

            <hr />

            <h2>Summary</h2>
            <p>Score: {result.score} / {result.total_questions}</p>
            <p>Percentage: {result.percentage}%</p>
            <p>Correct answers: {result.correct_answers}</p>
            <p>Wrong answers: {result.wrong_answers}</p>
            <p>Unanswered: {result.unanswered}</p>

            <p>Status: {result.status}</p>

            <hr />

            <h2>Question Review</h2>

            {result.answers.length === 0 ? (
                <p>No answer details available.</p>
            ) : (
                result.answers.map((answer, index) => (
                    <div key={answer.question}>
                        <h3>Question {index + 1}</h3>

                        <p>
                            <strong>{answer.question_text}</strong>
                        </p>

                        <p>
                            Your Answer: {answer.selected_option || "Not Answered"}
                        </p>

                        <p>
                            Correct Answer: {answer.correct_option}
                        </p>

                        {answer.selected_option === null ? (
                            <p
                                style={{
                                    color: "orange",
                                    fontWeight: "bold",
                                }}
                            >
                                Unanswered
                            </p>
                        ) : answer.is_correct ? (
                            <p
                                style={{
                                    color: "green",
                                    fontWeight: "bold",
                                }}
                            >
                                Correct
                            </p>
                        ) : (
                            <p
                                style={{
                                    color: "red",
                                    fontWeight: "bold",
                                }}
                            >
                                Wrong
                            </p>
                        )}

                        <hr />
                    </div>
                ))
            )}

            <button onClick={() => navigate("/student/dashboard")}>
                Back to Dashboard
            </button>
        </div>
    );
}

export default StudentResult;
