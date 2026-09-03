---
name: brainrot
description: >
  Turn any topic, doc, article, README, or wall of text into "sludge content":
  a split-screen web page with a narrated ELI5-style lesson on the left
  (browser text-to-speech, one-word-at-a-time TikTok captions) and an endless
  pixel platformer or Subway-Surfers-style gameplay video on the right. USE
  WHEN the user says brainrot, sludge, subway surfers, smooth brain, "I can't
  focus on this", "too much text", "read this to me", "teach me X but make it
  fun / unhinged", "explain this like a TikTok", "help me get through this
  doc", or pastes something long and wants to actually absorb it rather than
  skim. Also for "eli5 with audio" or "narrate this". NOT FOR: a plain summary
  or TL;DR, a serious reference document, a diagram-first explanation (use
  eli5 or show-me), or deep comprehension with quizzes (use explain-this).
---

# Brainrot

Sludge content, but the top half is something you need to learn. One HTML
file shaped like a phone (9:16, TikTok-style): on top, the lesson in short
spoken beats with the current word highlighted and blown up as a caption;
underneath, Minecraft-style 3D parkour: a blocky guy running over a void,
jumping gaps and fences and sidestepping walls, forever (or real gameplay
footage if the user supplies a YouTube link). The parkour is synced to the
lesson: every beat recolors the world into a new biome, the beat's key phrase
launches him off a slime block through an arc of coins, and finishing turns
everything gold. Narration is a natural male voice picked automatically.
The eyes have somewhere to go, so the ears can do the work.

You write the beats. A bundled script turns them into the page and opens it.

## Two modes

**teach** — the user names a topic and you write the lesson. If the topic is a
real API, library, spec, or CLI, fetch the docs first (WebFetch, or the
`defuddle` skill for articles) so method names and flags are real and current.
Remembered API surfaces are where narrated lessons go wrong, and a confident
voice reading a wrong flag is worse than a hedge.

**focus** — the user hands over text, a file, or a URL they need to get
through. Read the whole thing before writing a single beat. Beats carry the
source's actual content, chunked and lightly rephrased for the ear. Put the
analogy in the `eli5` field so `text` can stay faithful. Never add claims the
source doesn't make; if a passage is ambiguous, say so in the beat.

Pick focus whenever there is source material. Pick teach when there isn't.

## Workflow

1. Get the material (see modes above).
2. Write the beats JSON (schema below) to a temp file, for example
   `${TMPDIR:-/tmp}/brainrot-<slug>.json`.
3. Build and open:
   ```bash
   node <skill-dir>/scripts/build.mjs <beats.json> [--video <youtube url|id>] [--out <file>] [--no-open]
   ```
   `<skill-dir>` is the directory containing this SKILL.md. The script prints
   the output path (default `~/.cache/brainrot/<slug>-<stamp>.html`) and
   opens it. Read its stderr: it warns about beats that are too long. Fix
   those and rebuild before handing over.
4. Reply in one or two lines: the path, and "click to start, space pauses,
   ⚙ for speed, C for smooth brain mode." The page is the deliverable.
   Don't paste the lesson into chat.

## Beat schema

```json
{
  "title": "PKCE, but make it sludge",
  "subtitle": "OAuth for apps that can't keep a secret",
  "mode": "teach",
  "source": "optional label: file name, URL host, or 'from memory'",
  "video": { "youtube": null },
  "beats": [
    {
      "emoji": "🔑",
      "title": "The problem",
      "text": "Your phone app wants to log in with OAuth. But it can't keep a secret, because anyone can unzip the app and read the code.",
      "key": "can't keep a secret",
      "eli5": "It's a diary with the key taped to the cover.",
      "code": "optional, eight lines max",
      "lang": "ts"
    }
  ]
}
```

Required: top-level `title` and each beat's `text`. Everything else is
optional. `mode` defaults to teach. Always write `key` anyway; see below.

## Writing beats

- **8 to 20 beats.** Fewer and the runner barely gets going; more and
  attention leaves before the end.
- **`text` is 1 to 3 sentences, 40 words or fewer.** It is read aloud. Browser
  speech gets flaky past about fifteen seconds of continuous speech, and
  nobody holds a sixty-word sentence by ear. The build script warns at 60.
- **One idea per beat.** If a beat needs "and also", split it.
- **Write for the ear.** Short sentences. Contractions. Concrete nouns. No
  parentheses, no semicolons, no lists inside `text`. Skip things speech
  engines mangle: raw URLs, snake_case identifiers, hex, version strings. Put
  those in `code` instead, where they're shown, not spoken.
