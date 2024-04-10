async function getUsersRSAKey(userId) {
    const response = await fetch(`/key/${userId}`)
    const data = await response.json();
    return data.public_key;
}

async function encryptAESKeyForTarget(userId) {
    while (!aesKey) {
        await new Promise(r => setTimeout(r, 100));
    }
    let targetPublicRSAKey = decodeData(await getUsersRSAKey(userId));
    let importedKey = await window.crypto.subtle.importKey(
        "spki",
        targetPublicRSAKey,
        {name: "RSA-OAEP", hash: {name: "SHA-256"}},
        true,
        ["encrypt"]
    );
    console.log(importedKey)
    console.log(aesKey)
    let exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
    let encryptedKey = window.crypto.subtle.encrypt(
        {name: "RSA-OAEP"},
        importedKey,
        exportedAESKey
    );
    return encodeData(await encryptedKey);
}
async function getPrivateKey() {
    let dbRequest = indexedDB.open("keyDatabase", 1);
    return new Promise((resolve, reject) => {
        dbRequest.onsuccess = function (event) {
            let db = event.target.result;
            let transaction = db.transaction("keys", "readonly");
            let keyStore = transaction.objectStore("keys");
            let request = keyStore.get(currentUser + "_privateKey");
            request.onsuccess = function () {
                resolve(decodeData(request.result.key));
            };
            request.onerror = function() {
                reject("Error retrieving private key");
            };
        };
    });
}

async function decryptAESKey() {
    let importedRSAKey = await window.crypto.subtle.importKey(
        "pkcs8",
        await getPrivateKey(),
        {name: "RSA-OAEP", hash: {name: "SHA-256"}},
        true,
        ["decrypt"]
    );

    let decryptedAES = await window.crypto.subtle.decrypt(
        {name: "RSA-OAEP"},
        await importedRSAKey,
        decodeData(encAESKey)
    );
    let importedAESKey = await window.crypto.subtle.importKey(
        "raw",
        decryptedAES,
        {name: "AES-CBC"},
        true,
        ["encrypt", "decrypt"]
    );
    aesKey = importedAESKey;
    return importedAESKey;
}

async function encryptMessage(message) {
    while(!aesKey){
        await new Promise(r => setTimeout(r, 100));
    }
    let iv = window.crypto.getRandomValues(new Uint8Array(16));
    let encryptedMessage = window.crypto.subtle.encrypt(
        {name: "AES-CBC", iv: iv},
        aesKey,
        new TextEncoder().encode(message)
    );
    let b64encryptedMessage = encodeData(await encryptedMessage);
    let b64iv = encodeData(iv);
    return b64iv + '.' + b64encryptedMessage;

}

async function decryptMessage(message) {
    while(!aesKey){
        await new Promise(r => setTimeout(r, 100));
    }
    let parts = message.split('.');
    let b64iv = parts[0];
    let b64message = parts[1];
    let decryptedMessage = window.crypto.subtle.decrypt(
        {
            name: "AES-CBC", iv: decodeData(b64iv)},
        aesKey,
        decodeData(b64message)
    );
    return new TextDecoder().decode(await decryptedMessage);
}