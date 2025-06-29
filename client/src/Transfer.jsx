import { useState } from "react";
import server from "./server";

function Transfer({ address, setBalance, wallets }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      if (!address) {
        alert("Please select a wallet!");
        return;
      }

      const tx = {
        sender: address,
        recipient,
        sendAmount: Number(sendAmount),
      };

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
