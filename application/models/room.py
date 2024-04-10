from application.extensions import db
from sqlalchemy import Table, Column, Integer, String, ForeignKey, Text

room_user = Table(
    'room_user', db.Model.metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('room_code', String(8), ForeignKey('room.code')),
    Column('aes_key', Text)
)


class Room(db.Model):
    code = db.Column(db.String(8), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    messages = db.relationship('Message', backref='room', lazy=True)
    members = db.relationship('User', secondary=room_user, backref=db.backref('rooms', lazy=True))
