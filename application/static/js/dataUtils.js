function encodeData(data) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
}

function decodeData(data) {
    return new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
}