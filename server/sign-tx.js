const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

const ec = new EC('secp256k1');
const args = process.argv.slice(2);

const privateKey = args[0];
const key = ec.keyFromPrivate(privateKey);

const message = args[1];
const msgHash = SHA256(message);

const signature = key.sign(msgHash.toString());

console.log("\nSignature: " + signature.toDER('hex') + "\n");