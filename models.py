from flask_sqlalchemy import SQLAlchemy
from flask_security import Security
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
# from flask import current_app as app

db = SQLAlchemy()
security = Security()
fsq.FsModels.set_db_info(db)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer(), primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(), nullable=False)
    username = db.Column(db.String(), nullable = False, unique=True)
    password = db.Column(db.String(30), nullable=False)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    last_activity = db.Column(db.DateTime, default = datetime.utcnow)
    roles = db.relationship('Role', secondary = 'user_roles', backref=db.backref('users', lazy=True))
    books = db.relationship("BookRequestIssueHistory", backref="user")


    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Section(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    description = db.Column(db.String(50), nullable=False)
    all_books = db.relationship("Book", backref='section', cascade='all, delete-orphan')


class Book(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(20), nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    sect = db.Column(db.Integer, db.ForeignKey("section.id"), nullable=False)
    # section = db.relationship("Section", backref="books")
    user_book = db.relationship("User", secondary="association", backref='book_user')

class BookRequestIssueHistory(db.Model):
    serial_no = db.Column(db.Integer(), primary_key=True)
    book_id = db.Column(db.Integer(), db.ForeignKey("book.id"), nullable=False)
    book_name = db.Column(db.String(20), db.ForeignKey("book.name"), nullable=False)
    actual_status = db.Column(db.String(), default="available", nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    days_requested = db.Column(db.Integer(), nullable=False)
    request_date = db.Column(db.String(), nullable=False)
    Issue_date = db.Column(db.String(), nullable=False)
    Return_date = db.Column(db.String(), nullable=True)
    return_boolean = db.Column(db.Boolean(), default=False, nullable=False)
    rating = db.Column(db.Integer, nullable=True)
    # __table_args__ = (db.UniqueConstraint('user_id', 'book_id', name='unique_user_book_feedback'),)


class Association(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), primary_key=True)




