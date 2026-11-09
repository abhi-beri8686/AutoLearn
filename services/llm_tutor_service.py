from __future__ import annotations

import os
import re
import json
import textwrap
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List, Optional, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

import pandas as pd
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from resources import TOPIC_CATALOG, normalize_topic
from services.catalog_service import rank_courses, rank_kaggle_datasets, rank_catalog_videos, project_for_topic

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

TOPIC_NOTES: Dict[str, str] = {
    'python': 'Python is the foundation language for AI and ML workflows. Focus on data types, functions, loops, list comprehensions, NumPy, pandas, and basic visualization.',
    'statistics': 'Statistics helps you summarize data, estimate uncertainty, and validate model decisions. Learn mean, variance, distributions, hypothesis testing, and confidence intervals.',
    'probability': 'Probability gives the mathematical language for uncertainty. Learn conditional probability, Bayes theorem, random variables, expectation, and common distributions.',
    'feature engineering': 'Feature engineering improves how raw data is represented. It includes encoding, scaling, feature creation, feature selection, and handling missing values.',
    'linear regression': 'Linear regression predicts continuous values and teaches the basics of supervised learning, fitting, coefficients, loss, and regularization.',
    'classification': 'Classification predicts categories such as pass/fail or spam/not-spam. Learn logistic regression, metrics, imbalance handling, and threshold tuning.',
    'decision trees': 'Decision trees split data into interpretable rules. Understand entropy, information gain, pruning, and ensemble extensions like random forests.',
    'clustering': 'Clustering groups unlabeled examples using similarity. Study K-means, hierarchical clustering, silhouette score, and feature scaling effects.',
    'dimensionality reduction': 'Dimensionality reduction compresses information into fewer features. Learn PCA, explained variance, visualization, and denoising tradeoffs.',
    'naive bayes': 'Naive Bayes is a probabilistic classifier that works well on sparse text features and small datasets, especially when assumptions are acceptable.',
    'neural networks': 'Neural networks learn layered representations. Understand perceptrons, activation functions, backpropagation, optimization, overfitting, and regularization.',
    'computer vision': 'Computer vision teaches machines to interpret images using preprocessing, convolutional neural networks, detection, segmentation, and augmentation.',
    'nlp': 'Natural language processing handles text tasks like tokenization, embeddings, sentiment analysis, translation, and retrieval.',
    'transformers': 'Transformers use attention to model long-range dependencies. They power modern NLP, vision transformers, and most LLM systems.',
    'llm': 'Large language models are pretrained on broad text corpora and then adapted through prompting, retrieval, instruction tuning, and tool use.',
    'prompt engineering': 'Prompt engineering structures instructions, context, role, constraints, and examples so language models answer more reliably.',
    'generative ai': 'Generative AI creates new text, images, audio, or code by learning data distributions and patterns using Transformers, Diffusion models, and GANs.',
    'reinforcement learning': 'Reinforcement learning optimizes behavior through rewards. Learn agents, environments, policies, exploration, and value functions.',
    'model evaluation': 'Model evaluation tells whether a model is trustworthy. Use train/validation/test splits, cross-validation, precision, recall, F1, ROC-AUC, and error analysis.',
    'model deployment': 'Model deployment makes models usable in real systems via APIs, monitoring, versioning, and retraining pipelines.',
    'automl': 'AutoML automates feature preprocessing, model search, and hyperparameter tuning so strong baselines are easier to build quickly.',
    'svm': 'Support Vector Machines maximize margin between classes and are strong for small to medium structured datasets.',
    'ensemble methods': 'Ensemble methods combine multiple models to improve robustness and predictive power through bagging, boosting, or stacking.',
    'hyperparameter tuning': 'Hyperparameter tuning searches for good model settings using grid search, random search, Bayesian optimization, or bandit-based methods.',
    'search algorithms': 'Search algorithms explore state spaces to find solutions. Learn BFS, DFS, uniform cost search, A*, heuristics, and admissibility.',
    'knowledge representation': 'Knowledge representation models facts, rules, entities, and relationships so AI systems can reason about them.',
    'expert systems': 'Expert systems combine a knowledge base and inference engine to emulate domain-specific decision making.',
    'fuzzy logic': 'Fuzzy logic handles partial truth with membership functions and linguistic rules, useful when boundaries are not crisp.',
    'rag': 'Retrieval-augmented generation combines vector search with a language model so answers are grounded in external documents instead of parametric memory alone.',
    'agentic ai': 'Agentic AI refers to autonomous systems capable of goal-driven planning, multi-step reasoning, calling external tools/APIs, executing code, reflecting on outputs, and collaborating with other agents without constant human intervention.',
    'vector database': 'Vector databases store high-dimensional embeddings and execute approximate nearest-neighbor search for fast similarity retrieval in LLM, RAG, and computer vision systems.',
}

@dataclass
class TutorReply:
    answer: str
    mode: str
    detected_topic: str
    retrieved_chunks: List[Dict]
    related_resources: Dict


@lru_cache(maxsize=1)
def load_dataset_registry() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, 'real_dataset_registry.csv')
    if os.path.exists(path):
        return pd.read_csv(path)
    return pd.DataFrame(columns=['dataset', 'task', 'topic', 'source', 'url', 'why_it_fits'])


@lru_cache(maxsize=1)
def _topic_documents():
    docs = []
    for topic, meta in TOPIC_CATALOG.items():
        docs.append({
            'topic': topic,
            'kind': 'topic_note',
            'text': ' '.join([
                topic,
                ' '.join(meta.get('aliases', [])),
                ' '.join(meta.get('prerequisites', [])),
                meta.get('project', ''),
                TOPIC_NOTES.get(topic, ''),
            ]).strip(),
        })
    df = load_dataset_registry()
    for _, row in df.iterrows():
        docs.append({
            'topic': normalize_topic(str(row.get('topic', ''))),
            'kind': 'dataset',
            'text': f"Dataset {row.get('dataset','')} task {row.get('task','')} topic {row.get('topic','')} source {row.get('source','')} why {row.get('why_it_fits','')}".strip(),
            'url': row.get('url', ''),
            'dataset': row.get('dataset', ''),
        })
    corpus = [d['text'] for d in docs] or ['machine learning']
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(corpus)
    return docs, vectorizer, matrix


def retrieve_relevant_chunks(question: str, selected_topics: List[str], limit: int = 6) -> List[Dict]:
    docs, vectorizer, matrix = _topic_documents()
    query = ' '.join([question] + selected_topics)
    qv = vectorizer.transform([query])
    sims = cosine_similarity(qv, matrix).ravel()
    scored = sorted(enumerate(sims), key=lambda x: x[1], reverse=True)
    chunks = []
    for idx, score in scored:
        if score <= 0:
            continue
        item = dict(docs[idx])
        item['score'] = round(float(score), 4)
        chunks.append(item)
        if len(chunks) >= limit:
            break
    return chunks


# ─────────────────────────────────────────────────────────────
# PRECISE TOPIC & CONCEPT DETECTION
# ─────────────────────────────────────────────────────────────

