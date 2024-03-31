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
                modal.style.position = 'fixed';
                modal.style.top = '50%';
                modal.style.left = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.backgroundColor = 'white';
                modal.style.padding = '40px';
                modal.style.borderRadius = '10px';
                modal.style.zIndex = '1000';
                modal.style.textAlign = 'center';

                let message = document.createElement('p');
                message.textContent = 'Zeskanuj kod QR na innym urządzeniu, aby wyeksportować klucz prywatny i publiczny.';
                message.style.color = 'black';
                modal.appendChild(message);
                let publicQrCode = document.createElement('div');
                publicQrCode.id = 'qrCodePub';
                modal.appendChild(publicQrCode);
                let privateQrCode = document.createElement('div');
                privateQrCode.id = 'qrCodePriv';
                modal.appendChild(privateQrCode);
                let closeButton = document.createElement('button');
                closeButton.textContent = 'Zamknij';
                $(closeButton).click(function() {
                    $(modal).remove();
                });
                modal.appendChild(closeButton);
                document.body.appendChild(modal);
                $("#qrCodePub").qrcode({
                    mode: 0,
                    text: publicKey.key
                });
                $("#qrCodePriv").qrcode({
                    mode: 0,
                    text: privateKey.key
                });
            };
        };
    };
}

