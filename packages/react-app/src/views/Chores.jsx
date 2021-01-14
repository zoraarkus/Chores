/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, yourLocalBalance } from "react";
import "antd/dist/antd.css";
import { Button, Typography, Table, Input } from "antd";
import { useQuery, gql } from '@apollo/client';
import { Address, EtherInput} from "../components";
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import FunctionForm from "../components/Contract/FunctionForm";
//import { Header, Account, Faucet, Ramp, Contract, GasGauge } from "./components";
import fetch from 'isomorphic-fetch';
import { parseEther, formatEther } from "@ethersproject/units";

  const highlight = { marginLeft: 4, marginRight: 8, backgroundColor: "#f9f9f9", padding: 4, borderRadius: 4, fontWeight: "bolder" }

function Chores(props) {

  function graphQLFetcher(graphQLParams) {
    return fetch(props.subgraphUri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
    peoples {
     id
     choresSold
    }
    chores(first: 25, orderBy: createdAt, orderDirection: desc) {
     id
     chore 
      price
      createdAt
      certifiedBy{id}
     buyer {id}
      seller{id}
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
      title: 'seller',
      key: 'id',
      render: (record) => <Address
                        value={record.seller.id}
                        fontSize={16}
                      />
    },
    {
      title: 'buyer',
      key: 'id',
      render: (record) => 
        record.buyer ?  <Address value={record.buyer.id} fontSize={16} />
                    : "no buyer yet"
    },
    {
      title: 'certifier',
      key: 'id',
      render: (record) =>
          <Address value={record.certifiedBy ? record.certifiedBy.id : ""} fontSize={16} />
    },
    {
      title: 'status',
      key: 'status',
      render: (record) => <div style={{ marginTop: 32 }}>
          {record.buyer?"already bought":"go nuts"}
            </div>
    },
    {
      title: 'price',
      key: 'price',
      render: (record) => <div style={{ marginTop: 32 }}>
            {formatEther(record.price?record.price:0)}
            </div>
    },
    {
      title: 'Action',
      key: 'asdf',
      dataIndex: '',
        render: (record) =>
        ! record.buyer 
            ?
            <Button onClick={()=>{
                props.tx( props.writeContracts.Chores.bid(record.id,{
                    value: record.price/10 //parseEther("0.0001")
            }))
              }}>Bid on this for {formatEther(record.price/10)}</Button>
            :
            <Button onClick={()=>{
                props.tx( props.writeContracts.Chores.certifyWork(record.id))
            }}>Certify </Button>
        
    },
    {
      title: 'Created At',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: d => (new Date(d * 1000)).toISOString()
    },
    ];
  const [newChore, createNewChore, bidOnChore] = useState("loading...");


  const deployWarning = (
    <div style={{marginTop:8,padding:8}}>{"Warning: 🤔 Have you deployed your subgraph yet?"}</div>
  )

  return (
      <>

          <div style={{padding:64}}>
          ...
          </div>
          <div style={{width:780, margin: "auto", paddingBottom:64}}>

            <div style={{margin:32, textAlign:'right'}}>
              <Input onChange={(e)=>{createNewChore(e.target.value)}} />
              <Button onClick={()=>{
                console.log("newChore",newChore)
                console.log("newAuctionEvent",props.newAuctionEvents)
                props.tx( props.writeContracts.Chores.createAuction(newChore,{
                    value: parseEther("0.001")
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
