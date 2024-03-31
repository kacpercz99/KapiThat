import base64

from flask import render_template, redirect, url_for, flash, request, session
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash

from . import main
from ..extensions import db, login_manager
from ..models.user import User
from ..models.message import Message
from ..models.room import Room
from .forms import RegisterForm, LoginForm



@main.route('/')
def index():
    return render_template('index.html')


@main.route('/register', methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data)
        public_key_b64 = request.form.get('public_key')
        public_key = base64.b64decode(public_key_b64)
        new_user = User(username=form.username.data, password=hashed_password, public_key=public_key)
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        flash('Konto zostało utworzone', 'success')
        return redirect(url_for('main.home'))
    return render_template('register.html', form=form)


@main.route('/login', methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if check_password_hash(user.password, form.password.data):
                login_user(user)
                flash('Zalogowano pomyślnie', 'success')
                return redirect(url_for('main.home'))
        flash('Logowanie nieudane. Sprawdź nazwę użytkownika i hasło', 'danger')
        return render_template('login.html', form=form)
    else:
        return render_template('login.html', form=form)


@main.route('/logout', methods=["POST"])
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('main.index'))


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


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