from __future__ import annotations

import os
import re
import json
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
import requests
from dotenv import load_dotenv

load_dotenv()

# Complete Goal Catalog & Topics matching all 7 tracks specified by user
GOAL_DEFINITIONS = {
    'placement': {
        'id': 'placement',
        'title': 'ML for Placement',
        'subtitle': 'Technical, Algorithmic & Campus Interviews',
        'badge': 'Placement Ready',
        'color': 'cyan',
        'topics': [
            'Python', 'Statistics', 'Linear Regression', 'Logistic Regression',
            'SVM', 'Decision Trees', 'Random Forest', 'Ensemble Methods',
            'Feature Engineering', 'Model Evaluation', 'Bias-Variance Tradeoff'
        ],
        'defaultMastery': {
            'Python': 85,
            'Statistics': 74,
            'Linear Regression': 80,
            'Logistic Regression': 76,
            'SVM': 62,
            'Decision Trees': 78,
            'Random Forest': 75,
            'Ensemble Methods': 68,
            'Feature Engineering': 60,
            'Model Evaluation': 55,
            'Bias-Variance Tradeoff': 70
        }
    },
    'project': {
        'id': 'project',
        'title': 'AI for Project',
        'subtitle': 'End-to-End System & Application Engineering',
        'badge': 'Project Ready',
        'color': 'purple',
        'topics': [
            'Python', 'Data Preprocessing', 'EDA', 'Model Building',
            'Model Evaluation', 'Flask/FastAPI', 'APIs', 'Docker',
            'Cloud Deployment', 'End-to-End ML Pipelines'
        ],
        'defaultMastery': {
            'Python': 88,
            'Data Preprocessing': 82,
            'EDA': 85,
            'Model Building': 78,
            'Model Evaluation': 72,
            'Flask/FastAPI': 75,
            'APIs': 80,
            'Docker': 62,
            'Cloud Deployment': 54,
            'End-to-End ML Pipelines': 65
        }
    },
    'deeplearning': {
        'id': 'deeplearning',
        'title': 'Deep Learning',
        'subtitle': 'Neural Networks, PyTorch & Transformers',
        'badge': 'DL Specialist',
        'color': 'green',
        'topics': [
            'NumPy', 'PyTorch/TensorFlow', 'Neural Networks', 'Backpropagation',
            'CNN', 'RNN/LSTM', 'Attention Mechanism', 'Transformers',
            'Optimization (Adam/SGD)', 'Regularization (Dropout/BatchNorm)', 'DL Evaluation'
        ],
        'defaultMastery': {
            'NumPy': 88,
            'PyTorch/TensorFlow': 80,
            'Neural Networks': 78,
            'Backpropagation': 72,
            'CNN': 74,
            'RNN/LSTM': 65,
            'Attention Mechanism': 60,
            'Transformers': 55,
            'Optimization (Adam/SGD)': 70,
            'Regularization (Dropout/BatchNorm)': 68,
            'DL Evaluation': 62
        }
    },
    'nlp_llm': {
        'id': 'nlp_llm',
        'title': 'NLP & Gen AI',
        'subtitle': 'LLMs, RAG, Embeddings & Fine-Tuning',
        'badge': 'GenAI Architect',
        'color': 'amber',
        'topics': [
            'Tokenization', 'TF-IDF', 'Word Embeddings', 'Word2Vec',
            'BERT', 'Transformers', 'Fine-Tuning (LoRA/QLoRA)', 'LLMs',
            'RAG', 'Vector Databases', 'Prompt Engineering', 'GenAI Evaluation'
        ],
        'defaultMastery': {
            'Tokenization': 86,
            'TF-IDF': 84,
            'Word Embeddings': 80,
            'Word2Vec': 78,
            'BERT': 75,
            'Transformers': 72,
            'Fine-Tuning (LoRA/QLoRA)': 58,
            'LLMs': 70,
            'RAG': 65,
            'Vector Databases': 68,
            'Prompt Engineering': 85,
            'GenAI Evaluation': 60
        }
    },
    'cv_vision': {
        'id': 'cv_vision',
        'title': 'Computer Vision',
        'subtitle': 'Perception, YOLO & Vision Transformers',
        'badge': 'Vision Engineer',
        'color': 'rose',
        'topics': [
            'OpenCV', 'Image Processing', 'CNN Architectures', 'YOLO',
            'Object Detection (mAP/IoU/NMS)', 'Image Segmentation (U-Net)',
            'Vision Transformers', 'Image Augmentation', 'Feature Extraction', 'CV Evaluation'
        ],
        'defaultMastery': {
            'OpenCV': 84,
            'Image Processing': 82,
            'CNN Architectures': 76,
            'YOLO': 68,
            'Object Detection (mAP/IoU/NMS)': 64,
            'Image Segmentation (U-Net)': 58,
            'Vision Transformers': 52,
            'Image Augmentation': 80,
            'Feature Extraction': 72,
            'CV Evaluation': 66
        }
    },
    'mlops': {
        'id': 'mlops',
        'title': 'MLOps & AI Systems',
        'subtitle': 'Production Infrastructure, CI/CD & Monitoring',
        'badge': 'MLOps Engineer',
        'color': 'indigo',
        'topics': [
            'Docker', 'Kubernetes', 'MLflow', 'Feature Stores',
            'CI/CD Pipelines', 'Model Monitoring (Data Drift)',
            'Model Deployment', 'Model Serving (Triton/ONNX)', 'Cloud Scalability'
        ],
        'defaultMastery': {
            'Docker': 84,
            'Kubernetes': 62,
            'MLflow': 78,
            'Feature Stores': 60,
            'CI/CD Pipelines': 66,
            'Model Monitoring (Data Drift)': 56,
            'Model Deployment': 72,
            'Model Serving (Triton/ONNX)': 58,
            'Cloud Scalability': 64
        }
    },
    'datascience': {
        'id': 'datascience',
        'title': 'Data Science & EDA',
        'subtitle': 'Analytics, SQL, Hypothesis Testing & Storytelling',
        'badge': 'Data Scientist',
        'color': 'teal',
        'topics': [
            'Python', 'Pandas', 'NumPy', 'SQL (Window Functions/CTEs)',
            'Data Visualization', 'Exploratory Data Analysis',
            'Statistics (Hypothesis Testing/A/B Testing)', 'Data Cleaning',
            'Feature Engineering', 'Business Insights'
        ],
        'defaultMastery': {
            'Python': 88,
            'Pandas': 90,
            'NumPy': 85,
            'SQL (Window Functions/CTEs)': 82,
            'Data Visualization': 86,
            'Exploratory Data Analysis': 84,
            'Statistics (Hypothesis Testing/A/B Testing)': 72,
            'Data Cleaning': 88,
            'Feature Engineering': 70,
            'Business Insights': 75
        }
    }
}

