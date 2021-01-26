/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect,  yourLocalBalance } from "react";
import "antd/dist/antd.css";
import { Button, Typography, Table, Input } from "antd";
import { useQuery, gql } from '@apollo/client';
import { Address, EtherInput} from "../components";
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import FunctionForm from "../components/Contract/FunctionForm";
import Account from "../components/Account";
import SimpleBalance from "../components/SimpleBalance";
import AddressInput from "../components/AddressInput";
import CurrentAuctionPrice from "../components/CurrentAuctionPrice";
//import { Header, Account, Faucet, Ramp, Contract, GasGauge } from "./components";
import fetch from 'isomorphic-fetch';
import { parseUnits, parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { usePoller } from "eth-hooks";


const highlight = { marginLeft: 4, marginRight: 8, backgroundColor: "#f9f9f9", padding: 4, borderRadius: 4, fontWeight: "bolder" }

function Chores(props) {

  function graphQLFetcher(graphQLParams) {
    console.log(props.subgraphUri); 
    return fetch(props.subgraphUri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
    contracts{
	id
	contractStatus
	paused
    }
    peoples {
	id
	address
	isParent
	amtChoresSold
	choresSold {
	    id
	}
    }
  }
  `
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL)
  const { loading, data } = useQuery(EXAMPLE_GQL,{pollInterval: 2500});
  const peopleColumns= [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'is parent?',
      key: 'isParent',
      render: (record) => 
	<div style={{  }}> 
	    { record.isParent ? "true" : "false" 
		
	} </div>
    },
    {
      title: 'chores sold',
      key: 'amtChoresSold',
      render: (record) => 
	<div style={{  }}> { record.amtChoresSold} </div>
    }
    ];

  const [newChoreAmount,  setNewChoreAmount] = useState(0);
  const [addedParent, addParent] = useState();
  const [revokedParent, revokeParent] = useState();
  const [paused, pauseContract] = useState("loading...");
  const [rugged, rugPull] = useState("loading...");


  const deployWarning = (
    <div style={{marginTop:8,padding:8}}>{"Warning: 🤔 Have you deployed your subgraph yet?"}</div>
  )

  return (
      <>
      <div style={{border:"1px solid #cccccc", padding:16, width:800, margin:"auto",marginTop:64}}>
            <Account
	    style={{width:800}}
            address={props.writeContracts?props.writeContracts.Chores.address:0x0}
            localProvider={props.localProvider}
            injectedProvider={props.userProvider}
            mainnetProvider={props.mainnetProvider}
            price={0}
            />
            {"Chores:ADMIN"}


    <div style={{ width:400,marginTop:8,border:"1px solid #cccccc",padding:8}}>
                <AddressInput
                ensProvider={props.ensProvider}
                placeholder="got married? add new Parents here"
                value={addedParent}
                onChange={addParent}
                />
              <Button 
		onClick={()=>{
                console.log("addParent",addedParent)
                props.tx( props.writeContracts.Chores.addParent(addedParent,{ })) 
            }}>Add Parent</Button>
          </div>

	<div style={{ width:400,marginTop:8,border:"1px solid #cccccc",padding:8}}>
                <AddressInput
                ensProvider={props.ensProvider}
                placeholder="revoke parenthood here!"
                value={revokedParent}
                onChange={revokeParent}
                />
              <Button onClick={()=>{
                console.log("addParent",addedParent)
                props.tx( props.writeContracts.Chores.revokeParenthood(revokedParent,{ })) 
            }}>Revoke Parent</Button>

	</div>
	<div style={{ width:400,marginTop:8,border:"1px solid #cccccc",padding:8}}>
              <Button onClick={()=>{
                props.tx( props.writeContracts.Chores.togglePauseContract()) 
            }}>Pause/Unpause this contract</Button>
	</div>
	<div style={{ width:400,marginTop:8,border:"1px solid #cccccc",padding:8}}>
              <Button onClick={()=>{
                props.tx( props.writeContracts.Chores.rugPull()) 
            }}>rugpull this bitch</Button>
	</div>
<br/>
          <div style={{width:780, margin: "auto", paddingBottom:64}}>

            {data?<Table dataSource={data.peoples} columns={peopleColumns} rowKey={"id"} />:<Typography>{(loading?"Loading...":deployWarning)}</Typography>}

          </div>

          <div style={{padding:64}}>
          ...
          </div>
            <div style={{margin:0, height:800, border:"1px solid #888888", textAlign:'left'}}>
              <GraphiQL fetcher={graphQLFetcher} docExplorerOpen={true} query={EXAMPLE_GRAPHQL}/>
            </div>
        </div>
      </>
  );
}

export default Chores;