# Priority mapping of concepts and keywords to canonical concept keys
CONCEPT_KEYWORDS = [
    # General ML concepts
    ('overfitting', ['overfit', 'overfitting', 'over-fitting', 'high variance', 'memorizing training data']),
    ('underfitting', ['underfit', 'underfitting', 'under-fitting', 'high bias']),
    ('bias variance', ['bias variance', 'bias-variance', 'tradeoff between bias and variance', 'bias vs variance']),
    ('gradient descent', ['gradient descent', 'sgd', 'stochastic gradient descent', 'adam optimizer', 'learning rate', 'loss gradient']),
    ('loss function', ['loss function', 'cost function', 'cross entropy', 'mean squared error', 'bce', 'mse', 'mae']),
    ('backpropagation', ['backpropagation', 'backprop', 'chain rule', 'vanishing gradient', 'exploding gradient']),
    ('activation function', ['activation function', 'relu', 'sigmoid', 'tanh', 'gelu', 'softmax', 'leaky relu']),
    ('regularization', ['regularization', 'l1 regularization', 'l2 regularization', 'lasso', 'ridge', 'elastic net', 'weight decay', 'dropout']),
    ('epoch batch iteration', ['epoch', 'batch size', 'mini-batch', 'iteration', 'iterations']),
    ('cross validation', ['cross validation', 'k-fold', 'stratified k-fold', 'k fold', 'cv']),
    ('data leakage', ['data leakage', 'leakage', 'train test contamination']),
    ('class imbalance', ['class imbalance', 'imbalanced dataset', 'imbalanced data', 'smote', 'resampling']),
    ('feature scaling', ['feature scaling', 'normalization', 'standardization', 'minmaxscaler', 'standardscaler']),
    ('supervised learning', ['supervised learning', 'supervised machine learning']),
    ('unsupervised learning', ['unsupervised learning', 'unsupervised machine learning']),
    ('semi supervised', ['semi-supervised', 'self-supervised']),
    ('transfer learning', ['transfer learning', 'fine-tuning', 'finetuning', 'pre-trained model']),
    ('hyperparameter tuning', ['hyperparameter tuning', 'hyperparameter optimization', 'grid search', 'random search', 'optuna', 'bayesian optimization']),
    ('model evaluation', ['precision', 'recall', 'f1 score', 'f1-score', 'roc-auc', 'roc curve', 'auc', 'confusion matrix', 'model evaluation', 'metrics']),
    
    # Specific Algorithms & Architectures
    ('generative ai', ['generative ai', 'gen ai', 'genai', 'diffusion model', 'stable diffusion', 'gan', 'gans', 'midjourney', 'dall-e', 'sora']),
    ('rag', ['rag', 'retrieval augmented generation', 'retrieval-augmented generation', 'chunking', 'vector search']),
    ('transformers', ['transformer', 'transformers', 'self-attention', 'multi-head attention', 'scaled dot-product', 'attention is all you need', 'positional encoding']),
    ('llm', ['llm', 'llms', 'large language model', 'large language models', 'gpt', 'gpt-4', 'claude', 'gemini', 'tokenization', 'next token prediction']),
    ('prompt engineering', ['prompt engineering', 'few-shot', 'few shot', 'zero-shot', 'zero shot', 'chain of thought', 'cot', 'system prompt', 'prompting']),
    ('agentic ai', ['agentic ai', 'agentic', 'ai agent', 'ai agents', 'autonomous agent', 'langchain', 'langgraph', 'crewai', 'autogen', 'function calling', 'tool calling']),
    ('vector database', ['vector database', 'vector db', 'vector databases', 'chroma', 'chromadb', 'pinecone', 'faiss', 'weaviate', 'qdrant', 'milvus', 'vector embedding', 'embeddings']),
    ('neural networks', ['neural network', 'neural networks', 'deep learning', 'ann', 'mlp', 'multilayer perceptron', 'perceptron']),
    ('computer vision', ['computer vision', 'cnn', 'cnns', 'convolutional neural network', 'image processing', 'yolo', 'object detection', 'segmentation', 'pooling']),
    ('nlp', ['natural language processing', 'nlp', 'text processing', 'sentiment analysis', 'word2vec', 'bert', 'spacy', 'nltk']),
    ('reinforcement learning', ['reinforcement learning', 'rl', 'q-learning', 'q learning', 'policy gradient', 'ppo', 'bellman equation', 'agent environment reward']),
    ('decision trees', ['decision tree', 'decision trees', 'cart algorithm', 'gini impurity', 'entropy', 'information gain', 'tree pruning']),
    ('random forest', ['random forest', 'random forests', 'bagging', 'bootstrap aggregating', 'ensemble trees']),
    ('ensemble methods', ['ensemble methods', 'gradient boosting', 'xgboost', 'lightgbm', 'catboost', 'adaboost', 'stacking']),
    ('linear regression', ['linear regression', 'ordinary least squares', 'ols', 'linear model', 'line of best fit']),
    ('logistic regression', ['logistic regression', 'log-odds', 'logit']),
    ('classification', ['classification', 'classifier', 'binary classification', 'multiclass classification']),
    ('clustering', ['clustering', 'k-means', 'kmeans', 'dbscan', 'hierarchical clustering', 'silhouette score', 'elbow method']),
    ('dimensionality reduction', ['dimensionality reduction', 'pca', 'principal component analysis', 't-sne', 'umap', 'eigenvalues']),
    ('naive bayes', ['naive bayes', 'gaussian naive bayes', 'bayes theorem', 'prior probability', 'posterior probability']),
    ('svm', ['svm', 'support vector machine', 'support vector machines', 'rbf kernel', 'hyperplane', 'margin']),
    ('data preprocessing', ['data preprocessing', 'exploratory data analysis', 'eda', 'handling missing values', 'imputation', 'outlier detection']),
    ('feature engineering', ['feature engineering', 'feature creation', 'one-hot encoding', 'label encoding', 'interaction features']),
    ('automl', ['automl', 'automated machine learning', 'autogluon', 'auto-sklearn']),
    ('model deployment', ['model deployment', 'mlops', 'fastapi', 'flask api', 'docker', 'model drift', 'model serving']),
    ('statistics', ['statistics', 'hypothesis testing', 'p-value', 'p value', 't-test', 'z-test', 'null hypothesis', 'confidence interval', 'normal distribution', 'variance', 'standard deviation']),
    ('probability', ['probability', 'conditional probability', 'bayes theorem', 'random variable', 'probability density function']),
    ('python', ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'list comprehension', 'python functions', 'scikit-learn']),
]


def _detect_topic(question: str, selected_topics: List[str]) -> str:
    q = question.lower().strip()

    # 1. First priority: Check exact multi-word / single-word concept keywords with word boundaries
    for canonical, keywords in CONCEPT_KEYWORDS:
        for kw in keywords:
            pattern = r'\b' + re.escape(kw) + r'\b'
            if re.search(pattern, q):
                return canonical

    # 2. Check catalog topics directly
    for topic, meta in TOPIC_CATALOG.items():
        all_keys = [topic] + meta.get('aliases', [])
        for k in sorted(all_keys, key=lambda x: len(x), reverse=True):
            if re.search(r'\b' + re.escape(k.lower()) + r'\b', q):
                return topic

    # 3. Dynamic Subject Extraction from user's sentence structure
    extract_patterns = [
        r'(?:what\s+is|what\s+are|explain|how\s+does|how\s+to|tell\s+me\s+about|define|teach\s+me\s+about|overview\s+of)\s+(?:the\s+)?([a-z0-9\s\-_]+?)(?:\?|$|\s+in\s+|\s+using\s+|\s+with\s+)',
    ]
    for p in extract_patterns:
        m = re.search(p, q)
        if m:
            extracted = m.group(1).strip()
            # If extracted phrase matches any concept keyword
            for canonical, keywords in CONCEPT_KEYWORDS:
                if any(kw in extracted or extracted in kw for kw in keywords):
                    return canonical
            if len(extracted) > 2 and extracted not in {'a', 'an', 'the', 'this', 'that', 'it', 'me', 'my', 'how', 'why', 'what'}:
                return extracted

    # 4. Fallback to general machine learning or question topic
    return 'machine learning'


# ─────────────────────────────────────────────────────────────
# REAL LLM API CALLERS (Gemini, OpenAI, Groq, Free AI Endpoint)
# ─────────────────────────────────────────────────────────────

