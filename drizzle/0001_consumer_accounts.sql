CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT '',
  interests TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_last_seen_idx ON users(last_seen_at);

CREATE TABLE IF NOT EXISTS user_saves (
  user_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  story_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, story_id)
);

CREATE TABLE IF NOT EXISTS user_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  anonymous_id TEXT,
  session_id TEXT,
  event_name TEXT NOT NULL,
  story_id TEXT,
  topic TEXT,
  properties TEXT NOT NULL DEFAULT '{}',
  occurred_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS events_time_idx ON user_events(occurred_at);
CREATE INDEX IF NOT EXISTS events_user_idx ON user_events(user_id, occurred_at);
CREATE INDEX IF NOT EXISTS events_name_idx ON user_events(event_name, occurred_at);
