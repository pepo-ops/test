// sh モジュール

const { cloneDeep } = require(".");

/*===ファイルinternal共有バッファ========================*/

class SharedBuffer {
  SharedBuffer() {}
  static publicSharedDataBuffer = new Map();
  
  appendData(key, data) {
    // キーが存在しない場合、新しいキーを作成してデータを格納
      publicSharedDataBuffer.set(key, data);
  }


// Map内のすべてのエントリ[key,value]を取得
getAllEntry() {
  const allData = Array.from(publicSharedDataBuffer.entries());
  return allData;
}

// Map内のすべての値を取得
getAllValue() {
  const allData = Array.from(publicSharedDataBuffer.values());
  return allData;
}

// Map内のすべてのキーを取得
getAllKey() {
  const allData = Array.from(publicSharedDataBuffer.keys());
  return allData;
}

 // 特定のキーに対応するデータをポップする
  popValueByKey(key) {
    const dataCopy = publicSharedDataBuffer.get(key);
    publicSharedDataBuffer.delete(key); // データを取得後にクリア
    return dataCopy;
  }

  // Mapの中身をコンソールに表示
  showData() {
    console.log('Shared Data Buffer:');
    for (const [key, data] of publicSharedDataBuffer) {
      console.log(`${key} => ${JSON.stringify(data)}`);
    }
  }
// Mapの長さを取得
  retLength() {
    return publicSharedDataBuffer.size;
  }

  // Mapを初期化して空にする
  clearData() {
    publicSharedDataBuffer.clear();
    console.log('Shared Data Buffer init:', publicSharedDataBuffer.size);
  }
};

module.exports.SharedBuffer = SharedBuffer;



/*===ファイルglobal共有バッファ========================*/


let publicSharedDataBuffer = new Map();


function appendData(key, data) {
      publicSharedDataBuffer.set(key, data);
  };
module.exports.appendData = appendData;

function popValueByKey(key) {
  const dataCopy = publicSharedDataBuffer.get(key);
    publicSharedDataBuffer.delete(key); // データを取得後にクリア
    return dataCopy;
  };
module.exports.popValueByKey = popValueByKey;

// Map内のすべてのエントリ[key,value]を取得
function getAllEntry() {
  const allData = Array.from(publicSharedDataBuffer.entries());
  return allData;
};
module.exports.getAllEntry = getAllEntry;

// Map内のすべての値を取得
function getAllValue() {
  const allData = Array.from(publicSharedDataBuffer.values());
  return allData;
}
module.exports.getAllValue = getAllValue;

// Map内のすべてのキーを取得
function getAllKey() {
  const allData = Array.from(publicSharedDataBuffer.keys());
  return allData;
}
module.exports.getAllKey = getAllKey;

function showData() {
  console.log(`sharedDataBuffer ${[...publicSharedDataBuffer]}`);
}
module.exports.showData = showData;

function clearData() {
  publicSharedDataBuffer.clear();
};
module.exports.clearData = clearData;


