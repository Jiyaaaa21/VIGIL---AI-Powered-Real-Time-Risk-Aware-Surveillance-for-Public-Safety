# VIGIL — AI-Powered Real-Time Risk-Aware Surveillance for Public Safety

VIGIL is a **risk-aware surveillance system prototype** designed to demonstrate how
**AI-driven perception models** and **risk signals** can be visualized, escalated,
aggregated, and explained for **public safety and situational awareness**.

This repository contains **both frontend and backend work completed in Phase 1**,
along with a clearly defined roadmap toward a real-time, end-to-end system.

---

##  Problem Statement

**Real-Time Risk-Aware Surveillance for Public Safety**

Traditional surveillance systems rely heavily on manual monitoring and binary alerts.
VIGIL addresses this limitation by proposing a **risk-based, explainable, and scalable**
approach to multi-camera surveillance—prioritizing **situational awareness**
over automated or opaque decision-making.

---

##  Project Scope (Phase 1)

### What is implemented
- A **high-fidelity frontend dashboard** simulating a real surveillance command center
- **Two trained deep learning perception models**:
  - Crime / Activity Recognition
  - Weapon Detection
- Clear separation between:
  - **Perception (models)**
  - **Risk abstraction (simulated)**
  - **Decision visualization (frontend)**

### What is NOT yet implemented
- Live camera feeds
- Real-time backend–frontend integration
- Automated enforcement or deployment

---

##  System Architecture

VIGIL follows a **modular, layered architecture** that cleanly separates:

- **Perception (AI models)**
- **Risk abstraction & decision logic**
- **Visualization & operator interface**

This design enables scalability, explainability, and smooth transition from
offline experimentation (Phase 1) to real-time deployment (Phase 2).

---

##  Architecture — Phase 1 (Current Implementation)

Phase 1 focuses on **offline-trained models** and a **frontend-first system design**.
No live camera feeds or real-time inference are connected yet.


                ┌─────────────────────────────────────────────┐
                │          Offline Surveillance Data          │
                │            (UCF-Crime Dataset)              │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                ┌─────────────────────────────────────────────┐
                │          Backend Perception Models          │
                │                                             │
                │   ┌─────────────────────────────────────┐  │
                │   │ Activity Recognition Model           │  │
                │   │ DenseNet121 (14 Activity Classes)    │  │
                │   │                                     │  │
                │   │ • Behavioral understanding           │  │
                │   │ • Class probabilities                │  │
                │   │ • Offline trained & evaluated        │  │
                │   └─────────────────────────────────────┘  │
                │                                             │
                │   ┌─────────────────────────────────────┐  │
                │   │ Weapon Detection Model               │  │
                │   │ YOLOv8 (Object Detection)            │  │
                │   │                                     │  │
                │   │ • Weapon localization                │  │
                │   │ • Bounding boxes + confidence        │  │
                │   └─────────────────────────────────────┘  │
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                ┌─────────────────────────────────────────────┐
                │      Risk Abstraction Layer (Simulated)     │
                │                                             │
                │ • Combines model confidence signals         │
                │ • Produces risk scores & severity levels    │
                │ • Temporal logic mocked in Phase 1          │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                ┌─────────────────────────────────────────────┐
                │            VIGIL Frontend UI                │
                │                                             │
                │ • Camera Risk View                          │
                │ • Area Risk View                            │
                │ • Event Intelligence Timeline               │
                │ • System Health & Readiness                 │
                │                                             │
                │ (Consumes simulated backend-like data)      │
                └─────────────────────────────────────────────┘


---

### 🔹 Phase 2 Architecture (Planned)

                ┌─────────────────────────────────────────────┐
                │        Live Camera Feeds / CCTV             │
                │        (RTSP / IP / Video Streams)          │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                ┌─────────────────────────────────────────────┐
                │        Real-Time Inference Backend          │
                │                                             │
                │ • Activity Recognition                     │
                │   - CNN–LSTM / TCN / 3D CNNs                │
                │ • Weapon Detection                         │
                │   - YOLOv8 (Multi-Class)                   │
                │ • Optional multi-modal inputs               │
                │   - Optical flow / Audio                   │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                ┌─────────────────────────────────────────────┐
                │        Risk Fusion & Decision Layer         │
                │                                             │
                │ • Model output fusion                       │
                │ • Temporal persistence logic                │
                │ • Alert & severity generation               │
                │ • Explainable escalation rules              │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                ┌─────────────────────────────────────────────┐
                │          VIGIL Frontend (Live)              │
                │                                             │
                │ • Real-time risk updates                    │
                │ • Alert notifications                      │
                │ • Incident reporting & audit logs           │
                │ • Role-based access control                 │
                └─────────────────────────────────────────────┘


---

###  Architectural Design Principles

- **Separation of Concerns**
  - AI models handle perception
  - Risk layer handles abstraction
  - Frontend handles interpretation

- **Risk-First Design**
  - No binary “crime detected”
  - Continuous, confidence-aware escalation

- **Explainability**
  - Every alert is traceable via model outputs and timeline

- **Scalable Evolution**
  - Phase 1 → Phase 2 without frontend redesign

---

> **Note**  
> Phase 1 validates system design and model capability.  
> Phase 2 operationalizes the same architecture for real-time deployment.



Phase 1 focuses on validating **model capability** and **system design**
before real-time integration.

---

##  Frontend — VIGIL Dashboard (Phase 1)

### Overview

The frontend is a **React-based, production-style surveillance dashboard**
designed to resemble a real-world operations command center.

