# IntelFlow analytics event contract

Web and Android clients send product activity to `POST /api/events` using the same event names and payload shape. Do not create Android-only aliases for these events.

```json
{
  "event": "story_viewed",
  "anonymousId": "installation-scoped-random-id",
  "sessionId": "session-scoped-random-id",
  "storyId": "publisher-story-id",
  "topic": "Technology",
  "properties": {
    "platform": "android"
  }
}
```

Required client rules:

- Set `properties.platform` to `web` or `android`.
- Use a random installation identifier before login; never use an advertising ID, phone number or hardware identifier.
- Rotate `sessionId` when a new app session starts.
- Once authenticated, use the normal IntelFlow session so the server can associate events with the user.
- Keep optional property values non-sensitive. Do not send article contents, contacts, message recipients or device identifiers.

Stable event names:

- `session_started`
- `signed_in`
- `story_viewed`
- `storyarc_opened`
- `source_opened`
- `story_saved`
- `story_unsaved`
- `share_started`
- `share_completed`
- `share_downloaded`
- `feed_refreshed`
- `topic_opened`
- `scroll_feedback` with `properties.reason`: `useful_story`, `caught_up`, `repetitive` or `not_relevant`
- `profile_updated`
- `signed_out`
- `account_deleted`

The admin dashboard combines both platforms and exposes a platform-mix breakdown. Retention is calculated from activity days, so both clients must send `session_started` reliably.
