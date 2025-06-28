const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak")


function generateWallets() {
  const wallets = {};

  for (let i = 0; i < 3; i++) {
    const wallet = {};

    const privateKey = toHex(secp.utils.randomPrivateKey());
    const publicKey = toHex(secp.getPublicKey(privateKey));
    const address = _publicKeyToAddress(publicKey);
    wallet.balance = (i + 1) * 100;
    wallets[address] = wallet;
  }
  return wallets;
}

const balances = generateWallets();
console.log('Wallets:', balances)

app.use(cors());
app.use(express.json());

app.get("/wallets", (req, res) => {
  res.status(200).send(balances);
})

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address]?.balance || 0;
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

function _publicKeyToAddress(publicKey) {
  const hash = keccak256(hexToBytes(publicKey).slice(1));
  const address = toHex(hash.slice(-20));
  return '0x' + address;
}
