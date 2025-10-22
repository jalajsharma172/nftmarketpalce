// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
 
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
 
contract NFT is ERC721URIStorage {
    uint public tokenCount;
 
    constructor() ERC721 ("NFT_Contract", "NFT") {}
 
    function mint(string memory tokenURI) public payable returns (uint) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, tokenURI);//Sets _tokenURI as the tokenURI of tokenId.

        return tokenCount;
    }
}
 