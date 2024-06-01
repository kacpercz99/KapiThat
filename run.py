from application import init_app, socketio
app = init_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=42068, debug=True, allow_unsafe_werkzeug=True,
                 ssl_context=('application/certs/cert.pem', 'application/certs/key.pem'))
