from flask import Flask
from application.extensions import db, socketio, login_manager
from dotenv import load_dotenv
from application.utils import create_env_if_not_exist
from os import getenv


def init_app():
    app = Flask(__name__)

    create_env_if_not_exist(app)
    load_dotenv()

    app.config['SQLALCHEMY_DATABASE_URI'] = getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SECRET_KEY'] = getenv('SECRET_KEY')

    login_manager.login_view = 'main.login'

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint)


    db.init_app(app)
    socketio.init_app(app)
    login_manager.init_app(app)

    return app