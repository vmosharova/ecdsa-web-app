import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, wallets }) {
  const walletAddresses = Object.keys(wallets)

  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallets</h1>

      <select value={address} onChange={onChange}>
        <option value="">Select a wallet address</option>
        {walletAddresses.map((addr) => (
          <option key={addr} value={addr}>
            {addr}
          </option>
        ))}
      </select>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
