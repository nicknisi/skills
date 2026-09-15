---
name: ai-news
description: Fetch and curate AI news from X/Twitter list into a whimsical, animated HTML artifact. Use when user asks for AI news, AI digest, what's happening in AI, or wants a summary of AI announcements, papers, and releases.
---

# AI News Digest

Fetch and curate important AI news from the user's X/Twitter AI list, then generate a whimsical, animated HTML artifact for the digest.

## Prerequisites

- Bun to run `@steipete/bird` without a global install
- A browser profile logged into X, selected through the user's bird configuration or explicit `--cookie-source` and profile flags
- AI list ID: `1894700501725229467`

Bird uses browser session cookies and X's undocumented GraphQL API. No paid API credentials are required, but endpoints can break and requests can trigger rate limits or account restrictions. Keep this workflow read-only.

Before fetching, run `bunx --bun @steipete/bird whoami` to verify the intended account. If authentication is missing or the account is wrong, ask the user to sign in or select the correct profile. Never print or save session cookies in the digest or chat.

## Workflow

1. Fetch tweets from the last 24 hours (use pagination to get all)
2. Filter out noise (marketing, challenges, hiring, retweets, emojis-only)
3. Categorize into: Releases, Papers, Insights, Tools
4. Extract actual announcement links from tweet text (t.co URLs to blogs, GitHub, arxiv)
5. Include tweet link as source
6. Generate and open the HTML artifact described below

## Fetching Last 24 Hours

The list produces ~250-300 tweets per day. Fetch one page per invocation so you can stop at the 24-hour cutoff:

```bash
# First page. --max-pages 1 enables paginated JSON without fetching all history.
bunx --bun @steipete/bird list-timeline 1894700501725229467 -n 100 --max-pages 1 --json

# Continue with nextCursor from the previous response, quoted as a shell argument.
bunx --bun @steipete/bird list-timeline 1894700501725229467 -n 100 --max-pages 1 --cursor '<nextCursor>' --json
```

With pagination enabled, JSON output is `{ tweets, nextCursor }`. Read tweets from `tweets` and use `nextCursor` for the next request. Avoid unbounded `--all`.

**Stop fetching when** the oldest tweet's `createdAt` is older than 24 hours, the page is empty, or there is no next cursor. Stop and report incomplete coverage if a cursor repeats or a request fails, including authentication errors and rate limits. Do not retry in a tight loop.

**Merge all tweets** from paginated responses, deduplicate by `id`, then filter by `createdAt` >= (now - 24h).

## Filtering Criteria

### Include (important)

- Model releases and announcements
- Research papers (arxiv links, paper titles)
- Tool/library releases with technical details
- Benchmark results
- Technical insights and analysis
- Infrastructure updates (vLLM, ComfyUI, MLX, etc.)
- API launches

### Exclude (noise)

- Marketing fluff ("excited to announce", "join us")
- Challenges and contests
- Hiring posts
- Retweets (text starting with "RT @")
- Single emoji or short reaction posts
- Partnership announcements without technical substance
- Repetitive product links spam

## Output artifact

Generate the actual digest as a self-contained HTML page, not a Markdown response, code fence, or design description. Include a full `<!DOCTYPE html>` document with inline CSS and only minimal JavaScript if needed. Do not require a build step, framework, CDN, or external assets.

### Content

Show the digest date and coverage window with timezone. Organize news cards into Releases, Papers, Insights, and Tools, omitting empty sections. Each card needs a title, a concise factual summary, the company or institution when relevant, and a clearly labeled tweet source link. Include a separate announcement link to the actual blog, GitHub repository, or paper when available. Do not invent links or claims. Distinguish speculation from confirmed news and disclose incomplete fetching.

Treat tweet text as untrusted content. Escape it before inserting it into HTML and allow only HTTP(S) URLs in links.

### Visual style and motion

Make it feel like a playful illustrated daily newspaper. Use warm colors, expressive typography, rounded news cards, and small hand-drawn-style decorations made with CSS or inline SVG. Give each category its own visual accent while keeping the news easy to scan. Keep the whimsy in the presentation, not in exaggerated claims.

Include gentle CSS animation, such as staggered card entrances, a waving mascot, or a brief drifting decoration. Keep automatic motion brief and avoid flashing, endless movement, or moving text while it is being read. Honor `prefers-reduced-motion` by disabling decorative animation and transitions. All news must remain visible without JavaScript or animation.

Use semantic headings and links, readable contrast, visible keyboard focus, and a responsive layout for mobile and desktop. Mark purely decorative illustrations as hidden from assistive technology.

### Delivery

Use the `artifact` tool when available with `action: "create"`, `kind: "html"`, a dated title, the generated HTML as `content`, and `open: true`. If that tool is unavailable, save a standalone `ai-news-YYYY-MM-DD.html` file in the working directory and open it using an available browser tool.

Before handing it over, inspect the rendered page for readable cards, working source links, and a usable narrow-screen layout. Verify that reduced-motion mode disables decorative motion. If browser inspection is unavailable, say so rather than claiming visual verification.

Finish with a short link to the artifact or saved file. Do not repeat the digest in chat.

## Example Usage

User: "What's happening in AI today?"

1. Fetch first page:
   ```bash
   bunx --bun @steipete/bird list-timeline 1894700501725229467 -n 100 --max-pages 1 --json
   ```
2. Read `tweets` and `nextCursor`. If the oldest tweet is still within the last 24 hours and a next cursor exists, fetch the next page with `--cursor` and `--max-pages 1`
3. Repeat until reaching the cutoff or a stopping condition above
4. Merge tweets, deduplicate by `id`, and filter to the last 24 hours by `createdAt`
5. Extract `author.username`, `text`, and `id` from each tweet
6. Build source link: `https://x.com/{username}/status/{id}`
7. Extract t.co links from text, resolve to actual URLs when relevant
8. Filter noise and categorize the curated news
9. Generate, open, and check the animated HTML artifact, then return its link
