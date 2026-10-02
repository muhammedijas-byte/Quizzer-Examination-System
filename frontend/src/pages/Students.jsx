import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherLayout from "../components/TeacherLayout";

function Students() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [unassignedStudents, setUnassignedStudents] = useState([]);
    const [assigningId, setAssigningId] = useState(null);
    const [assignmentClass, setAssignmentClass] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [creating, setCreating] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [activeField, setActiveField] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        student_class: "",
    });
    const navigate = useNavigate();

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("access")}`,
    });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
            const [response, classResponse, unassignedResponse] = await Promise.all([
                api.get("students/list/", { headers: getHeaders() }),
                api.get("classes/", { headers: getHeaders() }),
                api.get("students/unassigned/", { headers: getHeaders() }),
            ]);
            setStudents(response.data);
            setClasses(classResponse.data);
            setUnassignedStudents(unassignedResponse.data);
            } catch (error) {
                console.error("Failed to fetch students:", error);

                setError(
                    error.response?.data?.detail ||
                    "Unable to load students."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleChange = (event) => {
        const { field, value } = event.target.dataset.field
            ? {
                field: event.target.dataset.field,
                value: event.target.value,
            }
            : { field: event.target.name, value: event.target.value };

        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const unlockField = (event) => {
        setActiveField(event.target.dataset.field);
    };

    const handleCreateStudent = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setCreating(true);

        try {
            const response = await api.post("students/", formData, {
                headers: getHeaders(),
            });

            setStudents((previous) => [
                ...previous,
                response.data,
            ]);
            setFormData({
                username: "",
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                student_class: "",
            });
            setMessage("Student account created successfully.");
        } catch (createError) {
            const data = createError.response?.data;
            const fieldError = data && Object.values(data)
                .flat()
                .find(Boolean);

            setError(
                fieldError ||
                data?.detail ||
                "Unable to create the student account."
            );
        } finally {
            setCreating(false);
        }
    };

    const handleRemoveStudent = async (student) => {
        const displayName =
            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
            student.username;

        if (!window.confirm(
            `Remove ${displayName}? This will permanently remove the account and its exam attempts.`
        )) {
            return;
        }

        setError("");
        setMessage("");
        setRemovingId(student.id);

        try {
            await api.delete(`students/${student.id}/`, {
                headers: getHeaders(),
            });

            setStudents((previous) =>
                previous.filter((item) => item.id !== student.id)
            );
            setMessage("Student account removed.");
        } catch (removeError) {
            setError(
                removeError.response?.data?.detail ||
                "Unable to remove the student account."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const handleAssignStudent = async (studentId) => {
        const classId = assignmentClass[studentId];
        if (!classId) return;
        setError(""); setMessage(""); setAssigningId(studentId);
        try {
            await api.patch(`students/${studentId}/class/`, { student_class: Number(classId) }, { headers: getHeaders() });
            const assigned = unassignedStudents.find((student) => student.id === studentId);
            setUnassignedStudents((items) => items.filter((student) => student.id !== studentId));
            setStudents((items) => [...items, { ...assigned, student_class: Number(classId), class_name: classes.find((item) => item.id === Number(classId))?.name }]);
            setMessage("Existing student assigned to your class.");
        } catch (assignError) {
            setError(assignError.response?.data?.student_class?.[0] || assignError.response?.data?.detail || "Unable to assign the student.");
        } finally { setAssigningId(null); }
    };

    return (
        <TeacherLayout>

            {/* HEADER */}
            <header className="dashboard-topbar">

                <div>
                    <p className="eyebrow">
                        STUDENT MANAGEMENT
                    </p>

                    <h1>
                        Students
                    </h1>

                    <p className="page-subtitle">
                        View and manage students registered
                        in the examination system.
                    </p>
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate("/teacher/dashboard")
                    }
                >
                    ← Dashboard
                </button>

            </header>


            {/* STAT */}
            <section className="student-management-stat">

                <div className="stat-card">

                    <div className="stat-icon purple">
                        ♙
                    </div>

                    <div>
                        <span>
                            Total Students
                        </span>

                        <strong>
                            {students.length}
                        </strong>
                    </div>

                </div>


                <div className="student-management-info">

                    <span className="management-dot"></span>

                    <div>
                        <strong>
                            Student Directory
                        </strong>

                        <p>
                            Registered student accounts
                            available to teachers.
                        </p>
                    </div>

                </div>

            </section>

            {(error || message) && (
                <div className={`alert ${error ? "alert-error" : "alert-success"}`}>
                    <span>{error ? "!" : "✓"}</span>
                    {error || message}
                </div>
            )}

            <section className="management-section">

                <div className="section-heading">
                    <div>
                        <span className="section-label">ADD STUDENT</span>
                        <h2>Create a Student Account</h2>
                        <p>
                            Add an individual student here, while students can
                            still create their own accounts from the registration page.
                        </p>
                    </div>
                </div>

                <div className="student-create-card">
                    <form onSubmit={handleCreateStudent} autoComplete="off">
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="student-first-name">First Name</label>
                                <input id="student-first-name" type="text" name="student-given-name" data-field="first_name" value={formData.first_name} onChange={handleChange} onFocus={unlockField} readOnly={activeField !== "first_name"} autoComplete="off" required />
                            </div>

                            <div className="form-field">
                                <label htmlFor="student-last-name">Last Name</label>
                                <input id="student-last-name" type="text" name="student-family-name" data-field="last_name" value={formData.last_name} onChange={handleChange} onFocus={unlockField} readOnly={activeField !== "last_name"} autoComplete="off" required />
                            </div>

                            <div className="form-field">
                                <label htmlFor="student-username">Username</label>
                                <input id="student-username" type="text" name="student-account-name" data-field="username" value={formData.username} onChange={handleChange} onFocus={unlockField} readOnly={activeField !== "username"} autoComplete="new-username" required />
                            </div>

                            <div className="form-field">
                                <label htmlFor="student-email">Email</label>
                                <input id="student-email" type="email" name="student-contact-email" data-field="email" value={formData.email} onChange={handleChange} onFocus={unlockField} readOnly={activeField !== "email"} autoComplete="off" required />
                            </div>

                            <div className="form-field form-field-wide">
                                <label htmlFor="student-class">Class</label>
                                <select id="student-class" name="student_class" value={formData.student_class} onChange={handleChange} required disabled={classes.length === 0}>
                                    <option value="">Select Class</option>
                                    {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                </select>
                                {classes.length === 0 && <p>No classes available. <button type="button" className="text-button" onClick={() => navigate("/teacher/classes")}>Create a class first.</button></p>}
                            </div>
                            <div className="form-field form-field-wide">
                                <label htmlFor="student-password">Password</label>
                                <input id="student-password" type="password" name="student-new-secret" data-field="password" value={formData.password} onChange={handleChange} onFocus={unlockField} readOnly={activeField !== "password"} autoComplete="new-password" minLength="6" required />
                            </div>
                        </div>

                        <div className="form-footer">
                            <span className="student-form-hint">Minimum 6 characters for the password.</span>
                            <button className="primary-button" type="submit" disabled={creating || classes.length === 0}>
                                {creating ? "Creating..." : "+ Add Student"}
                            </button>
                        </div>
                    </form>
                </div>

            </section>

            {unassignedStudents.length > 0 && (
                <section className="management-section">
                    <div className="section-heading"><div><span className="section-label">EXISTING ACCOUNTS</span><h2>Assign Unassigned Students</h2><p>These existing accounts have no class yet. Assigning them preserves their login details and exam history.</p></div></div>
                    {classes.length === 0 ? <div className="empty-state"><p>No classes available. <button type="button" className="btn btn-secondary" onClick={() => navigate("/teacher/classes")}>Create a class first.</button></p></div> : <div className="data-table-wrapper"><table className="data-table"><thead><tr><th>Student</th><th>Email</th><th>Class</th><th>Action</th></tr></thead><tbody>{unassignedStudents.map((student) => <tr key={student.id}><td>{`${student.first_name || ""} ${student.last_name || ""}`.trim() || student.username}</td><td>{student.email}</td><td><select aria-label={`Class for ${student.username}`} value={assignmentClass[student.id] || ""} onChange={(event) => setAssignmentClass((previous) => ({ ...previous, [student.id]: event.target.value }))}><option value="">Select Class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></td><td><button type="button" className="secondary-button" disabled={assigningId === student.id || !assignmentClass[student.id]} onClick={() => handleAssignStudent(student.id)}>{assigningId === student.id ? "Assigning..." : "Assign"}</button></td></tr>)}</tbody></table></div>}
                </section>
            )}


            {/* CONTENT */}
            <section className="dashboard-section">

                <div className="section-header">

                    <div>
                        <h2>
                            Student Directory
                        </h2>

                        <p>
                            All registered students
                        </p>
                    </div>

                    {students.length > 0 && (
                        <span className="section-count">
                            {students.length} students
                        </span>
                    )}

                </div>


                {loading ? (

                    <div className="loading-panel card">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading students...
                        </p>

                    </div>

                ) : error ? (

                    <div className="alert alert-error">
                        {error}
                    </div>

                ) : students.length === 0 ? (

                    <div className="empty-state card">

                        <div className="empty-icon">
                            ♙
                        </div>

                        <h3>
                            No students yet
                        </h3>

                        <p>
                            Students who register will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="data-table-wrapper">

                        <table className="data-table">

                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Class</th>
                                    <th>Student ID</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {students.map((student) => {

                                    const fullName =
                                        `${student.first_name || ""} ${student.last_name || ""}`.trim();

                                    const displayName =
                                        fullName ||
                                        student.username ||
                                        "Student";

                                    return (
                                        <tr
                                            key={student.id}
                                        >

                                            <td>

                                                <div className="student-table-user">

                                                    <div className="table-avatar">
                                                        {displayName[0].toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {displayName}
                                                        </strong>

                                                        <span>
                                                            Student
                                                        </span>
                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="username-text">
                                                    {student.username}
                                                </span>

                                            </td>


                                            <td>
                                                {student.email}
                                            </td>

                                            <td>{student.class_name || "Unassigned"}</td>


                                            <td>

                                                <span className="id-badge">
                                                    #{student.id}
                                                </span>

                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="delete-student-button"
                                                    onClick={() => handleRemoveStudent(student)}
                                                    disabled={removingId === student.id}
                                                >
                                                    {removingId === student.id ? "Removing..." : "Remove"}
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            <footer className="dashboard-footer">
                Quizzer · Student Management
            </footer>

        </TeacherLayout>
    );
}

export default Students;
