import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const EMPTY_FORM = { coordinatorName: "", designation: "", eventName: "", description: "", imageUrl: "" };

export default function AdminDashboard({ onClose, adminUid }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snapshot = await getDoc(doc(db, "portfolio", "leadership"));
        if (active && snapshot.exists()) setForm({ ...EMPTY_FORM, ...snapshot.data() });
      } catch (error) {
        if (active) setMessage(`Could not load details: ${error.code || error.message}`);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      await setDoc(doc(db, "portfolio", "leadership"), {
        coordinatorName: form.coordinatorName.trim(), designation: form.designation.trim(),
        eventName: form.eventName.trim(), description: form.description.trim(),
        imageUrl: form.imageUrl.trim(), updatedAt: serverTimestamp(), updatedBy: adminUid || ""
      });
      setMessage("Saved successfully. Public Leadership section will update automatically.");
    } catch (error) {
      console.error("Admin save error:", error.code, error.message);
      setMessage(`Save failed: ${error.code || error.message}. Check Firestore rules and admin UID.`);
    } finally { setSaving(false); }
  }

  return <div className="admin-dashboard-backdrop">
    <section className="admin-dashboard-panel" role="dialog" aria-modal="true" aria-labelledby="admin-dashboard-title">
      <header className="admin-dashboard-heading">
        <div><p className="admin-dashboard-eyebrow">AMAN.SEC / CONTENT STUDIO</p><h2 id="admin-dashboard-title">Admin dashboard</h2><p className="admin-dashboard-subtitle">Manage the public Leadership section.</p></div>
        <button type="button" className="admin-dashboard-close" onClick={onClose}>Close ×</button>
      </header>
      {loading ? <div className="admin-loading"><span className="spinner" /> Loading saved content…</div> : <form onSubmit={handleSave} className="admin-dashboard-form">
        <div className="admin-form-intro"><span className="admin-section-index">01</span><div><h3>Coordinator & event</h3><p>Changes publish to the public page after saving.</p></div></div>
        <label>Coordinator name<input name="coordinatorName" value={form.coordinatorName} onChange={updateField} required maxLength={100} placeholder="Full name" /></label>
        <label>Designation<input name="designation" value={form.designation} onChange={updateField} required maxLength={120} placeholder="Student Coordinator" /></label>
        <label className="admin-field-wide">Event name<input name="eventName" value={form.eventName} onChange={updateField} required maxLength={180} placeholder="Workshop on IoT and Smart System" /></label>
        <label className="admin-field-wide">Event description<textarea name="description" value={form.description} onChange={updateField} required rows={5} maxLength={2000} placeholder="Describe your role and the event…" /></label>
        <label className="admin-field-wide">Image URL <span className="field-hint">Use a public HTTPS image link; direct uploads are disabled in this version.</span><input name="imageUrl" type="url" value={form.imageUrl} onChange={updateField} placeholder="https://example.com/workshop.jpg" /></label>
        {form.imageUrl && <div className="admin-dashboard-preview"><img src={form.imageUrl} alt="Preview of selected event" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>Image preview</span></div>}
        {message && <p className={message.startsWith("Saved") ? "admin-dashboard-success" : "admin-dashboard-message"} role="status">{message}</p>}
        <div className="admin-form-actions"><button type="submit" className="admin-save-button" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><span className="admin-form-note">Secure write · Firebase Firestore</span></div>
      </form>}
    </section>
  </div>;
}
