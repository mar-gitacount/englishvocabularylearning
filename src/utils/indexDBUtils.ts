import { rejects } from "assert";
import { error } from "console";
import { KeyObject } from "crypto";
import { resolve } from "path";

// ?ここでDBがなければつくる。
const openDatabase = (dbName: string, version: number, objectStore: string): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    let isNewDatabase = false;  // isNewDatabaseの初期値を設定
    request.onerror = () => reject(request.error);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      console.log("データベースアクセス成功")
      resolve(db);
    };

    // バージョン変更トランザクション内でオブジェクトストアを作成する
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      const isNewDatabase = !db.objectStoreNames.contains(objectStore);
      // データベースを開いたときに既に存在するかどうかをチェックし、存在しない場合は作成する
      if (isNewDatabase) {
        console.log(`${objectStore}は作成されてません。作成します。`);
        const objectStoreCreate = db.createObjectStore(objectStore, { keyPath: 'id', autoIncrement: true });
        objectStoreCreate.createIndex('keyIdindex', 'Indexkeyid', { unique: false });
        // インデックスを作成する場合は以下のようにします
        // objectStoreCreate.createIndex('nameIndex', 'name', { unique: false });
      }
    };
  });
};

const openDatabasenext = (dbName: string, version: number, objectStore: string): Promise<{ db: IDBDatabase, isNew: boolean }> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    let isNewDatabase = false;  // isNewDatabaseの初期値を設定

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result as IDBDatabase;
      console.log("データベースアクセス成功");
      resolve({ db, isNew: isNewDatabase });  // dbとisNewDatabaseの両方を返す
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      isNewDatabase = !db.objectStoreNames.contains(objectStore);
      if (isNewDatabase) {
        console.log(`${objectStore}は作成されてません。作成します。`);
        const objectStoreCreate = db.createObjectStore(objectStore, { keyPath: 'id', autoIncrement: true });
        objectStoreCreate.createIndex('keyIdindex', 'Indexkeyid', { unique: false });
        // isNewDatabase = true
        // resolve({ db, isNew: isNewDatabase }); 
        // ここが実行された場合、isNewはTRUE?

      }
    };
  });
};






const checkDatabaseExists = (dbName: string, version: number, objectStore: string): Promise<boolean> => {
  return openDatabase(dbName, version, objectStore)
    .then(db => {
      db.close();
      return true;
    })
    .catch(() => {
      return false;
    });
};
//   <T>(dbName: string, version: number, id: string, dogid: string, hour: string, objectStore: string, dataArray: T[]): 
const upDateData = <T>(dbname: string, version: number, id: string, dogid: string, hour: string, objectStore: any, InsertdataArray: T[]): Promise<void> => {
  // ?DB存在確認
  // ?非同期通信開始

  // !もうつかれたので、ここら辺のコードはかなり乱暴、動いてる限りはなおさない。
  return new Promise<void>((resolve, reject) => {
    const data = { id, dogid, hour, InsertdataArray };
    // ?DBを開く。
    openDatabase(dbname, version, objectStore).then((db) => {
      // ?トランザクションの開始
      const transaction = db.transaction(objectStore, 'readwrite');
      // ?ストアを取得する。
      const store = transaction.objectStore(objectStore);
      // ?リクエストを取得する。
      const getRequest = store.get(id);
      // const data = { id, dogid, hour, dataArray };
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        record.dataArray[0] = InsertdataArray[0]
        record.hour = hour
        // record.dataArray[0].memo = "変更"
        // displayedValues[index] !== null && typeof displayedValues[index] === 'object' && Object.keys(displayedValues[index]).length >
        // ?[{"text":"","memo":"変更ff","date":"2024-03-28T19:00:00.000Z","time":"04:00","id":"afyugzdGFH8it1zpuExE","dogdataid":"tOnbJbaMwKwSlJLtIj1M"}]
        console.log(`${JSON.stringify(InsertdataArray)}を確認する。データタスクからわたってきた値です。`);
        console.log(record.dataArray, "アップデート関数内の取得した値");
        console.log(`${JSON.stringify(record)}がアップデートされたデータ`);
        console.log(`${JSON.stringify(record.hour)}がアップデートされたデータ時間です。`);
        const putRequest = store.put(record);
      };

      getRequest.onerror = () => {
        // データが見つからないとき。
        console.log(getRequest.error)
      };
      // // ?レコードキーを取得する
      // const putRequest = store.put(dataArray,recordkey)
      // putRequest.onsuccess = () =>{

      //     console.log('データが更新された。');
      //     resolve();   
      // }; 
      // putRequest.onerror = () =>{
      //   console.log("データ更新失敗しました。")
      //   reject(putRequest.error);
      // };

    })
  });


}

