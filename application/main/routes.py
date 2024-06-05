from flask import render_template, redirect, url_for, flash, request, session
from flask_login import login_required, current_user
from sqlalchemy import select, update

from . import main
from ..extensions import db
from ..models.invitation import Invitation
from ..models.message import Message
from ..models.room import Room, room_user
from ..utils import generate_room_code


@main.route('/')
def index():
    return render_template('index.html')


@main.route('/home', methods=["GET", "POST"])
@login_required
def home():
    if request.method == "POST":
        if 'aes_key' in request.form:
            room_name = request.form.get('room_name')
            aes_key = request.form.get('aes_key')
            owner_username = current_user.username
            if room_name:
                existing_codes = [room.code for room in Room.query.all()]
                code = generate_room_code(8, existing_codes)
                new_room = Room(name=room_name, code=code, owner=owner_username)
                new_room.members.append(current_user)
                db.session.add(new_room)
                db.session.commit()
                stmt = update(room_user).where(room_user.c.user_id == current_user.id, room_user.c.room_code == new_room.code).values(aes_key=aes_key)
                db.session.execute(stmt)
                db.session.commit()
                flash('Pomyślnie utworzono pokój', 'success')
                return redirect(url_for('main.room', room_code=new_room.code))
        elif 'room_code' in request.form:
            # delete the room and all messages associated with it
            room_code = request.form.get('room_code')
            room = Room.query.filter_by(code=room_code).first()
            if room and room.owner == current_user.username:

                invites = Invitation.query.filter_by(room_code=room_code).all()
                for invite in invites:
                    db.session.delete(invite)

                db.session.delete(room)
                db.session.commit()
                flash('Pomyślnie usunięto pokój', 'success')
            else:
                flash('Nie jesteś właścicielem tego pokoju', 'danger')
    return render_template('home.html', rooms=current_user.rooms, current_user=current_user)


@main.route('/room')
@login_required
def room():
    room_code = request.args.get('room_code')
    room = Room.query.filter_by(code=room_code).first()
    if room and current_user in room.members:
        session['room_code'] = room.code
        stmt = select(room_user.c.aes_key).where(room_user.c.user_id == current_user.id, room_user.c.room_code == room.code)
        enc_aes_key = db.session.execute(stmt).scalar()
        messages = Message.query.filter_by(room_code=room.code).all()
        return render_template('room.html', room=room, owner=room.owner, messages=messages, enc_aes_key=enc_aes_key)
    else:
        flash('Nie masz dostępu do tego pokoju lub nie istnieje taki pokoj', 'danger')
        return redirect(url_for('main.home'))
