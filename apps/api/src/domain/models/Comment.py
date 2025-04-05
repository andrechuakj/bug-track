from domain.helpers.Timestampable import Timestampable
from domain.models.User import User
from sqlalchemy.orm import backref
from sqlalchemy.sql.operators import is_
from sqlmodel import TEXT, Field, Relationship, Session, or_, select


class Comment(Timestampable, table=True):
    __tablename__ = "comments"
    id: int | None = Field(default=None, primary_key=True)
    content: str = Field(nullable=False, sa_type=TEXT)
    author_id: int = Field(nullable=False, foreign_key="users.id")
    author: User = Relationship()
    is_deleted: bool = Field(nullable=False, default=False)
    bug_report_id: int = Field(foreign_key="bug_reports.id")
    thread_id: int | None = Field(
        foreign_key="comments.id",
        nullable=True,
        default=None,
    )

    # Explicitly define remote_side due to self-referential relationship
    _discussion: list["Comment"] = Relationship(
        sa_relationship_kwargs={
            "backref": backref("thread", remote_side="Comment.id"),
        }
    )

    @property
    def is_thread(self):
        return self.thread_id is None or self.thread_id == self.id

    @property
    def replies(self):
        return [comment for comment in self._discussion if comment.id != self.id]


def get_comment_by_id(tx: Session, comment_id: int):
    return tx.get(Comment, comment_id)


def get_comments_by_bug_report_id(tx: Session, bug_report_id: int):
    return tx.exec(select(Comment).where(Comment.bug_report_id == bug_report_id)).all()


def get_discussions_by_bug_report_id(tx: Session, bug_report_id: int):
    # Discussions are either top-level, naked comments, or
    # comments that are their own threads.
    # Need to explicitly type this due to type bugs with SQLModel
    bool_expr: bool = or_(is_(Comment.thread_id, None), Comment.thread_id == Comment.id)
    return tx.exec(
        select(Comment).where(
            Comment.bug_report_id == bug_report_id,
            bool_expr,
        )
    ).all()


def get_comments_by_thread_id(tx: Session, thread_id: int):
    return tx.exec(select(Comment).where(Comment.thread_id == thread_id)).all()


def save_comment(tx: Session, comment: Comment):
    tx.add(comment)
    tx.commit()
    return comment
