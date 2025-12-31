# AI Surveillance System — Frontend

A **frontend-only, high-fidelity mock dashboard** for an AI-powered surveillance and risk-monitoring system.

This repository demonstrates how **AI risk signals would be visualized, escalated, aggregated, and audited in near real time**, using **simulated (mock) data**.

> **Important**
> - This project currently runs entirely on **mock / simulated data**
> - **No live camera feeds or AI models** are connected yet
> - Real camera input and backend inference are planned for **Phase 2**

---

## 📑 Table of Contents

- [What This Project Is (and Is Not)](#-what-this-project-is-and-is-not)
- [Core Concept](#-core-concept)
- [Application Structure](#-application-structure)
- [Screenshots](#-screenshots)
- [Data & Camera Inputs](#-data--camera-inputs)
- [Simulation Details](#-simulation-details)
- [Design Philosophy](#-design-philosophy)
- [Tech Stack](#-tech-stack)
- [Running the Project Locally](#-running-the-project-locally)
- [Available Scripts](#-available-scripts)
- [Known Limitations](#-known-limitations-intentional)
- [Roadmap](#-roadmap)
- [Disclaimer](#-disclaimer)
- [Author](#-author)

---

## 📌 What This Project Is (and Is Not)

### ✅ What it *is*
- A **production-style surveillance command-center UI**
- Focused on **risk-based monitoring**, not raw video feeds
- Demonstrates **system behavior, escalation logic, and explainability**
- Designed to be **backend-agnostic and future-ready**

### ❌ What it is *not*
- Not a real CCTV system  
- Not performing live crime detection  
- Not connected to physical cameras  
- Not running AI inference in the current phase  

---

## 🧠 Core Concept

Instead of binary *“crime detected”* outputs, the system is designed around:

- Risk scores  
- Confidence levels  
- Temporal escalation  
- Area-level aggregation  
- Explainable system decisions  

This mirrors how **real-world AI surveillance systems are evaluated, validated, and deployed**, where risk is continuous and decisions are auditable.

---

## 🧭 Application Structure

The frontend consists of **four focused views**, each answering a specific operational question.

---

### 1️⃣ Camera Risk View (`/cameras`)
**Tactical · Snapshot-level monitoring**

- 3×3 grid of camera tiles (simulated)
- Each camera displays:
  - Risk score  
  - Confidence  
  - Zone  
  - Status (Normal / Suspicious / High Risk)
- Automatic escalation of the highest-risk camera
- Snapshot refresh cycle: **every 5 seconds**
- Bounding boxes rendered on all frames *(mocked)*

---

### 2️⃣ Area Risk View (`/areas`)
**Strategic · Situational awareness**

- Aggregates camera-level risks into zones
- Displays:
  - Zone risk levels  
  - Risk persistence heat matrix  
  - System-wide KPIs
- Uses **abstract zones** (not real geographic maps)

---

### 3️⃣ Event Intelligence Timeline (`/timeline`)
**Explainability · Audit trail**

Chronological record of system decisions:

- Risk changes  
- Camera escalations  
- Alert confirmations  
- Risk normalization  

Designed to answer:  
**“Why did the system act?”**

---

### 4️⃣ System Health & Readiness (`/system`)
**Operational reliability**

- Simulated infrastructure metrics:
  - Cameras online  
  - Active alerts  
  - System mode  
  - CPU, memory, and network usage
- Focuses on **system stability**, not analytics

---

## 🖼️ Screenshots

> All screenshots are taken from the running frontend using **simulated data**.

### Camera Risk View
surveillance-dashboard\src\screenshots\cameras1.jpeg
surveillance-dashboard\src\screenshots\cameras2.jpeg
surveillance-dashboard\src\screenshots\cameras3.jpeg


### Area Risk View
surveillance-dashboard\src\screenshots\areas.jpeg


### Event Intelligence Timeline
surveillance-dashboard\src\screenshots\timeline.jpeg

### System Health & Readiness
surveillance-dashboard\src\screenshots\system.jpeg



---

## 🖼️ Data & Camera Inputs

### Phase 1 — Current (This Repository)

- ❌ No physical camera input  
- ❌ No video streams  
- ❌ No real AI model inference  
- ✅ Mock camera snapshots  
- ✅ Simulated risk scores, confidence values, and alerts  
- ✅ Fully functional UI and global state logic  

All camera data is **synthetically generated** to demonstrate:
- Risk progression  
- Escalation behavior  
- Cross-page consistency  

---

### Phase 2 — Planned

- Live camera feeds (RTSP / IP cameras or recorded streams)
- Backend AI inference service
- Snapshot ingestion from real cameras
- Integration with datasets such as **UCF-Crime**
- Real alert generation from model outputs

The frontend is already structured to accept these inputs with **minimal refactoring**.

---

## 🔁 Simulation Details

This frontend uses a **time-driven simulation engine** designed to mimic
real-world AI surveillance behavior.

### Simulation characteristics
- Snapshot refresh every **5 seconds**
- Gradual risk escalation (no abrupt jumps)
- Confidence-aware risk updates
- Deterministic event generation for demo stability
- Single global state shared across all views

> No randomness is used that would break UI consistency during demonstrations.

---

## 🎯 Design Philosophy

- The system acts autonomously; the operator observes
- Escalation is gradual, not reactive
- Explainability is treated as a first-class feature
- UI clarity is prioritized over visual flair

> If a feature looks impressive but reduces trust, it is intentionally excluded.

---

## 🛠️ Tech Stack

- **Framework:** React  
- **Runtime:** Node.js  
- **State Management:** Centralized global state  
- **Styling:** Custom dark dashboard UI  
- **Backend:** Not required (mock data only)

---

## ▶️ Running the Project Locally

### Prerequisites
Ensure the following are installed:

- **Node.js** (v18+ recommended)
- **npm**

Verify installation:
```bash
node -v
npm -v

Step 1: Clone the repository
git clone <https://github.com/Jiyaaaa21/VIGIL---AI-Powered-Real-Time-Risk-Aware-Surveillance-for-Public-Safety>

cd surveillance-dashboard

Step 2: Install dependencies
npm install

Step 3: Start the development server
npm run dev

Step 4: Open in browser
http://localhost:3000


🔮 Roadmap

Phase 1 — Completed

  ~ Full frontend UI
  ~ Mock data simulation
  ~ Risk escalation logic
  ~ Multi-view dashboard
  ~ Explainability timeline
  ~ System health monitoring

Phase 2 — Planned

  ~ Backend integration
  ~ Real camera inputs
  ~ AI inference models
  ~ Live alerting pipeline
  ~ Scalable deployment architecture


⚠️ Disclaimer

This is a prototype frontend intended for demonstration, evaluation, and design validation purposes.
It does not perform real surveillance or automated decision-making currently.

👤 Author

Developed as part of an AI surveillance system prototype focusing on
risk visualization, explainability, and operational awareness.
