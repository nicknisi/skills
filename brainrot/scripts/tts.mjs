// tts.mjs — pre-render narration with a neural TTS so the page plays real audio
// instead of the browser's speech synthesis (which ranges from "fine" to "robot").
//
// Providers (auto-detected from the environment):
//   ELEVENLABS_API_KEY -> ElevenLabs; the /with-timestamps endpoint gives exact per-character timing
//   OPENAI_API_KEY     -> OpenAI gpt-4o-mini-tts; word timing via whisper-1 alignment
//
// Every clip is cached in ~/.cache/brainrot/tts by a hash of provider+voice+style+text,
// so rebuilding a lesson with unchanged beats costs nothing. Zero dependencies (Node 18+).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const CACHE = path.join(os.homedir(), ".cache", "brainrot", "tts");

// Must match the page's spokenText(): the title as its own sentence, then the text.
export const spokenText = (b) => (b.title ? b.title.trim().replace(/[.!?:]+$/, "") + ". " : "") + b.text.trim();
export const tokenize = (s) => [...s.matchAll(/\S+/g)].map((m) => ({ w: m[0], start: m.index }));

export const DEFAULT_STYLE =
  "You are a fast, upbeat TikTok explainer narrator. Talk quickly with crisp diction and playful energy, " +
  "like telling a friend something wild you just found out. Lean into the punchlines. Keep pauses short. " +
  "Never sound like a corporate announcer or a textbook.";

export function detectProvider() {
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

async function fetchRetry(url, init, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    const body = await res.text();
    last = new Error(`${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
    if (res.status < 500 && res.status !== 429) break;
    if (res.status === 429 && /credit|quota|billing/i.test(body)) break;   // out of money, not out of rate
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw last;
}

// ---------------- OpenAI ----------------
async function openaiSpeech({ text, voice, style, model }) {
  const res = await fetchRetry("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, voice, input: text, instructions: style, response_format: "mp3" }),
  });
  return Buffer.from(await res.arrayBuffer());
}
async function openaiAlign(mp3, text) {
  const form = new FormData();
  form.append("file", new Blob([mp3], { type: "audio/mpeg" }), "beat.mp3");
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");
  form.append("prompt", text); // biases the transcript toward the words we actually spoke
  const res = await fetchRetry("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });
  const json = await res.json();
  return (json.words || []).map((w) => ({ word: w.word, start: w.start }));
}

// Map whisper's words onto our tokens: greedy walk on normalized text, interpolate the
// tokens it couldn't place, give up (undefined -> proportional timing) if too many.
export function alignWords(tokens, heard) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const times = new Array(tokens.length).fill(null);
  let j = 0, placed = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = norm(tokens[i].w);
    if (!t) continue;
    for (let k = j; k < Math.min(heard.length, j + 4); k++) {
      const h = norm(heard[k].word);
      if (!h) continue;
      if (h === t || h.startsWith(t) || t.startsWith(h)) {
        times[i] = Math.round(heard[k].start * 1000);
        j = k + 1;
        placed++;
        break;
      }
    }
  }
  if (placed < tokens.length * 0.7) return undefined;
  for (let i = 0; i < times.length; i++) {
    if (times[i] != null) continue;
    let a = i - 1, b = i + 1;
    while (a >= 0 && times[a] == null) a--;
    while (b < times.length && times[b] == null) b++;
    const ta = a >= 0 ? times[a] : 0;
    const tb = b < times.length ? times[b] : ta + 400 * (b - a);
    times[i] = Math.round(ta + ((tb - ta) * (i - a)) / (b - a));
  }
  for (let i = 1; i < times.length; i++) if (times[i] < times[i - 1]) times[i] = times[i - 1];
  return times;
}

// ---------------- ElevenLabs ----------------
async function elevenPickVoice() {
  const res = await fetchRetry("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
  });
  const { voices = [] } = await res.json();
  const gender = (v) => String((v.labels && v.labels.gender) || "");
  const male = voices.find((v) => v.category === "premade" && /male/i.test(gender(v)) && !/female/i.test(gender(v)));
  const v = male || voices[0];
  if (!v) throw new Error("ElevenLabs returned no voices");
  return { id: v.voice_id, name: v.name };
}
async function elevenSpeech({ text, voiceId, model }) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_64`;
  const res = await fetchRetry(url, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, speed: 1.1 },
    }),
  });
  const json = await res.json();
  const mp3 = Buffer.from(json.audio_base64, "base64");
  const al = json.alignment || json.normalized_alignment;
  let words;
  if (al && Array.isArray(al.characters) && al.characters.join("") === text) {
    words = tokenize(text).map((t) => Math.round(al.character_start_times_seconds[t.start] * 1000));
  }
  return { mp3, words };
}

// ---------------- driver ----------------
/**
 * Narrate every beat in place: sets beat.audio (data URI) and beat.words (ms per word token, when known).
 * Returns { provider, voice, model } for the page to display, or null when no provider is available.
 */
export async function narrate(beats, opts = {}, log = () => {}) {
  const provider = opts.provider || detectProvider();
  if (!provider) return null;
  const style = opts.style || DEFAULT_STYLE;
  const align = opts.align !== false;
  fs.mkdirSync(CACHE, { recursive: true });

  let voice, model, voiceId;
  if (provider === "openai") {
    voice = opts.voice || "ash";
    model = opts.model || "gpt-4o-mini-tts";
  } else if (provider === "elevenlabs") {
    model = opts.model || "eleven_turbo_v2_5";
    if (opts.voice && /^[A-Za-z0-9]{15,}$/.test(opts.voice)) {
      voiceId = opts.voice;
      voice = opts.voice;
    } else {
      const v = await elevenPickVoice();
      voiceId = v.id;
      voice = v.name;
    }
  } else throw new Error(`unknown TTS provider: ${provider}`);

  let done = 0, hits = 0;
  const one = async (b, i) => {
    const text = spokenText(b);
    const keySrc = [provider, model, voice, provider === "openai" ? style : "", align ? "a" : "", text].join("");
    const key = crypto.createHash("sha1").update(keySrc).digest("hex");
    const mp3Path = path.join(CACHE, key + ".mp3");
    const metaPath = path.join(CACHE, key + ".json");
    let mp3, words;
    if (!opts.noCache && fs.existsSync(mp3Path) && fs.existsSync(metaPath)) {
      mp3 = fs.readFileSync(mp3Path);
      words = JSON.parse(fs.readFileSync(metaPath, "utf8")).words || undefined;
      hits++;
    } else {
      if (provider === "openai") {
        mp3 = await openaiSpeech({ text, voice, style, model });
        if (align) {
          try {
            words = alignWords(tokenize(text), await openaiAlign(mp3, text));
          } catch (e) {
            log(`  beat ${i + 1}: alignment failed (${e.message.slice(0, 80)}); using proportional timing`);
          }
        }
      } else {
        ({ mp3, words } = await elevenSpeech({ text, voiceId, model }));
      }
      fs.writeFileSync(mp3Path, mp3);
      fs.writeFileSync(metaPath, JSON.stringify({ words: words || null, text }));
    }
    b.audio = "data:audio/mpeg;base64," + mp3.toString("base64");
    if (words) b.words = words;
    else delete b.words;
    done++;
    log(`  narrated ${done}/${beats.length}`);
  };
  // Modest concurrency: fast enough, gentle on rate limits.
  const queue = beats.map((b, i) => () => one(b, i));
  const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
    while (queue.length) await queue.shift()();
  });
  await Promise.all(workers);
  if (hits) log(`  (${hits} clip${hits === 1 ? "" : "s"} from cache)`);
  return { provider, voice, model };
}
