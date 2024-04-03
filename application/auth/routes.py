from flask import request, flash, redirect, render_template, url_for, session
from flask_login import login_user, current_user, login_required, logout_user
from . import auth
import base64
from .forms import RegisterForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from ..models.user import User
from ..extensions import db, login_manager


@auth.route('/register', methods=["GET", "POST"])
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


@auth.route('/login', methods=["GET", "POST"])
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


@auth.route('/logout', methods=["POST"])
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('main.index'))


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))