"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "./magnetic-button";

type SubmitStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Check your connection and try again.");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 rounded-3xl border border-[#e1dcb7]/20 bg-[#b4a84b]/[0.06] p-8"
    >
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-[#e1dcb7]/75"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-xl border border-[#e1dcb7]/25 bg-transparent px-4 py-3 text-[#f4f4d7] placeholder:text-[#e1dcb7]/40 transition-colors focus:border-[#b4a84b] focus:outline-none"
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-[#e1dcb7]/75"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-xl border border-[#e1dcb7]/25 bg-transparent px-4 py-3 text-[#f4f4d7] placeholder:text-[#e1dcb7]/40 transition-colors focus:border-[#b4a84b] focus:outline-none"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-[#e1dcb7]/75"
        >
          Message
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          rows={6}
          className="w-full rounded-xl border border-[#e1dcb7]/25 bg-transparent px-4 py-3 text-[#f4f4d7] placeholder:text-[#e1dcb7]/40 transition-colors focus:border-[#b4a84b] focus:outline-none"
          placeholder="Tell me about your project..."
          required
        />
      </div>

      {status === "success" ? (
        <div className="space-y-4 text-center">
          <p
            className="rounded-full bg-[#e1dcb7]/15 px-8 py-4 text-sm font-medium text-[#e1dcb7]"
            role="status"
          >
            Thanks — your message was sent.
          </p>
          <button
            type="button"
            className="text-xs font-medium uppercase tracking-[0.14em] text-[#e1dcb7]/80 underline-offset-4 transition-colors hover:text-[#f4f4d7] hover:underline"
            onClick={() => setStatus("idle")}
          >
            Send another message
          </button>
        </div>
      ) : (
        <MagneticButton
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-[#b4a84b] px-8 py-4 text-sm font-medium uppercase tracking-[0.12em] text-[#2f3731] transition-colors hover:bg-[#e1dcb7]"
          strength={0.2}
        >
          {status === "sending" ? "Sending…" : "Send Message"}
        </MagneticButton>
      )}

      {status === "error" && errorMessage && (
        <p className="text-center text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      )}
    </motion.form>
  );
}





