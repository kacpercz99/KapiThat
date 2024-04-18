#bin/bash
gunicorn -b 0.0.0.0:42068 -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 --certfile=./application/certs/cert.pem --keyfile=./application/certs/key.pem run:app