/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect,  yourLocalBalance } from "react";
import "antd/dist/antd.css";
import { Button, Typography, Table, Input } from "antd";
import { useQuery, gql } from '@apollo/client';
import { Address, EtherInput} from "../components";
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import FunctionForm from "../components/Contract/FunctionForm";
import SimpleBalance from "../components/SimpleBalance";
import Account from "../components/Account";
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
    paused
    contractStatus
    }
    peoples {
     id
     choresSold
    }
    chores(first: 25, orderBy: createdAt, orderDirection: desc) {
     id
     chore 
      price
    bid
      createdAt
      certifiedBy{id}
     buyer {id}
      seller{id}
	choreStatus
	sweeper
	transactionHash
    }
  }
  `
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL)
  const { loading, data } = useQuery(EXAMPLE_GQL,{pollInterval: 2500});
  const choreColumns= [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Chore',
      dataIndex: 'chore',
      key: 'chore',
    },
    {
      title: 'status',
      key: 'choreStatus',
      render: (record) => <div style={{  }}>
	{ record.choreStatus }
            </div>
    },
    {
      title: 'price: max/bid',
      key: 'final price',
      render: (record) => 
	<div style={{ marginTop: 5 }}>
	    <SimpleBalance
		size={14}
		balance={record.price}
		dollarMultiplier={props.price}
		/>
	{! record.buyer ? 
	    <CurrentAuctionPrice
		id={record.id}
		readContracts={props.readContracts}
		dollarMultiplier={props.price}
		startTime={record.createdAt }
		pollTime={1000}
		price={record.price}
		size={14}
		/>
	:
	    <SimpleBalance
		size={14}
		balance={record.bid}
		dollarMultiplier={props.price}
		/>
	}

	</div>
    },
    {
      title: 'buyer',
      key: 'id',
      render: (record) => 
        record.buyer ?  
            <Address value={record.buyer.id} fontSize={15} />
                    
        : 
	<div>
            <Button onClick={()=>{
		console.log("record.price", record.price); 
		var p = parseEther(formatEther(record.price)).div(10)
		props.tx( props.writeContracts.Chores.bid(record.id,{
		    value: p 
		}))
              }}>Bid 
            </Button>
		
	    <CurrentAuctionPrice
		size={14}
		id={record.id}
		readContracts={props.readContracts}
		dollarMultiplier={props.price}
		startTime={record.createdAt }
		pollTime={1000}
		price={ethers.BigNumber.from(record.price).div(10)}
		/>
		<div style={{fontSize : 5 }}>
			*refundable 10% bond paid back on certification
		</div>
	</div>
    },
    {
      title: 'certifier',
      key: 'id',
      render: (record) =>
        record.choreStatus == "bid" ?
            <Button onClick={()=>{
                props.tx( props.writeContracts.Chores.certifyWork(record.id))
            }}>Certify </Button>
        : record.choreStatus == "certified" ?
            <Address value={record.certifiedBy.id} fontSize={15} />
        : ""
    },
    {
      title: 'seller',
      key: 'id',
      render: (record) => <Address
                        value={record.seller.id}
                        fontSize={15}
                      />
    },
    {
      title: 'Created At',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: d => (new Date(d * 1000)).toISOString()
    },
    ];

  const [newChoreAmount,  setNewChoreAmount] = useState(0);
  const [newChore, createNewChore] = useState("loading...");


  const deployWarning = (
    <div style={{marginTop:8,padding:8}}>{"Warning: 🤔 Have you deployed your subgraph yet?"}</div>
  )

  return (
      <>

          <div style={{padding:64}}>
        <div style={{ float: "left" }}>
            <Account
            address={props.writeContracts?props.writeContracts.Chores.address:"loading...."}
            localProvider={props.localProvider}
            injectedProvider={props.userProvider}
            mainnetProvider={props.mainnetProvider}
            price={0}
            />
            {props.writeContracts.Chores.name}
        </div>
          ...
          </div>
          <div style={{width:780, margin: "auto", paddingBottom:64}}>

            <div style={{margin:32, textAlign:'right'}}>
              <Input onChange={(e)=>{createNewChore(e.target.value)}} />
		<EtherInput
		onChange={value=>{setNewChoreAmount(value)}}
		price={props.price}
		value={newChoreAmount}
		/>
              <Button onClick={()=>{
                console.log("setAmount",newChoreAmount)
                console.log("parseEther:", parseEther(newChoreAmount.toString()))
                props.tx( props.writeContracts.Chores.createAuction(newChore,{
                    value: (parseEther(newChoreAmount.toString()))
            }))
              }}>New Chore</Button>
            </div>


            {data?<Table dataSource={data.chores} columns={choreColumns} rowKey={"id"} />:<Typography>{(loading?"Loading...":deployWarning)}</Typography>}

          </div>

          <div style={{padding:64}}>
          ...
          </div>
            <div style={{margin:0, height:800, border:"1px solid #888888", textAlign:'left'}}>
              <GraphiQL fetcher={graphQLFetcher} docExplorerOpen={true} query={EXAMPLE_GRAPHQL}/>
            </div>
      </>
  );
}

export default Chores;
