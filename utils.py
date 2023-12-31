from random import choice
from string import ascii_letters
from os import path
from secrets import token_urlsafe


def generate_room_code(length: int, existing_codes: list[str]) -> str:
    while True:
        code_chars = [choice(ascii_letters) for _ in range(length)]
        code = ''.join(code_chars)
        if code not in existing_codes:
            return code


def create_enf_if_not_exists(app):
    if not path.exists('.env'):
        from dotenv import set_key

        with app.app_context():
            new_secret_key = token_urlsafe(24)
            set_key(".env", "SECRET_KEY", new_secret_key)
