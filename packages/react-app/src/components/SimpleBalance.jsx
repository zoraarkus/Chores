import React, { useState } from "react";
import { formatEther } from "@ethersproject/units";

/*

  <Balance
    address={selectedAddress}
    balance={selectedAddress}
    provider={props.provider}
    dollarMultiplier={props.price}
  />

*/


export default function SimpleBalance(props) {
  const [dollarMode, setDollarMode] = useState(true);
  const [balance, setBalance] = useState();

  let floatBalance = parseFloat("0.00");

  let usingBalance = balance;

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
  }else{
    displayBalance = "Ξ" + (floatBalance.toFixed(5));
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
