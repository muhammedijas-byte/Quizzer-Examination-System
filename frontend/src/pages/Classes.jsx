import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherLayout from "../components/TeacherLayout";

function Classes() {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const headers = { Authorization: `Bearer ${localStorage.getItem("access")}` };

    const loadClasses = async () => {
        try {
            const response = await api.get("classes/", { headers });
            setClasses(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Unable to load classes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadClasses(); }, []);

    const createClass = async (event) => {
        event.preventDefault();
        setBusy(true); setError(""); setMessage("");
        try {
            const response = await api.post("classes/", { name }, { headers });
            setClasses((items) => [...items, response.data].sort((a, b) => a.name.localeCompare(b.name)));
            setName(""); setMessage("Class created successfully.");
        } catch (err) {
            setError(err.response?.data?.name?.[0] || err.response?.data?.detail || "Unable to create class.");
        } finally { setBusy(false); }
    };

    const saveEdit = async (id) => {
        setBusy(true); setError(""); setMessage("");
        try {
            const response = await api.patch(`classes/${id}/`, { name: editingName }, { headers });
            setClasses((items) => items.map((item) => item.id === id ? response.data : item).sort((a, b) => a.name.localeCompare(b.name)));
            setEditingId(null); setMessage("Class updated successfully.");
        } catch (err) {
            setError(err.response?.data?.name?.[0] || err.response?.data?.detail || "Unable to update class.");
        } finally { setBusy(false); }
    };

    const deleteClass = async (item) => {
        if (!window.confirm(`Delete ${item.name}? Students and exams will remain, but become unassigned.`)) return;
        setError(""); setMessage("");
        try {
            await api.delete(`classes/${item.id}/`, { headers });
            setClasses((items) => items.filter((entry) => entry.id !== item.id));
            setMessage("Class deleted. Existing student and exam records were preserved.");
        } catch (err) {
            setError(err.response?.data?.detail || "Unable to delete class.");
        }
    };

    return <TeacherLayout>
        <header className="dashboard-topbar">
            <div><p className="eyebrow">CLASS MANAGEMENT</p><h1>Classes</h1><p className="page-subtitle">Organize students and exams by class.</p></div>
            <button className="btn btn-secondary" onClick={() => navigate("/teacher/dashboard")}>
                ← Dashboard
            </button>
        </header>
        <section className="student-management-stat"><div className="stat-card"><div className="stat-icon purple">▦</div><div><span>Total Classes</span><strong>{classes.length}</strong></div></div></section>
        {(error || message) && <div className={`alert ${error ? "alert-error" : "alert-success"}`} role="status">{error || message}</div>}
        <section className="management-section"><div className="section-heading"><div><span className="section-label">CREATE</span><h2>Create a Class</h2><p>Students and exams can be assigned after the class is created.</p></div></div>
            <div className="student-create-card"><form onSubmit={createClass}><div className="form-grid"><div className="form-field form-field-wide"><label htmlFor="class-name">Class Name</label><input id="class-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="For example, CSE-A" required /></div></div><div className="form-footer"><button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving..." : "+ Create Class"}</button></div></form></div>
        </section>
        <section className="management-section"><div className="section-heading section-heading-row"><div><span className="section-label">MANAGE</span><h2>My Classes</h2><p>Classes created by your teacher account.</p></div></div>
            {loading ? <div className="loading-panel"><div className="loading-spinner"/><p>Loading classes...</p></div> : classes.length === 0 ? <div className="empty-state"><h3>No classes created yet.</h3><p>Create a class to assign students and exams.</p></div> : <div className="exam-list">{classes.map((item) => <article className="exam-management-card" key={item.id}><div className="exam-card-main">{editingId === item.id ? <div className="form-field"><label htmlFor={`edit-class-${item.id}`}>Class Name</label><input id={`edit-class-${item.id}`} value={editingName} onChange={(event) => setEditingName(event.target.value)} maxLength={100}/></div> : <><span className="exam-subject-badge">CLASS</span><h3>{item.name}</h3></>}</div><div className="exam-card-actions">{editingId === item.id ? <><button className="secondary-button" disabled={busy} onClick={() => saveEdit(item.id)}>Save</button><button className="secondary-button" onClick={() => setEditingId(null)}>Cancel</button></> : <><button className="secondary-button" onClick={() => { setEditingId(item.id); setEditingName(item.name); }}>Edit</button><button className="delete-student-button" onClick={() => deleteClass(item)}>Delete</button></>}</div></article>)}</div>}
        </section>
        <footer className="dashboard-footer">Quizzer · Class Management</footer>
    </TeacherLayout>;
}

export default Classes;
