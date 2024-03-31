async function generateAndStoreKeyPair(username) {
    let keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1,0,1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );

    let publicKeyToExport = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
    );

    let privateKeyToExport = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
    );

    let base64PublicKey = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(publicKeyToExport))));
    let base64PrivateKey = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(privateKeyToExport))));

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