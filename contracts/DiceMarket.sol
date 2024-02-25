pragma solidity ^0.8.0;

import "./Dice.sol";

contract DiceMarket {
    address public owner;
    uint256 public comFee = 0;
    //uint256 public saleId = 0;
    Dice diceContract;

    mapping(uint256 => uint256) public diceSaleList;

    //construct the contract
    constructor(uint256 _commissionFee, Dice diceAddress) {
        owner = msg.sender;
        comFee = _commissionFee;
        //import the dices
        diceContract = diceAddress;
    }

    //diceContract.dices[diceId]
    //modifier to ensure a function is callable only by its owner    
    //modifier validPrice(uint256 diceId, uint256 price) {
    //    require(price >= comFee + diceContract.getDiceValue(diceId), "The price is less than comission fee plus dice value.");
    //   _;
    //}
    
    modifier isOnSale(uint256 diceId) {
        require(diceSaleList[diceId] != 0, "The dice is not on sale.");
        _;
    }

    //list a dice for sale    
    function list(uint256 diceId, uint256 price) public {
        //require(price >= comFee + diceContract.getDiceValue(diceId), "The price is less than comission fee plus dice value.");
        require(msg.sender == diceContract.getPrevOwner(diceId), "The msg.sender should be previous owner.");
        diceSaleList[diceId] = price;
    }
    //unlist a dice
    function unlist(uint256 diceId) public isOnSale(diceId) {
        //require(diceSaleList[diceId] != 0, "The dice is not on sale.");
        require(msg.sender == diceContract.getPrevOwner(diceId), "The msg.sender should be previous owner.");
        diceSaleList[diceId] = 0;
    }

    //get the price of the dice
    function checkPrice(uint256 diceId) public view isOnSale(diceId) returns (uint256) {
        return diceSaleList[diceId];
    }

    //get number of sides of dice    
    function buy(uint256 diceId) public payable isOnSale(diceId) {
        ////////////////////////
        // Q1: Who is the buyer? Is the buyer the sender? And is the sender here different from the sender in the 
        // constructor? Like one is the msg sender for the construct function, one is for the buy function.
        ////////////////////////
        //buyer: payable(msg.sender);
        //seller = payable(diceContract.dices[diceId].prevOwner);
        //require(diceSaleList[diceId] != 0, "The dice is not on sale.");
        require(diceSaleList[diceId] != 0, "The dice is not on sale.");
        require(msg.value >= diceSaleList[diceId] + comFee, "You do not pay enough money.");
        address payable seller = payable(diceContract.getPrevOwner(diceId));
        seller.transfer(diceSaleList[diceId] - comFee);
        diceContract.transfer(diceId, msg.sender);
        //unlist(diceId);
        
    }
    
    function getContractOwner() public returns (address) {
        return owner;
    }
}
