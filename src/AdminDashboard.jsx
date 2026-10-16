import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { profile, focusAreas, featuredProjects, learningLog, leadership, otherHighlights } from "./data.js";

const sections = [
  { key: "profile", label: "Profile", singular: "Profile", fields: [{ key: "name", label: "Full name", type: "text", required: true }, { key: "headline", label: "Headline", type: "text" }, { key: "role", label: "Role", type: "text" }, { key: "tagline", label: "Short intro", type: "textarea" }, { key: "about", label: "About me", type: "textarea" }, { key: "location", label: "Location", type: "text" }, { key: "email", label: "Public email", type: "email" }, { key: "username", label: "GitHub username", type: "text" }, { key: "linkedin", label: "LinkedIn URL", type: "url" }, { key: "tryhackme", label: "TryHackMe URL", type: "url" }, { key: "photoUrl", label: "Profile photo URL (Google Drive public link)", type: "url" }, { key: "backgroundAnimation", label: "Enable background animation", type: "checkbox" }] },
  { key: "projects", label: "Projects", singular: "Project", fields: [{ key: "name", label: "Project name", type: "text", required: true }, { key: "description", label: "Description", type: "textarea" }, { key: "tagsText", label: "Tech stack (comma-separated)", type: "text" }, { key: "url", label: "GitHub / source URL", type: "url" }, { key: "liveUrl", label: "Live demo URL", type: "url" }, { key: "imageUrl", label: "Cover image URL", type: "url" }] },
  { key: "skills", label: "Skills", singular: "Skill", fields: [{ key: "name", label: "Skill name", type: "text", required: true }, { key: "category", label: "Category", type: "text" }, { key: "level", label: "Level / status", type: "text" }] },
  { key: "labs", label: "Labs & write-ups", singular: "Lab", fields: [{ key: "title", label: "Lab / write-up title", type: "text", required: true }, { key: "description", label: "What you learned", type: "textarea" }, { key: "platform", label: "Platform", type: "text" }, { key: "status", label: "Status", type: "text" }, { key: "url", label: "Write-up URL", type: "url" }] },
  { key: "events", label: "Events", singular: "Event", fields: [{ key: "title", label: "Event name", type: "text", required: true }, { key: "role", label: "Your role", type: "text" }, { key: "date", label: "Date", type: "text" }, { key: "description", label: "Description", type: "textarea" }, { key: "imageUrl", label: "Photo URL", type: "url" }, { key: "link", label: "Event link", type: "url" }] },
  { key: "photos", label: "Photos", singular: "Photo", fields: [{ key: "title", label: "Photo title", type: "text", required: true }, { key: "caption", label: "Caption", type: "textarea" }, { key: "imageUrl", label: "Image URL", type: "url" }, { key: "alt", label: "Accessible image description", type: "text" }] },
  { key: "links", label: "Links", singular: "Link", fields: [{ key: "label", label: "Link label", type: "text", required: true }, { key: "url", label: "URL", type: "url", required: true }, { key: "kind", label: "Category", type: "text" }] },
];
const starter = {
  profile: { ...profile, photoUrl: "", backgroundAnimation: true, headline: "Cybersecurity Learner | Network Security | DFIR", about: "I am building practical skills in cybersecurity, network analysis, digital forensics, and web security through hands-on labs and documented projects." },
  projects: featuredProjects.map((x, i) => ({ ...x, id: `project-${i + 1}`, published: true, liveUrl: "", imageUrl: "" })),
  skills: focusAreas.map((name, i) => ({ id: `skill-${i + 1}`, name, category: "Core Skills", level: "Learning" })),
  labs: learningLog.map((x, i) => ({ id: `lab-${i + 1}`, title: x.title, description: x.text, platform: "Personal Lab", status: x.status, url: "" })),
  events: leadership.map((x, i) => ({ id: `event-${i + 1}`, title: x.event, role: x.role, description: x.description, date: "", imageUrl: x.image || "", link: "" })),
  photos: otherHighlights.map((x, i) => ({ id: `photo-${i + 1}`, title: x.title, caption: x.description, imageUrl: x.image || "", alt: x.title })),
  links: [{ id: "link-github", label: "GitHub", url: `https://github.com/${profile.username}`, kind: "Code" }, { id: "link-linkedin", label: "LinkedIn", url: profile.linkedin, kind: "Professional" }, { id: "link-tryhackme", label: "TryHackMe", url: profile.tryhackme, kind: "Labs" }],
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function AdminDashboard({ onClose, adminUid, onPublished }) {
  const [activeKey, setActiveKey] = useState("profile");
  const [draft, setDraft] = useState(() => clone(starter));
  const [published, setPublished] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [lastPublished, setLastPublished] = useState(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [preview, setPreview] = useState(false);
  const activeSection = sections.find((s) => s.key === activeKey) || sections[0];
  const isCollection = activeKey !== "profile";

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [draftSnap, publishedSnap, oldLeadership] = await Promise.all([
          getDoc(doc(db, "portfolioDrafts", "siteContent")),
          getDoc(doc(db, "portfolioPublished", "siteContent")),
          getDoc(doc(db, "portfolio", "leadership")),
        ]);
        let base = clone(starter);
        if (publishedSnap.exists() && publishedSnap.data().content) {
          const pub = publishedSnap.data();
          base = { ...base, ...pub.content };
          if (pub.publishedAt) setLastPublished(pub.publishedAt.toDate ? pub.publishedAt.toDate() : null);
        }
        if (oldLeadership.exists()) {
          const old = oldLeadership.data();
          const existing = base.events || [];
          const alreadyMapped = existing.some((e) => e.title === old.eventName);
          if (!alreadyMapped && old.eventName) base.events = [...existing, { id: "legacy-leadership", title: old.eventName, role: old.designation || "Coordinator", description: old.description || "", imageUrl: old.imageUrl || "", date: "", link: "" }];
        }
        if (!alive) return;
        if (draftSnap.exists() && draftSnap.data().content) setDraft({ ...base, ...draftSnap.data().content });
        else setDraft(base);
        setPublished(base);
      } catch (error) {
        if (alive) setMessage(`Could not load CMS content: ${error.code || error.message}. Check Firestore rules.`);
      } finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, []);

  function startNew() { setEditing("new"); setForm({}); setMessage(""); }
  function startEdit(item, index) {
    setEditing(index); setForm({ ...item, tagsText: (item.tags || item.techStack || []).join(", ") }); setMessage("");
  }
  function updateField(e) { const t = e.target; setForm((old) => ({ ...old, [t.name]: t.type === "checkbox" ? t.checked : t.value })); }
  function saveItem(e) {
    e.preventDefault();
    const record = { ...form, id: form.id || `${activeKey}-${newId()}` };
    if (activeKey === "projects") record.tags = (form.tagsText || "").split(",").map((x) => x.trim()).filter(Boolean);
    delete record.tagsText;
    if (activeKey === "projects" && record.published === undefined) record.published = true;
    setDraft((old) => {
      if (activeKey === "profile") return { ...old, profile: record };
      const items = [...(old[activeKey] || [])];
      if (editing === "new") items.push(record); else items[editing] = record;
      return { ...old, [activeKey]: items };
    });
    setEditing(null); setForm({}); setMessage("Changes are in the editor. Click Save Draft to store them; Publish is separate.");
  }
  function deleteItem(index) {
    if (!window.confirm(`Delete this ${activeSection.singular.toLowerCase()} from the current draft? It will not affect the live site until you publish.`)) return;
    setDraft((old) => ({ ...old, [activeKey]: (old[activeKey] || []).filter((_, i) => i !== index) }));
    setMessage("Removed from draft. Save Draft to keep this change.");
  }
  function moveItem(index, direction) {
    setDraft((old) => { const items = [...(old[activeKey] || [])]; const next = index + direction; if (next < 0 || next >= items.length) return old;[items[index], items[next]] = [items[next], items[index]]; return { ...old, [activeKey]: items }; });
  }
  async function saveDraft() {
    setSaving(true); setMessage("");
    try {
      await setDoc(doc(db, "portfolioDrafts", "siteContent"), { content: draft, status: "draft", updatedAt: serverTimestamp(), updatedBy: adminUid || "" });
      setMessage("Draft saved. Public website has not changed.");
    } catch (error) { setMessage(`Draft save failed: ${error.code || error.message}. Check Firestore rules.`); }
    finally { setSaving(false); }
  }
  async function publish() {
    setSaving(true); setMessage("");
    try {
      await setDoc(doc(db, "portfolioPublished", "siteContent"), { content: draft, status: "published", publishedAt: serverTimestamp(), publishedBy: adminUid || "" });
      await setDoc(doc(db, "portfolioDrafts", "siteContent"), { content: draft, status: "draft", updatedAt: serverTimestamp(), updatedBy: adminUid || "" });
      setPublished(clone(draft)); setLastPublished(new Date()); setConfirmPublish(false); setPreview(false);
      onPublished?.(draft); setMessage("Published successfully. The public portfolio now uses this version.");
    } catch (error) { setMessage(`Publish failed: ${error.code || error.message}. Check Firestore rules.`); }
    finally { setSaving(false); }
  }
  function discardDraft() {
    if (!window.confirm("Discard all unsaved editor changes and restore the last loaded/published version?")) return;
    setDraft(clone(published || starter)); setEditing(null); setForm({}); setMessage("Editor restored to the published version. Save Draft is not needed.");
  }

  return <div className="cms-backdrop"><section className="cms-shell" role="dialog" aria-modal="true" aria-labelledby="cms-title">
    <header className="cms-header"><div><span className="cms-eyebrow"><i className="status-dot" /> AMAN.SEC / CONTROL PLANE</span><h2 id="cms-title">Portfolio CMS <span>v2.0</span></h2><p>Manage content safely with draft-first publishing.</p></div><div className="cms-header-actions"><button className="cms-button subtle" onClick={() => setPreview(!preview)}>{preview ? "Close preview" : "Preview draft"}</button><button className="cms-close" onClick={onClose} aria-label="Close admin panel">✕</button></div></header>
    <div className="cms-statusbar"><span><i className="status-dot" /> ADMIN SESSION VERIFIED</span><span>{lastPublished ? `LAST PUBLISHED: ${lastPublished.toLocaleString()}` : "NO PUBLISHED TIMESTAMP RECORDED"}</span></div>
    {loading ? <div className="cms-loading">Loading saved draft and published content…</div> : <div className="cms-layout">
      <aside className="cms-sidebar"><span className="cms-sidebar-label">CONTENT MODULES</span>{sections.map((section, i) => <button key={section.key} className={activeKey === section.key ? "cms-nav-item active" : "cms-nav-item"} onClick={() => { setActiveKey(section.key); setEditing(null); setForm({}); }}><span className="cms-nav-number">0{i + 1}</span><span>{section.label}</span>{section.key !== "profile" && <small>{(draft[section.key] || []).length}</small>}</button>)}<div className="cms-sidebar-note"><strong>WORKFLOW</strong><span>1. Edit content</span><span>2. Save Draft</span><span>3. Preview</span><span>4. Publish explicitly</span></div><button className="cms-signout" onClick={async () => { await signOut(auth); onClose(); }}>Sign out ↗</button></aside>
      <div className="cms-workspace">
        {preview ? <div className="draft-preview"><div className="cms-section-heading"><span className="cms-eyebrow">UNPUBLISHED PREVIEW</span><h3>{draft.profile?.name || "Portfolio"}</h3><p>{draft.profile?.headline || draft.profile?.role}</p></div><div className="preview-grid">{["projects", "labs", "skills", "events", "photos", "links"].map((key) => <div className="preview-panel" key={key}><h4>{key.toUpperCase()} <span>{(draft[key] || []).length}</span></h4>{(draft[key] || []).slice(0, 4).map((x) => <p key={x.id || x.name}>{x.name || x.title || x.label}</p>)}</div>)}</div><p className="cms-help">This is a content preview inside the admin panel; it is not the full visual public-site preview.</p></div> : <>
          <div className="cms-section-heading"><div><span className="cms-eyebrow">CONTENT MODULE / {activeSection.key.toUpperCase()}</span><h3>{activeSection.label}</h3><p>{activeKey === "profile" ? "Edit the identity and contact information displayed across your site." : `Manage ${activeSection.label.toLowerCase()} shown on the public portfolio.`}</p></div>{isCollection && !editing && <button className="cms-button primary" onClick={startNew}>＋ Add {activeSection.singular}</button>}</div>
          {editing !== null ? <form className="cms-editor-form" onSubmit={saveItem}><div className="cms-editor-title"><h4>{activeKey === "profile" ? "Edit profile" : editing === "new" ? `New ${activeSection.singular}` : `Edit ${activeSection.singular}`}</h4><button type="button" className="cms-button subtle" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button></div><div className="cms-fields">{activeSection.fields.map((field) => field.type === "checkbox" ? <label className="cms-checkbox" key={field.key}><input name={field.key} type="checkbox" checked={form[field.key] !== false} onChange={updateField} />{field.label}</label> : <label className={field.type === "textarea" ? "wide" : ""} key={field.key}>{field.label}{field.type === "textarea" ? <textarea name={field.key} value={form[field.key] || ""} onChange={updateField} rows={4} required={field.required || false} maxLength={field.key === "about" || field.key === "description" ? 4000 : 2000} /> : <input name={field.key} type={field.type} value={form[field.key] || ""} onChange={updateField} required={field.required || false} maxLength={field.type === "url" ? 1000 : 300} />}</label>)}</div>{activeKey === "projects" && <label className="cms-checkbox"><input type="checkbox" checked={form.published !== false} onChange={(e) => setForm((old) => ({ ...old, published: e.target.checked }))} /> Show this project when the site is published</label>}<div className="cms-editor-actions"><button className="cms-button primary" type="submit">Apply to editor</button><span>Remember to click Save Draft after applying changes.</span></div></form> : isCollection ? <div className="cms-record-list">{(draft[activeKey] || []).length === 0 && <div className="cms-empty">No items yet. Use “Add {activeSection.singular}” to create one.</div>}{(draft[activeKey] || []).map((item, index) => <article className="cms-record" key={item.id || `${activeKey}-${index}`}><div className="cms-record-index">{String(index + 1).padStart(2, "0")}</div><div className="cms-record-body"><h4>{item.name || item.title || item.label || "Untitled item"}</h4><p>{item.description || item.caption || item.url || item.headline || item.role || "No description added"}</p><div className="cms-record-tags">{(item.tags || []).map((tag) => <span key={tag}>{tag}</span>)}{item.category && <span>{item.category}</span>}{item.status && <span>{item.status}</span>}{item.published === false && <span className="draft-tag">HIDDEN ON PUBLISH</span>}</div></div><div className="cms-record-actions"><button title="Move up" disabled={index === 0} onClick={() => moveItem(index, -1)}>↑</button><button title="Move down" disabled={index === draft[activeKey].length - 1} onClick={() => moveItem(index, 1)}>↓</button><button title="Edit" onClick={() => startEdit(item, index)}>Edit</button><button title="Delete from draft" className="danger" onClick={() => deleteItem(index)}>Delete</button></div></article>)}</div> : <form className="cms-editor-form profile-form" onSubmit={(e) => { e.preventDefault(); setDraft((old) => ({ ...old, profile: { ...old.profile, ...form } })); setEditing(null); setForm({}); setMessage("Profile changes applied to editor. Click Save Draft to store them."); }}><div className="cms-editor-title"><h4>Profile fields</h4><button className="cms-button subtle" type="button" onClick={() => { setEditing("profile"); setForm({ ...(draft.profile || {}) }); }}>Edit profile</button></div><div className="profile-summary"><div><span>DISPLAY NAME</span><strong>{draft.profile?.name || "Not set"}</strong></div><div><span>HEADLINE</span><strong>{draft.profile?.headline || draft.profile?.role || "Not set"}</strong></div><div><span>LOCATION</span><strong>{draft.profile?.location || "Not set"}</strong></div><div><span>GITHUB</span><strong>{draft.profile?.username || "Not set"}</strong></div></div><p className="cms-help">Use Edit profile to update all profile fields, then Apply to editor and Save Draft.</p></form>}
        </>}
        {message && <div className={/failed|could not/i.test(message) ? "cms-message error" : "cms-message"} role="status">{message}</div>}
        <div className="cms-publish-bar"><div><span className="draft-status"><i /> DRAFT WORKSPACE</span><p>Saving a draft never changes the public website.</p></div><div className="cms-publish-actions"><button className="cms-button subtle" onClick={discardDraft} disabled={saving}>Discard draft</button><button className="cms-button secondary" onClick={saveDraft} disabled={saving}>{saving ? "Saving…" : "Save Draft"}</button><button className="cms-button primary" onClick={() => setConfirmPublish(true)} disabled={saving}>{saving ? "Working…" : "Publish ↗"}</button></div></div>
      </div>
    </div>}
    {confirmPublish && <div className="confirm-overlay"><div className="confirm-box"><span className="cms-eyebrow">CONFIRM DEPLOYMENT</span><h3>Publish this version?</h3><p>This copies your current editor content to the public portfolio. Visitors will see these changes. Save Draft first if you want a recoverable draft.</p><div><button className="cms-button subtle" onClick={() => setConfirmPublish(false)}>Cancel</button><button className="cms-button primary" onClick={publish} disabled={saving}>{saving ? "Publishing…" : "Yes, publish now"}</button></div></div></div>}
  </section></div>;
}
