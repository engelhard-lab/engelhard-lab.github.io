---
title: "Grounding predictions in multi-modal evidence"
order: 2
image: ./evidence-grounded-prediction.jpg
imageAlt: "EviGen pipeline: evidence selection, rationale generation, and verification layers"
imageCredit: "Figure: Li et al., Findings of EMNLP 2026 (CC BY)"
publications:
  - li2025iris
  - li2026evigen
  - subramanian2021spanpredict
---

Key early signs of many conditions are documented only in clinical notes, but these findings are sparse relative to the high volume of notes for a typical patient, and most state-of-the-art NLP models are difficult for clinicians to interpret. We develop lightweight, scalable methods such as IRIS that retrieve the segments of a patient's notes most relevant to a given task, so clinicians can inspect the evidence behind each prediction. Follow-up work extends evidence-grounded prediction to multi-modal settings and generates provider-friendly rationales that are verified to be faithful to the source material.