- **`key` is the punchline: 1 to 5 words copied verbatim from `text`.** When
  narration reaches it the runner does his stunt and the phrase slams onto
  the video in big letters, so pick the words that carry the idea ("no
  token", "never leaves your app"), never a connective. Case-insensitive
  match; if it isn't found the stunt fires about 70% through the beat.
- **`title` is spoken first as its own sentence.** Five words or fewer.
- **`eli5` is shown, never spoken.** One sentence. It's where the analogy
  lives so `text` can stay precise.
- **`code` is eight lines or fewer** and looks runnable. It's the one place
  precision beats voice.
- **Order:** the hook (why care) → the one idea → mechanism in steps → the
  gotcha → what to do now → a closer a sleepy person could repeat back.

## Narrator voice

Unhinged is the delivery. The facts stay boring and correct. The runner and
the captions are the entertainment budget; the content doesn't need to spend
any.

- Talk like a friend explaining something at 1am, not a textbook. Second
  person, present tense.
- One concrete metaphor per beat, from daily life: bouncers, bank tellers,
  group chats, lost luggage. Not three metaphors.
- Hype only where it lands: "this is the whole trick" on the one idea, not on
  every beat.
- Fine: "okay so", "here's the thing", "no really", "this part is dumb but it
  matters". Not fine: stacked slang, fake enthusiasm on every line, anything
  you wouldn't say out loud. One "cooked" per lesson, max.
- Mild swearing is fine when it fits. Don't reach for it.
- Never invent. No made-up stats, versions, dates, or flag names. In teach
  mode, if you can't verify a name, fetch the docs or write "check the docs
  for the exact name" into the beat. In focus mode, keep the source's meaning
  exactly; rephrase only for the ear.

**Textbook:** "PKCE mitigates authorization code interception by binding the
token request to the client that initiated the authorization request via a
cryptographically random code verifier and its transformed code challenge."

**Brainrot:** "Here's the whole trick. Before you ask to log in, you make up a
big random secret and send only its hash. Later, when you trade the code for a
token, you show the original. Doesn't hash to the same thing? No token."
(`eli5`: "You mail a photo of your key first, then show up with the key.")

**Focus mode, source says:** "Retries use exponential backoff with full
jitter, capped at 30 seconds." **Beat:** "When a request fails, it waits a
random amount before trying again. The wait roughly doubles each time, but
never goes past thirty seconds." (`eli5`: "Knock, wait a bit, knock, wait
longer. Stop waiting longer at thirty seconds.")

## Options

- `--video <url|id>` starts on real gameplay footage instead of the built-in
  runner. Use it when the user names a video or asks for "actual subway
  surfers". Don't guess a video id from memory: ids can't be verified
  without fetching, and the owner may have disabled embedding. The page has
  a paste box, so the user can supply one later either way.
- `--out <path>` overrides the default output location.
- `--no-open` skips launching the browser.

## Gotchas

- **Don't ship this through an Artifact tool.** Speech synthesis and the
  YouTube iframe are blocked in artifact sandboxes. The page needs a real tab.
  The build script writes the file and opens it; that's the delivery.
- **The 3D runner loads three.js from cdnjs.** Offline, the video panel shows
  a one-line notice and the lesson still narrates; 📺 with a YouTube link
  also works once online. Nothing to fix in the beats.
- **Browsers won't speak until the user clicks.** The page opens on a "tap to
  start" gate on purpose.
- **The voice is picked by name, not chosen by the user.** The speech API has
  no gender or quality metadata, so the page ranks known male voices (Edge's
  neural "Natural" voices, Chrome's Google UK English Male, macOS's Alex, Tom,
  Evan, Daniel and friends, Enhanced variants first) and falls back to any
  English voice. There is no voice or pitch control by design. If the user
  wants it more natural than any browser voice, that means pre-rendering
  audio with a neural TTS API, which this skill doesn't do yet.
- **Chrome's cloud voices don't report word boundaries.** The page estimates
  word timing for those; local voices (Samantha and friends on macOS)
  highlight exactly. Nothing to fix.
- **Changing speed restarts the current beat from the current word.**
  Browser speech can't change rate mid-utterance.
- **"Too cringe" means the beats, not the format.** Calm the voice in the
  JSON and leave smooth brain mode off. The runner alone is quiet.

## Example requests

- "brainrot me on how DNS resolution works" → teach, about 12 beats, from
  general knowledge (no API surface to verify).
- "/brainrot ./docs/ARCHITECTURE.md" → focus, read the file, chunk faithfully.
- "I can't focus on this RFC, https://… just read it to me with the subway
  surfers thing" → focus, fetch with `defuddle`, chunk; mention the paste
  box if they want real footage.
- "teach me tanstack router loaders, make it dumb" → teach, fetch the docs
  first, then write; `code` fields carry the real function names.
