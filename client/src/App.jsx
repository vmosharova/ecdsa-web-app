import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState, useEffect } from "react";
import server from "./server";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [wallets, setWallets] = useState({});

  useEffect(() => {
    async function getWallets() {
      const response = await server.get("/wallets");
      setWallets(response.data);
    }

    getWallets();
  }, [])

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
        wallets={wallets}
      />
      <Transfer setBalance={setBalance} address={address} />
    </div>
  );
}

export default App;
