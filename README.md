# ✍️ OfflineScribe — Private AI Writing Assistant

A **completely private, offline-first AI writing assistant** that runs entirely in your browser using on-device LLM inference. Generate emails, essays, creative content, and summaries without sending any data to the cloud.

**Key Principle:** Your writing stays on your device. Period.

---

## 🎯 What Exactly Did You Build?

### The Problem
Most AI writing tools (ChatGPT, Grammarly, etc.) send your writing to their servers. This means:
- Your personal/confidential writing is exposed to third parties
- You need constant internet connectivity
- You pay subscription fees per month
- Your prompts train their models

### The Solution: OfflineScribe
A **professional-grade writing assistant** that:
- ✅ **Runs 100% locally** – Model loads once, then works offline forever
- ✅ **AI-powered writing** – LFM2 350M language model (Liquid AI)
- ✅ **5+ writing modes** – Email, Essay, Creative, Summary, Tone Rewriter
- ✅ **PDF support** – Extract and rewrite text from PDFs
- ✅ **Export-ready** – Save as .txt or .md files
- ✅ **Privacy-first** – No cloud calls, no tracking, no data collection
- ✅ **WebGPU acceleration** – Runs faster on devices with GPU support

---

## 🏗️ Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    OfflineScribe UI                          │
│  (React 19 + TypeScript + Vite 6.4.1)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              RunAnywhere Web SDK                             │
│  ├── ModelManager (download/cache/load models)              │
│  ├── ModelCategory (Language, Vision, STT, TTS)             │
│  ├── EventBus (download progress, model events)             │
│  └── TextGeneration + VLMWorkerBridge                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           WebAssembly Inference Engines                      │
│  ├── llama.cpp (LLM inference on CPU/GPU)                   │
│  ├── sherpa-onnx (STT/TTS/VAD)                              │
│  └── WebGPU runtime (GPU acceleration fallback)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│      Browser Storage (OPFS) — Model Cache                   │
│  └── LFM2-350M-Q4_K_M.gguf (~500MB)                         │
│      Downloaded once, reused forever                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: How Text Generation Works

```
User Input (prompt) 
    ↓
PromptEditor Component → Captures mode + text
    ↓
useRunAnywhere Hook → Validates model is ready
    ↓
TextGeneration.generateStream() → Streams tokens from LLM
    ↓
for await (token of stream) → Receives tokens one-by-one
    ↓
setOutput(accumulated) → React updates output in real-time
    ↓
OutputPanel Component → Renders streaming text + controls
    ↓
User can: Copy / Export as .txt / Export as .md
```

---

## 🎨 Features Explained

### 1. **Five Writing Modes**

Each mode uses a custom system prompt to specialize the LLM's behavior:

#### Email Mode
```
System Prompt: "You are an expert email writer..."
Example: "Request for meeting reschedule"
Output: Professional, concise email draft
```

#### Essay Mode
```
System Prompt: "You are an academic essay writer..."
Example: "Discuss artificial intelligence ethics"
Output: Structured essay with intro/body/conclusion
```

#### Creative Mode
```
System Prompt: "You are a creative writing expert..."
Example: "A cyberpunk detective story"
Output: Engaging fictional narrative
```

#### Summary Mode
```
System Prompt: "You are a summarization expert..."
Input: Long article or document
Output: Concise summary of key points
```

#### Tone Rewriter (Bonus)
```
Input: Any text
Tone Options: Formal / Casual / Persuasive
Output: Same text, rewritten in selected tone
```

### 2. **PDF Text Extraction**

- **Drag-drop interface** – Upload PDFs directly
- **Client-side processing** – pdfjs-dist library extracts text in browser
- **No server upload** – Files never leave your device
- **Auto-summary** – PDF text automatically switches to Summary mode
- **Statistics** – Shows character count, line count, page count

### 3. **Real-time Text Streaming**

- LLM generates tokens one at a time
- UI updates appear as text streams (like ChatGPT)
- **Responsive batching** – Updates grouped for smooth rendering
- No waiting for full response – see output immediately

### 4. **Export & Share**

- **Copy to Clipboard** – One-click copy of entire output
- **Download as .txt** – Plain text file for any editor
- **Download as .md** – Markdown file for GitHub/Docs

### 5. **Status Badge**

Shows real-time state:
- ⬇️ **Downloading... X%** – Model download in progress
- ⏳ **Loading Model...** – Loading model into memory
- 🟢 **Running Locally · No Cloud** – Ready to use, 100% offline
- ❌ **Load Failed - Retrying...** – Automatic retry if load fails

---

## 📁 Project Structure

