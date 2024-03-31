from application.extensions import db
from application.utils import generate_room_code
from sqlalchemy import Table, Column, Integer, String, ForeignKey


room_user = Table(
    'room_user', db.Model.metadata,
    Column('user_id', Integer, ForeignKey('user.id')),
    Column('room_code', String(8), ForeignKey('room.code'))
)


class Room(db.Model):
    code = db.Column(db.String(8), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    messages = db.relationship('Message', backref='room', lazy=True)
    members = db.relationship('User', secondary=room_user, backref=db.backref('rooms', lazy=True))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        existing_codes = [room.code for room in Room.query.all()]
        self.code = generate_room_code(8, existing_codes)
