const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("lazy kids", function () {
  let myContract;

  describe("Chores", function () {
    it("Should deploy chores somehow", async function () {
      const Chores = await ethers.getContractFactory("Chores");
      myContract = await Chores.deploy();
    });

    describe("pauseContract()", function () {
      it("Should be able to set stopped==true", async function () {
        await myContract.pauseContract();
        expect(await myContract.stopped()).to.equal(true);
      });
    });
    describe("togglePauseContract()", function () {
      it("Should be able to set stopped==false", async function () {
        await myContract.togglePauseContract();
        expect(await myContract.stopped()).to.equal(false);
      });
    });
    describe("addParent()", function(){
        it ("should add a parent to the parents array", async function(){
        const [owner, addr1, addr2] = await ethers.getSigners(); 
        await myContract.addParent(addr1.address); 
        expect(await myContract.parents(addr1.address)).to.equal(true);
        }); 
    }); 
    describe("revokeParenthood()", function(){
        it ("should add and then revoke parent to the parents array", async function(){
        const [owner, addr1, addr2] = await ethers.getSigners(); 
        await myContract.addParent(addr1.address); 
        await myContract.revokeParenthood(addr1.address); 
        expect(await myContract.parents(addr1.address)).to.equal(false);
        }); 
    }); 
    describe("addAuction()", function(){
        it ("should create and auction", async function(){
        const [owner, addr1, addr2] = await ethers.getSigners(); 
        await myContract.createAuction("ASDF",{value: (10**18).toString()}); 
        //const newBalance = await props.provider.getBalance(props.address);
	//console.log(myContract); 
        expect(await myContract.auctionCount()).to.equal(1);
        }); 
    }); 
  });
});
