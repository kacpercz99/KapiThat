from flask import Flask
from application.extensions import db, socketio, login_manager
from dotenv import load_dotenv
from application.utils import create_env_if_not_exist, init_db_if_not_exists
from os import getenv


def init_app():
    app = Flask(__name__)
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    create_env_if_not_exist(app)
    load_dotenv()

    app.config['SQLALCHEMY_DATABASE_URI'] = getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SECRET_KEY'] = getenv('SECRET_KEY')

    login_manager.login_view = 'auth.login'

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint)

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    db.init_app(app)
    init_db_if_not_exists(app, db)
    socketio.init_app(app)
    login_manager.init_app(app)

    return app
