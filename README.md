# 🫀 CardioTwin AI — Predictive Cardiology & Interactive Myocardial Digital Twin

CardioTwin AI is a high-performance clinical-grade cardiology research simulator, interactive anatomy visualization sandbox, and conversational medical consultation advisor. It integrates mathematical predictors (XGBoost classifiers, SHAP explainability matrices, K-Means high-dimensional clinical cohort clusterings) alongside next-generation generative AI pipelines (Gemini 3.5 multi-turn text with Google Search Grounding, Gemini 3.5 audio transcription, and Gemini 3.1 Live audio stream WebSockets).

---

## 🚀 Key Architectural Pillars & Features

### 1. Mathematical Clinical Modeling Engine
*   **Predictive Risk Classifier**: Employs mathematical classifiers to evaluate overall cardiovascular event risk (CVD, Stroke, Coronary Heart Disease) dynamically based on clinical parameters such as Systolic/Diastolic blood pressure, lipid levels (HDL, LDL, Total Cholesterol), medication compliance, lifestyle factors (tobacco load, sedentary levels), and demographic profiles.
*   **SHAP (SHapley Additive exPlanations)**: Calculates the game-theoretic mathematical contribution of each patient variable to explain *exactly* how each vital sign or lifestyle factor drives the overall risk score up or down.
*   **K-Means Cohort Cluster Positioning**: Evaluates high-dimensional spatial distances to locate the patient's place within real clinical cohorts, showing clinical similarity indexes relative to representative baseline profiles (e.g., Healthy Baseline, Severe Hypertensive, Atrial Fibrillation).
*   **Counterfactual Sandbox**: Allows researchers and clinicians to run "what-if" risk mitigations (e.g., reducing blood pressure by 10 mmHg, increasing medication compliance to 100%) and watch risk values dynamically adapt in real time.

### 2. Interactive Digital Twin Heart Model
*   **Vector Myocardial SVG Renderer**: Features a dynamic, animated vector heart illustration that morphs states in response to patient variables (e.g., exhibiting left ventricular thickness for hypertrophic parameters, irregular signal contractions for arrhythmia, and arterial cholesterol blockages).
*   **Hover-Based Interactive Hotspots**: Integrates floating information hotspots powered by `framer-motion` over anatomical sub-structures (Aorta Arch, Left Ventricle, Right Chambers, Coronary Arteries). Hovering triggers responsive tooltips explaining structural physiology and translating patient-specific health statuses.

### 3. Session comparison runs switcher
*   **Runs Historical Store**: Retains stateful records of each analysis run within the active session.
*   **Dynamic Comparison Panel**: Displays an interactive toggle dock right beneath the main navigation bar. Allows researchers to toggle instantly between different patient conditions to compare changes in risk indexes, SHAP contributions, and cohort trends.

### 4. CardioTwin Consult AI (Gemini Suite)
*   **Conversational Advisor**: A multi-turn medical chat workspace guided by system instructions defining a friendly clinical cardiology advisor.
*   **Google Search Grounding**: Integrates live Google Search retrieval. When toggled, Gemini queries medical databases, returning up-to-date consensus guidelines alongside verified source citation buttons.
*   **Vocal Transcription**: Features a one-tap recording utility that captures spoken questions, converts them to WebM, and transcribes them using `gemini-3.5-flash` to populate the text bar.
*   **Gemini Live Voice (Live API)**: Connects to a high-speed server WebSocket feeding raw audio straight to the low-latency `gemini-3.1-flash-live-preview` engine. Captures user microphones at `16kHz` PCM, and receives/schedules incoming `24kHz` audio chunks for real-time spoken clinical consultations.

---

## 🛠️ Technology Stack & Dependencies

*   **Frontend**: React (v18+), Vite, Tailwind CSS (for modern typography and fluid layouts), Lucide React (vector icon systems).
*   **Animation**: `motion` (formerly Framer Motion) from `motion/react` for smooth transitions, modal slides, and responsive hotspot tooltips.
*   **Backend Server**: Node.js Express Server (`server.ts`) bundled with `esbuild`.
*   **Generative AI SDK**: `@google/genai` (modernized Google GenAI SDK).
*   **Real-time WebSockets**: `ws` package for raw binary streaming.
*   **Audio Pipelines**: Web Audio API (ScriptProcessorNode, AudioContext) translating browser float-32 channels to/from server-side 16-bit PCM arrays.

---

## 💻 Developer Setup & Running Locally

Follow these steps to spin up the full-stack development workspace:

### 1. Configure Secrets and Environment Variables
Define your Gemini API credential inside `.env` in your root directory:
```env
# .env
GEMINI_API_KEY=your_actual_google_gemini_api_key_here
PORT=3000
```
*(An example template is supplied in `.env.example`.)*

### 2. Install Project Dependencies
Use npm to download package nodes:
```bash
npm install
```

### 3. Launch the Development Server
Starts the Express server alongside the Vite SPA middleware:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

### 4. Build for Production
To bundle and compile the client-side files and build the server executable:
```bash
npm run build
```
Start the production runtime:
```bash
npm run start
```

---

## 🫀 Key File Directory Structures

```
.
├── server.ts                    # Full-stack Node.js Express server, API routers & Live WebSocket Bridge
├── package.json                 # Node manifest, dependencies, and build scripts
├── src/
│   ├── App.tsx                  # Main App workspace coordinating navigation, tabs, and prediction states
│   ├── main.tsx                 # Core Vite client bootstrapper
│   ├── index.css                # Global CSS stylesheet importing Tailwind CSS
│   ├── types.ts                 # Shared clinical data models and prediction schemas
│   ├── components/
│   │   ├── AIClinicChatView.tsx          # Chat thread workspace, voice transcription & Live API spoken calls
│   │   ├── HeartAnatomyVisualizer.tsx   # SVG heart vector model & hover hotspot tooltips
│   │   ├── CardiovascularRiskMapView.tsx # Interactive 2D GNN network of comorbidities
│   │   ├── PatientForm.tsx              # Parameter adjustments, clinical sliders & cohort presets
│   │   ├── DashboardView.tsx            # Main clinical reports, SHAP charts & cohort groupings
│   │   └── CvdLibraryView.tsx           # Reference cardiovascular library view
```

---

## ⚕️ Disclaimer
*CardioTwin AI is a simulation, clinical research, and education sandbox tool. It is not intended to diagnose, treat, cure, or prevent any cardiovascular disease. All clinical recommendations or briefs generated by the LLM models must be cross-verified by qualified healthcare professionals.*
