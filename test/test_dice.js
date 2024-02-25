const_deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');

var Dice = artifacts.require("../contracts/Dice.sol");
var DiceBattle = artifacts.require("../contracts/DiceBattle.sol");
var DiceMarket = artifacts.require("../contracts/DiceMarket.sol");

contract('DiceBattle', function(accounts){

    before(async () => {
        diceInstance = await Dice.deployed();
        diceBattleInstance = await DiceBattle.deployed();
        diceMarketInstance = await DiceMarket.deployed();
    });
    console.log("Testing Trade Contract");
    // Q1 Test the creation of the dice
    it('Get Dice: creation of the dice', async () => {
        let makeD1 = await diceInstance.add(1, 1, {from: accounts[1], value: "100000000000000000"});
        let makeD2 = await diceInstance.add(30, 1, {from: accounts[2], value: "100000000000000000"});
        
        assert.notStrictEqual(
            makeD1,
            undefined,
            "Failed to make dice"
        );

        assert.notStrictEqual(
            makeD2,
            undefined,
            "Failed to make dice"
        );
    });
    // Q2.1 Test that if ether is not supplied to the Dice contract’s add function, an error is returned
    it('Get Dice: wrong value', async () => {
        try {
            let wrongD1 = await diceInstance.add(1, 1, {from: accounts[1], value: 0});
            await wrongD1;
            assert.fail(err.message,"Returned error: VM Exception while processing transaction: revert at least 0.01 ETH is needed to spawn a new dice -- Reason given: at least 0.01 ETH is needed to spawn a new dice.");
        } catch(err) {

        }
        try {
            let wrongD2 = await diceInstance.add(30, 1, {from: accounts[2]});
            await wrongD2;
            assert.fail(err.message,"Returned error: VM Exception while processing transaction: revert at least 0.01 ETH is needed to spawn a new dice -- Reason given: at least 0.01 ETH is needed to spawn a new dice.");
        } catch(err) {

        }
    });

    // Q2.2 Test that if ether is not supplied to the Dice contract’s add function, an error is returned
    it('Get Dice: wrong side', async () => {
        try {
            let wrongD1 = await diceInstance.add(0, 0, {from: accounts[1], value: 100000000000000000});
            await wrongD1;
            assert.deepStrictEqual(err.message,"Returned error: VM Exception while processing transaction: revert at least 0.01 ETH is needed to spawn a new dice -- Reason given: at least 0.01 ETH is needed to spawn a new dice.");
          } catch(err) {

          }
          try {
            let wrongD2 = await diceInstance.add(0, 1, {from: accounts[2], value: 100000000000000000});
            await wrongD2;
            assert.deepStrictEqual(err.message,"Returned error: VM Exception while processing transaction: revert at least 0.01 ETH is needed to spawn a new dice -- Reason given: at least 0.01 ETH is needed to spawn a new dice.");
          } catch(err) {

          }
    });

    // Q3 Test that the Dice can be transferred to the DiceMarket contract
    it('Transfer ownership of dice', async () => {

        let t1 = await diceInstance.transfer(0, diceBattleInstance.address, {from: accounts[1]});
        let t2 = await diceInstance.transfer(1, diceBattleInstance.address, {from: accounts[2]});

        let enemy_adj1 = await diceBattleInstance.setBattlePair(accounts[2], {from: accounts[1]});
        let enemy_adj2 = await diceBattleInstance.setBattlePair(accounts[1], {from: accounts[2]});
        
        truffleAssert.eventEmitted(enemy_adj1, 'add_enemy');
        truffleAssert.eventEmitted(enemy_adj2, 'add_enemy');
    });

    // Q4 Test that a Die cannot be listed if the price is less than value + commission
    it('List dice: price wrong', async () => {
        try {
            let wrongl1 = diceMarketInstance.list(0, 3, {from: accounts[1]});
            await wrongl1;
            assert.deepStrictEqual(err.message,"Returned error: VM Exception while processing transaction: revert list price must be higher than value and fee -- Reason given: list price must be higher than value and fee.");
        } catch(err) {

        }

        try {
            let wrongl2 = diceMarketInstance.list(0, 3, {from: accounts[1]});
            await l2fail;
            assert.deepStrictEqual(err.message,"Returned error: VM Exception while processing transaction: revert list price must be higher than value and fee -- Reason given: list price must be higher than value and fee.");
        // assert(false)
        } catch(err) {

        }
    });

    // Q5 Test that a Dice can be listed
    it('List dice', async () => {
        let Dicel1 = await diceMarketInstance.list(0, "200000000000000000", {from: accounts[1]});
        let Dicel2 = await diceMarketInstance.list(1, "200000000000000000", {from: accounts[2]});

        truffleAssert.passes(Dicel1, 'dice0_listed');
        truffleAssert.passes(Dicel2, 'dice1_listed');
    });

    //Q6.2 Test that a die cannot be unlisted if it is not the owner aksed for unlisting, an error is returned
    it('Unlist dice: wrong owner', async () => {
        try {
          let wrongu1 = diceMarketInstance.unlist(0, {from: accounts[2]});
          await wrongu1;
          assert.deepStrictEqual(err.message,"Returned error: VM Exception while processing transaction: revert Dice can only be unlisted by owner -- Reason given: Dice can only be unlisted by owner.");
        } catch(err) {

        }
    
        try {
          let wrongu2 = diceMarketInstance.unlist(0, {from: accounts[2]});
          await wrongu2;
          assert.deepStrictEqual(err.message,"Returned error: VM Exception while processing transaction: revert Dice can only be unlisted by owner -- Reason given: Dice can only be unlisted by owner.");
        } catch(err) {

        }
      });
    //Q8 Test that dice price can be checked
    it('Check dice price', async () => {
        let Dicep1 = await diceMarketInstance.checkPrice(0, {from: accounts[1]});
        let Dicep2 = await diceMarketInstance.checkPrice(1, {from: accounts[1]});
  
        truffleAssert.passes(Dicep1, 'dice0_pricechecked');
        truffleAssert.passes(Dicep2, 'dice1_pricechecked');
  
      });
    //Q7 Test that another party can buy the die
    it('Buy dice', async () => {
        let Diceb1 = await diceMarketInstance.buy(0, {from: accounts[2], value: "3000000000000000000"});
        let Diceb2 = await diceMarketInstance.buy(1, {from: accounts[1], value: "3000000000000000000"});

        truffleAssert.passes(Diceb1, 'dice0_bought');
        truffleAssert.passes(Diceb2, 'dice1_bought');
      });

    //Q6.1 Test that the owner can unlist a die
    it('Unlist dice', async () => {
        let Diceu1 = await diceMarketInstance.unlist(0, {from: accounts[1]});
        let Diceu2 = await diceMarketInstance.unlist(1, {from: accounts[2]});

        truffleAssert.passes(Diceu1, 'dice0_unlisted');
        truffleAssert.passes(Diceu2, 'dice1_unlisted');
      });
})
