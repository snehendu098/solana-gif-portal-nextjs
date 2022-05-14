export const checkSolanaBrowser = async () => {
  const { solana } = window;
  if (solana) {
    console.log("browser compatible with solana");
    return true;
  } else if (!solana) {
    alert("Install A Solana Wallet");
    return false;
  }
};

export const isConnected = async (address) => {
  const { solana } = window;
  if (solana) {
    const res = await solana.connect({ onlyIfTrusted: true });
    if (res.publicKey.toString()) {
      if (address === true) return res?.publicKey?.toString();
      else return true;
    } else {
      if (address === true) return null;
      else return null;
    }
  }
};
