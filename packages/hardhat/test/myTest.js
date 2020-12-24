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
        console.log(myContract); 
    });

    describe("pauseContract()", function () {
      it("Should be able to set stopped==ture", async function () {
        const newParent = "";

        await myContract.pauseContract();
        expect(await myContract.stopped()).to.equal(true);
        const [owner, addr1, addr2] = await ethers.getSigners(); 
          console.log(owner); 
          console.log(addr1); 
          console.log(addr2); 
      });
    });
    describe("addParent()", function(){
        it ("should add a parent to the parents array", async function(){
        const [owner, addr1, addr2] = await ethers.getSigners(); 
        await myContract.addParent(addr1.address); 
        expect(await myContract.parents(addr1.address)).to.equal(true);
        }); 
    }); 
  });
});
