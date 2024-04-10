var socketio = io();
var mediaRecorder;
var chunks = [];
var isRecording = false;
function formatTimestamp(timestamp) {
    let date = new Date(timestamp);
    let today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.getFullYear() === today.getFullYear()) {
        return date.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
    } else {
        return date.getFullYear().toString();
    }
}

function createChatItem(message, sender, timestamp, isVoiceMessage = false) {
    var messages = $("#messages");
    var senderIsUser = currentUser === sender;
    var content;
    var justifyContent = senderIsUser ? "justify-content-end" : "justify-content-start";
    var ownMessage = senderIsUser ? "self-message-item" : "peer-message-item";
    var senderMsg = senderIsUser || sender === "" ? "" : `<strong>${sender}</strong><br>`;
    if (isVoiceMessage) {
        content = `
                    <div class="row p-1 ${justifyContent}">
                        <div class="col-auto rounded-4 text-break mx-3 ${ownMessage}">
                            <p class="mb-0">
                                ${senderMsg}
                                <audio controls>
                                    <source src="${message}" type="audio/mpeg">
                                    Your browser does not support the audio element.
                                </audio><br>
                                <small>${timestamp}</small>
                            </p>
                        </div>
                    </div>
                `
    } else {
        content = `
                    <div class="row p-1 ${justifyContent}">
                        <div class="col-auto rounded-4 text-break mx-3 ${ownMessage}">
                            <p class="mb-0">
                                ${senderMsg}
                                ${message}<br>
                                <small>${timestamp}</small>
                            </p>
                        </div>
                    </div>
                `;
    }

    messages.append(content);
    messages.animate({scrollTop: messages.prop("scrollHeight")}, 300);
}

async function sendMessage() {
    var msgInput = $("#message-input");
    if (msgInput.val() === "") return;
    var msg = msgInput.val();
    console.log("sending message: ", msg)
    var encryptedMessage = await encryptMessage(msg);
    socketio.emit("message", {message: encryptedMessage, is_voice_message: false});
    msgInput.val("");
}

function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    isRecording = true;
    $("#record-btn").text("Stop").css("background", "#dc3545");
    navigator.mediaDevices.getUserMedia({audio: true}).then(function (stream) {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        };
    });
}

function stopRecording() {
    isRecording = false;
    $("#record-btn").text("Record").css("background", "#6610f2")
    mediaRecorder.stop();
    mediaRecorder.onstop = function () {
        var blob = new Blob(chunks, {type: 'audio/webm'});
        chunks = [];
        var reader = new FileReader();
        reader.onloadend = async function () {
            var base64data = reader.result;
            var encryptedBase64Data = await encryptMessage(base64data);
            socketio.emit("message", {message: encryptedBase64Data, is_voice_message: true});
        };
        reader.readAsDataURL(blob);
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
}

async function handleReceivedMessage(message) {
    let decryptedMessage;
    if (message.sender === "") {
        decryptedMessage = message.content;
    } else {
        decryptedMessage = await decryptMessage(message.content);
    }
    createChatItem(decryptedMessage, message.sender, formatTimestamp(message.timestamp), message.is_voice_message);
}

$(document).ready(function () {

    $.get(`/get_messages/${roomCode}`, function(data){
       data.messages.forEach(function(message){
          handleReceivedMessage(message);
       });
    });

    socketio.on("message", handleReceivedMessage);

    const inputHeight = $("#input").outerHeight();
    const headerHeight = $("header").outerHeight();
    const footerHeight = $("footer").outerHeight();
    const infoHeight = $("#room-info").outerHeight();
    const maxHeight = Math.floor(
        $(window).height() -
        headerHeight -
        footerHeight -
        infoHeight -
        inputHeight -
        40
    );
    $("#messages").css("max-height", maxHeight);

    $("#send-btn").on("click", function () {
        sendMessage();
    });

    $("#message-input").keydown(function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
});