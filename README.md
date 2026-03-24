# ✍️ OfflineScribe — Private AI Writing Assistant

A **completely private, offline-first AI writing assistant** that runs entirely in your browser using on-device LLM inference. Generate emails, essays, creative content, and summaries without sending any data to the cloud.

**Key Principle:** Your writing stays on your device. Period.

---

## 🎯 What Exactly is Build?

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
