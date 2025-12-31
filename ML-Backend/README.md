## 🧠 Backend Model (Phase 1)

> This section describes the **Phase 1 backend model design** used to generate
> simulated risk signals for the VIGIL frontend.  
> The model operates independently of the frontend and is **not yet integrated in real time**.

---

### Model Overview

The Phase 1 backend implements a **multi-class crime activity recognition model**
trained on the **UCF-Crime dataset** using a **DenseNet121** backbone.

The model is designed to recognize a diverse set of **crime-related and non-crime activities**
from RGB video frames, serving as a foundational perception module for
risk-aware surveillance.

---

### Architecture

- **Backbone:** DenseNet121  
  - Initialized with **ImageNet-pretrained weights**
  - Used as a spatial feature extractor
- **Input:**  
  - RGB video frames resized to **64 × 64**
- **Feature Extraction:**  
  - High-level spatial representations learned from individual frames
- **Classification Head:**  
  - Fully connected dense layers  
  - Dropout for regularization
- **Output Layer:**  
  - Softmax classifier predicting **14 crime-related activity classes**

---

### Training Configuration

- **Loss Function:** Categorical Cross-Entropy  
- **Optimizer:** Stochastic Gradient Descent (SGD)  
- **Training Objective:** Multi-class activity classification  
- **Dataset:** UCF-Crime  
- **Evaluation Metric:** ROC–AUC (micro-averaged)

ROC–AUC is selected due to its robustness in **imbalanced multi-class settings**,
which is characteristic of large-scale surveillance datasets.

---

### Performance Summary

The trained DenseNet-based model demonstrates strong discriminative capability
on the UCF-Crime test set:

- **Overall ROC–AUC (micro-average):** ~0.84  
- Effective separation between **normal and anomalous activities**
- Robust class-wise discrimination across:
  - Violent events
  - Non-violent abnormal activities
  - Normal behavior

ROC curve analysis shows clear margins between activity classes,
indicating strong representational learning despite challenging visual conditions
and class imbalance.

---

### Role in Phase 1 System

In **Phase 1**, this model:
- Serves as the **conceptual backend intelligence**
- Produces **class-level confidence signals**
- Informs **simulated risk scores** consumed by the frontend
- Is **not yet connected to live camera feeds**

The frontend currently uses **mocked outputs** that mirror the structure
and behavior of this model’s predictions.

---

### Future Enhancements (Phase 2+)

Planned extensions to improve realism, robustness, and deployability include:

- **Temporal Modeling**  
  - CNN–LSTM  
  - Temporal Convolutional Networks (TCN)  
  - 3D CNNs for motion-aware learning

- **Attention Mechanisms**  
  - Spatial attention for salient regions  
  - Temporal attention for key frames

- **Higher-Resolution Inputs**  
  - Preserving fine-grained visual details in complex scenes

- **Class Imbalance Handling**  
  - Focal loss  
  - Class-weighted training  
  - Adaptive sampling strategies

- **Multi-Modal Learning**  
  - Optical flow integration  
  - Audio-based cues for enhanced robustness

- **Real-Time Deployment**  
  - Model pruning and quantization  
  - TensorRT optimization  
  - Edge and surveillance hardware acceleration

---

> **Note:**  
> These enhancements align with the Phase 2 roadmap, where real-time inference
> and live camera integration are planned.
