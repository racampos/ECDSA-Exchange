const express = require('express');
const app = express();
const cors = require('cors');
const port = 8080;
const EC = require('elliptic').ec;
const { keccak256 } = require("ethereum-cryptography/keccak");

const ec = new EC('secp256k1');
const accounts = [];

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

for (let i=0; i<3; i++) {
  const key = ec.genKeyPair();
  const private_key = key.getPrivate().toString(16);
  const public_key = key.getPublic().encode('hex');
  accounts.push(
    {
      "private_key": private_key,
      "public_key": public_key,
      "address": '0x{}'.format(keccak256(public_key).toString('hex').slice(-40))
    }
  )
}

balances = {};
for (let i=0; i<accounts.length; i++) {
  balances[accounts[i]["address"]] = 100;
}

let startup_message = `
Avaliable Accounts
==================
`;

for (let i=0; i<accounts.length; i++) {
  let public_key = accounts[i]['address'];
  startup_message += '\n({}) {} (100 ETH)'.format(i, public_key);
}
startup_message += `\n
Private Keys
==================
`

for (let i=0; i<accounts.length; i++) {
  let private_key = accounts[i]['private_key'];
  startup_message += '\n({}) {}'.format(i, private_key);
}
console.log(startup_message);

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/verify_signature', (req, res) => {
  const {address, message_hash, signature} = req.body;
  let public_key = null;
  for (let i=0; i< accounts.length; i++) {
    if (address == accounts[i]['address']) {
      public_key = accounts[i]['public_key']
    }
  }
  let valid = false;
  const key = ec.keyFromPublic(public_key, 'hex');
  try {
    valid = key.verify(message_hash, signature);
  } catch {
    valid = false;
  }
  res.send({valid});
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
