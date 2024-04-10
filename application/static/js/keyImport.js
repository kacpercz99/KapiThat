function importKeyFromQrCode(username, modal) {
    modal.removeChild(document.getElementById('qrCodeButton'));
    modal.removeChild(document.getElementById('fileButton'));
    let qrCode = document.createElement('video');
    qrCode.id = 'qrCode';
    modal.appendChild(qrCode);
    modal.style.maxWidth = 600;
    modal.style.maxHeight = 600;
    import('./qr-scanner.min.js').then((module) => {
        const QrScanner = module.default;
        const scanner = new QrScanner(qrCode, result => console.log(result), {
            highlightScanRegion: true,
            highlightCodeOutline: true,
        });

        scanner.start().then(() => {

            let closeButton = document.createElement('button');
            closeButton.classList.add('btn');
            closeButton.textContent = 'Zamknij';
            $(closeButton).click(function() {
                scanner.stop();
            });
            modal.appendChild(closeButton);
        });
    });
}

function importKeyFromFile(username, modal) {
    modal.removeChild(document.getElementById('qrCodeButton'));
    modal.removeChild(document.getElementById('fileButton'));

}

function saveKeyPair(username, keyPairJSON) {
    let keyPair = JSON.parse(keyPairJSON);
    let dbRequest = indexedDB.open('keyDatabase', 1);

    dbRequest.onupgradeneeded = function (event) {
        let db = event.target.result;
        db.createObjectStore("keys", {keyPath: "id"});
    };

    dbRequest.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction("keys", "readwrite");
        let keyStore = transaction.objectStore("keys");
        keyStore.add({id: username + "_privateKey", key: keyPair.privateKey});
        keyStore.add({id: username + "_publicKey", key: keyPair.publicKey});
    };
}