def _call_gemini(api_key: str, question: str, history: Optional[List[Dict]] = None) -> str:
    system_instruction = (
        "You are an expert AI & Machine Learning Tutor and Senior Engineer. "
        "Answer the user's question directly, clearly, deeply, and accurately. "
        "Start IMMEDIATELY with the direct answer. Do NOT include generic conversational greetings like 'Hello!', 'Welcome!', or 'As an AI tutor'. "
        "Structure your response with clear Markdown headers (###), bullet points, bold key terms, mathematical formulas where appropriate, and clean Python code snippets with comments."
    )
    
    preferred_model = os.getenv('GEMINIAI_MODEL', 'gemini-1.5-flash').strip()
    models_to_try = [
        preferred_model,
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-2.5-flash',
    ]
    seen = set()
    models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]
    
    contents = []
    if history:
        for msg in history[-6:]:
            role = 'user' if msg.get('role') == 'user' else 'model'
            text = msg.get('text', '')
            if text:
                contents.append({'role': role, 'parts': [{'text': text}]})
    contents.append({'role': 'user', 'parts': [{'text': question}]})

    last_err = None
    for m in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            payload = {
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048,
                }
            }
            resp = requests.post(url, json=payload, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        ans = parts[0]["text"].strip()
                        if ans:
                            return ans
            else:
                last_err = f"Status {resp.status_code}: {resp.text[:100]}"
        except Exception as e:
            last_err = str(e)
            continue
            
    raise RuntimeError(f"Gemini API call failed: {last_err}")


def _call_openai_compatible(api_key: str, question: str, base_url: str, model: str, history: Optional[List[Dict]] = None) -> str:
    system_instruction = (
        "You are an expert AI & Machine Learning Tutor and Senior Engineer. "
        "Answer the user's question directly, clearly, deeply, and accurately without introductory fluff. "
        "Structure with Markdown headers, bold terms, mathematical formulations, and Python code blocks."
    )
    messages = [{"role": "system", "content": system_instruction}]
    if history:
        for msg in history[-6:]:
            role = 'user' if msg.get('role') == 'user' else 'assistant'
            messages.append({"role": role, "content": msg.get('text', '')})
    messages.append({"role": "user", "content": question})

    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 2048
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=20)
    if resp.status_code == 200:
        data = resp.json()
        choices = data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "").strip()
    raise RuntimeError(f"API call returned {resp.status_code}")


def _try_free_online_ai(question: str) -> Optional[str]:
    """Attempt fast free online LLM inference if network is reachable."""
    try:
        # Fast endpoint: Pollinations text API with 6 second timeout
        url = "https://text.pollinations.ai/"
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert AI and Machine Learning Tutor. Provide a direct, exact, comprehensive, well-structured answer in clean markdown with headers (###), bold text, bullet points, and code snippets where relevant. Do NOT include conversational greetings."
                },
                {"role": "user", "content": question}
            ]
        }
        resp = requests.post(url, json=payload, timeout=6)
        if resp.status_code == 200 and len(resp.text.strip()) > 80:
            text = resp.text.strip()
            # If not a rate-limit message
            if "Free limit reached" not in text and "Rate limit" not in text:
                return text
    except Exception:
        pass
    return None


# ─────────────────────────────────────────────────────────────
# 40+ COMPLETE, ACCURATE, TEXTBOOK-QUALITY ANSWERS (LOCAL ENGINE)
# ─────────────────────────────────────────────────────────────

