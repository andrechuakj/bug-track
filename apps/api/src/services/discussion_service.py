from domain.models.Comment import *
from internal.errors.client_errors import NotFoundError
from sqlmodel import Session
from utilities.classes import Service


class _DiscussionService(Service):

    def get_discussions(self, tx: Session, bug_report_id: int):
        self.logger.info(f"Getting discussions for bug report {bug_report_id}")
        return get_discussions_by_bug_report_id(tx, bug_report_id)

    def get_discussion_id(self, tx: Session, comment_id: int):
        self.logger.info(f"Getting discussion id for comment {comment_id}")
        comment = get_comment_by_id(tx, comment_id)
        if comment is None:
            self.logger.error(f"Comment {comment_id} not found!")
            raise NotFoundError(f"Comment {comment_id} not found")
        if comment.is_thread:
            return comment
        self.logger.info(
            f"Discussion id for comment {comment_id} is {comment.thread_id}"
        )
        thread = get_comment_by_id(tx, comment.thread_id)
        assert thread is not None
        return thread

    def add_bug_report_comment(self, tx: Session, comment: Comment):
        self.logger.info(f"Adding comment to bug report {comment.bug_report_id}")
        saved_comment = save_comment(tx, comment)
        self.logger.info(f"Comment {saved_comment.id} saved!")
        return saved_comment

    def convert_comment_to_discussion_thread(self, tx: Session, comment: Comment):
        self.logger.info(f"Converting comment {comment.id} to discussion thread")
        if comment.thread_id is not None:
            self.logger.error("Comment is already a discussion thread, ignoring")
            return comment
        comment.thread_id = comment.id
        saved_comment = save_comment(tx, comment)
        self.logger.info("Comment converted!")
        return saved_comment

    def add_comment_to_thread(self, tx: Session, comment: Comment, thread_id: int):
        self.logger.info(f"Adding comment to thread {thread_id}")
        self.logger.info(f"Getting thread {thread_id}")
        thread = get_comment_by_id(tx, thread_id)
        if thread is None:
            self.logger.error(f"Thread {thread_id} not found!")
            raise NotFoundError(f"Thread {thread_id} not found")
        if not thread.is_thread:
            self.logger.warning(f"Comment {thread_id} is not a thread, converting")
            thread = self.convert_comment_to_discussion_thread(tx, thread)
        comment.thread_id = thread.id
        comment.bug_report_id = thread.bug_report_id
        saved_comment = save_comment(tx, comment)
        self.logger.info(f"Comment {saved_comment.id} added to thread!")
        return saved_comment


DiscussionService = _DiscussionService()

__all__ = ["DiscussionService"]
