from application.extensions import db


class Invitation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, nullable=False)
    sender_name = db.Column(db.String(50), nullable=False)
    room_code = db.Column(db.String(8), nullable=False)
    room_name = db.Column(db.String(100), nullable=False)
    aes_key = db.Column(db.Text, nullable=False)