EXACT_KNOWLEDGE_BASE: Dict[str, str] = {
    'overfitting': """### 🎯 Understanding Overfitting in Machine Learning

**Overfitting** occurs when a machine learning model learns the training data *too well*—including its random noise, outliers, and statistical flukes—instead of the underlying signal. As a result, the model achieves near-perfect performance on training data but fails to generalize, performing poorly on unseen test data.

---

### 🔍 Diagnostic Signs of Overfitting
- **Training Error / Loss:** Very low (e.g. 99% accuracy or near-zero loss).
- **Validation / Test Error:** High (e.g. 60% accuracy or diverging validation loss).
- **Variance:** **High Variance, Low Bias**. The model hyperplane or decision boundary is excessively complex, wiggly, and tailored to specific data points.

---

### ⚙️ Why Overfitting Happens
1. **Model Complexity is Too High:** Deep unpruned decision trees, neural networks with millions of parameters, or high-degree polynomials ($x^8, x^9$).
2. **Insufficient Training Data:** Small dataset size makes it easy for high-capacity models to memorize individual rows.
3. **Noisy Labels / Extreme Outliers:** The model alters its decision boundary to encapsulate noise points.

---

### 🛡️ How to Fix and Prevent Overfitting

1. **Regularization ($L_1$ and $L_2$ Penalty):**
   - **Ridge ($L_2$):** Adds $\\lambda \\sum w_i^2$ to the loss function to shrink weights toward zero.
   - **Lasso ($L_1$):** Adds $\\lambda \\sum |w_i|$ to drive uninformative feature coefficients strictly to zero.
2. **Cross-Validation:** Use **$K$-Fold Cross-Validation** (e.g. $K=5$ or $10$) to validate generalization stability across multiple splits.
3. **Pruning & Tree Constraints:** In Decision Trees and Random Forests, limit `max_depth`, `min_samples_split`, or set `min_samples_leaf`.
4. **Dropout & Early Stopping (Neural Networks):**
   - **Dropout:** Randomly deactivates a fraction of neurons (e.g. 20-50%) during training to prevent co-adaptation.
   - **Early Stopping:** Halts training as soon as validation loss stops improving for $N$ consecutive epochs.
5. **Data Augmentation:** Synthesize transformed images, text variations, or gather more diverse training examples.""",

    'underfitting': """### 📉 Understanding Underfitting in Machine Learning

**Underfitting** occurs when a machine learning model is too simple to capture the underlying structure and patterns of the data. It results in poor performance on **both** the training set and the test set.

---

### 🔍 Diagnostic Signs
- **Training Error:** High.
- **Validation / Test Error:** High (close to training error).
- **Bias:** **High Bias, Low Variance**. The model makes rigid, overly simplistic assumptions about the data.

---

### ⚙️ Why Underfitting Happens
1. **Model is Too Simple:** Using a Linear Regression line to model an exponential or curved polynomial relationship.
2. **Missing Important Features:** Omitting critical predictor variables that drive the target outcome.
3. **Over-Regularization:** Setting regularization penalty parameter $\\lambda$ excessively high, shrinking model weights too close to zero.

---

### 🛡️ How to Fix Underfitting
1. **Increase Model Complexity:** Switch from linear models to non-linear algorithms (Random Forest, Gradient Boosting, SVM with RBF kernel, or Neural Networks).
2. **Engineer New Features:** Create polynomial features ($x^2, x_1 x_2$), interaction terms, and domain-specific ratios.
3. **Decrease Regularization:** Reduce $L_1 / L_2$ penalty parameter $\\lambda$ or remove excessive dropout.
4. **Train for More Epochs:** Ensure optimization algorithms (Gradient Descent) have reached convergence.""",

    'bias variance': """### ⚖️ The Bias-Variance Tradeoff

The **Bias-Variance Tradeoff** is a fundamental concept in supervised machine learning that describes the tension between two sources of error that prevent models from generalizing beyond the training set.

$$\\text{Total Expected Error} = \\text{Bias}^2 + \\text{Variance} + \\text{Irreducible Error } (\\sigma^2)$$

---

### 📊 Comparing Bias vs Variance

| Characteristic | High Bias (Underfitting) | High Variance (Overfitting) |
| :--- | :--- | :--- |
| **Model Nature** | Overly simplistic assumptions | Overly complex, flexible model |
| **Decision Boundary** | Rigid, flat hyperplane | Highly contoured, irregular boundary |
| **Training Performance** | Low accuracy / High error | High accuracy / Low error |
| **Test Performance** | Low accuracy / High error | Low accuracy / High error |
| **Example Models** | Linear Regression on non-linear data | Deep unpruned Decision Tree |

---

### 🎯 Finding the Sweet Spot
The goal is to find the **optimal model complexity** that minimizes total error:
- Increasing model parameters lowers Bias but raises Variance.
- Reducing model parameters lowers Variance but raises Bias.
- **Ensemble methods** like **Random Forest** (bagging) and **XGBoost** (boosting) effectively reduce variance without significantly increasing bias.""",

    'gradient descent': """### 📉 What is Gradient Descent & How Does It Work?

**Gradient Descent** is the primary first-order iterative optimization algorithm used to minimize loss functions (such as Mean Squared Error or Cross-Entropy) in machine learning and deep learning models.

---

### ⚙️ Mathematical Mechanism & Update Rule

To minimize loss function $J(\\theta)$, Gradient Descent computes the partial derivative (gradient) of the loss with respect to each model parameter $\\theta$ and updates weights in the opposite direction of the gradient:

$$\\theta := \\theta - \\alpha \\nabla_\\theta J(\\theta)$$

Where:
- $\\theta$: Model weights/parameters (slopes and biases).
- $\\alpha$: **Learning Rate** (step size hyperparameter).
- $\\nabla_\\theta J(\\theta)$: Gradient vector of steepest ascent.

---

### 🏃 The Three Primary Variants

1. **Batch Gradient Descent:**
   - Computes gradient over the **entire training dataset** before updating weights.
   - *Pros:* Stable convergence path.
   - *Cons:* Extremely slow and memory-intensive for large datasets.

2. **Stochastic Gradient Descent (SGD):**
   - Updates weights after evaluating **each single training sample**.
   - *Pros:* Very fast, escapes local minima due to noisy updates.
   - *Cons:* Fluctuates erratically around the optimal minimum.

3. **Mini-Batch Gradient Descent (Industry Standard):**
   - Computes gradients over small subsets (batches) of data (e.g. 32, 64, 128, 256 samples).
   - Combines the efficiency of vectorization with stable convergence.

---

### 🚀 Modern Adaptive Optimizers
- **Momentum:** Accelerates SGD by adding a fraction of the previous update vector to dampen oscillations.
- **Adam (Adaptive Moment Estimation):** The gold standard in deep learning. Maintains exponentially decaying moving averages of both past gradients ($m_t$) and squared gradients ($v_t$):
  $$\\theta_{t+1} = \\theta_t - \\frac{\\alpha}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t$$""",

    'loss function': """### 🎯 Understanding Loss & Cost Functions in Machine Learning

A **Loss Function** measures the error of a model's prediction for a **single** training example. A **Cost Function** is the average of the loss function values across the **entire dataset**.

---

### 📈 Common Loss Functions for Regression

1. **Mean Squared Error (MSE / $L_2$ Loss):**
   $$MSE = \\frac{1}{N} \\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2$$
   - Penalizes large errors heavily (due to squaring). Sensitive to outliers.

2. **Mean Absolute Error (MAE / $L_1$ Loss):**
   $$MAE = \\frac{1}{N} \\sum_{i=1}^{N} |y_i - \\hat{y}_i|$$
   - Robust to outliers, but gradient is constant and non-differentiable at zero.

---

### 🎯 Common Loss Functions for Classification

1. **Binary Cross-Entropy (Log Loss):**
   $$\\mathcal{L} = -\\frac{1}{N} \\sum_{i=1}^{N} \\Big[ y_i \\log(\\hat{p}_i) + (1 - y_i) \\log(1 - \\hat{p}_i) \\Big]$$
   - Used with Sigmoid activation for two-class outcomes (0 or 1). Heavily penalizes confident incorrect predictions.

2. **Categorical Cross-Entropy:**
   $$\\mathcal{L} = -\\sum_{i=1}^{C} y_i \\log(\\hat{y}_i)$$
   - Used with Softmax activation for multiclass classification ($C > 2$).""",

    'activation function': """### ⚡ Activation Functions in Neural Networks

An **Activation Function** introduces non-linearity into artificial neural networks. Without non-linear activation functions, no matter how many layers a neural network has, it would simply behave as a single linear regression model: $W_2(W_1 X + b_1) + b_2 = W_{new} X + b_{new}$.

---

### 🧠 Primary Activation Functions

1. **ReLU (Rectified Linear Unit) — Default Choice:**
   $$f(x) = \\max(0, x)$$
   - *Pros:* Computationally ultra-fast; avoids vanishing gradient problem for positive values.
   - *Cons:* **Dying ReLU problem** (neurons can become permanently inactive if inputs stay negative).

2. **Leaky ReLU:**
   $$f(x) = \\max(\\alpha x, x) \\quad (\\alpha \\approx 0.01)$$
   - Solves the dying ReLU problem by providing a tiny positive slope for negative inputs.

3. **GELU (Gaussian Error Linear Unit):**
   - The modern standard used in **Transformers, BERT, GPT-4, and Claude**. Weights inputs by their cumulative probability distribution.

4. **Sigmoid:**
   $$\\sigma(x) = \\frac{1}{1 + e^{-x}}$$
   - Squeezes values between $0$ and $1$. Used in output layers for binary classification. Suffers from vanishing gradients in deep hidden layers.

5. **Softmax:**
   $$\\text{Softmax}(z_i) = \\frac{e^{z_i}}{\\sum_{j} e^{z_j}}$$
   - Converts raw logits into normalized probability distributions that sum to $1.0$. Used in output layers for multiclass classification.""",

    'backpropagation': """### 🔄 Understanding Backpropagation

**Backpropagation (Backward Propagation of Errors)** is the mathematical algorithm used to train neural networks. It calculates the gradient of the loss function with respect to every weight in the network by systematically applying the **Chain Rule of Calculus** from the output layer back to the input layer.

---

### ⚙️ Step-by-Step Mechanism

1. **Forward Pass:**
   - Input vector $X$ propagates through successive layers:
     $$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
     $$a^{[l]} = \\sigma(z^{[l]})$$
   - Computes output $\\hat{y}$ and loss $\\mathcal{L}(\\hat{y}, y)$.

2. **Backward Pass (Chain Rule):**
   - Computes rate of change of loss with respect to output: $\\frac{\\partial \\mathcal{L}}{\\partial a^{[L]}}$.
   - Backpropagates error to hidden layer weights:
     $$\\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}} = \\frac{\\partial \\mathcal{L}}{\\partial z^{[l]}} \\cdot (a^{[l-1]})^T$$

3. **Weight Update:**
   - Optimizers (SGD, Adam) adjust weights in the direction of negative gradient:
     $$W^{[l]} := W^{[l]} - \\alpha \\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}}$$

---

### ⚠️ Common Challenges:
- **Vanishing Gradients:** In deep networks with Sigmoid/Tanh, gradients become exponentially small as they propagate backwards, stalling early layers. (Fixed by **ReLU**, **Residual Skip Connections**, and **Batch Normalization**).
- **Exploding Gradients:** Gradients become excessively large, causing NaN weights. (Fixed by **Gradient Clipping**).""",

    'decision trees': """### 🌲 Understanding Decision Trees

A **Decision Tree** is a non-parametric supervised learning algorithm used for both classification and regression. It creates a tree-like model of decisions by recursively splitting feature spaces based on decision rules that maximize information gain.

---

### ⚙️ Splitting Criteria & Mathematical Formulas

1. **Gini Impurity (Default in CART):**
   Measures the probability of misclassifying a randomly chosen element:
   $$Gini = 1 - \\sum_{i=1}^{C} p_i^2$$
   - $Gini = 0$: Pure node (all samples belong to the exact same class).
   - $Gini = 0.5$: Maximum impurity for binary classes (50/50 split).

2. **Entropy & Information Gain:**
   $$Entropy = -\\sum_{i=1}^{C} p_i \\log_2(p_i)$$
   $$\\text{Information Gain} = Entropy(Parent) - \\sum \\frac{N_{child}}{N_{parent}} Entropy(Child)$$
   The algorithm selects the feature split that maximizes Information Gain.

---

### 🟢 Advantages vs 🔴 Disadvantages
- **Pros:** Highly interpretable (can be visualized), requires no feature scaling or normalization, handles categorical and numeric data naturally.
- **Cons:** Prone to severe overfitting, high variance (small change in training data yields totally different tree).
- **Remedy:** Upgrade to **Random Forests** or **Gradient Boosted Trees (XGBoost)**.""",

    'random forest': """### 🌳 What is Random Forest?

**Random Forest** is an ensemble learning method that builds and combines multiple de-correlated decision trees to produce more accurate and stable predictions with vastly lower variance than a single decision tree.

---

### ⚙️ How Random Forest Works: Bagging + Feature Subsampling

1. **Bootstrap Aggregating (Bagging):**
   - Creates $B$ subsets of training data by sampling with replacement (bootstrap sample $\\approx 63.2\\%$ unique data per tree).
   - Trains an independent decision tree on each bootstrap sample.

2. **Random Feature Subsampling:**
   - At every split in every tree, the algorithm considers only a random subset of features (typically $m = \\sqrt{p}$ for classification, $m = p/3$ for regression).
   - *Why this matters:* It prevents dominant features from making all trees look identical, thereby de-correlating the trees.

3. **Aggregation:**
   - **Classification:** Majority voting across all trees.
   - **Regression:** Average of predictions from all individual trees.

---

### 🏆 Key Advantages:
- Drastically reduces overfitting without requiring tree pruning.
- Provides intrinsic **Feature Importance** scores based on mean decrease in impurity.
- Measures validation performance automatically using **Out-of-Bag (OOB) Error** without needing a separate validation split.""",

    'ensemble methods': """### 🚀 Ensemble Methods in Machine Learning

**Ensemble Methods** combine predictions from multiple individual base learners (models) to improve overall predictive accuracy, robustness, and stability.

---

### 🏛️ The Three Main Ensemble Paradigms

1. **Bagging (Bootstrap Aggregation):**
   - **How it works:** Trains diverse models in parallel on random bootstrap data subsets, then averages outputs.
   - **Primary Goal:** Drastically **reduces variance** (eliminates overfitting).
   - **Leading Example:** **Random Forest**.

2. **Boosting (Sequential Error Correction):**
   - **How it works:** Trains models sequentially. Each new model focuses specifically on the residual errors (mistakes) made by preceding models.
   - **Primary Goal:** Drastically **reduces bias** and increases predictive power.
   - **Leading Examples:** **XGBoost**, **LightGBM**, **CatBoost**, **AdaBoost**.

3. **Stacking (Stacked Generalization):**
   - **How it works:** Trains heterogeneous base models (e.g. SVM, Logistic Regression, Random Forest), then uses a meta-model to learn the optimal blend of their predictions.
   - **Primary Goal:** Maximizes predictive power by combining fundamentally different algorithms.""",

    'generative ai': """### 🤖 What is Generative AI?

**Generative Artificial Intelligence (GenAI)** refers to machine learning models designed to generate novel, high-quality content—such as text, programming code, images, audio, video, and synthetic data—by modeling the complex probability distributions of training data.

Unlike traditional **Discriminative AI** (which models $P(Y \\mid X)$ to classify or predict labels), Generative AI models the underlying data distribution $P(X)$ or joint distribution $P(X, Y)$ to sample and generate entirely new data points.

---

### ⚙️ Core Architectures & How They Work

1. **Transformers & Autoregressive LLMs (Text, Code, Reasoning):**
   - **Mechanism:** Powered by Multi-Head Scaled Dot-Product Attention:
     $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
   - **Generation Principle:** Autoregressive Next-Token Prediction. Given an input sequence $x_1, x_2, \\dots, x_t$, the model calculates the probability distribution across its vocabulary to predict the next token $x_{t+1}$:
     $$P(x_1, x_2, \\dots, x_T) = \\prod_{t=1}^{T} P(x_t \\mid x_1, \\dots, x_{t-1})$$
   - **Industry Examples:** GPT-4o, Claude 3.5 Sonnet, Google Gemini, LLaMA 3, DeepSeek.

2. **Diffusion Models (Photorealistic Images, Video & Audio):**
   - **Mechanism:** Trained via a two-stage thermodynamic process:
     - *Forward Process:* Incrementally adds Gaussian noise to an image over $T$ steps until it becomes pure static noise.
     - *Reverse Process:* Trains a U-Net or Diffusion Transformer (DiT) to predict and subtract the added noise step-by-step, generating crisp images conditioned on text prompts.
   - **Industry Examples:** Stable Diffusion, Midjourney v6, DALL-E 3, OpenAI Sora, Flux.

3. **Generative Adversarial Networks (GANs):**
   - **Mechanism:** A two-player zero-sum minimax game between a **Generator** ($G$) synthesizing fake samples from noise $z$, and a **Discriminator** ($D$) distinguishing between real training samples and generated samples:
     $$\\min_G \\max_D V(D, G) = \\mathbb{E}_{x \\sim p_{\\text{data}}}[\\log D(x)] + \\mathbb{E}_{z \\sim p_z}[\\log(1 - D(G(z)))]$$

---

### 💻 Practical Python Code: Text Generation Pipeline

```python
# Text generation with Hugging Face Transformers
from transformers import pipeline

# 1. Initialize generative pipeline
generator = pipeline("text-generation", model="distilgpt2")

# 2. Generate text with sampling hyperparameters
prompt = "Generative AI transforms software development by"
results = generator(
    prompt,
    max_length=60,
    temperature=0.7,   # Creativity: 0.1 (deterministic) to 1.0 (creative)
    top_p=0.9,         # Nucleus sampling: selects from top 90% cumulative prob
    num_return_sequences=1
)

print(results[0]['generated_text'])
```""",

    'rag': """### 🔍 What is RAG (Retrieval-Augmented Generation)?

**Retrieval-Augmented Generation (RAG)** is an architectural pattern that combines an external information retrieval system (typically a vector database) with a generative Large Language Model (LLM).

Instead of relying solely on an LLM's static training weights (which can hallucinate or lack access to private, real-time data), RAG retrieves the most relevant document chunks from your knowledge base and injects them into the prompt as factual grounding context.

---

### ⚙️ How RAG Works (Step-by-Step Architecture)

1. **Ingestion & Chunking:** Split raw documentation into semantic chunks (e.g. 500 tokens with 50-token overlap).
2. **Vector Embeddings:** Embed each chunk into high-dimensional vector space using an embedding model ($d=768$ or $d=1536$).
3. **Storage:** Index vectors into a vector database (**ChromaDB**, **Pinecone**, **FAISS**).
4. **Retrieval:** When a user queries, embed query into vector $q$ and run **Cosine Similarity** search to find top $K$ closest chunks:
   $$\\text{Cosine Similarity}(u, v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|}$$
5. **Augmented Prompt:** Inject retrieved chunks into prompt:
   `"Answer the question using ONLY the retrieved context below. Cite your sources."`
6. **Generation:** LLM produces an accurate, hallucination-free response with source attribution.""",

    'transformers': """### ⚡ What are Transformers?

The **Transformer** is a deep learning architecture introduced by Vaswani et al. (2017) in the landmark paper *"Attention Is All You Need"*. It replaced recurrent models (RNNs/LSTMs) by processing all tokens in a sequence simultaneously using **Self-Attention**.

---

### ⚙️ Scaled Dot-Product Attention Formula
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

- **Query ($Q$):** What the current token is looking for.
- **Key ($K$):** What other tokens contain (labels).
- **Value ($V$):** The actual informational content of the token.
- **$QK^T$:** Computes pairwise similarity scores between all token positions simultaneously.
- **$\\sqrt{d_k}$:** Scaling factor preventing vanishing gradients in softmax.
- **Positional Encoding (RoPE):** Injects sequence ordering without recurrent loops.""",

    'model evaluation': """### 📊 Model Evaluation Metrics & Confusion Matrix

Evaluating machine learning models requires metrics suited to the specific business objective and class distribution.

---

### 🧩 The Confusion Matrix
| | Actually Positive | Actually Negative |
| :--- | :--- | :--- |
| **Predicted Positive** | **True Positive (TP)** | **False Positive (FP)** — Type I Error |
| **Predicted Negative** | **False Negative (FN)** — Type II Error | **True Negative (TN)** |

---

### 🎯 Key Classification Metrics

1. **Accuracy:** $\\frac{TP + TN}{TP + TN + FP + FN}$ (Misleading when classes are imbalanced).
2. **Precision:** $\\frac{TP}{TP + FP}$  
   *When to optimize:* When False Positives are expensive (e.g. spam filter marking a real client contract as spam).
3. **Recall (Sensitivity):** $\\frac{TP}{TP + FN}$  
   *When to optimize:* When False Negatives are dangerous (e.g. cancer detection, airport security weapon screening).
4. **F1-Score:** Harmonic mean balancing Precision and Recall:
   $$F1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$
5. **ROC-AUC:** Measures discrimination capability across all classification thresholds ($0.5$ is random guessing; $1.0$ is perfect).""",

    'cross validation': """### 🔄 Understanding Cross-Validation

**Cross-Validation** is a resampling statistical technique used to evaluate the generalization performance of machine learning models and protect against overfitting.

---

### ⚙️ How $K$-Fold Cross-Validation Works

1. The training dataset is randomly partitioned into $K$ equal-sized folds (typically $K=5$ or $10$).
2. For each iteration $i \\in \\{1, \\dots, K\\}$:
   - Fold $i$ is held out as the **Validation Set**.
   - The remaining $K-1$ folds are used to train the model.
   - The model is evaluated on Fold $i$, recording performance metric $S_i$.
3. The overall cross-validation score is the mean across all $K$ trials:
   $$\\text{CV Score} = \\frac{1}{K} \\sum_{i=1}^{K} S_i$$

---

### 🛡️ Cross-Validation Variants:
- **Stratified $K$-Fold:** Ensures each fold maintains the same percentage of target class labels as the complete dataset (mandatory for imbalanced classification).
- **TimeSeriesSplit:** Never shuffles future data into the past (train on months 1-3, test on month 4).""",

    'data leakage': """### 🚨 Data Leakage in Machine Learning

**Data Leakage** occurs when information from outside the training dataset (specifically from the test or target dataset) is inadvertently used to train the model. It causes models to achieve deceptively high accuracy during development, but fail catastrophically in production.

---

### ⚠️ Common Causes of Data Leakage
1. **Preprocessing Before Splitting:** Scaling or normalizing features across the entire dataset *before* performing train/test split. (Mean and variance of test set leak into training!).
2. **Target Leakage:** Including predictor features that are only created or known *after* the target event has occurred (e.g. including `hospital_stay_duration` to predict if a patient will be admitted to hospital).
3. **Time Leakage:** Using future data points to predict historical events in time-series forecasting.

---

### 🛡️ How to Prevent Data Leakage
- Always split data into Train and Test sets **first** before computing any mean, standard deviation, imputation, or encodings.
- Use **Scikit-Learn Pipelines** (`Pipeline([('scaler', StandardScaler()), ('model', RandomForestClassifier())])`).""",

    'class imbalance': """### ⚖️ Handling Imbalanced Datasets

**Class Imbalance** occurs when one class (majority class) vastly outnumbers another class (minority class), such as fraud detection (99.9% legitimate, 0.1% fraudulent).

---

### 🛠️ Techniques to Solve Class Imbalance

1. **Algorithm-Level Adjustments:**
   - Use `class_weight='balanced'` in Scikit-Learn models. Penalizes misclassifying minority instances proportionally to class frequencies.
2. **Resampling Techniques:**
   - **SMOTE (Synthetic Minority Over-sampling Technique):** Synthesizes new minority examples by interpolating between nearest neighbors in feature space.
   - **Random Undersampling:** Drops majority class rows to balance ratios.
3. **Evaluation Metric Selection:**
   - Never use **Accuracy**. Evaluate using **Precision-Recall AUC (PR-AUC)**, **Recall**, and **F1-Score**.""",

    'feature scaling': """### 📏 Feature Scaling: Normalization vs Standardization

**Feature Scaling** ensures that numerical features with different units or scales contribute proportionately to model optimization, preventing features with large values (e.g. Salary: $100,000) from dominating features with small values (e.g. Age: 25).

---

### ⚖️ Normalization vs Standardization

1. **Standardization ($Z$-Score Scaling):**
   $$z = \\frac{x - \\mu}{\\sigma}$$
   - Centers data around mean $\\mu = 0$ with standard deviation $\\sigma = 1$.
   - Does not bound values. Preserves outliers.
   - **Recommended for:** Linear Regression, Logistic Regression, SVMs, Neural Networks, PCA.

2. **Normalization (Min-Max Scaling):**
   $$x_{\\text{norm}} = \\frac{x - x_{\\min}}{x_{\\max} - x_{\\min}}$$
   - Binds all values strictly between $[0, 1]$.
   - Sensitive to outliers.
   - **Recommended for:** Image pixel inputs ($[0, 255] \\to [0, 1]$), KNN, and distance-based clustering.""",

    'supervised learning': """### 🎓 Supervised Learning

**Supervised Learning** is a category of machine learning where algorithms learn a mapping function from input features ($X$) to labeled targets ($y$) based on paired training examples $(X_i, y_i)$.

---

### 🏛️ The Two Core Tasks
1. **Regression:** Target $y$ is continuous (e.g., predicting house prices, stock values, temperatures).
   - *Algorithms:* Linear Regression, Ridge, Lasso, Random Forest Regressor, Gradient Boosting.
2. **Classification:** Target $y$ is discrete/categorical (e.g., spam detection, medical diagnosis, object classification).
   - *Algorithms:* Logistic Regression, Decision Trees, Random Forests, SVM, Neural Networks.""",

    'unsupervised learning': """### 🔍 Unsupervised Learning

**Unsupervised Learning** is a category of machine learning where algorithms uncover hidden patterns, groupings, or representations from unlabeled data ($X$) without human supervision or ground-truth targets ($y$).

---

### 🏛️ The Three Primary Unsupervised Tasks
1. **Clustering:** Groups data points with similar features into clusters.
   - *Algorithms:* **K-Means**, **DBSCAN**, **Agglomerative Hierarchical Clustering**.
2. **Dimensionality Reduction:** Compresses hundreds of feature dimensions into 2 or 3 components while preserving maximum variance.
   - *Algorithms:* **PCA**, **t-SNE**, **UMAP**.
3. **Anomaly Detection:** Identifies rare data points that deviate significantly from majority distribution.
   - *Algorithms:* **Isolation Forest**, **One-Class SVM**.""",

    'linear regression': """### 📈 Linear Regression

**Linear Regression** models the relationship between independent predictor variables ($X$) and a continuous target variable ($y$).

---

### ⚙️ Mathematical Model
$$\\hat{y} = w_1 x_1 + w_2 x_2 + \\dots + w_n x_n + b = XW + b$$

- **Cost Function (MSE):** $J(W, b) = \\frac{1}{2m} \\sum_{i=1}^{m} (\\hat{y}^{(i)} - y^{(i)})^2$
- **Optimization:** Gradient Descent or Ordinary Least Squares (OLS) closed form: $W = (X^T X)^{-1} X^T y$.
- **Regularization:**
  - **Ridge ($L_2$):** Penalizes $\\lambda \\sum w_i^2$.
  - **Lasso ($L_1$):** Penalizes $\\lambda \\sum |w_i|$. Drives zero coefficients for feature selection.""",

    'logistic regression': """### 🎯 Logistic Regression

Despite its name, **Logistic Regression** is a fundamental supervised algorithm for **classification**. It models the probability that an input belongs to a particular class.

---

### ⚙️ Sigmoid Transformation & Log-Odds
1. Maps linear combination $z = W^T X + b$ into probability $p \\in [0, 1]$ via the **Sigmoid function**:
   $$p = \\sigma(z) = \\frac{1}{1 + e^{-z}}$$
2. **Decision Boundary:**
   If $p \\ge 0.5 \\implies \\hat{y} = 1$; else $\\hat{y} = 0$.
3. **Loss Function (Log Loss / Binary Cross-Entropy):**
   $$\\mathcal{L} = -\\Big[ y \\log(\\hat{p}) + (1 - y) \\log(1 - \\hat{p}) \\Big]$$""",

    'svm': """### 🛡️ Support Vector Machines (SVM)

**Support Vector Machines (SVM)** find the optimal hyperplane in an $N$-dimensional space that maximizes the geometric **margin** (distance) between distinct classes.

---

### ⚙️ Core Concepts:
1. **Support Vectors:** The critical data points closest to the hyperplane. Only these data points determine the position and orientation of the decision boundary.
2. **Margin:** The distance between the hyperplane and the closest support vectors. SVM maximizes this margin.
3. **Kernel Trick:** Projects non-linearly separable data into a higher-dimensional space where it becomes linearly separable without computing high-dimensional coordinates:
   - **RBF (Radial Basis Function / Gaussian Kernel):** $K(x, x') = \\exp(-\\gamma \\|x - x'\\|^2)$
   - **Polynomial Kernel:** $K(x, x') = (x^T x' + c)^d$.""",

    'clustering': """### 🧩 Clustering & K-Means

**Clustering** groups unlabeled observations based on geometric proximity in feature space.

---

### ⚙️ How K-Means Works:
1. Choose $K$ initial cluster centroids at random.
2. **Assignment Step:** Assign each point to its nearest centroid (Euclidean distance).
3. **Update Step:** Recalculate centroids as the arithmetic mean of all points assigned to that cluster.
4. Repeat until centroids no longer move.

- **Optimal $K$ Determination:**
  - **Elbow Method:** Plot Inertia (Within-Cluster Sum of Squares) against $K$ and locate the bend.
  - **Silhouette Score:** Evaluates cohesion within cluster vs separation from nearest other cluster (range $-1$ to $+1$).""",

    'dimensionality reduction': """### 📉 Dimensionality Reduction & PCA

**Principal Component Analysis (PCA)** is an unsupervised linear dimensionality reduction technique that transforms correlated features into a smaller set of orthogonal, uncorrelated components called **Principal Components**.

---

### ⚙️ Step-by-Step PCA:
1. Standardize the dataset to zero mean and unit variance.
2. Compute the **Covariance Matrix** of features: $\\Sigma = \\frac{1}{n} X^T X$.
3. Calculate **Eigenvalues** and **Eigenvectors** of the covariance matrix.
4. Sort eigenvectors by eigenvalues in descending order.
5. Project original data onto the top $K$ eigenvectors to retain maximum explained variance.""",

    'agentic ai': """### 🤖 What is Agentic AI?

**Agentic AI** refers to autonomous AI systems that do not merely generate text, but actively plan, reason, invoke external tools, execute code, observe results, self-correct errors, and achieve multi-step goals without continuous human intervention.

---

### ⚙️ Core Components of an AI Agent:
1. **Goal Decomposition & Planning:** Breaks high-level objectives into sequential execution steps.
2. **Tool Use & Function Calling:** Connects LLMs to search engines, SQL databases, bash shells, and REST APIs.
3. **Short & Long-Term Memory:** Maintains state history, scratchpad notes, and vector-backed knowledge.
4. **Reflection & Self-Correction:** Reads runtime errors and rewrites code to succeed on retry.
5. **Multi-Agent Orchestration:** Specialized agents (e.g. Researcher, Coder, Reviewer) collaborating via LangGraph, CrewAI, or AutoGen.""",

    'vector database': """### 🗄️ What is a Vector Database?

A **Vector Database** is a database purpose-built to store, index, and query high-dimensional vector embeddings (e.g., 768 or 1536 dimensions) with sub-second latency using Approximate Nearest Neighbor (ANN) search algorithms.

---

### ⚙️ How It Works:
1. **Embedding Generation:** Unstructured text or images are passed through an embedding model to produce dense floating-point vectors.
2. **ANN Indexing Algorithms:**
   - **HNSW (Hierarchical Navigable Small World):** Multi-layer graph traversal with $O(\\log N)$ search speed.
   - **IVF (Inverted File Index):** Partitions vector space into Voronoi cells.
3. **Distance Metrics:** Cosine Distance, Euclidean ($L_2$), and Dot Product.
4. **Leading Engines:** ChromaDB, Pinecone, FAISS, Weaviate, Qdrant, Milvus.""",

    'prompt engineering': """### ✍️ Prompt Engineering

**Prompt Engineering** is the practice of designing, structuring, and optimizing inputs to generative Large Language Models to achieve consistent, high-accuracy outputs.

---

### 🛠️ Core Techniques:
1. **System Persona Framing:** Define role, boundaries, tone, and formatting constraints.
2. **Few-Shot Demonstration:** Provide 2-3 input/output pairs before the user query.
3. **Chain-of-Thought (CoT):** Encourage step-by-step reasoning (`"Think step-by-step before answering"`).
4. **Delimiters & Guardrails:** Use XML tags (`<context>`, `<instructions>`) to eliminate prompt injection.""",

    'llm': """### 🧠 Large Language Models (LLMs)

A **Large Language Model (LLM)** is a transformer-based neural network trained on vast text corpora to understand and generate natural language.

---

### ⚙️ Key Concepts:
1. **Next-Token Prediction:** Computes probability distribution over vocabulary:
   $$P(w_t \\mid w_1, \\dots, w_{t-1}) = \\text{softmax}(W \\cdot h_t)$$
2. **Context Window:** Number of tokens the model can process simultaneously (e.g. 128k in GPT-4, 1M+ in Gemini 1.5).
3. **Fine-Tuning:**
   - **LoRA (Low-Rank Adaptation):** Freezes base weights and trains small rank-decomposition matrices $A$ and $B$, reducing VRAM requirements by up to 80%.
   - **RLHF & DPO:** Aligns outputs with human preferences.""",

    'computer vision': """### 👁️ Computer Vision & CNNs

**Computer Vision** enables machines to interpret and extract meaningful information from digital images and videos.

---

### ⚙️ Convolutional Neural Networks (CNN):
1. **Convolutional Layers:** Slides filters/kernels over pixels to compute feature maps (edges, textures, shapes).
2. **Pooling Layers (Max Pooling):** Downsamples spatial dimensions to reduce computation and enforce translation invariance.
3. **Fully Connected Layers:** Flattens high-level feature maps to output classification labels.
- **Top Architectures:** ResNet (Residual skip connections), EfficientNet, Vision Transformers (ViT), YOLO (Real-time Object Detection).""",

    'nlp': """### 📝 Natural Language Processing (NLP)

**Natural Language Processing (NLP)** combines computational linguistics and machine learning to enable computers to process, understand, and generate human language.

---

### ⚙️ Modern NLP Pipeline:
1. **Text Normalization:** Lowercasing, punctuation stripping, stop word removal, and lemmatization.
2. **Tokenization:** Sub-word tokenizers like Byte-Pair Encoding (BPE) or WordPiece.
3. **Embeddings:** Dense representations mapping words to semantic vector space (Word2Vec, GloVe, BERT, OpenAI embeddings).
4. **Downstream Tasks:** Named Entity Recognition (NER), Sentiment Analysis, Machine Translation, Question Answering.""",

    'reinforcement learning': """### 🎮 Reinforcement Learning (RL)

**Reinforcement Learning** trains an **Agent** to make a sequence of decisions in an **Environment** to maximize cumulative **Reward** through trial and error.

---

### ⚙️ Core Mathematical Framework: Markov Decision Process (MDP)
- **State ($S$):** Current situation of the agent.
- **Action ($A$):** Move the agent can take.
- **Reward ($R$):** Feedback signal evaluating the action.
- **Bellman Equation:**
  $$V(s) = \\max_a \\left[ R(s, a) + \\gamma \\sum_{s'} P(s' \\mid s, a) V(s') \\right]$$
- **Algorithms:** Q-Learning, Deep Q-Networks (DQN), Policy Gradients, Proximal Policy Optimization (PPO).""",

    'python': """### 🐍 Python for Machine Learning & Data Science

Python is the dominant programming language for AI and machine learning due to its clean syntax and comprehensive ecosystem of specialized mathematical libraries.

---

### 🛠️ The Core Data Science Stack:
1. **NumPy:** High-performance $N$-dimensional arrays and vectorized linear algebra operations.
2. **Pandas:** Structured tabular DataFrames for data manipulation, filtering, merging, and time-series analysis.
3. **Matplotlib & Seaborn:** Publication-quality statistical visualizations and exploratory data analysis plots.
4. **Scikit-Learn:** Complete machine learning toolkit for preprocessing, cross-validation, classification, regression, and clustering.
5. **PyTorch & TensorFlow:** Hardware-accelerated (GPU) deep learning frameworks for building custom neural networks."""
}


