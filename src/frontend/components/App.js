 import './App.css';
import Navigation from './Navigtion';
import {ethers} from "ethers";
import { useState } from 'react';
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTaddress from "../contractsData/NFT-address.json";

import Home from './Home'
import Create from './Create'
import MyListedItems from './MyListedItems'
import MyPurchases from './MyPurchases'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

function App() {
  const [loading,setLoading]=useState(true);
  const [account,setAccount]=useState(null);
  const [nft,setNFT]=useState({});
  const [marketplace,setMarketplace]=useState({});


  const web3Handler=async () => {
    const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
    setAccount(accounts);
    const provider =new ethers.providers.Web3Provider(window.ethereum);
    
    const signer =provider.getSigner();
    loadContracts(signer);
  }
  const loadContracts=async (signer) => {
    const marketplace=new ethers.Contract(MarketplaceAddress.address,MarketplaceAbi.abi,signer);
    setMarketplace(marketplace);
    const nft=new ethers.Contract(NFTaddress.address,NFTAbi.abi,signer);
    console.log(nft)  ;
    
    setNFT(nft);    
    setLoading(false);
  }

  return (
    <BrowserRouter>
      <div className='App'>
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={ <Home marketplace={marketplace} nft={nft} />} />
            <Route path="/create" element={< Create marketplace={marketplace} nft={nft} />  } />
            <Route path="/my-listed-items" element={ <MyListedItems marketplace={marketplace} nft={nft}  account={account}/>  } />
            <Route path="/my-purchases" element={ <MyPurchases marketplace={marketplace} nft={nft}  account={account[0]}/> } />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
