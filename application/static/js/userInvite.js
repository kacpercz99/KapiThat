$(document).ready(function () {
    $("#invite-user").click(function () {
        $("#inviteUserModal").modal("show");
    });

    let invButton = $('#invite-btn');

    $('#search-btn').click(function () {
        var username = $('#username').val();
        $.get('/find_users/' + username, function (data) {
            var userList = $('#user-list');
            invButton.attr("disabled", false)
            userList.empty();
            if (data.message) {
                userList.append(new Option('No users found', ''));
                invButton.attr("disabled", true)
            } else {
                userList.attr("disabled", false)
                data.users.forEach(function (user) {
                    userList.append(new Option(user.username, user.id));
                });
            }
        });
    });

    invButton.click(async function () {
        var userId = $('#user-list').val();
        await fetch('/invite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient_id: userId,
                room_code: roomCode,
                room_name: roomName,
                sender_name: currentUser,
                aes_key: await encryptAESKeyForTarget(userId)
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Invitation sent');
                    $('#inviteUserModal').modal('hide');
                }
            });
    });
});