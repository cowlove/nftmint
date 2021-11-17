import { useEffect, useState } from "react";
import { connectWallet, mintNFT, getCurrentWalletConnected } from "./utils/interact.js";

require('dotenv').config();

const contractABI = require('./c2-abi.json')
const contractAddress = "0x6EdB1622dFd2c1fBa4484A1f2F5cD6E071d908Db"
let baseCost = 0;

const Minter = (props) => {

  //State variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [cost, setCost] = useState("");
  const [slider, setSlider] = useState("");

  useEffect(async () => {
    setSlider(0);
    const { address, status } = await getCurrentWalletConnected();
    setWallet(address)
    setStatus(status);
    setPreviewImage("");
    updateBaseCost();
    addWalletListener();

  }, []);

  const updateBaseCost = async () => {
      baseCost = await getCurrentCost();
      setCost(baseCost);
  }

  const getCurrentCost = async () => {
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);

    let contract = await new web3.eth.Contract(contractABI, contractAddress);
    contract.setProvider(web3.currentProvider);

    return contract.methods.getTokenCost().call();
  }
  
  const getCurrentTokenID = async () => {
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);

    let contract = await new web3.eth.Contract(contractABI, contractAddress);
    contract.setProvider(web3.currentProvider);

    return contract.methods.currentTokenId().call();
  }

  const onSliderChange = async (v) => {
      setSlider(v);
      setCost(baseCost * (1.0 + slider/25));
      setStatus("Ready to mint your NFT!");
  }

  const mintNFT = async () => {
    setPreviewImage("");
    
    //const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
    //const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
    //const web3 = createAlchemyWeb3(alchemyKey);

    setStatus("Connecting to the NFT smart contract...");
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);

    let contract = await new web3.eth.Contract(contractABI, contractAddress);
    contract.setProvider(web3.currentProvider);

    setStatus("Reserving an NFT token spot for you...");
    let id = 0;
    try { 
        id = await getCurrentTokenID();
        await updateBaseCost();
    } catch (error) {
        return {
          success: false,
          status: "😥 Something went wrong! (Please make sure youre on a rinkeby test chain.) Error: " + error.message
      }
  
    }

    setStatus("Generating the art...");
    let r = await fetch("/api/greeting?cost=" + cost + "&boost=" + slider + "&number=" + (parseInt(id) + 1));
    let j = await r.json();
    const tokenURL = j.token;
    const imageURL = j.image;

    //setPreviewImage(imageURL);

    setStatus("Minting to the blockchain, please approve the wallet transaction!");
    //set up your Ethereum transaction
    const transactionParameters = {
      to: contractAddress, // Required except during contract publications.
      from: window.ethereum.selectedAddress, // must match user's active address.
      "value": "" + Math.round(cost),
      'data': contract.methods.mintTo(window.ethereum.selectedAddress, tokenURL)
        .encodeABI()//make call to NFT smart contract 
    };

    //sign the transaction via Metamask
    try {
      const txHash = await window.ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
        setPreviewImage(imageURL);
        return {
          success: true,
          status: "✅ Congratulations, here is your blockhain transaction!\nhttps://rinkeby.etherscan.io/tx/" + txHash
      }
    } catch (error) {
      return {
        success: false,
        status: "😥 Something went wrong: " + error.message
      }
    }
  }

  const connectWalletPressed = async () => { //TODO: implement
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Use the slider for a rarity boost!");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }


  const onMintPressed = async () => {
    const { status } = await mintNFT();
    setStatus(status);
  };

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Wallet Connected: " +
          String(walletAddress).substring(0, 4) +
          "..." +
          String(walletAddress).substring(39)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">Jim's NFT Minter</h1>
      <h2>Current NFT cost is {(cost/100000).toFixed(5)} ETH</h2>

      <p>
      </p>RARITY BOOST: <input type="range" min="0" max="100" value={slider}
        onChange={e => onSliderChange(e.target.value)}
     />
      <button id="mintButton" onClick={onMintPressed}>
        Mint NFT
      </button>
      {previewImage != ""  && (<center><img src={previewImage} 
        style={{borderWidth:200,borderColor:'#000000',width:200,height:200,borderRadius:100}}></img></center>) }
      <p id="status">
        {status}
      </p>
      <br></br><br></br><br></br><p><small><a href="https://testnets.opensea.io/collection/juicy-fruit-collection-six">View collection on OpenSea.</a></small></p>
    </div>
  );
};


export default Minter;
