"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("IntelFlow support request");
  const [message, setMessage] = useState("");

  function openDraft(event: FormEvent) {
    event.preventDefault();
    const body = [`Name: ${name}`, `Reply email: ${email}`, "", message].join("\n");
    window.location.href = `mailto:hello@swarnimcapital.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return <form className="contact-form" onSubmit={openDraft}>
    <div className="contact-form-intro"><strong>Write to IntelFlow</strong><span>This form opens an email draft to hello@swarnimcapital.com. Nothing is uploaded or stored by IntelFlow.</span></div>
    <div className="contact-form-row"><label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label>Your email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label></div>
    <label>Subject<input required value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
    <label>Message<textarea required rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="How can we help? Please do not include client financial data." /></label>
    <button type="submit">Open email draft →</button>
  </form>;
}
