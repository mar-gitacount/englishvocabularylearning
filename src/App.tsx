// import React, { Component, ChangeEvent, FormEvent } from 'react';
// @ts-ignore
import React, { useState, useEffect } from 'react';
import ItemData from './data/items.json';
import { checkDatabaseExists, openDatabase, addMemoData, checkKeyExists, searchItems, deleteRequest, upDateData, getAllIndexes, getIndexItems, openDatabasenext } from './utils/indexDBUtils';
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
  // 問題を選択した場合、以下にデータを入れ込む。
  const [rondomdata, setRondomData] = useState<DisplayDataValue[]>([]);
  const [Indexkeys, setIndexkeys] = useState<string[]>([]);
  const [question, setQestion] = useState<string[]>([]);
 
  // フィルター管理する定数
  const [filteredData, setFilteredData] = useState<DisplayDataValue[]>([]);

  const [initialized, setInitialized] = useState(false); // 初期化完了をトラッキングする状態

  const [questionchoice, setQestionchoice] = useState("");

  // ?index.DBを利用する処理。
  const dbName = "englishdata";
  const version = 1;
  const objectID = 'myobjects'
  const IndexName = "keyIdindex"



  // ?ランダムにデータを抽出する関数
  const getRandom = async (array: any) => {
    // alert(JSON.stringify(array[Math.floor(Math.random() * array.length)].id))
    const itemid = array[Math.floor(Math.random() * array.length)].id
    // flg ? setFlag(false) : setFlag(true)
    setFlag(false)
    // alert(item)
    // ランダムに選択した値のidを選択する。
    // setQestionchoice(array[Math.floor(Math.random() * array.length)].id)
    setQestionchoice(String(array[Math.floor(Math.random() * array.length)].id));
    // const finditem = rondomdata.find(item => item.id === itemid) 
    const finditem: DisplayDataValue[] = rondomdata
      .map(item => (item.id === itemid ? item : undefined))
      .filter((item): item is DisplayDataValue => item !== undefined);

    setFilteredData(finditem)
    console.log(finditem, "選ばれたアイテム")

    // setQestionchoice(item)
    // alert(questionchoice)
    return array[Math.floor(Math.random() * array.length)].id;
  }

  const filterDataById = (id: string | number) => {
    const filtered = rondomdata.filter((data) => data.id === id);
    const finditem = rondomdata.find(item => item.id === Number(id))
    console.log(finditem, "フィルター結果")
    setFilteredData(filtered);
  };





  //  ?ランダムデータにデータ一覧を代入する関数
  const rondomchoiceItemInset = () => {
    // alert("データ")
    setRondomData(displaydata)

  }
  // ?選択した番号の関数　
  const choiceNumber = async (num: string) => {
    // alert(num)
    // flg ? setFlag(false) : setFlag(true)
    setLoading(true);  // ローディング開始
    try {
      const result = await getIndexItems(dbName, objectID, version, IndexName, num)
      console.log(result, "結果確認")
      // ?問題配列に代入する。
      setRondomData(displaydata)
      // setRondomData([])
      setDisplayData(result)
    } catch (error) {
      console.error("Error fetching data:", error);
    };
    setLoading(false);  // ローディング終了
    console.log(displaydata, "表示されるデータ")

  }

  const removeItemById = async (id: number) => {
    const index = rondomdata.findIndex((item) => item.id === id);
    if (index !== -1) {
      const updatedData = [
        ...rondomdata.slice(0, index),
        ...rondomdata.slice(index + 1),
      ];
      await setRondomData(updatedData);
    }
    alert(rondomdata.length)
    // alert(id)

    rondomdata.length === 0 ? alert("アイテムがなくなりました"): getRandom(rondomdata)
  };




  const flgchange = () => {
    flg ? setFlag(false) : setFlag(true)
  }

  const handleIsNew = (isNew: boolean) => {
    console.log(`データベースは新規に作成されましたか？ ${isNew}`);
    if (isNew) {

    }
  }
  // useEffectを使用してコンポーネントがマウントされたときに一度だけデータを処理する
  useEffect(() => {
    // インデックスキーはkeyにする。
    // jsonファイルからのデータをいれる

    // INDEXDB確認フェッチメソッド
    async function initializeDatabase() {
      try {
        const { db, isNew } = await openDatabasenext(dbName, version, objectID);
        if (isNew) {
          console.log('新規にデータベースが作成されました。');
          // ここでjsonファイルをいれる
          // 新規データベースに対する初期化処理など

          // JSONのデータをINDEXDBに入れる。
          // jsonデータのおおまかなループ。
          Object.entries(ItemData).forEach(([key, value]) => {
            const Indexkey = String(key)
            // 検索するための検索キーを追加する。
            console.log(`${key}と${value}`)
            // ここでは単一データのループが実行されている。
            Object.entries(value).forEach(([k, item]) => {
              // 以下をローカルDBに入れる。
              // console.log(`大本キー${key} キー${k} アイテム${item}`)
              // ?ここでアイテム数を追加している。
              return addMemoData(dbName, version, Indexkey, k, item, objectID)
            })
            // upDateData(dbName, version, data.dogdataid, data.id, datestring, objectID, indexdpadddata);
            // setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
            getAllIndexes(dbName, objectID, version)

          });
        } else {
          console.log('データベースは既に存在しています。');
        }
        // データベース操作のコード
      } catch (error) {
        console.error('データベースの開けませんでした:', error);
      }
    }

    Object.entries(ItemData).forEach(([key, value]) => {
      setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
      // 初めての場合、ここにいれる。
      setIndexkeys(prevItems => [...prevItems, key]);
    });
    // INDEXDBを初期化
    initializeDatabase()


  }, []);  // 空

  // useEffect(() => {
  // console.log(Indexkeys,"はキーを確認する"); // 更新後の状態がここで確認できます
  // }, [Indexkeys]);
  useEffect(() => {
    // ?displaydataを取得する。
    console.log(typeof displaydata, "displayData updated");
    setRondomData(displaydata)
  }, [displaydata]);

  useEffect(() => {
    if (initialized) { // 初期化が完了している場合のみアラートを表示
      if (questionchoice !== null) {
        // alert(`${questionchoice} はクエスチョンのアラート`);
      }
    } else {
      setInitialized(true); // コンポーネントの初回レンダリング後にinitializedをtrueに設定
    }
  }, [questionchoice]);
  return (
    <div className="App">
      <header className="App-header">
        
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <img src="/teacher_english_man_casual.png" className="App-logo" alt="Teacher" />
        <div>シンプルな英単語アプリ</div>
        {/* <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p> */}
        {/* <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!!
        </a> */}
        {/* {flg ? <div>true</div> : <div>false</div>}

        {questionchoice && questionchoice.length > 0 ? (
          <input type="text" placeholder={questionchoice} onInput={(e) => filterDataById(e.currentTarget.value)} />
        ) : null}

        {questionchoice.length > 0 ? (
          <button onClick={(e) => filterDataById(questionchoice)}>Filter Data</button>
        ) : null} */}

                {/* {displaydata.length > 0 ? (<button onClick={() => rondomchoiceItemInset()}>これをおすとランダムに問題が出力されるよ</button>) : 'データ未選択'} */}
        {/* ユーザが選択した場合以下がなくなる */}
     
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {/* ローカルDBのインデックスに変更する。 */}
          {Indexkeys.map((item, index) => (
            // <div key = {index}>{item}</div>
            <button key={index} onClick={() => choiceNumber(item)} style={{ width: "10%" }}>{item}</button>
            // 
          ))}
        </div>

        {rondomdata.length > 0 ? (<button onClick={() => getRandom(rondomdata)}>単語を表示する。</button>) : (Object.entries(displaydata).map(([key, value], index) => (
          <div>アイテムがなくなりました。</div>
        )))

        }

        {filteredData.map((data) => (
          <div key={data.key}>
            <div>
              {data.id}
            </div>
            <div>
              以下を答えよ。
            </div>
            <div>
              {data.key}
            </div>
            <div>
              <button onClick={() => flg ? setFlag(false) : setFlag(true)}>{flg ? "答えを非表示する。" : "答えを表示にする。"}</button>
            </div>

            <div>
              {flg ? data.value : ""}
            </div>
            {/* 正解ボタン */}
            <div>
            {flg ? <button onClick={() => removeItemById(data.id)}>正解の場合押す</button> :"" }
            </div>
          </div>

          // {data.key}
        ))}


      </header>
      {/* <button onClick={flgchange}>Increment</button> */}
      <body>
        {/* ここに値を入れ込む */}
        {/* ロードチェックする */}
        {loading ? 'Loading...' : ''}
        <div>
          {/* {Object.keys(displaydata).map(key => (
        <p key={key}>{key}: {displaydata}</p>
      ))} */}
        </div>
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


      </body>

    </div>
  );
}

export default App;
