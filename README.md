# VIGIL — AI-Powered Real-Time Risk-Aware Surveillance for Public Safety

![Status](https://img.shields.io/badge/status-phase--1-blue)
![Frontend](https://img.shields.io/badge/frontend-react-61dafb)
![Backend](https://img.shields.io/badge/backend-ml%20model-yellow)
![Data](https://img.shields.io/badge/data-ucf--crime-orange)
![Deployment](https://img.shields.io/badge/deployment-not%20live-lightgrey)

VIGIL is a **risk-aware surveillance system prototype** designed to demonstrate how
**AI-driven activity recognition and risk signals** can be visualized, escalated,
aggregated, and explained for **public safety and situational awareness**.

This repository contains **both frontend and backend work completed in Phase 1**,
along with a clear roadmap toward real-time, end-to-end deployment.

---

## 📌 Problem Statement

**Real-Time Risk-Aware Surveillance for Public Safety**

Traditional surveillance systems rely on manual monitoring and binary alerts.
VIGIL addresses this gap by introducing a **risk-based, explainable, and scalable**
approach to multi-camera surveillance—prioritizing **situational awareness**
over automated judgment.

---

## 🧭 Project Scope (Phase 1)

### What is implemented
- A **high-fidelity frontend dashboard** simulating a real surveillance command center
- A **trained deep learning model** for multi-class crime activity recognition
- Clear separation between **perception (model)** and **decision visualization (UI)**

### What is NOT yet implemented
- Live camera feeds
- Real-time backend–frontend integration
- On-device or edge deployment

---

## 🧱 System Architecture (High-Level)

[ UCF-Crime Dataset ]
        ↓
[ DenseNet121-Based Activity Recognition Model ]
        ↓
[ Class Probabilities & Confidence Scores ]
        ↓
[ Risk Abstraction Layer (Simulated in Phase 1) ]
        ↓
[ VIGIL Frontend Dashboard ]


Phase 1 focuses on validating **model capability** and **UI/system design**
before real-time integration.

---

## 🖥️ Frontend (Phase 1)

### Overview

The frontend is a **React-based, production-style surveillance dashboard**
designed to resemble a real-world operations command center.

It consumes **simulated risk signals** that mirror expected backend outputs.

---

### Frontend Views

#### 1️⃣ Camera Risk View
**Tactical · Snapshot-Level Monitoring**

- 3×3 grid of simulated camera feeds
- Each camera displays:
  - Risk score
  - Confidence
  - Zone
  - Status (Normal / Suspicious / High Risk)
- Automatic escalation of the highest-risk camera
- Snapshot refresh cadence: **every 5 seconds**
- Bounding boxes rendered on all frames (mocked)

---

#### 2️⃣ Area Risk View
**Strategic · Situational Awareness**

- Aggregates camera-level risk into zones
- Displays:
  - Zone risk indicators
  - Risk persistence heat matrix
  - System-wide KPIs
- Uses abstract zones (not real geographic maps)

---

#### 3️⃣ Event Intelligence Timeline
**Explainability · Audit Trail**

- Chronological record of system decisions:
  - Risk increases
  - Camera escalations
  - Alert confirmations
  - Risk normalization
- Answers: **“Why did the system act?”**

---

#### 4️⃣ System Health & Readiness
**Operational Reliability**

- Simulated system metrics:
  - Cameras online
  - Active alerts
  - System mode
  - CPU, memory, network usage
- Focuses on system stability, not analytics

---

### Frontend Technology Stack

- **Framework:** React
- **Runtime:** Node.js
- **State Management:** Centralized global state
- **Styling:** Custom dark, dashboard-style UI
- **Backend Dependency:** None (mock data only)

---

## 🧠 Backend Model (Phase 1)

### Model Overview

The Phase 1 backend implements a **multi-class crime activity recognition model**
trained on the **UCF-Crime dataset** using a **DenseNet121** backbone.

The model serves as the **perception layer** for VIGIL.

---

### Architecture

- **Backbone:** DenseNet121
  - ImageNet-pretrained weights
- **Input:** RGB video frames resized to **64 × 64**
- **Feature Extraction:** High-level spatial features
- **Classification Head:**
  - Fully connected dense layers
  - Dropout regularization
- **Output:** Softmax over **14 crime-related activity classes**

---

### Training Configuration

- **Loss Function:** Categorical Cross-Entropy
- **Optimizer:** Stochastic Gradient Descent (SGD)
- **Dataset:** UCF-Crime
- **Evaluation Metric:** ROC–AUC (micro-average)

ROC–AUC is chosen due to the **severe class imbalance** in surveillance datasets.

---

### Model Performance

- **Overall ROC–AUC (micro-average):** ~0.84
- Robust discrimination across:
  - Violent activities
  - Non-violent anomalous events
  - Normal behavior
- Clear separation between normal and anomalous classes in ROC analysis

These results demonstrate the effectiveness of **DenseNet-based spatial feature extraction**
for large-scale crime activity recognition.

---

### Role in Phase 1 System

In Phase 1:
- The model is **trained and evaluated offline**
- Its outputs inform the **design of frontend risk abstractions**
- The frontend currently uses **mocked signals** shaped after real model outputs
- No real-time inference pipeline is active yet

---

## ▶️ Running the Frontend Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm

Verify installation:
```bash
node -v
npm -v


### Steps

git clone <https://github.com/Jiyaaaa21/VIGIL---AI-Powered-Real-Time-Risk-Aware-Surveillance-for-Public-Safety>
cd surveillance-dashboard
npm install
npm run dev

##  Open in Browser

http://localhost:3000



## 🔮 Future Enhancements (Phase 2+)

### Backend Enhancements
- Temporal modeling using **CNN–LSTM**, **Temporal Convolutional Networks (TCN)**, or **3D CNNs**
- Integration of **spatial and temporal attention mechanisms** to focus on salient regions and key frames
- Training with **higher-resolution inputs** to preserve fine-grained visual details
- **Class imbalance mitigation** using focal loss, class-weighted training, or adaptive sampling
- **Multi-modal learning** by incorporating optical flow and audio cues
- **Model optimization** for real-time inference using pruning, quantization, and TensorRT

---

### System & Deployment
- Real-time backend inference service
- Live camera integration via **RTSP / IP streams**
- Risk abstraction layer derived from model probability outputs
- **Edge and cloud deployment** strategies for scalable operation
- **Scalable alerting pipeline** for real-world surveillance environments

---

### Frontend Enhancements
- Integration with real backend inference APIs
- **Live risk updates** driven by real-time model outputs
- Incident **export, reporting, and audit logs**
- **Role-based access control (RBAC)** for operators and administrators