const deleteDatabase = (dbName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    request.onblocked = () => {
      reject(new Error("Database deletion was blocked"));
    };
  });
};

const checkReuest = (dbname: string, version: number, objectStore: string, primaryKey: any): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const request = indexedDB.open(dbname, version);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      const transaction = db.transaction([objectStore], 'readwrite');
      const objectStoreName = transaction.objectStore(objectStore);
      const index = objectStoreName.index(primaryKey)
      

    }

  });
}

const deleteRequest = (dbname: string, version: number, objectStore: string, primaryKey: any): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(dbname, version);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;

      const transaction = db.transaction([objectStore], 'readwrite');
      const objectStoreName = transaction.objectStore(objectStore);
      const deleteRequest = objectStoreName.delete(primaryKey);

      deleteRequest.onsuccess = () => {
        console.log("レコード削除しました。", primaryKey);

      };

      deleteRequest.onerror = (error) => {
        console.log("レコードの削除中にエラーが発生", error);
        reject(error); // エラーが発生したらPromiseを拒否する
      };

      transaction.oncomplete = () => {
        db.close(); // トランザクションが完了したらデータベースを閉じる
        console.log("トランザクション終了")
        resolve(); // 成功したらPromiseを解決する
      };

      transaction.onerror = (event: any) => {
        console.error("トランザクション中にエラーが発生しました:", event.target.error);
        reject(event.target.error);
      };


    };

    request.onupgradeneeded = (event) => {
      // データベースのバージョンアップが必要な場合の処理を追加する
    };

    request.onblocked = () => {
      // データベースがブロックされた場合の処理を追加する
    };
  });
}


const addMemoData = <T>(dbName: string, version: number, Indexkeyid: string, key: string, value: string, objectStore: string): Promise<void> => {
  return openDatabase(dbName, version, objectStore)
    .then(db => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([objectStore], 'readwrite');
        const objectStoreCreate = transaction.objectStore(objectStore);
        const data = { key, Indexkeyid, value };
        console.log(`${JSON.stringify(data)}これはデータです`)
        const request = objectStoreCreate.add(data);
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    })
    .catch(error => {
      throw new Error(`Failed to add memo data: ${error}オブジェクトストア${objectStore}, id=${Indexkeyid}`);
    });
};

const addDataByHour = (dbName: string, version: number, data: any, objectStore: string): Promise<void> => {
  return openDatabase(dbName, version, objectStore)
    .then(db => {
      return new Promise<void>((resolve, reject) => {
        // データの時間から時間帯を取得
        const hour = new Date(data.date.seconds * 1000).getHours();

        // オブジェクトストアを選択
        const objectStoreName = `hour_${hour}`;
        const transaction = db.transaction([objectStoreName], 'readwrite');
        const store = transaction.objectStore(objectStoreName);

        // データを追加
        const addRequest = store.add(data);
        addRequest.onsuccess = (event) => {
          console.log("Data added successfully to hour:", hour);
          resolve();
        };
        addRequest.onerror = (event) => {
          reject(new Error("Failed to add data to hour: " + hour + ", " + (event.target as IDBRequest).error?.toString()));
        };

        transaction.onerror = () => {
          reject(new Error("Transaction error"));
        };
      });
    });
};

const checkKeyExists = (dbName: string, objectStore: string, key: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(objectStore, 'readonly');
      const store = transaction.objectStore(objectStore);
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        console.log(result !== undefined ? `${key}はキーアイテムを確認しました` : `${key}は存在しません`);
        resolve(result !== undefined);
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      // データベースのバージョンが上がった場合の処理
      console.log('データベースのバージョンが上がった場合の処理をここに追加します');
    };

    request.onblocked = () => {
      // データベースがブロックされた場合の処理
      console.log('データベースがブロックされました');
    };
  });
};




