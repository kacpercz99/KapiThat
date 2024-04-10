import os.path
from random import choice
from string import ascii_letters
from os import path
from secrets import token_urlsafe
from dotenv import set_key

current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = path.join(current_dir, '.env')
db_path = path.join(current_dir, 'instance').join('kapithat.db')


def generate_room_code(length: int, existing_codes: list) -> str:
    while True:
        code_chars = [choice(ascii_letters) for _ in range(length)]
        code = ''.join(code_chars)
        if code not in existing_codes:
            return code


def create_env_if_not_exist(app):
    if not path.exists(env_path):
        with app.app_context():
            new_secret_key = token_urlsafe(24)
            set_key(env_path, "SECRET_KEY", new_secret_key)
            set_key(env_path, "SQLALCHEMY_DATABASE_URI", "sqlite:///kapithat.db")


def init_db_if_not_exists(app, db):
    if not path.exists(db_path):
        with app.app_context():
            db.create_all()
            db.session.commit()
