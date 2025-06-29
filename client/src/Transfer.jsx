import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { signSync } from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance, wallets }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
  }

  async function signTx(privateKey, tx) {
    const message = JSON.stringify(tx);
    const messageHash = hashMessage(message);
    const signature = signSync(messageHash, privateKey, { recovered: true });
    const [sig, recoveryBit] = signature;
    return { signature: toHex(sig), recoveryBit };
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const sender = wallets[address];

      if (!sender) {
        alert("Sender wallet not found!");
        return;
      }

      let tx = {
        sender: address,
        recipient,
        sendAmount: Number(sendAmount),
      };

      const { signature, recoveryBit } = await signTx(sender.privateKey, tx);
      const msgHash = hashMessage(JSON.stringify(tx));

      tx.signature = signature;
      tx.msgHash = toHex(msgHash);
      tx.recoveryBit = recoveryBit;

      const { data } = await server.post(`send`, tx);
      setBalance(data.balance);
    } catch (err) {
        console.error(err);
        if (err.response) {
          alert(err.response.data.message);
        } else {
          alert(err.message);
        }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        <span class="subtitle">
          Send Amount
        </span>
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        <span class="subtitle">
          Recipient
        </span>
        <input
          placeholder="Type an address (starts with '0x...')"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
