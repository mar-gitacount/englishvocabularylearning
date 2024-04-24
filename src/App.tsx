// import React, { Component, ChangeEvent, FormEvent } from 'react';
// @ts-ignore
import React, { useState, useEffect } from 'react';
import ItemData from './data/items.json';
import { checkDatabaseExists, openDatabase, addMemoData, checkKeyExists, searchItems, deleteRequest, upDateData } from './utils/indexDBUtils';
import fs from 'fs';

import logo from './logo.svg';
import './App.css';




function App() {
  const [items, setItems] = useState<string[]>([]);
  const [userchoiceitems, setUserchoiceItems] = useState<string[]>([]);
  const [flg, setFlag] = useState(false)
  const [Jsonitems, JsonsetItems] = useState<typeof ItemData>(ItemData);
  console.log(Jsonitems)

  // ?index.DBを利用する処理。
  const dbName = "englishdata";
  const version = 1;
  const objectID = 'myobjects'
  // ?選択した番号の関数
  const choiceNumber = (num: string) => {
    alert(num)
    flg ? setFlag(false) : setFlag(true)
    // setUserchoiceItems(JSON.parse(ItemData["200"]))
    // console.log(JSON.stringify(ItemData[num]))
    // const test = Jsonitems[num] as any
    Object.entries(ItemData).forEach(([key, value]) => {
      if (key == num) {
        console.log(ItemData["200"])
      }
      setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
    });

  }
  const flgchange = () => {
    flg ? setFlag(false) : setFlag(true)
  }
  // useEffectを使用してコンポーネントがマウントされたときに一度だけデータを処理する
  useEffect(() => {
    // インデックスキーはkeyにする。
    Object.entries(ItemData).forEach(([key, value]) => {
      const Indexkey = String(key)
      console.log(`${key}と${value}`)
      Object.entries(value).forEach(([k,item])=>{
        // 以下をローカルDBに入れる。
        console.log(`大本キー${key} キー${k} アイテム${item}`)
        openDatabase(dbName, version, objectID).then(db => {
          return addMemoData(dbName,version,Indexkey,k,item,objectID)
        })
      })
      
      // upDateData(dbName, version, data.dogdataid, data.id, datestring, objectID, indexdpadddata);

      console.log(key, "はキーを確認する");  // コンソールにキーを出力
      setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
    });

  }, []);  // 空

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!!
        </a>
        {flg ? <div>true</div> : <div>false</div>}
        {/*  */}

      </header>
      {/* <button onClick={flgchange}>Increment</button> */}
      <body>
        <div>以下から英語の問題を選択してください</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {Object.entries(Jsonitems).map(([key, value]) => (
            // <div key = {index}>{item}</div>
            <div>
              <button onClick={() => choiceNumber(key)}>{key}</button>
            </div>

            // <button key={index} onClick={() => choiceNumber(item)} style={{ width: "10%" }}>{item}</button>

            // 
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {items.map((item, index) => (
            // <div key = {index}>{item}</div>

            <button key={index} onClick={() => choiceNumber(item)} style={{ width: "10%" }}>{item}</button>

            // 
          ))}
        </div>
      </body>

    </div>
  );
}

export default App;
