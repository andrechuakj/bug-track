import pickle
import re
from pathlib import Path

import markdown
import numpy as np
import spacy
from bs4 import BeautifulSoup
from fuzzywuzzy import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from utilities.category_keywords import CATEGORY_KEYWORDS

# Load spaCy model
nlp = spacy.load("en_core_web_lg")

# Load trained ML model
MODEL_DIR = Path(__file__).parent.parent / "model"

FUZZY_WEIGHT = 0.4
SPACY_WEIGHT = 0.4
TOKEN_OVERLAP_WEIGHT = 0.2

with open(MODEL_DIR / "bug_classifier_model.pkl", "rb") as model_file:
    model: LogisticRegression = pickle.load(model_file)

with open(MODEL_DIR / "label_encoder.pkl", "rb") as encoder_file:
    label_encoder = pickle.load(encoder_file)

with open(MODEL_DIR / "tfidf_vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer: TfidfVectorizer = pickle.load(vectorizer_file)


class _BugClassifierService:
    """Service for classifying bug reports."""

    def __init__(self):
        # Custom stopwords (keep useful words like 'error', 'failure', etc.)
        self.custom_stopwords = nlp.Defaults.stop_words - {
            "error",
            "failure",
            "issue",
            "bug",
        }

    def preprocess_text(self, text: str) -> str:
        """Preprocess text"""
        if not text:
            return ""

        text = re.sub(r"!\[.*?\]\(.*?\)", "[IMAGE]", text)
        text = re.sub(r"https?://\S+", "[LINK]", text)

        # Convert Markdown to HTML
        html = markdown.markdown(text)

        # Use BeautifulSoup to extract plain text
        soup = BeautifulSoup(html, "html.parser")
        text = soup.get_text(separator=" ")

        # Remove extra spaces & newlines
        text = re.sub(r"\s+", " ", text).strip()

        # Process with SpaCy
        doc = nlp(text.lower())

        # Remove Stopwords, Lemmatize
        return " ".join(
            [
                token.lemma_
                for token in doc
                if token.is_alpha and token.text not in self.custom_stopwords
            ]
        )

    def get_category_by_keywords(self, issue_title: str) -> str | None:
        """Finds category using exact, fuzzy, and semantic similarity matching (title only)."""
        issue_title = issue_title.lower()
        issue_doc = nlp(issue_title)

        best_match = None
        best_score = 0.0

        for category, keywords in CATEGORY_KEYWORDS.items():
            for keyword in keywords:
                keyword_lower = keyword.lower()
                keyword_doc = nlp(keyword_lower)

                # Exact Match (Highest Priority)
                if keyword_lower in issue_title:
                    return category

                # Fuzzy Matching (Handles Typos & Variations)
                fuzzy_score = (
                    fuzz.partial_ratio(issue_title, keyword_lower) / 100
                )  # Normalize 0-1

                # Word Vector Similarity (SpaCy)
                spacy_score = (
                    issue_doc.similarity(keyword_doc)
                    if issue_doc.has_vector and keyword_doc.has_vector
                    else 0.0
                )

                # Common Token Overlap (Better Context Matching)
                issue_tokens = set(
                    token.text for token in issue_doc if not token.is_stop
                )
                keyword_tokens = set(
                    token.text for token in keyword_doc if not token.is_stop
                )
                common_token_score = len(issue_tokens & keyword_tokens) / max(
                    len(keyword_tokens), 1
                )

                # Dynamic Weighted Scoring
                length_factor = min(
                    len(issue_title) / 100, 1
                )  # Normalize length impact
                combined_score = (
                    (FUZZY_WEIGHT * fuzzy_score)
                    + (SPACY_WEIGHT * spacy_score)
                    + (TOKEN_OVERLAP_WEIGHT * common_token_score * length_factor)
                )

                # Update best match
                if combined_score > best_score and combined_score > 0.7:
                    best_score = combined_score
                    best_match = category

        return best_match

    def predict_bug_category(self, title: str, body: str) -> str:
        """Predicts the category using the saved model and vectorizer."""

        # Try keyword-based classification first (only on title)
        keyword_category = self.get_category_by_keywords(title)
        if keyword_category:
            return keyword_category  # If keyword match is found, use it directly

        # If no keyword match, use ML model
        processed_text = self.preprocess_text(title + " " + body)
        text_tfidf = vectorizer.transform([processed_text])

        # Predict probabilities
        probabilities = model.predict_proba(text_tfidf)
        max_prob = np.max(probabilities)

        predicted_encoded = np.argmax(probabilities)
        predicted_label = label_encoder.inverse_transform([predicted_encoded])[0]

        # Use a percentile-based threshold to adapt confidence dynamically
        confidence_threshold = np.percentile(probabilities, 10)

        return predicted_label if max_prob >= confidence_threshold else "Others"


BugClassifierService = _BugClassifierService()

__all__ = ["BugClassifierService"]
