import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { uploadFileToIPFS, uploadJsonToIPFS } from '../utils/ipfs'



 

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription]=useState('')

  const uploadToPinata = async (file) => {
 
    try {
      const formData = new FormData();
      formData.append('file', file);
        const ipfsHash = await uploadFileToIPFS(file)
        return ipfsHash
    } catch (error) {
      console.log("Error uploading file to Pinata: ", error);
      throw error;
    }
  };

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    
    
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
          const ipfsHash = await uploadFileToIPFS(file)
        setImage(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      } catch (error) {
        console.log("ipfs image upload error: ", error.message)
      }
    }
  }
  const mintThenList = async (ipfsHash) => {
    const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    try {
      // mint nft and get transaction
      console.log("Minting NFT...");
      const mintTx = await nft.mint(uri);
      console.log("Waiting for transaction...");
      const tx = await mintTx.wait();
      
      // Get token ID using tokenCount since we're incrementing it in the contract
      const tokenId = await nft.tokenCount();
      console.log("Minted NFT with ID:", tokenId.toString());
      
      console.log("Approving marketplace...");
      // approve marketplace to spend nft
      const approvalTx = await nft.setApprovalForAll(marketplace.address, true);
      await approvalTx.wait();
      
      console.log("Listing NFT...");
      // add nft to marketplace
      const listingPrice = ethers.utils.parseEther(price.toString());
      const listingTx = await marketplace.makeItem(nft.address, tokenId, listingPrice);
      await listingTx.wait();
      
      console.log("NFT Listed successfully!");
    } catch (error) {
      console.error("Error in mintThenList:", error);
      throw error;
    }
  }

  const createNFT = async () => {
    if (!image || !price || !name || !description) return
    try {
      const metadata = JSON.stringify({
        name,
        description,
        image,
        price
      });

      const blob = new Blob([metadata], { type: 'application/json' });
      const file = new File([blob], 'metadata.json');
        const ipfsHash = await uploadJsonToIPFS(JSON.parse(metadata))
      mintThenList(ipfsHash)
    } catch (error) {
      console.log("ipfs uri upload error: ", error)
    }
  }



  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create;