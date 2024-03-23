var socketio = io();
var mediaRecorder;
var chunks = [];
var isRecording = false;

function formatMessageDate(date) {
    const userLocale = navigator.language;
    moment.locale(userLocale);

    const currentDate = moment();
    const messageDate = moment(date);

    if (currentDate.isSame(messageDate, "day")) {
        if (moment.localeData().longDateFormat("LT").includes("A")) {
            return messageDate.format("LT");
        } else {
            return messageDate.format("HH:mm");
        }
    } else {
        return messageDate.format("LL");
    }
}

function createChatItem(message, sender, isVoiceMessage = false) {
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
                                <small>${formatMessageDate(new Date())}</small>
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
                                <small>${formatMessageDate(new Date())}</small>
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
    socketio.emit("message", {message: msg});
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
            socketio.emit("voice-message", {message: base64data});
        };
        reader.readAsDataURL(blob);
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
}

$(document).ready(function () {
    socketio.on("message", function (message) {
        //console.log('message received')
        createChatItem(message.message, message.sender);
    });

    socketio.on('voice-message', function (data) {
        //console.log('voice message received')
        createChatItem(data.message, data.sender, true);
    })

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