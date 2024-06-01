async function importKeyFromFile(username) {
    let fileInput = document.getElementById('keyFile');
    let file = fileInput.files[0];
    let fileContent = await file.text();

    let keyPair = JSON.parse(decodeURIComponent(fileContent));

    if(!keyPair.hasOwnProperty('privateKey') || !keyPair.hasOwnProperty('publicKey')) {
        alert('Niepoprawny format pliku');
        return;
    }

    saveKeyPair(username, keyPair);
    location.reload();
}

function saveKeyPair(username, keyPair) {

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