const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");


function generateWallets() {
  const wallets = {};

  for (let i = 0; i < 3; i++) {
    const privateKey = toHex(secp.utils.randomPrivateKey());
    const publicKey = toHex(secp.getPublicKey(privateKey));
    const address = _publicKeyToAddress(publicKey);
    wallets[address] = {
      privateKey: privateKey,
      balance: (i + 1) * 100,
    };
  }
  return wallets;
}

const wallets = generateWallets();
console.log('Wallets:', wallets)

app.use(cors());
app.use(express.json());

app.get("/wallets", (req, res) => {
  res.status(200).send(wallets);
})

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = wallets[address]?.balance || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (wallets[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    wallets[sender] -= amount;
    wallets[recipient] += amount;
    res.send({ balance: wallets[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!wallets[address]) {
    wallets[address] = 0;
  }
}

function _publicKeyToAddress(publicKey) {
  const hash = keccak256(hexToBytes(publicKey).slice(1));
  const address = toHex(hash.slice(-20));
  return '0x' + address;
}
