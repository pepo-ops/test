// myTable モジュール


const myLib = require('./index.js');

global.hashTable = new Map();

class HashTable {
    HashTable() {
      global.hashTable = new Map();
    }

   
  
    registerData(key, data) {
      // const key = myLib.generateHash(salt)
      global.hashTable.set(key, data); // ハッシュをキーとしてデータを登録すること
    }
  
    checkExist(salt) {
      const key = global.generateHash(salt);
      return global.hashTable.has(key); // ハッシュテーブルにハッシュが存在するか確認
    }
  
    getData(salt) {
      const key = myLib.generateHash(salt);
      return global.hashTable.get(key); // ハッシュテーブルからハッシュに対応するオブジェクトの参照を取得
    }
  
    deleteData(salt) {
      const key = global.generateHash(salt);
      global.hashTable.delete(key); // ハッシュテーブルからハッシュに対応するデータを削除
    }
  
    showTable(log) {
      console.log(log);
      for (const [key, data] of global.hashTable) {
        console.log(`${key} => ${JSON.stringify(data)}`);
      }
    }
  
    retLength() {
      return global.hashTable.size;
    }
  
    // 新しいメソッド：オブジェクトの中身を詳細に表示
    inspectData() {
      console.log('Inspecting hashTable:');
      console.dir(global.hashTable, { depth: null });
    }
  
    clearData() {
      global.hashTable.clear();
      console.log('hashTable init:', global.hashTable.size);
    }
  };
  
  module.exports.HashTable = HashTable;

  /*===グローバルハッシュテーブル===*/

  let gv_testHashTable = new HashTable();
  let gv_procHashTable = new HashTable();
  let gv_browHashTable = new HashTable();
  let gv_userHashTable = new HashTable();
  let gv_commentHashTable = new HashTable();
  module.exports.gv_testHashTable = gv_testHashTable;
  module.exports.gv_procHashTable = gv_procHashTable;
  module.exports.gv_browHashTable = gv_browHashTable;
  module.exports.gv_userHashTable = gv_userHashTable;
  module.exports.gv_commentHashTable = gv_commentHashTable;


