from flask import render_template, redirect, url_for, flash, request, session
from flask_login import login_required, current_user
from . import main
from ..extensions import db
from ..models.message import Message
from ..models.room import Room


@main.route('/')
def index():
    return render_template('index.html')


@main.route('/home', methods=["GET", "POST"])
@login_required
def home():
    if request.method == "POST":
        room_name = request.form.get('room_name')
        if room_name:
            new_room = Room(name=room_name)
            new_room.members.append(current_user)
            db.session.add(new_room)
            db.session.commit()
            flash('Pomyślnie utworzono pokój', 'success')
            return redirect(url_for('main.room', room_code=new_room.code))
            # return render_template('room.html', room=new_room)
    return render_template('home.html', rooms=current_user.rooms, current_user=current_user)


@main.route('/room')
@login_required
def room():
    room_code = request.args.get('room_code')
    room = Room.query.filter_by(code=room_code).first()
    if room and current_user in room.members:
        session['room_code'] = room.code
        messages = Message.query.filter_by(room_code=room.code).all()
        return render_template('room.html', room=room, messages=messages)
    else:
        flash('Nie masz dostępu do tego pokoju lub nie istnieje taki pokoj', 'danger')
        return redirect(url_for('main.home'))