# Rich Question Bank categorized by goal
QUESTION_DATABASE = {
    'placement': [
        {
            'id': 'pl-1',
            'goal': 'placement',
            'title': 'Bias-Variance Tradeoff in Machine Learning',
            'topic': 'Bias-Variance Tradeoff',
            'difficulty': 'Beginner',
            'type': 'conceptual',
            'question': 'What is the Bias-Variance tradeoff, and how do high bias and high variance manifest in model training and testing errors?',
            'hints': [
                'Hint 1: Think of bias as under-fitting (model too simplistic) and variance as over-fitting (model overly sensitive to noise).',
                'Hint 2: High bias yields high training error AND high test error. High variance yields very low training error but poor test error.'
            ],
            'idealKeyPoints': [
                'Bias is error from erroneous assumptions in learning algorithm (underfitting).',
                'Variance is sensitivity to small fluctuations in training data (overfitting).',
                'High bias = model fails to capture underlying patterns (high train & test error).',
                'High variance = model memorizes training noise (low train error, high test error).',
                'Goal is finding the sweet spot minimizing total expected error = Bias² + Variance + Irreducible Error.'
            ],
            'explanation': 'The Bias-Variance tradeoff represents the fundamental tension in supervised learning between a model\'s simplicity (bias) and flexibility (variance). Regularization and ensemble methods help balance both.'
        },
        {
            'id': 'pl-2',
            'goal': 'placement',
            'title': 'Precision vs Recall & When to Prioritize Each',
            'topic': 'Model Evaluation',
            'difficulty': 'Intermediate',
            'type': 'conceptual',
            'question': 'Explain the difference between Precision and Recall. In which real-world scenarios would you prioritize Recall over Precision, and vice-versa?',
            'hints': [
                'Hint 1: Precision = TP / (TP + FP); Recall = TP / (TP + FN).',
                'Hint 2: High recall is critical when False Negatives are costly (e.g. Cancer detection). High precision is critical when False Positives are disruptive (e.g. Spam detection or fraud alerts that freeze accounts).'
            ],
            'idealKeyPoints': [
                'Precision = True Positives / (True Positives + False Positives) (Prediction exactness).',
                'Recall = True Positives / (True Positives + False Negatives) (Completeness of discovery).',
                'Prioritize Recall when False Negatives are dangerous (e.g., disease detection, airport security).',
                'Prioritize Precision when False Positives cause high annoyance or cost (e.g., spam filter, loan auto-approval).',
                'F1-Score is the harmonic mean balancing Precision and Recall.'
            ],
            'explanation': 'Precision measures exactness while Recall measures completeness. In medical diagnosis, high Recall prevents undiagnosed patients. In spam filtering, high Precision prevents dropping legitimate critical messages.'
        },
        {
            'id': 'pl-3',
            'goal': 'placement',
            'title': 'Handling Missing Values and Outliers',
            'topic': 'Feature Engineering',
            'difficulty': 'Intermediate',
            'type': 'scenario',
            'question': 'You are handed a dataset with 25% missing values in numeric columns and severe skewness due to outliers. Walk through your strategy to clean and prepare this data for a linear model vs a tree-based model.',
            'hints': [
                'Hint 1: Linear models assume linearity and are sensitive to scale and outliers. Tree models are invariant to monotonic transformations and handle outliers naturally.',
                'Hint 2: For linear models, consider median/KNN imputation, log/Box-Cox transforms, and robust scaling or IQR capping.'
            ],
            'idealKeyPoints': [
                'Assess missingness mechanism (MCAR, MAR, MNAR). Use median, MICE, or KNN imputation; add missing indicator column.',
                'For Linear Regression/SVM: Apply log/PowerTransform to skewed distributions; use IQR/Z-score clipping; scale with StandardScaler.',
                'For Tree-based (Random Forest/XGBoost): Can split on extreme values without scaling; XGBoost can handle NaNs directly.',
                'Avoid data leakage by fitting imputers/scalers only on training splits.'
            ],
            'explanation': 'Linear models require normalized and outlier-free inputs because squared residuals amplify outlier influence. Tree models split hierarchically on order, making them robust to monotonic outlier scales.'
        },
        {
            'id': 'pl-4',
            'goal': 'placement',
            'title': 'Implement Custom Euclidean & Manhattan Distance in Java',
            'topic': 'Python',
            'difficulty': 'Beginner',
            'type': 'coding',
            'question': 'Implement a method `calculateDistance(double[] pointA, double[] pointB, String metric)` in Java that computes Euclidean distance when metric is "euclidean" and Manhattan distance when metric is "manhattan".',
            'hints': [
                'Hint 1: Euclidean distance = sqrt(sum((a_i - b_i)^2)).',
                'Hint 2: Manhattan distance = sum(abs(a_i - b_i)).'
            ],
            'starterCode': {
                'java': """public class Solution {
    public static double calculateDistance(double[] pointA, double[] pointB, String metric) {
        // Write your solution here
        double sum = 0.0;
        if ("manhattan".equalsIgnoreCase(metric)) {
            for (int i = 0; i < pointA.length; i++) {
                sum += Math.abs(pointA[i] - pointB[i]);
            }
            return sum;
        } else {
            for (int i = 0; i < pointA.length; i++) {
                double diff = pointA[i] - pointB[i];
                sum += diff * diff;
            }
            return Math.sqrt(sum);
        }
    }
}""",
                'python': """import math

class Solution:
    def calculateDistance(self, pointA: list[float], pointB: list[float], metric: str) -> float:
        if metric.lower() == "manhattan":
            return sum(abs(a - b) for a, b in zip(pointA, pointB))
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(pointA, pointB)))"""
            },
            'testCases': [
                {'input': 'pointA=[0,0], pointB=[3,4], metric="euclidean"', 'expectedOutput': '5.0'},
                {'input': 'pointA=[1,2], pointB=[4,6], metric="manhattan"', 'expectedOutput': '7.0'}
            ],
            'timeComplexity': 'O(d) where d is dimensionality',
            'spaceComplexity': 'O(1)'
        }
    ],
    'project': [
        {
            'id': 'pr-1',
            'goal': 'project',
            'title': 'Architecting End-to-End ML REST API with FastAPI',
            'topic': 'Flask/FastAPI',
            'difficulty': 'Intermediate',
            'type': 'technical',
            'question': 'How do you design a high-throughput, low-latency FastAPI inference service for a Scikit-Learn or PyTorch model, including request validation and async batching?',
            'hints': [
                'Hint 1: Use Pydantic for strict request/response schemas.',
                'Hint 2: Load model weights once during startup in app lifespan context, not per request.'
            ],
            'idealKeyPoints': [
                'Use Pydantic BaseModel for automatic validation, type safety, and OpenAPI documentation.',
                'Load model weights globally in lifespan/startup event to prevent reloading per request.',
                'Use async def endpoints with background worker queues or thread pool offloading (asyncio.to_thread) for CPU-bound inference.',
                'Implement structured logging, health checks (/healthz), and Prometheus latency metrics.'
            ],
            'explanation': 'FastAPI with Uvicorn provides asynchronous I/O. Offloading forward passes to process pools or ONNX runtime prevents event loop blocking during heavy model inference.'
        },
        {
            'id': 'pr-2',
            'goal': 'project',
            'title': 'Containerizing ML Inference with Docker',
            'topic': 'Docker',
            'difficulty': 'Intermediate',
            'type': 'scenario',
            'question': 'Describe best practices for creating a lightweight, production-ready Docker container for an AI microservice. How do you optimize image size and prevent security risks?',
            'hints': [
                'Hint 1: Use multi-stage builds and slim base images (e.g. python:3.11-slim).',
                'Hint 2: Avoid running containers as root user.'
            ],
            'idealKeyPoints': [
                'Use specific slim base images (e.g., python:3.11-slim) rather than full Ubuntu/Python images.',
                'Leverage multi-stage builds to compile C dependencies without keeping build tools in final image.',
                'Order Dockerfile layers from least to most frequently modified to maximize layer caching.',
                'Create and switch to a non-root appuser for runtime security.',
                'Use .dockerignore to exclude virtualenvs, .git, cache files, and model checkpoints if fetched from S3.'
            ],
            'explanation': 'Optimizing Docker images reduces deployment latency, memory overhead, and attack surface in production Kubernetes clusters.'
        }
    ],
    'deeplearning': [
        {
            'id': 'dl-1',
            'goal': 'deeplearning',
            'title': 'Vanishing and Exploding Gradients & Solutions',
            'topic': 'Neural Networks',
            'difficulty': 'Intermediate',
            'type': 'conceptual',
            'question': 'Explain what causes vanishing and exploding gradients during backpropagation in deep neural networks. What architectural techniques and regularizations prevent them?',
            'hints': [
                'Hint 1: Recall the chain rule derivative: multiplying many values < 1 shrinks gradients to zero (vanishing), while multiplying values > 1 causes gradients to diverge (exploding).',
                'Hint 2: Solutions include ReLU activations, He/Xavier weight initialization, Batch Normalization, and Residual skip connections.'
            ],
            'idealKeyPoints': [
                'Vanishing Gradients: Caused by saturating activations (Sigmoid/Tanh) where derivatives are < 0.25, compounded across deep layers by chain rule.',
                'Exploding Gradients: Caused by large weights and deep architectures where gradient product compounds exponentially.',
                'Activation function solution: Use non-saturating activations like ReLU, LeakyReLU, or GELU.',
                'Initialization solution: He/Kaiming or Xavier/Glorot initialization matching layer fan-in/fan-out.',
                'Architectural solution: Batch/Layer Normalization, Gradient Clipping (for RNNs), and Residual Skip Connections (ResNets).'
            ],
            'explanation': 'Residual connections create direct gradient highways where d(x + f(x))/dx = 1 + f\'(x), ensuring gradients flow back undisturbed even through 100+ layers.'
        },
        {
            'id': 'dl-2',
            'goal': 'deeplearning',
            'title': 'Self-Attention Mechanism & Scaled Dot-Product in Transformers',
            'topic': 'Transformers',
            'difficulty': 'Advanced',
            'type': 'technical',
            'question': 'Derive and explain the Scaled Dot-Product Attention equation: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V. Why is the sqrt(d_k) scaling factor mathematically necessary?',
            'hints': [
                'Hint 1: For large d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients.',
                'Hint 2: Dividing by sqrt(d_k) normalizes the dot product variance back to 1.'
            ],
            'idealKeyPoints': [
                'Queries (Q), Keys (K), and Values (V) are linear projections of input tokens.',
                'Dot product QK^T measures pairwise token similarity and alignment score.',
                'Mathematical reason for sqrt(d_k): If components of Q and K have mean 0 and variance 1, their dot product has mean 0 and variance d_k.',
                'Without scaling by sqrt(d_k), large d_k produces extreme logits, saturating softmax and causing vanishing gradients during backpropagation.',
                'Softmax normalizes similarities into attention weights that linearly weight Value vectors V.'
            ],
            'explanation': 'Scaled Dot-Product Attention allows every token to directly interact with every other token in parallel O(1) sequential distance, overcoming RNN sequential bottlenecks.'
        }
    ],
    'nlp_llm': [
        {
            'id': 'nlp-1',
            'goal': 'nlp_llm',
            'title': 'RAG Architecture: Chunking, Vector Indexing, & Re-Ranking',
            'topic': 'RAG',
            'difficulty': 'Intermediate',
            'type': 'technical',
            'question': 'Describe an enterprise Retrieval-Augmented Generation (RAG) pipeline from document ingestion to LLM generation. How do chunk size, overlap, vector similarity, and re-ranking affect generation quality?',
            'hints': [
                'Hint 1: Ingestion -> Chunking (with overlap) -> Embedding -> Vector DB Index (HNSW/IVF) -> Query -> Hybrid/Vector Search -> Cross-Encoder Reranker -> LLM Context Window.',
                'Hint 2: Small chunks preserve pinpoint accuracy; large chunks preserve semantic context. Chunk overlap prevents splitting key sentences across boundaries.'
            ],
            'idealKeyPoints': [
                'Document Ingestion & Chunking: Split documents with overlap (e.g. 512 tokens with 50 token overlap) using semantic or recursive character splitting.',
                'Vector Storage: Embed chunks with dense embedding models (e.g., text-embedding-3 or BGE) and store in vector DB with HNSW indexing.',
                'Hybrid Retrieval: Combine BM25 keyword search with dense cosine vector similarity (Reciprocal Rank Fusion RRF).',
                'Re-ranking: Pass top-K candidates through a Cross-Encoder reranker (e.g., Cohere or BGE-Reranker) to score semantic relevance precisely.',
                'Prompt Synthesis & Grounding: Inject top reranked chunks into LLM system prompt with strict citation constraints to eliminate hallucination.'
            ],
            'explanation': 'RAG dynamically grounds LLM answers in proprietary, up-to-date domain data without expensive continual retraining.'
        },
        {
            'id': 'nlp-2',
            'goal': 'nlp_llm',
            'title': 'Fine-Tuning LLMs with LoRA & QLoRA',
            'topic': 'Fine-Tuning (LoRA/QLoRA)',
            'difficulty': 'Advanced',
            'type': 'conceptual',
            'question': 'How does Low-Rank Adaptation (LoRA) enable parameter-efficient fine-tuning of 70B+ LLMs on consumer GPUs? Explain the decomposition W = W_0 + B*A and how QLoRA extends it.',
            'hints': [
                'Hint 1: W_0 remains frozen. B has shape (d x r) and A has shape (r x k) where rank r << min(d, k).',
                'Hint 2: QLoRA quantizes W_0 to 4-bit NormalFloat (NF4) with Double Quantization and Paged Optimizers.'
            ],
            'idealKeyPoints': [
                'LoRA freezes base model weights W_0 and injects trainable rank decomposition matrices: W = W_0 + Delta_W = W_0 + (B * A) * (alpha / r).',
                'Rank r is very small (e.g., 8, 16, or 32), reducing trainable parameters by 99% while preserving full-rank capacity.',
                'Zero inference overhead: At deployment, Delta_W can be directly merged into base weights W_0.',
                'QLoRA advances: Quantizes frozen weights W_0 to 4-bit NormalFloat (NF4), applies Double Quantization to save memory, and uses Paged Optimizers for CUDA memory spikes.'
            ],
            'explanation': 'LoRA and QLoRA democratize LLM customization by enabling 70B parameter models to be fine-tuned on single 24GB/48GB GPUs without losing accuracy.'
        }
    ],
    'cv_vision': [
        {
            'id': 'cv-1',
            'goal': 'cv_vision',
            'title': 'YOLO Single-Stage Object Detection vs Two-Stage Detectors',
            'topic': 'YOLO',
            'difficulty': 'Intermediate',
            'type': 'conceptual',
            'question': 'Compare single-stage object detectors (like YOLO) with two-stage detectors (like Faster R-CNN) in terms of architecture, speed, accuracy, and handling of Intersection over Union (IoU) and Non-Maximum Suppression (NMS).',
            'hints': [
                'Hint 1: Two-stage detectors generate Region Proposals first (RPN), then classify each candidate. YOLO predicts bounding boxes and class probabilities directly from full image in a single pass.',
                'Hint 2: NMS filters overlapping boxes having IoU > threshold by selecting the candidate with highest confidence score.'
            ],
            'idealKeyPoints': [
                'Architecture difference: Two-stage (Faster R-CNN) uses Region Proposal Network (RPN) followed by RoI Pooling and classification. Single-stage (YOLO) treats detection as direct spatial regression.',
                'Speed vs Accuracy Tradeoff: YOLO achieves real-time inference (60-150+ FPS) suitable for edge devices; two-stage historically yields higher precision on small objects at slower inference speeds.',
                'Intersection over Union (IoU): Metric measuring area of overlap / area of union between predicted and ground truth boxes (typically IoU >= 0.5 or 0.75).',
                'Non-Maximum Suppression (NMS): Post-processing step that removes redundant overlapping bounding boxes by sorting confidences and suppressing boxes with IoU > threshold.'
            ],
            'explanation': 'YOLO enables real-time edge intelligence by executing one single forward pass across the entire image, drastically reducing latency.'
        }
    ],
    'mlops': [
        {
            'id': 'mlo-1',
            'goal': 'mlops',
            'title': 'Detecting and Handling Data Drift and Concept Drift in Production',
            'topic': 'Model Monitoring (Data Drift)',
            'difficulty': 'Intermediate',
            'type': 'scenario',
            'question': 'Your production fraud detection model\'s accuracy drops by 18% three months after deployment. Distinguish Data Drift from Concept Drift, and outline a diagnostic and automated remediation architecture.',
            'hints': [
                'Hint 1: Data Drift is P(X) changing (input distributions shifting). Concept Drift is P(Y|X) changing (relationship between input and fraud labels shifting).',
                'Hint 2: Statistical tests: Kolmogorov-Smirnov (KS) test, Population Stability Index (PSI), Wasserstein distance.'
            ],
            'idealKeyPoints': [
                'Data Drift (Covariate Shift): Input feature distribution P(X) changes while P(Y|X) remains constant (e.g., new user demographics).',
                'Concept Drift: The underlying relationship P(Y|X) changes (e.g., fraudsters adopt new deceptive transaction patterns).',
                'Detection: Calculate statistical divergence (Kolmogorov-Smirnov test for continuous, Chi-Square for categorical, Population Stability Index PSI > 0.2).',
                'Monitoring Pipeline: Stream inference payloads to feature store/data lake; run daily drift detection jobs (Evidently AI / Great Expectations).',
                'Remediation: Trigger automated retraining pipeline with recent window data; evaluate on holdout set; canary deploy new model version.'
            ],
            'explanation': 'Continuous monitoring of statistical feature divergence and ground-truth delay curves is critical to ensure ML systems remain reliable in changing real-world environments.'
        }
    ],
    'datascience': [
        {
            'id': 'ds-1',
            'goal': 'datascience',
            'title': 'A/B Testing Methodology, Sample Size & P-Values',
            'topic': 'Statistics (Hypothesis Testing/A/B Testing)',
            'difficulty': 'Intermediate',
            'type': 'technical',
            'question': 'Walk through the design and execution of an A/B test for a new checkout recommendation algorithm. How do you determine sample size, control for Type I/II errors, and interpret p-values?',
            'hints': [
                'Hint 1: Null hypothesis H0: No difference in conversion rate. Alternative H1: Conversion rate improves by minimum detectable effect (MDE).',
                'Hint 2: Power analysis uses significance level alpha (typically 0.05) and statistical power 1 - beta (typically 0.80).'
            ],
            'idealKeyPoints': [
                'Formulate Null Hypothesis (H0: CR_test = CR_control) and Alternative Hypothesis (H1: CR_test > CR_control).',
                'Sample Size Calculation: Determined by baseline conversion rate, Minimum Detectable Effect (MDE), significance level alpha (0.05), and statistical power (1 - beta = 0.80).',
                'Randomization: Ensure user-level hashing prevents split leakage; verify sample ratio mismatch (SRM).',
                'Execution: Run for full business cycles (minimum 1-2 full weeks) to avoid day-of-week seasonality.',
                'P-Value Interpretation: Probability of observing data at least as extreme assuming H0 is true; if p < 0.05, reject H0 with statistical significance.'
            ],
            'explanation': 'A/B testing is the gold standard for causal inference in product decision-making, ensuring algorithm enhancements deliver genuine measurable business lift.'
        }
    ]
}

