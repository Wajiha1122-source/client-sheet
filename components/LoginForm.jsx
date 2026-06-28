"use client";

import { useState, useTransition } from "react";
import { LogIn } from "lucide-react";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      window.location.href = data.redirectTo;
    });
  }

  return (
    <form onSubmit={onSubmit}>
      {error ? <div className="alert">{error}</div> : null}
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="button" type="submit" disabled={pending}>
        <LogIn size={18} />
        {pending ? "Checking..." : "Login"}
      </button>
    </form>
  );
}
