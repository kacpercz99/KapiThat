async function generateAESKey() {
    let key = await window.crypto.subtle.generateKey(
        {
            name: "AES-CBC",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    return await window.crypto.subtle.exportKey("raw", key);
}

async function getPublicKey(username) {
    let dbRequest = indexedDB.open("keyDatabase", 1);
    return new Promise((resolve, reject) => {
        dbRequest.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction("keys", "readonly");
            let keyStore = transaction.objectStore("keys");
            let request = keyStore.get(username + "_publicKey");
            request.onsuccess = function() {
                resolve(decodeData(request.result.key));
            };
            request.onerror = function() {
                reject("Error retrieving public key");
            };
        };
    });
}

async function encryptAESKey(aesKey, publicKey) {
    let importedKey = await window.crypto.subtle.importKey(
        "spki",
        publicKey,
        {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}
        },
        true,
        ["encrypt"]
    );

    let encryptedKey = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        importedKey,
        aesKey
    );

    return encodeData(encryptedKey);
}

async function process(username){
    let aesKey = await generateAESKey();
    let publicKey = await getPublicKey(username);
    return await encryptAESKey(aesKey, publicKey);
}