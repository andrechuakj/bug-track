import numpy as np
import spacy
import pickle
from domain.models.BugReport import (
    save_bug_report,
    get_unvectorized_bugs,
)
from sqlmodel import Session
from utilities.classes import Service


class _BugVectorizerService(Service):
    """Service for vectorizing bug reports."""

    # Load spaCy model
    NLP = spacy.load("en_core_web_lg")

    def vectorize_no_vector_bug_reports(self, tx: Session) -> int:
        """Vectorizes reports that have no vector representation."""
        unvectorized_bugs = get_unvectorized_bugs(tx)
        self.logger.info(
            f"Vectorizing {len(unvectorized_bugs)} bug reports with no vector representation"
        )

        vectorized_count = 0
        for bug in unvectorized_bugs:
            try:
                doc = _BugVectorizerService.NLP(
                    bug.title + " " + (bug.description or "")
                )
                vector = np.mean(
                    [token.vector for token in doc if token.has_vector], axis=0
                )

                if vector is None or vector.shape[0] == 0:
                    self.logger.warning(
                        f"Could not generate vector for bug ID {bug.id}"
                    )
                    continue

                vector_binary = pickle.dumps(vector)
                bug.vector = vector_binary
                save_bug_report(tx, bug)
                vectorized_count += 1

                self.logger.info(f"Vectorized bug ID {bug.id}")
            except Exception as e:
                self.logger.error(f"Failed to vectorize bug ID {bug.id}: {e}")

        self.logger.info(
            f"Completed vectorization. Total vectorized: {vectorized_count}"
        )
        return vectorized_count


BugVectorizerService = _BugVectorizerService()

__all__ = ["BugVectorizerService"]
