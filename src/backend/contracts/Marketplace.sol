// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";



contract Marketplace  is ReentrancyGuard{

    //state variables
    address payable immutable freeAccount;
    uint public immutable freePercent;
    uint public itemCount;


    struct Item{
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }
    

event Offered(
    uint256 itemId,
    address indexed nft,
    uint256 tokenId,
    uint256 price,
    address indexed seller
);

    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed buyer
    );
    

    mapping(uint=>Item)public items;


    constructor(uint _freePercent){
        freeAccount=payable(msg.sender);
        freePercent=_freePercent;
    }

    function makeItem(IERC721 _nft,uint _tokenId,uint _price) external nonReentrant{
        require(_price>0,"Price must be greater than zero");
        _nft.transferFrom(msg.sender,address(this),_tokenId);
        items[itemCount]=Item(itemCount,_nft,_tokenId,_price,payable(msg.sender),false);
        emit Offered(itemCount,address(_nft),_tokenId,_price,msg.sender);
        itemCount++;
    }
    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint totalPrice = getTotalPrice(_itemId);

        Item storage item=items[_itemId];
        require(_itemId>0 && _itemId<=itemCount,"Item does not exist");
        require(msg.value>=totalPrice,"not enogh ether to cover item price and market fee");
        require(!item.sold,"item is already sold");

        item.seller.transfer(totalPrice);
        freeAccount.transfer(totalPrice-item.price);
        item.sold=true;
        item.nft.transferFrom(address(this),msg.sender,item.tokenId);

        emit Bought(_itemId,address(item.nft),item.tokenId,item.price,msg.sender);

    }
    function getTotalPrice(uint _itemId) view public returns(uint){
        return (items[_itemId].price*(100*freePercent)/100);
    }
    
}  
