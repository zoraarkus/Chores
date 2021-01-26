import React, { useState } from "react";
import { parseEther, formatEther  } from "@ethersproject/units";
import { usePoller } from "eth-hooks";
import { ethers } from "ethers";

export default function CurrentAuctionPrice(props) {
  const [dollarMode, setDollarMode] = useState(true);
  const [currentAuctionPrice, setAuctionPrice] = useState();

  const getAuctionPrice = async () => {
    if (props.readContracts) {
      try {
        const newAuctionPrice= await props.readContracts.Chores.getCurrentAuctionPrice(props.id);
        setAuctionPrice(newAuctionPrice);
        console.log("new auction price for: " + props.id +  "-->" + newAuctionPrice); 
      } catch (e) {
        console.log(e);
      }
    }
  };
  const spoof = ()=>{
    const duration = 255; 
    const now = Math.round(new Date().getTime()/1000); 
    const elapsed = now - props.startTime + 90; //***WHY adding 90 seconds? who the fuck knows... hardhat and react are on different times? 
    const totalPriceChange =  ethers.BigNumber.from(ethers.BigNumber.from(props.price).sub(ethers.BigNumber.from(props.price).div(10))); 
    const currentPriceChange = totalPriceChange.mul(elapsed).div(duration); 
    const currentPrice = ethers.BigNumber.from(props.price).div(10).add(currentPriceChange); 
    if (props.id == 1){
        console.log("tpc", formatEther(totalPriceChange)*props.dollarMultiplier, "cpc", formatEther(currentPriceChange)*props.dollarMultiplier); 
        console.log("now", now, "startTime ", props.startTime, "elapsed:", elapsed); 
    }
    //console.log("fe",formatEther(props.price))
    const newAuctionPrice = 
        now - props.startTime < 255
        ? 
        currentPrice
        :
        props.price 

    //console.log("spoof" + props.id + " " + newAuctionPrice)

    setAuctionPrice(newAuctionPrice);

  }

  usePoller(
    () => {
      spoof();
    },
    props.pollTime ? props.pollTime : 1999,
  );

  let floatBalance = parseFloat("0.00");
  let usingBalance = currentAuctionPrice;

  if (typeof props.balance !== "undefined") {
    usingBalance = props.balance;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toFixed(4);

  if (props.dollarMultiplier && dollarMode) {
    displayBalance = "$" + (floatBalance * props.dollarMultiplier).toFixed(2);
  }

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: props.size ? props.size : 24,
        padding: 8,
        cursor: "pointer",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {displayBalance}
    </span>
  );
}
