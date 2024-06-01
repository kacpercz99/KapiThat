function getKeys(username) {
    return new Promise((resolve, reject) => {
        let openRequest = indexedDB.open('keyDatabase', 1);

        openRequest.onupgradeneeded = function () {
            let db = openRequest.result;
            if (!db.objectStoreNames.contains('keys')) {
                db.createObjectStore('keys');
            }
        };

        openRequest.onsuccess = function () {
            let db = openRequest.result;
            let transaction = db.transaction('keys', 'readonly');
            let store = transaction.objectStore('keys');

            let privateKeyRequest = store.get(username + '_privateKey');

            privateKeyRequest.onsuccess = function () {
                let privateKey = privateKeyRequest.result;

                let publicKeyRequest = store.get(username + '_publicKey');

                publicKeyRequest.onsuccess = function () {
                    let publicKey = publicKeyRequest.result;

                    let keyPair = {
                        privateKey: privateKey.key,
                        publicKey: publicKey.key
                    };

                   resolve(JSON.stringify(keyPair));
                };
            };
        };

        openRequest.onerror = function () {
            reject("Error opening database");
        };
    });
}

async function exportKeysToFile(username) {

    let keyPairString = await getKeys(username);

    let encodedKeyPair = encodeURIComponent(keyPairString);

    let blob = new Blob([encodedKeyPair], {type: 'text/plain;charset=utf-8'});

    let url = URL.createObjectURL(blob);

    let link = document.createElement('a');
    link.href = url;
    link.download = 'keyPair.txt';
    link.click();
}