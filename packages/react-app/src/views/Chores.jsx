/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import "antd/dist/antd.css";
import { Button, Typography, Table, Input } from "antd";
import { useQuery, gql } from '@apollo/client';
import { Address , EtherInput} from "../components";
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.min.css';
import fetch from 'isomorphic-fetch';
import DisplayVariable from "./DisplayVariable";
import FunctionForm from "../commponents/Contract/FunctionForm";
import { useContractLoader, useContractExistsAtAddress } from "../hooks";

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
    purposes(first: 25, orderBy: createdAt, orderDirection: desc) {
      id
      purpose
      createdAt
      sender {
        id
      }
    }
    senders {
      id
      address
      purposeCount
    }
  }
  `
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL)
  const { loading, data } = useQuery(EXAMPLE_GQL,{pollInterval: 2500});

  const purposeColumns = [
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Sender',
      key: 'id',
      render: (record) => <Address
                        value={record.sender.id}
                        ensProvider={props.mainnetProvider}
                        fontSize={16}
                      />
    },
    {
      title: 'createdAt',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: d => (new Date(d * 1000)).toISOString()
    },
    ];

  const [newPurpose, setNewPurpose] = useState("loading...");
  const [readContracts, mainnetProvider] = useState("loading...");


  const deployWarning = (
    <div style={{marginTop:8,padding:8}}>{"Warning: 🤔 Have you deployed your subgraph yet?"}</div>
  )

  return (
      <>
      <FunctionForm
        key={"FFcreateAuction"  }
        contractFunction={(fn.stateMutability === "view" || fn.stateMutability === "pure")?contract[fn.name]:contract.connect(signer)[fn.name]}
        functionInfo={fn}
        provider={provider}
        gasPrice={gasPrice}
        triggerRefresh={triggerRefresh}
      />
        <Address
            value={props.readContracts?props.readContracts.Chores.address:props.readContracts}
            ensProvider={mainnetProvider}
            fontSize={16}
        />

        <EtherInput
        price={props.price}
        value={100}
        />


          <div style={{width:780, margin: "auto", paddingBottom:64}}>

            <div style={{margin:32, textAlign:'right'}}>
              <Input onChange={(e)=>{setNewPurpose(e.target.value)}} />
              <Button onClick={()=>{
                console.log("newPurpose",newPurpose)
                /* look how you call setPurpose on your contract: */
                props.tx( props.writeContracts.Chores.createAuction(newPurpose) )
              }}>CreateAuction</Button>
            </div>

            <div style={{margin:32, textAlign:'right'}}>
              <Input onChange={(e)=>{setNewPurpose(e.target.value)}} />
              <Button onClick={()=>{
                console.log("newPurpose",newPurpose)
                /* look how you call setPurpose on your contract: */
                props.tx( props.writeContracts.YourContract.setPurpose(newPurpose) )
              }}>Set Purpose</Button>
            </div>

            {data?<Table dataSource={data.purposes} columns={purposeColumns} rowKey={"id"} />:<Typography>{(loading?"Loading...":deployWarning)}</Typography>}

            <div style={{margin:32, height:400, border:"1px solid #888888", textAlign:'left'}}>
              <GraphiQL fetcher={graphQLFetcher} docExplorerOpen={true} query={EXAMPLE_GRAPHQL}/>
            </div>

          </div>

          <div style={{padding:64}}>
          ...
          </div>
      </>
  );
}

export default Chores;