# Progressive Preparation Path Stages
PREPARATION_STAGES = [
    {
        'id': 'fundamentals',
        'title': 'Fundamentals & Core Theory',
        'description': 'Foundational syntax, mathematical definitions, and algorithm mechanisms.',
        'targetCount': 5,
        'minAccuracy': 60
    },
    {
        'id': 'core_concepts',
        'title': 'Core Technical Concepts',
        'description': 'In-depth domain principles, loss functions, architectures, and evaluation.',
        'targetCount': 8,
        'minAccuracy': 65
    },
    {
        'id': 'intermediate',
        'title': 'Intermediate Q&A & Trade-Offs',
        'description': 'Architectural comparisons, optimization nuances, and edge cases.',
        'targetCount': 10,
        'minAccuracy': 70
    },
    {
        'id': 'advanced',
        'title': 'Advanced & System Design',
        'description': 'Scalability, latency bottlenecks, mathematical derivations, and distributed systems.',
        'targetCount': 12,
        'minAccuracy': 75
    },
    {
        'id': 'scenarios',
        'title': 'Scenario & Real-World Debugging',
        'description': 'Diagnostic root-cause analysis, production failures, and mitigation strategies.',
        'targetCount': 8,
        'minAccuracy': 80
    },
    {
        'id': 'mock_interview',
        'title': 'Full Realistic Mock Interview',
        'description': 'Comprehensive time-bound simulation with behavioral, technical, and live coding rounds.',
        'targetCount': 1,
        'minAccuracy': 75
    }
]