const addMemoDataHour = (dbName: string, version: number, data: { id: string, memo: string }, objectStore: string): Promise<void> => {
  return openDatabase(dbName, version, objectStore)
    .then(db => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['myObjectStore'], 'readwrite');
        const store = transaction.objectStore('myObjectStore');

        const getRequest = store.get(data.id); // 既存のデータが存在するか確認

        getRequest.onsuccess = (event) => {
          const existingData = getRequest.result;
          if (existingData) {
            reject(new Error("Data with the same ID already exists in the database"));
          } else {
            const addRequest = store.add(data); // データを追加
            addRequest.onsuccess = (event) => {
              console.log("Memo data added successfully");
              resolve();
            };
            addRequest.onerror = (event) => {
              reject(new Error("Failed to add memo data: " + (event.target as IDBRequest).error?.toString()));
            };
          }
        };

        getRequest.onerror = (event) => {
          reject(new Error("Error checking for existing data: " + (event.target as IDBRequest).error?.toString()));
        };

        transaction.onerror = () => {
          reject(new Error("Transaction error"));
        };
      });
    });
};

const searchItems = (dbName: string, objectStoreName: string, indexName: string, searchKey: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(objectStoreName, 'readonly');
      const store = transaction.objectStore(objectStoreName);
      const index = store.index(indexName);
      const getRequest = index.getAll(searchKey);
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result);
      };
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

// データをインサートする。
// const defaultjsonDataInsert=<T>(dbName: string, version: number, id: string,objectStore:string): Promise<void> =>{
//   openDatabase(dbName, version, objectStore).then((db) => {
//     // データが存在しない場合、
//   })

// }
async function getIndexItems(
  dbName: string,
  objectStoreName: string,
  version: number,
  indexName: string,
  keyname: string
): Promise<any[]> {
  try {
    const db = await openDatabase(dbName, version, objectStoreName);
    const transaction = db.transaction(objectStoreName, 'readonly');
    const objectStore = transaction.objectStore(objectStoreName);
    const index = objectStore.index(indexName);
    const keyRange = IDBKeyRange.only(keyname);

    return new Promise((resolve, reject) => {
      const cursorRequest = index.openCursor(keyRange);
      const results: any[] = [];  // 結果を保存する配列

      cursorRequest.onsuccess = (event: Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          results.push(cursor.value);  // 結果配列に値を追加
          console.log(`Found item with id ${cursor.value.id} and content:`, cursor.value);
          cursor.continue();  // 次の一致するアイテムへ進む
        } else {
          // console.log("No more items found.");
          // console.log(typeof results,"は帰ってくる値の型")
          // console.log(results[3000],"は帰ってくる値")
          // 以下が配列の中身
          // {"key":"salmon","Indexkeyid":"600","value":"鮭"}
          // 配列型のようだが、object型でかえってくる。
          const length = Object.keys(results).length
          console.log(length, "はオブジェクトの数")
          resolve(results);  // 全ての結果を解決
        }
      };

      cursorRequest.onerror = () => {
        console.error("Cursor request failed.");
        reject(cursorRequest.error);
      };
    });

  } catch (error) {
    console.error("Failed to open database:", error);
    throw error;  // エラーを再スローして、呼び出し元でキャッチ可能にする
  }
}

// INDEXをすべて取得する。
const getAllIndexes = (dbName: string, objectStoreName: string, version: number): Promise<void | ((this: IDBTransaction, ev: Event) => any) | null> => {
  return openDatabase(dbName, version, objectStoreName).then(db => {
    const transaction = db.transaction(objectStoreName, 'readonly');
    const objectStore = transaction.objectStore(objectStoreName);
    const indexNames = objectStore.indexNames;

    // indexNamesはDOMStringListで、配列のように扱えるが、正確には配列ではないため、Array.fromを使用して配列に変換する
    const indexes = Array.from(indexNames);

    indexes.forEach(indexName => {
      // console.log(`${indexName} はインデックス`);
    });

    // 各インデックスに対して処理を行う
    indexes.forEach(indexName => {
      console.log(`Index: ${indexName}`);
      const myIndex = objectStore.index(indexName);
      myIndex.openCursor().onsuccess = function (event) {
        // IDBRequest として event.target を扱うための型アサーション
        const request = event.target as IDBRequest<IDBCursorWithValue | null>;
        if (request.result) {
          const cursor = request.result;
          console.log(`キーを確認！！: ${cursor.key}, 値: ${JSON.stringify(cursor.value)}`);
          cursor.continue();  // 次のアイテムへカーソルを進める
        } else {
          console.log('インデックス内の全アイテムの確認が完了しました。');
        }
      };
      // ここで、各インデックスに対する追加の処理を行うことができます
      // 例: myIndex.get() や myIndex.openCursor() などを使用
    });
    // トランザクションの完了を待つ
    return transaction.oncomplete;
  }).catch(error => {
    console.error('データベース操作中にエラーが発生しました:', error);
  });
}

