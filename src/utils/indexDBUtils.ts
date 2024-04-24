import { rejects } from "assert";
import { error } from "console";
import { KeyObject } from "crypto";
import { resolve } from "path";

// ?ここでDBがなければつくる。
const openDatabase = (dbName: string, version: number, objectStore: string): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => reject(request.error);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
      console.log("データベースアクセス成功")
      resolve(db);
    };

    // バージョン変更トランザクション内でオブジェクトストアを作成する
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;

      // データベースを開いたときに既に存在するかどうかをチェックし、存在しない場合は作成する
      if (!db.objectStoreNames.contains(objectStore)) {
        console.log(`${objectStore}は作成されてません。作成します。`);
        const objectStoreCreate = db.createObjectStore(objectStore, { keyPath: 'id', autoIncrement: true });
        objectStoreCreate.createIndex('keyIdindex', 'Indexkeyid', { unique: false });
        // インデックスを作成する場合は以下のようにします
        // objectStoreCreate.createIndex('nameIndex', 'name', { unique: false });
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
const upDateData = <T>(dbname: string, version: number, id: string, dogid: string, hour: string, objectStore:any, InsertdataArray: T[]): Promise<void> => {
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
        record.hour= hour
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

const deleteRequest = (dbname: string, version: number, objectStore: string, recordkey: string): Promise<void> => {
  return openDatabase(dbname, version, objectStore).then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const objectStoreName = transaction.objectStore(objectStore);
      const deleteRequest = objectStoreName.delete(recordkey);
      deleteRequest.onsuccess = () => {
        console.log("レコード削除しました。", recordkey);
      };
      deleteRequest.onerror = (error) => {
        console.log("レコードの削除中にエラーが発生", error);
      }
      // deleteRequest.onerror = ()
    });
  })
    .catch(error => {
      console.error("DB接続エラー:", error);
    })
}

const addMemoData = <T>(dbName: string, version: number, Indexkeyid: string,key:string,value:string,objectStore: string): Promise<void> => {
  return openDatabase(dbName, version, objectStore)
    .then(db => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([objectStore], 'readwrite');
        const objectStoreCreate = transaction.objectStore(objectStore);
        const data = { key,Indexkeyid,value};
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
      const getRequest = store.getKey(key);
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result !== undefined);
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




export { openDatabase, checkDatabaseExists, deleteDatabase, addMemoData,addDataByHour, addMemoDataHour, checkKeyExists, searchItems, deleteRequest, upDateData };
