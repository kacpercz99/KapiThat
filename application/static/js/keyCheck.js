async function check(username) {
    if (!await checkIfKeysExist(username)) {
        popupKeyImport(username);
    }
    return true;
}

function checkIfKeysExist(username) {
    return new Promise((resolve, reject) => {
        let openRequest = indexedDB.open('keyDatabase', 1);

        openRequest.onupgradeneeded = function(event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys', {keyPath: "id"});
            }
        };

        openRequest.onsuccess = function(event) {
            let db = openRequest.result;
            let transaction = db.transaction("keys", "readonly");
            let keyStore = transaction.objectStore("keys");

            let privateKeyRequest = keyStore.get(username + "_privateKey");
            let publicKeyRequest = keyStore.get(username + "_publicKey");

            transaction.oncomplete = function() {

                if (privateKeyRequest.result && publicKeyRequest.result) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
        };

        openRequest.onerror = function(event) {
            reject(new Error('Error opening database'));
        };
    });
}

function popupKeyImport(username) {
    let modal = document.createElement('div');
    modal.id = 'popupModal';


    let message = document.createElement('p');
    message.textContent = 'Nie wykryto kluczy, musisz je zaimportować z innego urządzania, aby odszyfrować wiadmości.';
    message.style.color = 'black';
    modal.appendChild(message);
    let qrCodeButton = document.createElement('button');
    qrCodeButton.id = 'qrCodeButton';
    qrCodeButton.classList.add('btn');
    qrCodeButton.textContent = 'Zeskanuj kod QR';
    $(qrCodeButton).click(function() {
        importKeyFromQrCode(username, modal);
    });
    modal.appendChild(qrCodeButton);
    let fileButton = document.createElement('button');
    fileButton.id = 'fileButton';
    fileButton.classList.add('btn');
    fileButton.textContent = 'Wybierz plik z kluczami';
    $(fileButton).click(function() {
        importKeyFromFile(username, modal);
    });
    modal.appendChild(fileButton);
    document.body.appendChild(modal);
}