"use client";

import { useState, type FormEvent } from "react";
import { CONTACT } from "@/lib/siteContent";
import { sendEnquiry } from "@/services/siteService";
import SiteIcon from "@/components/site/SiteIcon";
import { ENQUIRY_SUBJECTS, YEAR_GROUPS } from "@/types";

/** A line of contact details with a button that copies it. */
function CopyRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access: the text is selectable, so people can copy it by hand.
    }
  }
  return (
    <div className="ci">
      <span className="k"><SiteIcon name={icon} /></span>
      <div>
        <div className="small muted">{label}</div>
        <div className="v">{value}</div>
      </div>
      <button type="button" className="copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
    </div>
  );
}

/** "Book a free consultation": the contact details and the form. The message is saved for the admins. */
export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const input = {
      parentName: value("parentName"),
      studentName: value("studentName"),
      email: value("email"),
      phone: value("phone"),
      yearGroup: value("yearGroup"),
      subject: value("subject"),
      message: value("message"),
    };
    if (!input.parentName) return setError("Add the parent’s name.");
    if (!input.studentName) return setError("Add the student’s name.");
    if (!/^\S+@\S+\.\S+$/.test(input.email)) return setError("Add a valid email so we can reply.");

    setError("");
    setSending(true);
    try {
      await sendEnquiry(input);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again, or email us.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="band ink" id="contact">
      <div className="in contact">
        <div className="stack" style={{ gap: 22 }}>
          <span className="eyebrow">Contact us</span>
          <h2>Talk to us about your child’s learning</h2>
          <p className="lead">Tell us a little about the student and we will get back to you to arrange a free consultation.</p>
          <div className="contact-list">
            <CopyRow icon="mail" label="Email" value={CONTACT.email} />
            <CopyRow icon="phone" label="Phone and WhatsApp" value={CONTACT.phone} />
            <div className="ci">
              <span className="k"><SiteIcon name="pin" /></span>
              <div>
                <div className="v">{CONTACT.place}</div>
                <div className="small muted">{CONTACT.placeNote}</div>
              </div>
            </div>
          </div>
        </div>

        {sent ? (
          <div className="card stack" style={{ background: "var(--surface)", color: "var(--ink)", borderRadius: 22, padding: 32, border: "1px solid var(--line)" }}>
            <h3>Thank you. We have your details.</h3>
            <p className="ok-msg">Your message has gone to the Educate Cloud team. We reply within one working day.</p>
            <button type="button" className="btn" onClick={() => setSent(false)}>Send another enquiry</button>
          </div>
        ) : (
          <form className="card" onSubmit={submit} noValidate>
            <h3>Send us a message</h3>
            <div className="grid2">
              <label className="f" htmlFor="c-parent">Parent name<input id="c-parent" name="parentName" autoComplete="name" required /></label>
              <label className="f" htmlFor="c-child">Student name<input id="c-child" name="studentName" required /></label>
            </div>
            <div className="grid2">
              <label className="f" htmlFor="c-email">Email<input id="c-email" name="email" type="email" autoComplete="email" required /></label>
              <label className="f" htmlFor="c-phone">WhatsApp number<input id="c-phone" name="phone" type="tel" autoComplete="tel" /></label>
            </div>
            <div className="grid2">
              <label className="f" htmlFor="c-year">
                Year group
                <select id="c-year" name="yearGroup" defaultValue="Year 10">
                  {YEAR_GROUPS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </label>
              <label className="f" htmlFor="c-subj">
                Subject
                <select id="c-subj" name="subject" defaultValue="Maths">
                  {ENQUIRY_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <label className="f" htmlFor="c-msg">
              Anything we should know? <span className="h">Optional: exam board, target grade, what is hard right now</span>
              <textarea id="c-msg" name="message" rows={4} maxLength={2000} />
            </label>
            {error && <p className="err" role="alert">{error}</p>}
            <button className="btn solid" type="submit" disabled={sending}>{sending ? "Sending…" : "Send message"}</button>
            <p className="small muted">We reply within one working day. Your details are only used to answer your enquiry.</p>
          </form>
        )}
      </div>
    </section>
  );
}
