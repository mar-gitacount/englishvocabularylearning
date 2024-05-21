// import React, { Component, ChangeEvent, FormEvent } from 'react';
// @ts-ignore
import React, { useState, useEffect } from 'react';
import ItemData from './data/items.json';
import { checkDatabaseExists, openDatabase, addMemoData, checkKeyExists, searchItems, deleteRequest, upDateData, getAllIndexes, getIndexItems, openDatabasenext, getIndexKeys } from './utils/indexDBUtils';
import fs from 'fs';

import logo from './logo.svg';
import './App.css';
import { isTemplateMiddleOrTemplateTail } from 'typescript';

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
  const [flg, setFlag] = useState(false);
  const [newdic, setNewdic] = useState<DisplayDataValue[]>([]);

  // デフォルトで読みこむjsonファイル
  const [Jsonitems, JsonsetItems] = useState<typeof ItemData>(ItemData);
  // 日本語
  const [formData, setFormData] = useState({ dictname: '', english: '', japan: '' });
  // 英語辞書名をいれる
  const [newdicName, setDicNewname] = useState("");
  // 英単語
  const [newenglishdata, setEnglishdata] = useState("");

  // 日本語
  const [newjapandata, setJapandata] = useState("");

  const [displaydataallshowflg, setdisplaydatasllshowflg] = useState(false)


  const [loading, setLoading] = useState(false);  // ローディング状態管理用
  const [displaydata, setDisplayData] = useState<DisplayDataValue[]>([]);
  // 問題を選択した場合、以下にデータを入れ込む。
  const [rondomdata, setRondomData] = useState<DisplayDataValue[]>([]);
  const [Indexkeys, setIndexkeys] = useState<string[]>([]);
  const [question, setQestion] = useState<string[]>([]);

  // フィルター管理する定数
  const [filteredData, setFilteredData] = useState<DisplayDataValue[]>([]);

  const [initialized, setInitialized] = useState(false); // 初期化完了をトラッキングする状態
  // 
  const [choicedatadisplay, setchoiceDatadisplay] = useState("");
  const [questionchoice, setQestionchoice] = useState("");

  // ?index.DBを利用する処理。
  const dbName = "englishdata";
  const version = 1;
  const objectID = 'myobjects'
  const IndexName = "keyIdindex"
  // その日勉強したかどうかのチェックオブジェクト、
  const datedata = "datelearning"
  const datelearning = 'datelearning'
  const dateversion = 1
  const currentDate = new Date();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if (!file) return;
    console.log(file.name,"はjsonのファイルネームINDEXキーになるやつ")
    


    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      try {
        const data = JSON.parse(json);
        if (Array.isArray(data)) {
          Object.entries(data).forEach(([key, value]) => {
            // 以下をファイル名から抽出するようにする。
            const Indexkey = String(file.name.replace('.json',''));
            // const Indexkey = String(key)
            // 検索するための検索キーを追加する。
            console.log(`アップロードしたjsonの${key}と${JSON.stringify(value)}`);
            // ここでは単一データのループが実行されている。
            console.log(`indexdbにアップするやつ→${value["key"]}`);
            return addMemoData(dbName,version,Indexkey,value["key"],value["value"],objectID)
            Object.entries(value).forEach(([k, item]) => {
              // 以下をローカルDBに入れる。
              console.log(JSON.stringify(item))
              console.log(`大本キー${key} キー${k} アイテム${item}`)
              // ?ここでアイテム数を追加している。
              // return addMemoData(dbName, version, Indexkey, k, item, objectID)
            })
            // upDateData(dbName, version, data.dogdataid, data.id, datestring, objectID, indexdpadddata);
            // setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
            getAllIndexes(dbName, objectID, version)

          });



          console.log(`${data}はアップロードしたJSONファイルの値`)
          // setDisplayData(data);
        } else {
          console.error("Invalid JSON format: expected an array");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadJson = () => {
    const sectionname = choicedatadisplay
    const dataToSave = {
      sectionname: displaydata,
    };
    // const json = JSON.stringify(dataToSave, null, 2); // JSON形式に変換
    const json = JSON.stringify(displaydata, null, 2); // JSON形式に変換
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${choicedatadisplay}.json`;
    a.click();
    URL.revokeObjectURL(url); // 解放
  };

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
  const handleChange = (event: any) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const itemdelete = (id: number) => {
    alert(id)
    // indexdbから削除かつdisplaydataからも削除する。
    // deleteRequest(dbName,version,objectID,String(id))

    deleteRequest(dbName, version, objectID, id)
    const updatedData = displaydata.filter(item => item.id !== id);
    // 新しい配列をステートにセットして要素を更新
    setDisplayData(updatedData);

  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    // return addMemoData(dbName, version, Indexkey, k, item, objectID)
    addMemoData(dbName, version, formData.dictname, formData.english, formData.japan, objectID)
    alert(`入力された値${formData.dictname}`)
    // alert(`入力された値: ${inputValue}`);
    // ここにフォームの送信処理を追加します
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
    setchoiceDatadisplay(num)
    setLoading(true);  // ローディング開始
    try {

      //選択した全てのデータ。 
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
    // 以下は問題出力時にセットする。
    setFilteredData([]);

    console.log(displaydata, "表示されるデータ")

  }

  const removeItemById = async (id: number, key: string) => {
    const index = rondomdata.findIndex((item) => item.id === id);
    // アイテム数が0の時点では以下の処理が通る。
    if (index !== -1) {
      const updatedData = [
        ...rondomdata.slice(0, index),
        ...rondomdata.slice(index + 1),
      ];
      setRondomData(updatedData);

    }

    // データベースが空になった場合。
    if (rondomdata.length === 0) {
      // const currentDate = new Date();
      // const dateString = currentDate.toISOString();
      // await addMemoData(datedata, dateversion, dateString, key, "本日済み", datelearning);
      console.log("データがなくなった。")
    } else {
      // データベースが空でない場合。
      getRandom(rondomdata);
    }
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
        // 学習履歴DBに入れ込むよ。
        // await openDatabasenext(datedata, dateversion, datelearning);


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
              console.log(`大本キー${key} キー${k} アイテム${item}`)
              // ?ここでアイテム数を追加している。
              return addMemoData(dbName, version, Indexkey, k, item, objectID)
            })
            // upDateData(dbName, version, data.dogdataid, data.id, datestring, objectID, indexdpadddata);
            // setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
            getAllIndexes(dbName, objectID, version)

          });

        } else {
          console.log('データベースは既に存在しています。');
          getIndexKeys(dbName, version, objectID, IndexName)
            .then((keys) => {
              console.log('インデックスキー:', keys);
              keys.forEach((key) => {
                console.log('インデックスキー:', key);
                // キーごとに必要な処理をここに追加
                setIndexkeys(prevItems => [...prevItems, key]);
              });

            })
            .catch((error) => {
              console.error('インデックスキーの取得に失敗しました:', error);
            });
        }
        // データベース操作のコード
      } catch (error) {
        console.error('データベースの開けませんでした:', error);
      }
    }

    // Object.entries(ItemData).forEach(([key, value]) => {
    //   setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
    //   // 初めての場合、ここにいれる。
    //   setIndexkeys(prevItems => [...prevItems, key]);
    // });
    // getIndexKeys(dbName, version, objectID, IndexName)
    //   .then((keys) => {
    //     console.log('インデックスキー:', keys);
    //     keys.forEach((key) => {
    //       console.log('インデックスキー:', key);
    //       // キーごとに必要な処理をここに追加
    //       setIndexkeys(prevItems => [...prevItems, key]);
    //     });

    //   })
    //   .catch((error) => {
    //     console.error('インデックスキーの取得に失敗しました:', error);
    //   });
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

  // ランダムデータを削除云々。
  useEffect(() => {
    if (displaydata.length > 0) {
      if (rondomdata.length === 0) {
        const currentDate = String(new Date());
        alert(currentDate)
        // const dateString = currentDate.toISOString();

        // Indexkeyid
        addMemoData(datedata, dateversion, currentDate, displaydata[0].Indexkeyid, "本日済み", datelearning);
        alert("選択した問題が0になりました。")
      } else {
        const displaydatereplace = JSON.stringify(displaydata)
        // alert(`${displaydata.length}は残りのランダムデータ`)
      }
    }

  }, [rondomdata])

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
        <input type="file" accept=".json" onChange={handleFileChange} />
        <div>{choicedatadisplay}</div>
        {/* ここで編集するを押すとすべての単語が出てくるようにする。 */}
        {displaydata.length > 0 && (
          <div>
            <button onClick={() => setdisplaydatasllshowflg(!displaydataallshowflg)}>
              {displaydataallshowflg ? "閉じる" : "単語をすべて表示する"}
            </button>
            <button onClick={handleDownloadJson}>JSONをダウンロード</button>
          </div>
        )}
        {
          displaydataallshowflg ? (Object.entries(displaydata).map(([key, value], index) => (
            <div key={index}>
              <div>{key}</div>
              <div>
                {JSON.stringify(value["key"])}:
                {JSON.stringify(value["value"])}
                <button onClick={() => itemdelete(value["id"])} style={{ backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer' }}>削除する</button>
              </div>
            </div>
          ))):(<div></div>)

        }
        {/* {Object.entries(displaydata).map(([key, value], index) => (
          <div key={index}>
            <div>{key}</div>
            <div>
              {JSON.stringify(value["key"])}:
              {JSON.stringify(value["value"])}
              <button onClick={() => itemdelete(value["id"])} style={{ backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer' }}>削除する</button>
            </div>
          </div>
        ))} */}
        {/* {rondomdata.length > 0 ? (<button onClick={() => getRandom(rondomdata)}>単語を表示する。</button>) : (Object.entries(displaydata).map(([key, value], index) => (
          <div>アイテムがなくなりました。</div>
        )))} */}

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
            // 番号を指定してランダムデータに表示する。
            <button key={index} onClick={() => choiceNumber(item)} style={{ width: "10%" }}>{item}</button>
            // 
          ))}
        </div>

        {/* {rondomdata.length > 0 ? (<button onClick={() => getRandom(rondomdata)}>単語を表示する。</button>) : (Object.entries(displaydata).map(([key, value], index) => (
          <div>アイテムがなくなりました。</div>
        ))) */}
        {rondomdata.length > 0 ? (<button onClick={() => getRandom(rondomdata)}>単語を表示する。</button>) : <div></div>}
        {/* 単語を表示するを押下した時点で決定する。 filterdDateは問題一問の表示*/}
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
              {flg ? <button onClick={() => removeItemById(data.id, data.Indexkeyid)}>正解の場合押す</button> : ""}


              {rondomdata.length > 0 ? (<div>残り:{rondomdata.length}問</div>) : (<div>{data.Indexkeyid}がなくなりました。</div>)}
            </div>
          </div>

          // {data.key}
        ))}


      </header>
      {/* <button onClick={flgchange}>Increment</button> */}
      <body>
        {/* ここに値を入れ込む */}
        {/* ロードチェックする */}
        <div>以下に入力して好きな単語帳をつくってね</div>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="dictname">単語帳の名前:</label>
            <input
              type="text"
              id="dictname"
              name='dictname'
              value={formData.dictname}
              onChange={handleChange}
              placeholder="単語帳の名前を入力してね" // これがプレースホルダー
            />
          </div>
          <div>
            <label htmlFor="english">英文</label>
            <input
              type="text"
              id="english"
              name='english'
              value={formData.english}
              onChange={handleChange}
              placeholder="" // これがプレースホルダー
            />
          </div>
          <div>
            <label htmlFor="japan">日本語文</label>
            <input
              type="text"
              id="japan"
              name='japan'
              value={formData.japan}
              onChange={handleChange}
              placeholder="" // これがプレースホルダー
            />
          </div>

          <button type="submit">送信</button>

        </form>
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
