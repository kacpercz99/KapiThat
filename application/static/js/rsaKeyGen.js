async function generateAndStoreKeyPair(username) {
    console.log("Generating key pair for " + username);

    let keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01,0x00,0x01]),
            hash: {name: "SHA-256"}
        },
        true,
        ["encrypt", "decrypt"]
    );

    let exportedPublicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    let exportedPrivateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    let base64PublicKey = encodeData(exportedPublicKey);
    let base64PrivateKey = encodeData(exportedPrivateKey);

    let dbRequest = indexedDB.open("keyDatabase", 1);
    dbRequest.onupgradeneeded = function(event) {
        let db = event.target.result;
        db.createObjectStore("keys", {keyPath: "id"});
    };
    dbRequest.onsuccess = function(event) {
        let db = event.target.result;
        let transaction = db.transaction("keys", "readwrite");
        let keyStore = transaction.objectStore("keys");

        keyStore.add({id: username + "_privateKey", key: base64PrivateKey});
        keyStore.add({id: username + "_publicKey", key: base64PublicKey});

    };
    return base64PublicKey;
}