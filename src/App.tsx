// import React, { Component, ChangeEvent, FormEvent } from 'react';
// @ts-ignore
import React, { useState, useEffect } from 'react';
import ItemData from './data/items.json';
import { checkDatabaseExists, openDatabase, addMemoData, checkKeyExists, searchItems, deleteRequest, upDateData, getAllIndexes, getIndexItems } from './utils/indexDBUtils';
import fs from 'fs';

import logo from './logo.svg';
import './App.css';

interface Item {
  key: string;
  Indexkeyid: string;
  value: string;
  id: number;
}

type DisplayDataValue = {
  key: string;
  Indexkeyid: string;
  value: string;
  id: number;
}


function App() {
  const [items, setItems] = useState<string[]>([]);
  const [userchoiceitems, setUserchoiceItems] = useState<string[]>([]);
  const [flg, setFlag] = useState(false)
  // デフォルトで読みこむjsonファイル
  const [Jsonitems, JsonsetItems] = useState<typeof ItemData>(ItemData);
  const [loading, setLoading] = useState(false);  // ローディング状態管理用
  // const [displaydata, setDisplayData] = useState<any>({});
  const [displaydata, setDisplayData] = useState<DisplayDataValue[]>([]);
  const [Indexkeys, setIndexkeys] = useState<string[]>([]);
  // ?index.DBを利用する処理。
  const dbName = "englishdata";
  const version = 1;
  const objectID = 'myobjects'
  const IndexName = "keyIdindex"





  // ?選択した番号の関数
  const choiceNumber = async (num: string) => {
    alert(num)
    flg ? setFlag(false) : setFlag(true)
    setLoading(true);  // ローディング開始
    try {
      const result = await getIndexItems(dbName, objectID, version, IndexName, num)
      console.log(result, "結果確認")
      setDisplayData(result)


    } catch (error) {
      console.error("Error fetching data:", error);
    };
    setLoading(false);  // ローディング終了
    console.log(displaydata, "表示されるデータ")
  }
  const flgchange = () => {
    flg ? setFlag(false) : setFlag(true)
  }
  
  // useEffectを使用してコンポーネントがマウントされたときに一度だけデータを処理する
  useEffect(() => {
    // インデックスキーはkeyにする。
    Object.entries(ItemData).forEach(([key, value]) => {
      setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
      // 初めての場合、ここにいれる。
      setIndexkeys(prevItems => [...prevItems, key]);
    });

    Object.entries(ItemData).forEach(([key, value]) => {
      const Indexkey = String(key)
      // 検索するための検索キーを追加する。

      console.log(`${key}と${value}`)
      Object.entries(value).forEach(([k, item]) => {
        // 以下をローカルDBに入れる。
        // console.log(`大本キー${key} キー${k} アイテム${item}`)
        openDatabase(dbName, version, objectID).then(db => {
          return addMemoData(dbName, version, Indexkey, k, item, objectID)
        })
      })
      // upDateData(dbName, version, data.dogdataid, data.id, datestring, objectID, indexdpadddata);
      // setItems(prevItems => [...prevItems, key]); // 状態にキーを追加

      getAllIndexes(dbName, objectID, version)

    });

  }, []);  // 空

  // useEffect(() => {
  // console.log(Indexkeys,"はキーを確認する"); // 更新後の状態がここで確認できます
  // }, [Indexkeys]);
  useEffect(() => {
    // ?displaydataを取得する。
    console.log(typeof displaydata, "displayData updated");
  }, [displaydata]);


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
        {/* ここに値を入れ込む */}
        {/* ロードチェックする */}
        {loading ? 'Loading...' : 'データ取得完了しました'}
        <div>
          {/* {Object.keys(displaydata).map(key => (
        <p key={key}>{key}: {displaydata}</p>
      ))} */}
        </div>
       
        <div>以下から英語の問題を選択してください</div>
        {/* <div style={{ display: 'flex', justifyContent: 'center' }}>
          {Object.entries(Jsonitems).map(([key, value]) => (
            // <div key = {index}>{item}</div>
            <div>
              <button onClick={() => choiceNumber(key)}>{key}</button>
            </div>

            // <button key={index} onClick={() => choiceNumber(item)} style={{ width: "10%" }}>{item}</button>

            // 
          ))}
        </div> */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {/* ローカルDBのインデックスに変更する。 */}
          {Indexkeys.map((item, index) => (
            // <div key = {index}>{item}</div>
            <button key={index} onClick={() => choiceNumber(item)} style={{ width: "10%" }}>{item}</button>
            // 
          ))}
        </div>
        {Object.entries(displaydata).map(([key, value], index) => (
          <div key={index}>
            <span>{value.value}</span>
            <span>{value.key}</span>
          </div>
        ))}
      </body>

    </div>
  );
}

export default App;
