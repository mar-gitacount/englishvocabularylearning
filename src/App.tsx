// import React, { Component, ChangeEvent, FormEvent } from 'react';
import React,{useState,useEffect } from 'react';
import ItemData from './data/items.json';
import { checkDatabaseExists, openDatabase, addMemoData, checkKeyExists, searchItems, deleteRequest, upDateData } from './utils/indexDBUtils';
import fs from 'fs';

import logo from './logo.svg';
import './App.css';




function App() {
  const [items, setItems] = useState<string[]>([]);
  const [flg,setFlag] = useState(false)

  const flgchange = () =>{
    flg ? setFlag(false):setFlag(true)
  }
   // useEffectを使用してコンポーネントがマウントされたときに一度だけデータを処理する
   useEffect(() => {
    Object.entries(ItemData).forEach(([key, value]) => {
      console.log(key, "はキーを確認する");  // コンソールにキーを出力
      setItems(prevItems => [...prevItems, key]); // 状態にキーを追加
    });
   
  }, [flg]);  // 空
  
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
        {flg ? <div>true</div>:<div>false</div>}
        <button onClick={flgchange}>Increment</button>
      </header>
      
    </div>
  );
}

export default App;
