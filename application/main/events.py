from datetime import datetime
from flask_login import current_user
from flask import session
from flask_socketio import send, join_room, leave_room
from .. import socketio, db
from ..models.message import Message
from ..models.room import Room


@socketio.on('connect')
def handle_connect():
    room_code = session.get('room_code')
    room = Room.query.filter_by(code=room_code).first()
    if room is not None:
        join_room(room.code)
        send({
            "sender": "",
            "content": f"{current_user.username} jest online",
            "timestamp": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f'),
            "is_voice_message": False
        }, to=room_code, broadcast=True)


@socketio.on('message')
def handle_message(payload):
    print('Received payload')
    print(payload)
    room_code = session.get('room_code')
    if room_code is None:
        room_code = payload.get('room_code')
    print(f'from room_code: {room_code}')
    if room_code is not None:
        print('message received')
        message = Message(content=payload['message'], sender_id=current_user.id, room_code=room_code, is_voice_message=payload.get('is_voice_message'))
        db.session.add(message)
        db.session.commit()
        print(f'Timestamp: {message.timestamp}')
        print(f'Is voice message: {message.is_voice_message}')
        send({
            "sender": message.sender.username,
            "content": message.content,
            "timestamp": message.timestamp.strftime('%Y-%m-%d %H:%M:%S.%f'),
            "is_voice_message": message.is_voice_message
        }, to=room_code, broadcast=True)


@socketio.on('disconnect')
def handle_disconnect():
    room_code = session.get('room_code')
    if room_code is not None:
        leave_room(room_code)
        send({
            "sender": "",
            "content": f"{current_user.username} jest offline",
            "timestamp": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f'),
            "is_voice_message": False
        }, to=room_code, broadcast=True)
