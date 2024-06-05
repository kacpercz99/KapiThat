from flask import redirect, url_for

from application import init_app, socketio
app = init_app()


@app.errorhandler(404)
def page_not_found(e):
    return redirect(url_for('main.index'))


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=42068, debug=True, allow_unsafe_werkzeug=True,
                 ssl_context=('application/certs/cert.pem', 'application/certs/key.pem'))
