var socketio = io();
var mediaRecorder;
var chunks = [];
var isRecording = false;
var lastMessageTime = null;

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

function sendMessage() {
    var msgInput = $("#message-input");
    if (msgInput.val() === "") return;
    var msg = msgInput.val();
    console.log("sending message: ", msg)
    socketio.emit("message", {message: msg, is_voice_message: false});
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
        reader.onloadend = function () {
            var base64data = reader.result;
            socketio.emit("message", {message: base64data, is_voice_message: true});
        };
        reader.readAsDataURL(blob);
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
}

function handleReceivedMessage(message) {
    createChatItem(message.content, message.sender, message.timestamp, message.is_voice_message);
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

    const roomcode = $("#room-code");

    roomcode.popover({
        content: "Room code copied!",
        trigger: "manual",
    });

    roomcode.click(function () {
        var roomCode = $("#room-code").text().trim();
        navigator.clipboard.writeText(roomCode).then(function () {
            $("#room-code").popover("show");
            setTimeout(function () {
                $("#room-code").popover("hide");
            }, 1000);
        });
    });
});