It consumes **simulated risk signals** that mirror expected backend outputs,
allowing validation of UI behavior, escalation logic, and explainability.

---

### Frontend Views

#### 1. Camera Risk View — Tactical Monitoring
- 3×3 grid of simulated camera feeds
- Each camera displays:
  - Risk score
  - Confidence
  - Zone
  - Status (Normal / Suspicious / High Risk)
- Automatic escalation of the highest-risk camera
- Snapshot refresh cycle: **every 5 seconds**
- Bounding boxes rendered on all frames (mocked)

---

#### 2. Area Risk View — Situational Awareness
- Aggregates camera-level risk into abstract zones
- Displays:
  - Zone risk indicators
  - Risk persistence heat matrix
  - System-wide KPIs
- Designed for strategic oversight

---

#### 3. Event Intelligence Timeline — Explainability
- Chronological audit trail of:
  - Risk changes
  - Camera escalations
  - Alert confirmations
  - Risk normalization
- Answers the question:
  **“Why did the system act?”**

---

#### 4. System Health & Readiness
- Simulated infrastructure metrics:
  - Cameras online
  - Active alerts
  - System mode
  - CPU, memory, network usage
- Focuses on operational reliability

---

### Frontend Technology Stack
- **Framework:** React
- **Runtime:** Node.js
- **State Management:** Centralized global state
- **Styling:** Custom dark dashboard UI
- **Backend Dependency:** None (mock data only)

---

##  Backend Models (Phase 1)

VIGIL’s backend in Phase 1 consists of **two complementary AI perception modules**.

---

##  Model 1: Crime & Activity Recognition (UCF-Crime)

### Overview

A **multi-class crime activity recognition model** trained on the **UCF-Crime dataset**
using a **DenseNet121** backbone.  
This model provides **high-level behavioral understanding** from video frames.

---

### Architecture
- **Backbone:** DenseNet121 (ImageNet-pretrained)
- **Input:** RGB frames resized to **64 × 64**
- **Classification Head:** Dense layers + dropout
- **Output:** Softmax over **14 activity classes**

---

### Training & Evaluation
- **Loss:** Categorical Cross-Entropy
- **Optimizer:** SGD
- **Metric:** ROC–AUC (micro-average)

**Performance:**
- Overall ROC–AUC: **~0.84**
- Strong separation between:
  - Normal behavior
  - Non-violent anomalies
  - Violent activities

---

### Role in Phase 1
- Trained and evaluated **offline**
- Produces class probabilities and confidence scores
- Informs frontend **risk simulation logic**
- Not yet deployed in real time

---

##  Model 2: Weapon Detection System (YOLOv8)

### Overview

An **object detection–based weapon detection system**
implemented using **YOLOv8**.

Unlike classification, this model performs **spatial localization**,
detecting both **presence and position** of weapons in images.

---

### What Has Been Built
- YOLOv8-based weapon detector
- Complete training and inference pipeline
- GPU-accelerated workflow
- Bounding box visualization
- Exportable, deployment-ready model

---

### Technical Architecture
- **Model:** YOLOv8
- **Framework:** PyTorch (Ultralytics)
- **Problem Type:** Object Detection
- **Input:** Images
- **Output:** Bounding boxes + confidence scores

---

### Key Capabilities
- Real-time weapon detection (model-level)
- Accurate localization
- Suitable for surveillance and security systems
- Optimized for fast inference on GPU

---

##  Relationship Between the Two Models

- **Activity Recognition** answers: *What is happening?*
- **Weapon Detection** answers: *Is there an explicit physical threat?*

In future phases, outputs from both models will be:
- Fused into a **unified risk abstraction layer**
- Used to trigger **alerts and escalations**
- Visualized coherently in the VIGIL dashboard

---

##  Running the Frontend Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm

Verify installation:
```bash
node -v
npm -v


git clone <https://github.com/Jiyaaaa21/VIGIL---AI-Powered-Real-Time-Risk-Aware-Surveillance-for-Public-Safety>
cd surveillance-dashboard
npm install
npm run dev

Open in browser
http://localhost:3000


##  Future Enhancements (Phase 2+)

### Backend Enhancements
- Temporal modeling using **CNN–LSTM**, **Temporal Convolutional Networks (TCN)**, or **3D CNNs**
- Integration of **spatial and temporal attention mechanisms** to focus on salient regions and key frames
- Training with **higher-resolution inputs** to preserve fine-grained visual details
- **Class imbalance mitigation** using focal loss, class-weighted training, or adaptive sampling
- **Multi-modal learning** by incorporating optical flow and audio cues
- **Model optimization** for real-time inference using pruning, quantization, and TensorRT

---

### Weapon Detection Extensions
- **Multi-class weapon detection** (e.g., pistols, rifles, automatic weapons)
- **Real-time video and CCTV inference**
- **Confidence-based alert triggering** for rapid threat response
- **Edge-device optimization** for low-latency deployment

---

### System & Deployment
- **Real-time backend inference service**
- **Live camera integration** via RTSP / IP streams
- **Risk abstraction layer** derived from model probability outputs
- **Edge and cloud deployment** strategies for scalable operation
- **Scalable alerting pipeline** for real-world surveillance environments

---

### Frontend Enhancements
- Integration with real backend inference APIs
- **Live risk updates** driven by real-time model outputs
- Incident **export, reporting, and audit logs**
- **Role-based access control (RBAC)** for operators and administrators

---

##  Disclaimer

VIGIL is a **research and demonstration prototype currently**.  
It does **not** perform real surveillance or automated enforcement  
and should **not** be used for operational decision-making.