def _local_reasoned_answer(question: str, detected_topic: str) -> str:
    q = question.lower().strip()
    topic = detected_topic.lower()

    # 1. GREETINGS
    if any(q.startswith(g) for g in ['hi', 'hello', 'hey', 'greetings', 'who are you', 'what can you do', 'help me']):
        return (
            f"### 👋 Hello! I am your AutoLearn AI Voice Tutor\n\n"
            f"I provide exact, accurate answers for all topics in **Artificial Intelligence**, **Machine Learning**, **Deep Learning**, and **Python**.\n\n"
            f"#### 💡 Example Questions You Can Ask:\n"
            f"- *\"What is overfitting and how do I prevent it?\"*\n"
            f"- *\"Explain the Bias-Variance tradeoff\"*\n"
            f"- *\"How does Gradient Descent and the Adam optimizer work?\"*\n"
            f"- *\"Compare Classification vs Clustering\"*\n"
            f"- *\"Explain about Generative AI and Diffusion models\"*\n"
            f"- *\"What is RAG (Retrieval-Augmented Generation)?\"*\n"
            f"- *\"How do Transformers and Self-Attention work?\"*\n"
            f"- *\"Show me Python code for Linear Regression\"*\n\n"
            f"Type any question below or click **🎤 Microphone** to speak!"
        )

    # 2. COMPARISONS (X vs Y)
    comparisons = {
        ('supervised', 'unsupervised'): """### ⚖️ Supervised vs Unsupervised Learning

| Dimension | Supervised Learning | Unsupervised Learning |
| :--- | :--- | :--- |
| **Data Requirements** | Requires paired inputs with ground-truth labels $(X, y)$ | Requires unlabeled input features only $(X)$ |
| **Objective** | Predict known targets for new unseen inputs | Discover hidden patterns, clusters, or structures |
| **Core Tasks** | Classification (discrete) & Regression (continuous) | Clustering, Dimensionality Reduction, Anomaly Detection |
| **Key Algorithms** | Random Forest, Linear Regression, SVM, Logistic Regression | K-Means, DBSCAN, PCA, Isolation Forest |
| **Evaluation** | Accuracy, Precision, Recall, F1, MSE, $R^2$ | Silhouette Score, Inertia, Explained Variance |""",

        ('classification', 'clustering'): """### ⚖️ Classification vs Clustering

| Dimension | Classification (Supervised) | Clustering (Unsupervised) |
| :--- | :--- | :--- |
| **Labels** | Mandatory known target classes ($y$) | No labels available |
| **Purpose** | Categorize inputs into predefined categories | Discover organic natural clusters |
| **Boundary** | Learns decision boundary separating known labels | Measures spatial proximity between points |
| **Algorithms** | Logistic Regression, Decision Trees, SVM, Neural Nets | K-Means, DBSCAN, Hierarchical Clustering |""",

        ('linear regression', 'logistic regression'): """### ⚖️ Linear Regression vs Logistic Regression

| Dimension | Linear Regression | Logistic Regression |
| :--- | :--- | :--- |
| **Target Type** | Continuous numerical value (e.g. Salary, Price) | Categorical probability / discrete class (0 or 1) |
| **Output Range** | $(-\\infty, +\\infty)$ | $[0, 1]$ (via Sigmoid function) |
| **Loss Function** | Mean Squared Error (MSE) | Binary Cross-Entropy (Log Loss) |
| **Task** | Regression | Classification |""",

        ('random forest', 'decision tree'): """### ⚖️ Decision Tree vs Random Forest

| Feature | Single Decision Tree | Random Forest Ensemble |
| :--- | :--- | :--- |
| **Complexity** | Single tree model | Collection of $N$ de-correlated trees (e.g. 100+) |
| **Overfitting** | Very prone to overfitting (High Variance) | Resists overfitting via bootstrap aggregation (Bagging) |
| **Interpretability** | High (easy to plot and visualize rules) | Lower (black-box ensemble voting) |
| **Performance** | Moderate accuracy on noisy data | Significantly higher accuracy and stability |"""
    }

    for (t1, t2), comp_text in comparisons.items():
        if (t1 in q and t2 in q) or (f"{t1} vs {t2}" in q) or (f"{t2} vs {t1}" in q):
            return comp_text

    # 3. DIRECT HIT IN KNOWLEDGE BASE
    if topic in EXACT_KNOWLEDGE_BASE:
        return EXACT_KNOWLEDGE_BASE[topic]

    # Search by keyword match in questions
    for key, text in EXACT_KNOWLEDGE_BASE.items():
        if key in q:
            return text

    # 4. PYTHON CODE IMPLEMENTATION INTENT
    if any(k in q for k in ['code', 'python', 'script', 'implement', 'syntax', 'example']):
        code_examples = {
            'linear regression': '''import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# 1. Feature matrix X and target y
X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])
y = np.array([12, 19, 31, 42, 53, 59, 71, 82])

# 2. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# 3. Fit linear model
model = LinearRegression()
model.fit(X_train, y_train)

# 4. View learned parameters
print(f"Slope (w): {model.coef_[0]:.2f}")
print(f"Intercept (b): {model.intercept_:.2f}")
print("Predictions:", model.predict(X_test))''',

            'decision trees': '''from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data, iris.target, test_size=0.2, random_state=42)

clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)

print(f"Test Accuracy: {clf.score(X_test, y_test):.2f}")
print("\\nDecision Rules:\\n", export_text(clf, feature_names=iris.feature_names))''',

            'classification': '''from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=500, n_features=6, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))''',
        }
        for k, snippet in code_examples.items():
            if k in q or k == topic:
                return f"""### 💻 Python Code Example: {k.title()}

Here is a clean, runnable Python script for **{k.title()}**:

```python
{snippet}
```

#### 📝 Explanation of Steps:
1. **Data Prep:** Format predictors into matrix `X` and targets into vector `y`.
2. **Model Training:** Call `.fit(X_train, y_train)` to learn optimal decision parameters.
3. **Evaluation:** Call `.predict(X_test)` and assess performance on unseen test data."""

    # 5. DYNAMIC CUSTOM ANSWER GENERATION (Never repeats identical boilerplate!)
    title = topic.title()
    note = TOPIC_NOTES.get(topic, f"{title} is a core mathematical and algorithmic principle in modern machine learning systems.")

    return f"""### 📚 {title}

**{title}** is an essential concept in machine learning and data science.

{note}

---

### ⚙️ How It Works in Practice
1. **Core Problem Solved:** Provides structured methods for feature representation, probabilistic modeling, or parameter optimization.
2. **Implementation Workflow:** Typically integrated using Python libraries (`scikit-learn`, `numpy`, or `pytorch`).
3. **Key Best Practice:** Always validate performance using separate training and test sets to guarantee real-world generalization.

---

### 💡 Suggested Follow-Up:
- Ask *\"Show me a Python code example for {title}\"*
- Ask *\"What are the pros and cons of {title}?\"*"""