```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Tab navigation (Chat/Vision/Voice/Tools)
├── runanywhere.ts              # SDK initialization + model catalog
│
├── hooks/
│   ├── useRunAnywhere.js       # Custom hook for LLM text generation
│   │                           # - Model loading
│   │                           # - Streaming token handling
│   │                           # - Error/timeout management
│   ├── useModelLoader.ts       # Model download + load lifecycle
│   │                           # - Download tracking
│   │                           # - Cache management
│   │                           # - State machine
│   └── useRunAnywhere.js       # (existing) Model loader reference
│
├── components/
│   ├── ChatTab.tsx             # Main OfflineScribe UI component
│   │                           # - Mode selector
│   │                           # - Editor + Output layout
│   │                           # - Feature toggles
│   ├── PromptEditor.jsx        # Left panel
│   │                           # - Mode dropdown
│   │                           # - Textarea for input
│   │                           # - Generate button
│   ├── OutputPanel.jsx         # Right panel
│   │                           # - Displays generated text
│   │                           # - Copy/Export buttons
│   │                           # - Loading spinner + error display
│   ├── LocalBadge.jsx          # Top-right status indicator
│   │                           # - Shows download progress
│   │                           # - Loading state
│   │                           # - Ready/error states
│   ├── ToneRewriter.jsx        # Collapsible tone feature
│   │                           # - Paste text to rewrite
│   │                           # - Select tone (Formal/Casual/Persuasive)
│   │                           # - Live rewrite output
│   ├── PDFDropzone.jsx         # Drag-drop PDF upload
│   │                           # - Client-side extraction
│   │                           # - Text preview + stats
│   │                           # - Auto-switch to Summary mode
│   ├── VisionTab.tsx           # (unchanged) Vision tab
│   ├── VoiceTab.tsx            # (unchanged) Voice tab
│   ├── ToolsTab.tsx            # (unchanged) Tools tab
│   ├── ModelBanner.tsx         # (existing) Model download banner
│   └── LocalBadge.jsx          # (existing) Local status badge
│
├── prompts/
│   └── systemPrompts.js        # System prompts for all 5 modes
│                               # - Email, Essay, Creative, Summary
│                               # - Tone variants (Formal/Casual/Persuasive)
│                               # - Placeholder examples for each mode
│
├── styles/
│   └── index.css               # Complete styling (~900 lines)
│                               # - Dark theme (matches RunAnywhere)
│                               # - Responsive layout (1fr 1fr grid)
│                               # - Component styles for all UI elements
│                               # - Mobile breakpoints
│
├── workers/
│   └── vlm-worker.ts           # (unchanged) Vision worker

tests/
├── web-starter-app-bugs.md
└── web-starter-app-test-suite.md
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourname/OfflineScribe.git
cd OfflineScribe

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### First-Time Setup
1. App initializes RunAnywhere SDK (~2 seconds)
2. Badge shows: **⬇️ Downloading... 0%**
3. LFM2 350M model downloads (~500MB, 2-5 minutes on 50Mbps)
4. Badge shows: **⏳ Loading Model...**
5. Model loads into memory (~30 seconds, depending on RAM)
6. Badge shows: **🟢 Running Locally · No Cloud**
7. **Ready to use!**

### Using OfflineScribe

1. **Select a mode** from the dropdown (Email, Essay, Creative, Summary)
2. **Enter your prompt** in the text area
   - Example: "Write a professional email requesting a meeting"
3. **Click Generate** or press Ctrl+Enter
4. **Watch output stream** in real-time on the right panel
5. **Copy or export** your writing when done

---

## 🏗️ How It Works Technically

### 1. Model Loading Pipeline

```javascript
// src/hooks/useModelLoader.ts
useModelLoader(ModelCategory.Language)
  ↓
1. Check if model already loaded
  ↓
2. If not: Find first Language model from catalog
  ↓
3. Download to OPFS (browser cache)
   - Shows progress: ⬇️ Downloading... X%
   - EventBus triggers 'model.downloadProgress' events
  ↓
4. Load into WebAssembly memory
   - Shows progress: ⏳ Loading Model...
   - Calls ModelManager.loadModel()
  ↓
5. Verify loaded
   - State becomes 'ready'
   - Badge shows: 🟢 Running Locally · No Cloud
```

### 2. Text Generation Pipeline

```javascript
// src/hooks/useRunAnywhere.js
async generate(systemPrompt, userMessage)
  ↓
1. Validate model is ready
  ↓
2. Build prompt: `${systemPrompt}\n\nUser: ${userMessage}`
  ↓
3. Call TextGeneration.generateStream(prompt, {
     maxTokens: 256,    // Safety limit: stop after 256 tokens
     temperature: 0.9   // Slightly creative, but focused
   })
  ↓
4. Stream tokens: for await (const token of stream)
   - Each token received individually
   - Accumulated into output string
   - setOutput(accumulated) triggers React re-render
   - Timeout: max 120 seconds total generation time
  ↓
