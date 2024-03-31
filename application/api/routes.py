from datetime import datetime
from flask_login import login_required, current_user
from . import api
from flask import request
from ..models.message import Message
from ..models.room import Room


@api.route('/get_messages/<room_code>', methods=["GET"])
@login_required
def get_messages(room_code):
    last_message_time = request.args.get('last_message_time')
    room = Room.query.filter_by(code=room_code).first()
    if room and current_user in room.members:
        if last_message_time:
            last_message_time = datetime.strptime(last_message_time, '%Y-%m-%d %H:%M:%S.%f')
            messages = Message.query.filter(Message.room_code == room_code, Message.timestamp > last_message_time).all()
            if not messages:
                return {"messages": []}
        else:
            messages = Message.query.filter_by(room_code=room_code).all()
        messages_data = [{
            "content": message.content,
            "sender": message.sender.username,
            "timestamp": message.timestamp,
            "is_voice_message": message.is_voice_message
        } for message in messages]
        return {"messages": messages_data}
    else:
        return {"error": "Brak dostepu"}, 403
