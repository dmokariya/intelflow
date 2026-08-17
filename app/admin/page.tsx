"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type UserRow = { id: string; name: string; email: string; photo: string; created_at: number; last_seen_at: number; action_count: number; stories_viewed: number };
type ActionRow = { event_name: string; topic: string | null; occurred_at: number; user_name: string | null; user_email: string | null };
type Data = { kpis: Record<string, number>; topics: Array<{ topic: string; value: number }>; recent: ActionRow[]; users: UserRow[] };
const labels: Record<string, string> = { users: "Registered users", dau: "Daily active", wau: "Weekly active", mau: "Monthly active", events7: "Actions · 7d", views7: "Stories viewed · 7d", saves7: "Saves · 7d", shares7: "Shares · 7d", sources7: "Source opens · 7d", refresh7: "Refreshes · 7d", returning7: "Returning users · 7d", sessionDepth: "Actions / session" };

export default function AdminDashboard() {
  const [data, setData] = useState<Data | null>(null), [error, setError] = useState(""), [query, setQuery] = useState(""), [selectedEmail, setSelectedEmail] = useState("");
  useEffect(() => { fetch("/api/admin/metrics", { cache: "no-store" }).then(async (response) => { if (!response.ok) throw new Error((await response.json()).error || "Unavailable"); return response.json(); }).then(setData).catch((reason) => setError(reason.message)); }, []);
  const filteredUsers = useMemo(() => (data?.users || []).filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())), [data, query]);
  const filteredActions = useMemo(() => (data?.recent || []).filter((action) => !selectedEmail || action.user_email === selectedEmail), [data, selectedEmail]);
  if (error) return <main className="analytics-shell"><Link href="/">← IntelFlow</Link><h1>Audience dashboard</h1><p>{error}</p></main>;
  if (!data) return <main className="analytics-shell"><p>Loading audience metrics…</p></main>;
  return <main className="analytics-shell"><Link href="/">← IntelFlow</Link><span>PRIVATE · ADMIN</span><h1>Audience dashboard</h1><p>Product health, reading depth and registered-user activity. Phone numbers and demographic profiles are not collected.</p>
    <section className="analytics-kpis">{Object.entries(data.kpis).map(([key, value]) => <article key={key}><span>{labels[key] || key}</span><strong>{value}</strong></article>)}</section>
    <section className="analytics-grid"><article><h2>Topic affinity</h2>{data.topics.length ? data.topics.map((item) => <div className="metric-row" key={item.topic}><span>{item.topic}</span><strong>{item.value}</strong></div>) : <p>No topic activity yet.</p>}</article><article><h2>Recent actions</h2>{selectedEmail && <button className="analytics-clear" onClick={() => setSelectedEmail("")}>Showing {selectedEmail} · clear</button>}{filteredActions.slice(0, 25).map((item, index) => <div className="metric-row metric-action" key={`${item.occurred_at}-${index}`}><span><b>{item.user_name || item.user_email || "Guest"}</b>{item.event_name.replaceAll("_", " ")}{item.topic ? ` · ${item.topic}` : ""}</span><time>{new Date(item.occurred_at).toLocaleString("en-IN")}</time></div>)}</article></section>
    <section className="analytics-users"><header><div><span>REGISTERED USERS</span><h2>User activity</h2></div><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" aria-label="Search users" /></header><div className="analytics-table-wrap"><table><thead><tr><th>User</th><th>Joined</th><th>Last seen</th><th>Actions</th><th>Stories</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id} onClick={() => setSelectedEmail(user.email)}><td><div className="analytics-person">{user.photo ? <img src={user.photo} alt="" /> : <i>{user.name.slice(0, 1) || "?"}</i>}<span><b>{user.name || "Unnamed"}</b><small>{user.email}</small></span></div></td><td>{new Date(user.created_at).toLocaleDateString("en-IN")}</td><td>{new Date(user.last_seen_at).toLocaleString("en-IN")}</td><td>{user.action_count}</td><td>{user.stories_viewed}</td></tr>)}</tbody></table></div>{!filteredUsers.length && <p>No matching registered users.</p>}</section>
  </main>;
}