const getIndexKeys = (
  dbName: string,
  version: number,
  objectStoreName: string,
  indexName: string
): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDatabase(dbName, version, objectStoreName);
      const transaction = db.transaction(objectStoreName, 'readonly');
      const objectStore = transaction.objectStore(objectStoreName);
      const index = objectStore.index(indexName);
      const request = index.openKeyCursor();
      const keys = new Set<string>();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursor>).result;
        if (cursor) {
          keys.add(cursor.key as string);
         
          cursor.continue();
        } else {
          resolve(Array.from(keys));
        }
      };

      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};


const checkIfValueExists = (dbName: string, objectStoreName: string, indexKeyName: string, valueToCheck: any): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName);
    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      const db: IDBDatabase = request.result;
      const transaction: IDBTransaction = db.transaction(objectStoreName, 'readonly');
      const objectStore: IDBObjectStore = transaction.objectStore(objectStoreName);

      const index: IDBIndex | null = objectStore.index(indexKeyName);
      if (!index) {
        reject(`Index key "${indexKeyName}" not found in object store "${objectStoreName}".`);
        return;
      }

      // const getRequest = index.get(valueToCheck);
      const getRequest = objectStore.index(indexKeyName).get(valueToCheck);


      getRequest.onsuccess = () => {
        const result = getRequest.result;
        if (result !== undefined) {
          resolve(true); // 値が見つかった場合
        } else {
          resolve(false); // 値が見つからなかった場合
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };

    request.onupgradeneeded = () => {
      // データベースのバージョンが上がった場合の処理
    };

    request.onblocked = () => {
      // データベースがブロックされた場合の処理
    };
  });
};




const getItemByPrimaryKeyAndValue = (dbName: string, objectStoreName: string, primaryKey: any, indexName: string, valueToCheck: any,value:any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(objectStoreName, 'readonly');
      const objectStore = transaction.objectStore(objectStoreName);
      const index = objectStore.index(indexName);
      // const getRequest = index.getAll(primaryKey)
      const getRequest = index.openCursor(primaryKey)
      const items: any[] = [];
      getRequest.onsuccess = (event:Event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const item = cursor.value;
          items.push(item);
          cursor.continue();
        } else {
          // フィルタリングされたアイテムの中から指定されたアイテム名と一致するものを取得する
          const filteredItems = items.filter((item) => item.key === valueToCheck);
          if (filteredItems.length > 0) {
            console.log('Matching Items:', filteredItems);
            resolve(true)
          } else {
            console.log('No matching item found');
            const version = 1
            addMemoData(dbName, version, primaryKey,  valueToCheck, value, objectStoreName)
            resolve(false)
          }
          // resolve();
        }
      }
      // const getRequest = objectStore.get(primaryKey);

      // getRequest.onsuccess = () => {
      //   const result = getRequest.result;
      //   console.log(result)
      //   if (result) {
      //     console.log(result,"アイテムが見つかった")
      //     resolve(result);
      //   } else {
      //     console.log(result["key"],"アイテムがない")
      //     resolve(null); // 条件に一致するアイテムが見つからなかった場合
      //   }
      // };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};



export { openDatabase, openDatabasenext, checkDatabaseExists,getItemByPrimaryKeyAndValue ,deleteDatabase, addMemoData, addDataByHour, addMemoDataHour, checkKeyExists, searchItems, deleteRequest, upDateData, getAllIndexes, getIndexItems, getIndexKeys, checkIfValueExists,checkReuest };
