from application.extensions import db

room_user = db.Table(
    'room_user', db.Model.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('room_code', db.String(8), db.ForeignKey('room.code')),
    db.Column('aes_key', db.Text)
)


class Room(db.Model):
    code = db.Column(db.String(8), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    owner = db.Column(db.String(50), nullable=False)
    messages = db.relationship('Message', backref='room', cascade="all, delete", lazy=True)
    members = db.relationship('User', secondary=room_user, backref=db.backref('rooms', lazy=True))
