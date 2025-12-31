##  Backend Models (Phase 1)

VIGIL’s backend in Phase 1 consists of **two complementary AI perception modules**:

1. **Crime / Activity Recognition Model** — *What is happening?*  
2. **Weapon Detection Model** — *Is a weapon present, and where?*

Together, these models form the **perception foundation** for risk-aware surveillance,
while decision-making and visualization are handled by the frontend.

Both models are currently **trained and evaluated offline** and are **not yet integrated
into a real-time inference pipeline**.

---

##  Model 1: Crime & Activity Recognition (UCF-Crime)

### Overview

This module implements a **multi-class crime activity recognition model**
trained on the **UCF-Crime dataset** using a **DenseNet121** backbone.

The model is designed to recognize **crime-related and non-crime activities**
from RGB video frames and serves as the **high-level behavioral understanding layer**
for the VIGIL system.

---

### Architecture

- **Backbone:** DenseNet121  
  - Initialized with **ImageNet-pretrained weights**
- **Input:**  
  - RGB video frames resized to **64 × 64**
- **Feature Extraction:**  
  - High-level spatial feature representations
- **Classification Head:**  
  - Fully connected dense layers  
  - Dropout for regularization
- **Output Layer:**  
  - Softmax classifier predicting **14 activity classes**

---

### Training Configuration

- **Loss Function:** Categorical Cross-Entropy  
- **Optimizer:** Stochastic Gradient Descent (SGD)  
- **Dataset:** UCF-Crime  
- **Evaluation Metric:** ROC–AUC (micro-average)

ROC–AUC is chosen due to the **severe class imbalance** present in large-scale
surveillance datasets.

---

### Performance Summary

- **Overall ROC–AUC (micro-average):** ~0.84  
- Strong separation between:
  - Normal activities  
  - Non-violent anomalies  
  - Violent events
- Robust class-wise discrimination under challenging visual conditions

These results demonstrate the effectiveness of **DenseNet-based spatial feature extraction**
for crime activity recognition.

---

### Role in Phase 1 System

- Operates as an **offline-trained perception model**
- Outputs **class probabilities and confidence scores**
- Informs the **design of risk abstraction logic**
- Frontend currently uses **mocked signals** shaped after these outputs

---

##  Model 2: Weapon Detection System (YOLOv8)

### Overview

This module implements an **AI-based weapon detection system**
using a deep learning **object detection** approach.

Unlike activity recognition, this model focuses on **spatial localization**,
detecting both the **presence and precise location** of weapons in images
using bounding boxes and confidence scores.

It complements the activity recognition model by providing **fine-grained threat cues**.

---

### What Has Been Built (Phase 1)

- **YOLOv8-based weapon detection model**
- Complete **training and inference pipeline**
- **GPU-accelerated** training workflow
- Image-based inference with **bounding box visualization**
- **Exportable, deployment-ready** trained model

---

### System Workflow

1. Input images are preprocessed and resized  
2. YOLOv8 learns spatial and visual weapon features  
3. During inference, the entire image is processed in a **single forward pass**  
4. Detected weapons are returned as:
   - Bounding boxes  
   - Confidence scores  
5. Outputs can be visualized or passed to downstream systems

---

### Technical Architecture

- **Model Architecture:** YOLOv8  
- **Framework:** PyTorch (Ultralytics)  
- **Problem Type:** Object Detection  
- **Input:** Images  
- **Output:** Bounding boxes with weapon confidence scores  

---

### Key Capabilities

- Real-time weapon detection (model-level)
- Accurate weapon localization
- Scalable and modular design
- Optimized for fast inference using **GPU acceleration**

---

### Use Cases

- Smart surveillance systems  
- Public safety and threat monitoring  
- Security screening in restricted areas  
- AI-assisted law enforcement tools  

---

##  Relationship Between the Two Models

The two backend models serve **distinct but complementary roles**:

- **Activity Recognition:**  
  - Understands *what type of behavior is occurring*
- **Weapon Detection:**  
  - Identifies *explicit physical threats and their locations*

In future phases, outputs from both models will be:
- Fused into a **unified risk abstraction layer**
- Used to drive **real-time alerts and escalations**
- Visualized coherently in the VIGIL frontend

---

##  Future Enhancements (Phase 2+)

### Backend Enhancements
- Temporal modeling (CNN–LSTM, TCN, 3D CNNs)
- Spatial & temporal attention mechanisms
- Higher-resolution inputs
- Class imbalance mitigation (focal loss, weighted sampling)
- Multi-modal learning (optical flow, audio)
- Model optimization (pruning, quantization, TensorRT)

---

### Weapon Detection Extensions
- Multi-class weapon detection (pistols, rifles, automatic weapons)
- Real-time video and CCTV stream inference
- Confidence-based alert triggering
- Edge-device optimization for low-latency deployment

---

### System & Deployment
- Real-time backend inference service
- Live camera integration (RTSP / IP streams)
- Risk abstraction from model probabilities
- Edge and cloud deployment strategies
- Scalable alerting and notification pipeline

---

> **Note:**  
> All Phase 2 enhancements focus on transitioning from
> *offline-trained models* to a *real-time, deployable surveillance system*
> while maintaining explainability and ethical safeguards.
