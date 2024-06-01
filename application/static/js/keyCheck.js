async function checkForKeys(username) {
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
            reject("Błąd otwarcia bazy danych kluczy");
        };
    });
}

function popupKeyImport(username) {
    let modal = new bootstrap.Modal(document.getElementById('importKeysModal'), {
        backdrop: 'static'
    });
    modal.show();
}