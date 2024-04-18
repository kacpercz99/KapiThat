from datetime import datetime
from flask_login import login_required, current_user

from . import api
from flask import request

from .. import db
from ..models.invitation import Invitation
from ..models.message import Message
from ..models.room import Room, room_user
from ..models.user import User


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
        return {"error": "Brak dostepu"}


@api.route('/find_users/<string:username>', methods=['GET'])
@login_required
def find_users(username):
    users = User.query.filter(User.username.like(f'%{username}%')).all()
    users = [user for user in users if user != current_user]
    if len(users) > 0:
        return {
            "users": [{
                "id": user.id,
                "username": user.username
            } for user in users]
        }
    else:
        return {"message": "Users not found"}


@api.route('/key/<int:user_id>', methods=['GET'])
@login_required
def get_key(user_id):
    user = User.query.get(user_id)
    key = user.public_key
    return {"public_key": key}


@api.route('/invite', methods=['POST'])
@login_required
def invite():
    recipient_id = request.json.get('recipient_id')
    room_code = request.json.get('room_code')
    room_name = request.json.get('room_name')
    sender_name = request.json.get('sender_name')
    aes_key = request.json.get('aes_key')

    room = Room.query.filter_by(code=room_code).first()
    if room.owner != current_user.username:
        return {"error": "Nie jestes wlascicielem pokoju"}

    recipient = User.query.get(recipient_id)
    if recipient:
        if Invitation.query.filter_by(recipient_id=recipient_id, room_code=room_code).first():
            return {"error": "Zaproszenie juz wyslane"}
        invitation = Invitation(recipient_id=recipient_id, sender_name=sender_name, room_code=room_code, room_name=room_name, aes_key=aes_key)
        db.session.add(invitation)
        db.session.commit()
        return {"message": "Zaproszenie wysłane"}
    else:
        return {"error": "Nie znaleziono uzytkownika"}


@api.route('/invitations/<int:user_id>', methods=['GET'])
@login_required
def get_invitations(user_id):
    if user_id != current_user.id:
        return {"error": "Brak dostepu"}
    invitations = Invitation.query.filter_by(recipient_id=user_id).all()
    if len(invitations) == 0:
        return {"error": "Brak zaproszen"}
    return {
        "invitations": [{
            "id": invitation.id,
            "invitation_id": invitation.id,
            "room_code": invitation.room_code,
            "room_name": invitation.room_name,
            "sender": invitation.sender_name
        } for invitation in invitations]
    }


@api.route('/accept_invitation/<int:invitation_id>', methods=['POST'])
@login_required
def accept(invitation_id):
    invitation = Invitation.query.get(invitation_id)
    if invitation:
        if invitation.recipient_id != current_user.id:
            return {"error": "Brak dostepu"}
        user = User.query.get(invitation.recipient_id)
        room = Room.query.get(invitation.room_code)
        if user and room:
            room.members.append(user)
            stmt = room_user.insert().values(user_id=user.id, room_code=invitation.room_code, aes_key=invitation.aes_key)
            db.session.delete(invitation)
            db.session.execute(stmt)
            db.session.commit()
            return {"message": "Zaproszenie zaakceptowane"}
    return {"error": "Nie znaleziono zaproszenia"}


@api.route('/check_if_user_exists/<string:username>', methods=['GET'])
def check_if_user_exists(username):
    if '/register' in request.referrer:
        user = User.query.filter_by(username=username).first()
        return {'exists': user is not None}
    else:
        return {'error': 'Invalid request source'}