import { useEffect, useState, useCallback } from "react";
import { connectWallet, getCurrentWalletConnected } from "../../utils/interact";

import "./default.scss";

import detectEthereumProvider from "@metamask/detect-provider";

const LayoutDefault = () => {
  const [walletAddress, setWalletAddress] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [status, setStatus] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [limit, setLimit] = useState(5);
  const [maxSupply, setMaxSupply] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [error, setError] = useState("");
  const [price, setPrice] = useState(0);

  const { ethers } = require("ethers");
  const contractABI = require("../../contract-abi.json");
  const contractAddress = "0x931d46a2a3e591a9fee23ccbf976a26532c1db87";

  useEffect(() => {
    async function fetchData() {
      const { address, status } = await getCurrentWalletConnected();
      setWalletAddress(address);
      setStatus(status);

      addWalletListener();
    }
    fetchData();
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();

    setStatus(walletResponse.status);
    setWalletAddress(walletResponse.address);
  };

  const calculatePrice = useCallback(async () => {
    const browserProvider = await detectEthereumProvider();
    const provider = new ethers.providers.Web3Provider(browserProvider);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider.getSigner()
    );
    const tokenPrice = await contract.cost();
    const newPrice = ethers.utils.formatEther(tokenPrice._hex);
    const conta = (newPrice * quantity).toFixed(3);

    setPrice(conta);
  }, [
    contractABI,
    ethers.Contract,
    ethers.providers.Web3Provider,
    ethers.utils,
    quantity,
  ]);

  useEffect(() => {
    calculatePrice();
  }, [quantity, calculatePrice]);

  useEffect(() => {
    if (walletAddress) {
      const getSupply = async () => {
        const browserProvider = await detectEthereumProvider();
        const provider = new ethers.providers.Web3Provider(browserProvider);
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider.getSigner()
        );
        const totalSupply = await contract.totalSupply();
        setTotalSupply(Number(totalSupply._hex));

        const supplyQuantity = await contract.maxSupply();

        setMaxSupply(Number(supplyQuantity._hex));
      };
      getSupply();
    }
  }, [
    walletAddress,
    contractAddress,
    ethers.providers.Web3Provider,
    ethers.Contract,
    contractABI,
  ]);

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 10000);
  }, [error]);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWalletAddress("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const mintTokens = async (mintAmount) => {
    const browserProvider = await detectEthereumProvider();
    const provider = new ethers.providers.Web3Provider(browserProvider);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider.getSigner()
    );
    const tokenPrice = await contract.cost();

    try {
      await contract.mint(mintAmount, {
        value: tokenPrice.mul(mintAmount),
      });
    } catch (e) {
      setError(e.code);
    }
  };

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      <main>
        <section className="section-down-header">
          <img
            src="https://mint.dininhoadventures.com/img/logo.svg"
            alt="Stranger Friends"
            className="image-down-header"
          ></img>
        </section>
        {walletAddress !== "" ? (
          <>
            <div className="connect-wallet" />
            <small className="wallet-address">{walletAddress}</small>

            <section className="AllTokens">
              {totalSupply === maxSupply ? (
                <p className="AllTokens--name">All tokens are Minted</p>
              ) : (
                <>
                  <div className="card-input">
                    <button
                      className="card-button-add-neg"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                      -
                    </button>
                    <div>{quantity}</div>
                    <button
                      className="card-button-add-neg"
                      onClick={() =>
                        quantity < limit && setQuantity(quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="AllTokens--name">Open to Mint</p>
                  <p className="AllTokens--name">Price: {price} ETH</p>
                </>
              )}
            </section>
            <section className="section--button-mint">
              <button
                className="button--mint"
                onClick={() => mintTokens(quantity)}
              >
                {totalSupply === maxSupply ? "Sold Out" : "Mint"}
              </button>
            </section>
            <section className="AllTokens">
              <p>Tokens Left</p>
              <p>
                {totalSupply}/{maxSupply}
              </p>
            </section>
            <section className="section--icons">
              <img src="img/etherscan.png" alt="Etherscan logo" />

              <img
                src="img/opensea.png"
                alt="Opensea logo"
                className="opensea-icon"
              />

              <img
                src="img/twitter.png"
                alt="Twitter logo"
                className="twitter-icon"
              />
            </section>
          </>
        ) : (
          <div className="connect-wallet">
            <button
              type="button"
              className="connect-wallet-button"
              onClick={() => {
                connectWalletPressed();
              }}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LayoutDefault;
