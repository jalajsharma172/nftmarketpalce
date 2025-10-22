import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(false)
  const [purchases, setPurchases] = useState([])

    // console.log("marketplace contract ",marketplace);
    // console.log("nft contract ",nft);
    // console.log(account);
    

  const loadPurchasedItems = async () => {
    // Fetch purchased items from marketplace by querying Offered events with the buyer set as the user
    const filter = marketplace.filters.Bought(null, null, null, null, account);
    console.log("filter",filter);
    
    const results = await marketplace.queryFilter(filter)

    // Fetch metadata of each nft and add that to listedItem object.
    const purchases = await Promise.all(results.map(async i => {
        
        
      // fetch arguments from each result
      i = i.args;
      console.log(i);
      // get uri url from nft contract
      const uri = await nft.tokenURI(i.tokenId)
      // use uri to fetch the nft metadata stored on ipfs
      const response = await fetch(uri)
      const metadata = await response.json()
      // get total price of item (item price + fee)
      const totalPrice = await marketplace.getTotalPrice(i.itemId)
      // define listed item object
      let purchasedItem = {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image
      }
      return purchasedItem;
    }))
    setLoading(false)
    setPurchases(purchases)
  }

  useEffect(() => {
    if (account) {
        loadPurchasedItems()
    }
  }, []) 

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
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
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No purchases</h2>
          </main>
        )}
    </div>
  );
}