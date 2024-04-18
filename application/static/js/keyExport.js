function exportKeys(username) {
    let openRequest = indexedDB.open('keyDatabase', 1);

    openRequest.onupgradeneeded = function() {
        let db = openRequest.result;
        if (!db.objectStoreNames.contains('keys')) {
            db.createObjectStore('keys');
        }
    };

    openRequest.onsuccess = function() {
        let db = openRequest.result;
        let transaction = db.transaction('keys', 'readonly');
        let store = transaction.objectStore('keys');

        let privateKeyRequest = store.get(username + '_privateKey');

        privateKeyRequest.onsuccess = function() {
            let privateKey = privateKeyRequest.result;

            let publicKeyRequest = store.get(username + '_publicKey');

            publicKeyRequest.onsuccess = function() {
                let publicKey = publicKeyRequest.result;

                let keyPair = {
                    privateKey: privateKey.key,
                    publicKey: publicKey.key
                };

                let keyPairString = JSON.stringify(keyPair);

                let modal = document.createElement('div');
                modal.id = 'popupModal';
                modal.classList.add('text-center');
                let message = document.createElement('p');
                message.textContent = 'Zeskanuj kod QR na innym urządzeniu, aby wyeksportować klucz prywatny i publiczny.';
                message.style.color = 'black';
                modal.appendChild(message);
                let QrCode = document.createElement('div');
                QrCode.id = 'qrCode';
                modal.appendChild(QrCode);
                let closeButton = document.createElement('button');
                closeButton.classList.add('btn');
                closeButton.textContent = 'Zamknij';
                $(closeButton).click(function() {
                    $(modal).remove();
                });
                modal.appendChild(closeButton);
                document.body.appendChild(modal);
                console.log(privateKey.key.length)

                $("#qrCode").kjua({
                    render: 'svg',
                    text: privateKey.key,
                    crisp: true,
                    ecLevel: 'L',
                    size: 700,
                    mode: 'black',
                    back: 'white'
                });
            };
        };
    };
}