def get_goal_metadata(goal_id: str) -> Dict[str, Any]:
    return GOAL_DEFINITIONS.get(goal_id, GOAL_DEFINITIONS['placement'])


def get_interview_questions(goal_id: str, difficulty: str = 'all', q_type: str = 'all') -> List[Dict[str, Any]]:
    pool = QUESTION_DATABASE.get(goal_id, QUESTION_DATABASE['placement'])
    results = []
    for q in pool:
        if difficulty != 'all' and q.get('difficulty', '').lower() != difficulty.lower():
            continue
        if q_type != 'all' and q.get('type', '').lower() != q_type.lower():
            continue
        results.append(q)
    return results or pool


def get_daily_challenge(goal_id: str, weak_topic: Optional[str] = None) -> Dict[str, Any]:
    pool = QUESTION_DATABASE.get(goal_id, QUESTION_DATABASE['placement'])
    if weak_topic:
        for q in pool:
            if weak_topic.lower() in q.get('topic', '').lower() or q.get('topic', '').lower() in weak_topic.lower():
                return q
    return pool[0] if pool else {}


def evaluate_text_answer_gemini(api_key: str, question: Dict[str, Any], user_answer: str) -> Optional[Dict[str, Any]]:
    """Evaluates answer using Gemini API with structured JSON output."""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        prompt = f"""You are an expert technical interviewer evaluating an interview candidate's response.
Question: {question.get('question')}
Ideal Key Points to Look For: {json.dumps(question.get('idealKeyPoints', []))}
Candidate Answer: {user_answer}

Evaluate the candidate's answer based on:
1. Conceptual correctness & depth (0-100 score)
2. Matched key points vs missed key points
3. Technical terminology and clarity
4. Constructive feedback explaining what was done well and what crucial points were missing.

Respond ONLY with valid JSON in this exact structure without markdown fences:
{{
    "score": 85,
    "verdict": "Strong Technical Answer",
    "isSatisfactory": true,
    "feedback": "Constructive explanation...",
    "matchedKeyPoints": ["Point 1", "Point 2"],
    "missedKeyPoints": ["Point 3"],
    "clarityScore": "High Clarity",
    "technicalDepth": "Industry Standard"
}}"""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }
        resp = requests.post(url, json=payload, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed = json.loads(raw_text)
                return parsed
    except Exception as e:
        print(f"[Interview Evaluator] Gemini evaluation fallback triggered: {e}")
    return None


def evaluate_text_answer_heuristic(question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
    """Heuristic semantic evaluation engine assessing completeness, key concepts, and structure."""
    if not user_answer or len(user_answer.strip()) < 10:
        return {
            'score': 25,
            'verdict': 'Incomplete Response',
            'isSatisfactory': False,
            'feedback': 'Your answer is too brief. Be sure to articulate key principles, definitions, and practical examples.',
            'matchedKeyPoints': [],
            'missedKeyPoints': question.get('idealKeyPoints', []),
            'clarityScore': 'Needs Improvement',
            'technicalDepth': 'Basic'
        }

    answer_lower = user_answer.lower()
    matched_points = []
    missed_points = []
    ideal_points = question.get('idealKeyPoints', [])

    for pt in ideal_points:
        words = [w for w in re.split(r'\W+', pt.lower()) if len(w) > 3]
        matches = sum(1 for w in words if w in answer_lower)
        if matches >= 2 or pt.lower()[:15] in answer_lower:
            matched_points.append(pt)
        else:
            missed_points.append(pt)

    ratio = len(matched_points) / max(1, len(ideal_points))
    length_bonus = 10 if len(user_answer) > 120 else 0
    score = min(96, max(38, int(ratio * 70 + 25 + length_bonus)))

    if score >= 80:
        verdict = 'Strong Technical Answer'
        feedback = 'Excellent articulation of core concepts and trade-offs. Your answer demonstrates strong technical terminology and clear structure.'
    elif score >= 60:
        verdict = 'Partially Complete'
        feedback = 'You covered the foundational idea, but missed a few crucial technical subtleties. Review the missing key points below.'
    else:
        verdict = 'Needs More Depth'
        feedback = 'Your response lacks essential technical mechanics. Carefully study the explanation and missing key concepts to strengthen your understanding.'

    return {
        'score': score,
        'verdict': verdict,
        'isSatisfactory': score >= 60,
        'feedback': feedback,
        'matchedKeyPoints': matched_points,
        'missedKeyPoints': missed_points,
        'clarityScore': 'High Clarity' if score >= 75 else 'Moderate',
        'technicalDepth': 'Industry Standard' if score >= 75 else 'Developing'
    }


def evaluate_interview_response(question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('OPENAI_API_KEY')
    if api_key and len(api_key.strip()) > 8:
        gemini_result = evaluate_text_answer_gemini(api_key.strip(), question, user_answer)
        if gemini_result:
            return gemini_result
    return evaluate_text_answer_heuristic(question, user_answer)
