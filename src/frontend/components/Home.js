import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const loadMarketplaceItems = async () => {
    try {
        console.log("Starting to load marketplace items...");
        console.log("Marketplace contract:", marketplace);
        
        // Load all unsold items
        const itemCount = await marketplace.itemCount();
        console.log("Total item count:", itemCount.toString());
        
        let items = []
        for (let i = 1; i <= itemCount; i++) {
            try {
                const item = await marketplace.items(i);
                console.log(`Item ${i}:`, item);
                
                if (!item.sold) {
                    // get uri url from nft contract
                    const uri = await nft.tokenURI(item.tokenId);
                    console.log(`URI for token ${item.tokenId}:`, uri);
                    
                    // use uri to fetch the nft metadata stored on ipfs
                    const response = await fetch(uri);
                    const metadata = await response.json();
                    
                    // get total price of item (item price + fee)
                    const totalPrice = await marketplace.getTotalPrice(item.itemId);
                    
                    
                    items.push({
                        totalPrice,
                        itemId: item.itemId,
                        seller: item.seller,
                        name: metadata.name,
                        description: metadata.description,
                        image: metadata.image
                    });
                }
            } catch (error) {
                console.error(`Error processing item ${i}:`, error);
            }
        }
        console.log("Processed items:", items);
        setItems(items);
        setLoading(false);
    } catch (error) {
        console.error("Error in loadMarketplaceItems:", error);
        setLoading(false);  // Set loading to false even on error
    }
  }

    const buyMarketItem = async (item) => {
        await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
      loadMarketplaceItems();
    }


  useEffect(() => {
    loadMarketplaceItems()
  }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer> 
                    <div className='d-grid'>
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}

export default Home