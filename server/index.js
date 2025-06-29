const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes, utf8ToBytes } = require("ethereum-cryptography/utils");
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

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

function signTx(privateKey, tx) {
  const message = JSON.stringify(tx);
  const messageHash = hashMessage(message);
  const signature = secp.signSync(messageHash, privateKey, { recovered: true });
  const [sig, recoveryBit] = signature;
  return { signature: toHex(sig), recoveryBit, msgHash: toHex(messageHash) };
}

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
  const { sender, recipient, sendAmount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const originalSenderWallet = wallets[sender];

  if (!originalSenderWallet) {
    return res.status(400).send({ message: "Sender wallet not found!" });
  }

  if (originalSenderWallet.balance < sendAmount) {
    return res.status(400).send({ message: "Not enough funds!" });
  }

  const tx = { sender, recipient, sendAmount };
  
  const { signature, recoveryBit, msgHash } = signTx(originalSenderWallet.privateKey, tx);
  
  const sigBytes = hexToBytes(signature);
  const hashBytes = hexToBytes(msgHash);
  
  const recoveredPublicKey = secp.recoverPublicKey(hashBytes, sigBytes, recoveryBit);
  const recoveredAddress = _publicKeyToAddress(toHex(recoveredPublicKey));

  console.log("Original sender:", sender);
  console.log("Recovered address:", recoveredAddress);

  if (recoveredAddress !== sender) {
    return res.status(400).send({
      message: "Signature verification failed!",
    });
  }

  wallets[sender].balance -= sendAmount;
  wallets[recipient].balance += sendAmount;
  
  res.send({ 
    balance: wallets[sender].balance,
    signature,
    msgHash,
    recoveryBit
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!wallets[address]) {
    wallets[address] = { balance: 0 };
  }
}

function _publicKeyToAddress(publicKey) {
  const hash = keccak256(hexToBytes(publicKey).slice(1));
  const address = toHex(hash.slice(-20));
  return '0x' + address;
}