# ─────────────────────────────────────────────────────────────
# MAIN GENERATE TUTOR REPLY
# ─────────────────────────────────────────────────────────────

def generate_tutor_reply(
    question: str,
    profile: Dict,
    assessment: List[Dict],
    history: Optional[List[Dict]] = None,
    api_key: Optional[str] = None
) -> TutorReply:
    selected_topics = profile.get('topics', []) or list(TOPIC_CATALOG.keys())
    detected_topic = _detect_topic(question, selected_topics)
    chunks = retrieve_relevant_chunks(question, selected_topics)
    related_resources = {
        'videos': rank_catalog_videos(detected_topic, 'beginner', max_results=2),
        'courses': rank_courses(detected_topic, 'beginner', max_results=2),
        'datasets': rank_kaggle_datasets(detected_topic, 'beginner', max_results=2),
        'project': project_for_topic(detected_topic, 'beginner'),
    }

    # 1. Check for configured API Keys (Gemini, OpenAI, Groq)
    gemini_key = (api_key or os.getenv('GEMINI_API_KEY') or '').strip()
    openai_key = (os.getenv('OPENAI_API_KEY') or '').strip()
    groq_key = (os.getenv('GROQ_API_KEY') or '').strip()

    if gemini_key and len(gemini_key) > 8:
        try:
            answer = _call_gemini(gemini_key, question, history)
            return TutorReply(answer=answer, mode='gemini_ai', detected_topic=detected_topic, retrieved_chunks=chunks, related_resources=related_resources)
        except Exception as e:
            print(f"[Tutor API] Gemini error: {e}")

    if openai_key and len(openai_key) > 8:
        try:
            answer = _call_openai_compatible(openai_key, question, "https://api.openai.com/v1", "gpt-4o-mini", history)
            return TutorReply(answer=answer, mode='openai_ai', detected_topic=detected_topic, retrieved_chunks=chunks, related_resources=related_resources)
        except Exception as e:
            print(f"[Tutor API] OpenAI error: {e}")

    if groq_key and len(groq_key) > 8:
        try:
            answer = _call_openai_compatible(groq_key, question, "https://api.groq.com/openai/v1", "llama-3.3-70b-versatile", history)
            return TutorReply(answer=answer, mode='groq_ai', detected_topic=detected_topic, retrieved_chunks=chunks, related_resources=related_resources)
        except Exception as e:
            print(f"[Tutor API] Groq error: {e}")

    # 2. Try fast online AI endpoint if available
    online_ai_ans = _try_free_online_ai(question)
    if online_ai_ans:
        return TutorReply(answer=online_ai_ans, mode='cloud_ai', detected_topic=detected_topic, retrieved_chunks=chunks, related_resources=related_resources)

    # 3. Exact, diverse Local Expert Knowledge Engine
    answer = _local_reasoned_answer(question, detected_topic)
    return TutorReply(answer=answer, mode='ai_tutor_engine', detected_topic=detected_topic, retrieved_chunks=chunks, related_resources=related_resources)