5. Display in OutputPanel real-time
```

### 3. System Prompts (Custom Personalities)

Each mode uses a specialized system prompt to guide the LLM:

```javascript
// src/prompts/systemPrompts.js
{
  email: {
    systemPrompt: "You are an expert email writer. Write professional, concise, well-structured emails...",
    placeholder: "What email do you need to write? (e.g., 'Request for meeting reschedule')",
  },
  essay: {
    systemPrompt: "You are an academic essay writer. Write structured essays with clear intro, body, and conclusion...",
    placeholder: "What essay topic? (e.g., 'Artificial intelligence ethics')",
  },
  // ... more modes
}
```

### 4. React Component Hierarchy

```
App
├── TabBar (Chat | Vision | Voice | Tools)
└── ChatTab
    ├── OfflineScribeHeader
    │   ├── h1 "✍️ OfflineScribe"
    │   └── LocalBadge (status + progress)
    └── OfflineScribeContent
        ├── EditorOutputLayout (2-column grid)
        │   ├── PromptEditor (left panel)
        │   │   ├── Mode selector dropdown
        │   │   ├── Textarea input
        │   │   └── Generate button
        │   └── OutputPanel (right panel)
        │       ├── Output display
        │       ├── Copy/Export buttons
        │       └── Error display
        ├── ToneRewriter (collapsible)
        │   ├── Paste text area
        │   ├── Tone selector
        │   └── Rewrite output
        ├── PDFDropzone (collapsible)
        │   ├── Drag-drop area
        │   └── Extracted text preview
        └── Footer (privacy notice)
```

---

## 💾 Model & Memory Details

### LFM2 350M Model
- **Source:** Liquid AI (LiquidAI/LFM2-350M-GGUF)
- **Format:** GGUF (GPU-friendly format)
- **Quantization:** Q4_K_M (4-bit quantized)
- **Size:** ~500MB (compressed)
- **Loaded Size:** ~350MB in memory
- **Speed:** ~50-100 tokens/sec on CPU (faster with GPU)
- **Capabilities:** Text generation, instruction following, few-shot learning

### Browser Storage
- **Cache Type:** OPFS (Origin Private File System)
- **Persistence:** Survives browser restart
- **Max Size:** Usually 50GB+ per origin (browser-dependent)
- **Download Resume:** Yes, partial downloads resume
- **This App Uses:** ~500MB after first download

---

## 🔒 Privacy & Security

### What Happens to Your Data
1. **Input:** Stays in browser memory only
2. **Processing:** Runs on-device LLM, no network calls
3. **Output:** Stays in browser; copied locally or downloaded
4. **Storage:** Model cached in browser OPFS (not sent anywhere)
5. **Deletion:** Clear browser cache = all data deleted

### No Cloud Calls
- ✅ No API calls to OpenAI, Anthropic, etc.
- ✅ No telemetry or tracking
- ✅ No model training on your data
- ✅ No account required
- ✅ No authentication needed

### Security Considerations
- Runs in a sandboxed browser context
- Model code in WebAssembly (cannot access OS)
- Local to your machine only
- OPFS storage isolated per website origin

---

## 📦 Deployment

### Option 1: Vercel (Recommended)

```bash
# Push to GitHub
git add .
git commit -m "OfflineScribe hackathon submission"
git push origin main

# Then deploy
npm run build
npx vercel --prod
```

**Note:** `vercel.json` already includes required headers for OPFS support.

### Option 2: Netlify

```bash
npm run build
# Drag & drop 'dist' folder to Netlify
```

Add this to `_headers` file:
```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

### Option 3: GitHub Pages

```bash
npm run build
# Push 'dist' folder to gh-pages branch
```

---

## 🎬 Demo for Judges

### What to Show
1. **Privacy Badge** – Point to "🟢 Running Locally · No Cloud"
2. **Generate Email** – Type "meeting request" → generates draft email
3. **Try Different Modes** – Essay, Creative, Summary
4. **Tone Rewriter** – Paste text → make it "Formal" / "Casual" / "Persuasive"
5. **PDF Upload** – Drag PDF → extracts text → auto-summarize
6. **Export** – Show .txt download
7. **Go Offline** – Unplug internet, generate text (still works!)

