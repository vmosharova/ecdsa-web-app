const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak")

const privateKey1 = secp.utils.randomPrivateKey();
console.log('privateKey1: ', toHex(privateKey1));
const publicKey1 = secp.getPublicKey(privateKey1);
console.log('publicKey1:', toHex(publicKey1));
const privateKey2 = secp.utils.randomPrivateKey();
console.log('privateKey2: ', toHex(privateKey2));
const publicKey2 = secp.getPublicKey(privateKey2);
console.log('publicKey2:', toHex(publicKey2));
const privateKey3 = secp.utils.randomPrivateKey();
console.log('privateKey3: ', toHex(privateKey3));
const publicKey3 = secp.getPublicKey(privateKey3);
console.log('publicKey3:', toHex(publicKey3));

app.use(cors());
app.use(express.json());

function getAddress(publicKey) {
  // shortened hash like in eth - slice(1) as it removes the 1st byte (uncompressed key):
  return toHex(keccak256(piblickey.slice(1).slice(-20)));
}

const balances = {
  [getAddress(publicKey1)]: 100,
  [getAddress(publicKey2)]: 75,
  [getAddress(publicKey1)]: 50
};



app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
