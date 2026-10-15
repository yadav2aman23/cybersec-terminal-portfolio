
import { useState } from "react";
import {
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export default function AdminLogin({ onAdminLogin, onClose }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const credential = await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            // Replace this placeholder with your actual Firebase Auth UID.
            const ADMIN_UID = "ReKfdP9a10cJYMkq2z4V6q16lps2";

            if (credential.user.uid !== ADMIN_UID) {
                await signOut(auth);
                setError("This account is not authorized as an admin.");
                return;
            }

            onAdminLogin(credential.user);
        } catch {
            setError("Login failed. Check your email and password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-login-backdrop">
            <form className="admin-login-panel" onSubmit={handleSubmit}>
                <h2>Admin Login</h2>
                <p>Sign in to manage portfolio details.</p>

                <label htmlFor="admin-email">Email</label>
                <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <label htmlFor="admin-password">Password</label>
                <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                {error && <p role="alert" className="admin-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
}