### Key Points to Emphasize
- ✅ **Completely Local** – No servers, no cloud API calls
- ✅ **First-run Download** – Model caches, then offline forever
- ✅ **Privacy-First** – No data collection, no tracking
- ✅ **Production-Ready** – Full error handling, timeout protection, retry logic
- ✅ **5+ Features** – Email, Essay, Creative, Summary, Tone Rewriter, PDF extraction

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| First Load | ~2 sec (SDK init) |
| Model Download | 2-5 min (500MB, depends on internet) |
| Model Load into Memory | ~30 sec |
| Token Generation Speed | 50-100 tokens/sec (CPU) |
| Per-text Generation | 30-60 seconds (256 tokens) |
| Memory Usage | ~350MB (model loaded) |
| Browser Cache Size | ~500MB OPFS |

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **UI Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6.4.1 |
| **AI Engine** | RunAnywhere Web SDK |
| **LLM Inference** | llama.cpp (WebAssembly) |
| **Model Cache** | OPFS (Origin Private File System) |
| **PDF Processing** | pdfjs-dist 5.5.207 |
| **Styling** | CSS (dark theme) |
| **Deployment** | Vercel / Netlify / GitHub Pages |

---

## 🚀 Future Enhancements (Post-Hackathon)

- [ ] **Voice Input** – Speak prompts, hear AI responses (using STT/TTS)
- [ ] **Multi-model Selection** – Let users choose between LFM2 350M vs. 1.2B
- [ ] **Custom System Prompts** – Users define their own personalities
- [ ] **Prompt History** – Save and recall previous prompts
- [ ] **Markdown Preview** – Live preview of exported markdown
- [ ] **Keyboard Shortcuts** – Alt+E for Email, Alt+S for Summary, etc.
- [ ] **Dark/Light Theme** – User preference toggle
- [ ] **Image Generation** – Use on-device VLM for image creation

---

## ❓ FAQ

**Q: Will it work offline after first download?**
A: Yes! After the model downloads and loads once, OfflineScribe works 100% offline. Delete your browser cache to clear the model.

**Q: Can iOS/Android use this?**
A: Not currently. Mobile browsers don't support WebGPU and OPFS reliably. Desktop only.

**Q: Is the output AI quality good?**
A: LFM2 350M is a small model (optimized for speed). Outputs are solid for emails/summaries, creative for essays. OpenAI GPT-4 quality would require a 7B+ model (requires more memory).

**Q: Can I use this offline on public WiFi?**
A: Yes! After first download, works completely offline. No internet connection required after that first setup.

**Q: How do I clear the cached model?**
A: Open DevTools → Application → Storage → OPFS → Delete. Or clear all browser data.

---

## 📄 License

This project is a **PS-1 Hackathon submission** built on the RunAnywhere Web Starter template. See LICENSE for details.

---

## 👨‍💻 Credits

Built with:
- **RunAnywhere Web SDK** – For on-device AI inference
- **LFM2 Model** – By Liquid AI
- **Vite** – For build tooling
- **React 19** – For UI framework

---

**Ready to try it?** Clone the repo, run `npm install && npm run dev`, and generate your first email! 🚀
├── main.tsx              # React root
├── App.tsx               # Tab navigation (Chat | Vision | Voice)
├── runanywhere.ts        # SDK init + model catalog + VLM worker
├── workers/
│   └── vlm-worker.ts     # VLM Web Worker entry (2 lines)
├── hooks/
│   └── useModelLoader.ts # Shared model download/load hook
├── components/
│   ├── ChatTab.tsx        # LLM streaming chat
│   ├── VisionTab.tsx      # Camera + VLM inference
│   ├── VoiceTab.tsx       # Full voice pipeline
│   └── ModelBanner.tsx    # Download progress UI
└── styles/
    └── index.css          # Dark theme CSS
```

## Adding Your Own Models

Edit the `MODELS` array in `src/runanywhere.ts`:

```typescript
{
  id: 'my-custom-model',
  name: 'My Model',
  repo: 'username/repo-name',           // HuggingFace repo
  files: ['model.Q4_K_M.gguf'],         // Files to download
  framework: LLMFramework.LlamaCpp,
  modality: ModelCategory.Language,      // or Multimodal, SpeechRecognition, etc.
  memoryRequirement: 500_000_000,        // Bytes
}
```

Any GGUF model compatible with llama.cpp works for LLM/VLM. STT/TTS/VAD use sherpa-onnx models.

## Deployment

### Vercel

```bash
npm run build
npx vercel --prod
```

The included `vercel.json` sets the required Cross-Origin-Isolation headers.

### Netlify

Add a `_headers` file:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
```

### Any static host

Serve the `dist/` folder with these HTTP headers on all responses:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

## Browser Requirements

- Chrome 96+ or Edge 96+ (recommended: 120+)
- WebAssembly (required)
- SharedArrayBuffer (requires Cross-Origin Isolation headers)
- OPFS (for persistent model cache)

## Documentation

- [SDK API Reference](https://docs.runanywhere.ai)
- [npm package](https://www.npmjs.com/package/@runanywhere/web)
- [GitHub](https://github.com/RunanywhereAI/runanywhere-sdks)

## License

MIT
