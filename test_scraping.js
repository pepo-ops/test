let myLib = require('./myLib/index.js');
let shBuf = require('./myLib/sharedBuffer.js');
let path = require('path');
let puppeteer = myLib.puppeteer;
const fs = require('fs');
const https = require('https');
const ch = require('child_process');
const m3u8Parser = require('m3u8-parser');
const axios = require('axios');
const util = require('util');


/* デバッグ用ブレークポイント */
console.log('I am in test_scraping'); // set breakpoint here.
/* config */
// ミュートモード
const muteMode = 'URL';
const exmampleMute = ['URL'];
if(muteMode !== true) {
  console.log('DBG DUMP ON');
}
// videoダウンロードフラグ
const videoDonwload = true;
if(videoDonwload === true) {
  console.log('video download mode');
} else {
  console.log('video donwload is disabled');
}

// ===システムコールで、親プロセスからのprocObjectデータ受信待ち処理終了===


    
  // =================== ObjectTemplateDefinition ==================
  

// =================== ObjectTemplateDefinition END ===================

  // =================== internalFunctionDefinition ==================
  function httpsRequest(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = '';
  
        response.on('data', (chunk) => {
          data += chunk;
        });
  
        response.on('end', () => {
          resolve({ data });
        });
      });
  
      request.on('error', (error) => {
        reject(error);
      });
  
      request.end();
    });
  }

  function convertCommentJsonToAss(jsonFilePath, assFolderPath, startTime, context) {
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  
    const convertedTimeDataString = startTime.replace(/[.\s:+()-]/g, "_");
    const duration = 2000; //2秒間のassファイル
                  
    const outputFileName = `ASSfragment_${convertedTimeDataString}to${duration}seconds.ass`;
    // ASSファイルを作成または上書き
    fs.writeFileSync(assFolderPath, '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n');
    const targetTime = new Date(startTime);
    const endTime = new Date(targetTime.getTime + duration);
  
    // JSONデータをASSフォーマットにマッピングしてファイルに書き込む
    jsonData.forEach((entry, index) => {
      const comTimeStamp = new Date(entry.timestamp);
      // 指定された時刻以降で、2秒後の時刻より前のコメントを対象にする
      if (comTimeStamp >= targetTime && comTimeStamp < endTime) {
        const startTime = `0:${comTimeStamp.getHours()}:${comTimeStamp.getMinutes()}:${comTimeStamp.getSeconds()}.${comTimeStamp.getMilliseconds() / 100}`;
        const endTime = new Date(comTimeStamp.getTime() + 5000); // Startの5秒後
        let style = 'Default';
  
        if(context) {
          style = context; //styleにセッションコンテキストを付与 (例 返信相手のユーザ名など
        }
        const name = entry.usernameCanonical; // ユーザー名を使用
  
        // MarginVの計算（50ずつ追加し、250を超えたら0に戻す）
        const marginV = (index * 50) % 250;
  
        const text = `${entry.displayName}: ${entry.textFragment}`;
        const assLine = `Dialogue: 0,${startTime},${endTime}, ${style},${name},0000,0000,${marginV},,${text}\n`;
  
        fs.appendFileSync(assFilePath, assLine);

    }
    });
  }


// =================== ProcessDefinition ===================

// 初回起動する子プロセスの数
let numberOfProcesses = 0;
gv_childproc_num = numberOfProcesses;

//メッセージと、プロセスコマンド例
let proc_cmd_list = ['start','listen','handler','interrupt','wait','stop','restart','kill','ack','reject','change'];
let proc_session_list = ['restart', 'complete','request'];



/**
 * 親プロセスに関するイベントリスナーを追加する関数
 * 
 * @param {void}
 * @returns {void}
 */
 async function setupParentProcessListeners() {
   
    process.on('exit', (code, signal) => {
      console.log(`Parent process exited with code ${code} and signal ${signal}`);
   //   process.exit();
   });
    process.on('error', (error) => {
      console.error('Parent process error:', error);
      process.exit();
    });
    process.on('message', (msg) => {
    // : メッセージのルーティング処理
      switch (msg.obj_data.proc_attr) {
        case 'control':
          // control プロセスへの処理
          console.error('destinationError:procObjの整合性に問題があります', msg);
          return;
          break;
        case 'crawler':
          // crawler プロセスへの処理
          console.error('destinationError:procObjの整合性に問題があります', msg);
          return;
         break;
        case 'scraping':
          // scraping プロセスへの処理
         break;
      default:
        console.error('Unknown destination:', msg);
        return;
  }
      // ここでメッセージに基づく処理を追加
      console.log(`Received message from ${msg.src} process:`, msg);
        //即座にコピー作成
        let MyprocObj = myLib.cloneDeep(msg.obj_data);
        msg.obj_data = null; //念のためproc_dataのメモリ開放
        switch (MyprocObj.proc_cmd) {
          case 'start':
// ============================ここにメイン処理を記述============================================================================
      scraping_main(MyprocObj);

      // 3秒おきに、コメントリストを保存する
      //setInterval(() => {
      //  saveAndClearQueue(MyprocObj);        
      //}, 3000);
      // ブラウザ再起動 30分インターバル
      // myLib.browserRestartInterval(MyprocObj.browObjList, 30);
            
// ============================ここにメイン処理終了============================================================================
            break;
          case 'listen':
            // 'listen' コマンドの処理
            break;
          case 'handler':
            if (typeof handlerFunctions[MyprocObj.handler_func] === 'function') {
              // 'handler' コマンドかつ有効なコールバック関数が指定されていれば実行
              handlerFunctions[MyprocObj.handler_func](MyprocObj);
            } else {
              console.error('Unknown command:', MyprocObj);
            }
            break;
          case 'interrupt':
             // 'interrput' コマンドの処理
              break;
          case 'wait':
             // 'wait' コマンドを受け取ったらouterHTMLの処理ループを停止
             const interval = procObj.proc_data.duration;
             myLib.gv_isProcLoop = false;
             // duration秒間の割り込み処理
             myLib.sleep(null, interval);
             console.log(`Interrupted for ${interval}seconds`);
             // ここでduration秒間だけの処理を実行
             myLib.gv_isProcLoop = true;
            break;
          case 'stop':
            // 'stop' コマンドの処理
            break;
          case 'restart':
            // 'restart' コマンドの処理
            break;
          case 'kill':
            // 'kill' コマンドの処理
            break;
          case 'ack':
            // 'ack' コマンドの処理
            break;
          case 'reject':
            // 'reject' コマンドの処理
            break;
          case 'change':
            // 'change' コマンドの処理
            break;
  
          default:
            break;
        }
  
      });
    }

// =================== ProcessDefinitionEND ===================


// =================== ProcessMain ===================


 // 親プロセスからのイベントリスナーを設定
 setupParentProcessListeners();


// =================== ProcessMainEND ===================

// =================== InternalFunctionDefinition ===================

function fileExists(filePath) {
  try {
    // ファイルの情報を取得してエラーが発生しなければファイルが存在する
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    // エラーが発生した場合、ファイルが存在しない
    return false;
  }
}

// 絵文字のコードポイントかどうかを判定
function isEmojiCodePoint(codePoint) {
  // 一般的な絵文字の Unicode レンジに含まれるかどうかを判定
  return (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || 
         (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) ||
         (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) ||
         (codePoint >= 0x1F700 && codePoint <= 0x1F77F) ||
         (codePoint >= 0x1F780 && codePoint <= 0x1F7FF) ||
         (codePoint >= 0x1F800 && codePoint <= 0x1F8FF) ||
         (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||
         (codePoint >= 0x1FA00 && codePoint <= 0x1FA6F) ||
         (codePoint >= 0x2600 && codePoint <= 0x26FF) ||
         (codePoint >= 0x2700 && codePoint <= 0x27BF);
}

/**
 * コメントデータをローカルに保存し、キューをクリアする関数
 * @param {myLib.procObjectTemplate} procObj - グローバルprocオブジェクト
 */
async function saveAndClearQueue(procObj, cList){
  console.log("I am saveAndClearQueue");
  try {
              // パフォーマンス計測したいコード開始
              const startTime = Date.now();
  let newUserObject = procObj.userObjList[0];
  let officialName = newUserObject.officialName;
  let usernameCanonical = procObj.userObjList[0].usernameCanonical;
  // オフィシャルユーザーネームのディレクトリパスを作成
  let userDirectoryPath = path.join(myLib.USER_DATA_PATH, `./${usernameCanonical}`);
  procObj.userObjList[0].user_folder_path = userDirectoryPath;
  // JSONファイルの保存先パスを作成(オフィシャルファイル名)
  let lc_out_path = path.join(userDirectoryPath, `${officialName}_コメント_.json`);


  for(let ch  of cList) {
    // スタンプイメージ文字の可能性
    if(ch.textFragment === '') {
      ch.textFragment = `stamp_${ch.stampImage.alt}`;
      console.log('stampImage', ch.textFragment);
    }

    // 正規表現を使用して ": " の後に続く文字列を抽出
    const match = ch.textFragment.match(/: (.*)/);
    let extractedText = null;
                   
     // matchがnullでない場合、該当する部分が見つかったことを意味
     if (match) {
         extractedText = match[1];
     } else {
         extractedText = ch.textFragment;
     }
     ch.textFragment = extractedText;
       // UTF-16コード単位 絵文字のコードポイントを取得
     const codePoints = Array.from(extractedText).map(char => char.codePointAt(0));

  // 絵文字のみを抽出して処理
  const processedEmoji = codePoints.map((codePoint, index) => {
    if (isEmojiCodePoint(codePoint)) {
      // 絵文字のコードポイントを16進数で表示
      const emojiInfo = isEmojiCodePoint(codePoint) ? ` (Emoji, Code Point: U+${codePoint.toString(16)})` : '';
      if(muteMode === true) {
        ;
      }else{
        console.log(`${extractedText[index]}${emojiInfo}`);
      }
      // 絵文字のコードポイントがサロゲートペアの場合はString.fromCodePointを使用
      return (codePoint >= 0xD800 && codePoint <= 0xDBFF) ? String.fromCodePoint(codePoint, codePoints[index + 1]) : String.fromCodePoint(codePoint);
    } else {
      // 絵文字でない場合はそのままの文字列
      return String.fromCodePoint(codePoint);
    }
  }).join('');
  ch.textFragment = processedEmoji;

  

  
     //hashの計算
     ch.hash = myLib.generateHash(ch.usernameCanonical + ch.textFragment);
  }


    // ローカルデータの読み込み
    let existingDataList = procObj.commentBufList;
    if(muteMode === true) {
      ;
    }else{
      console.log('before dup check cList:', cList);
    }
    // まずは、新規コメントのシャロ―コピーとしてすべて保存
    procObj.savedata_que_list = cList.slice();
    // 終端からの重複チェックと削除
    for (let i = cList.length - 1; i >= 0; i--) {
      let cmt = cList[i];
      let existingIndex = existingDataList.findIndex(ext_ptr => ext_ptr.hash === cmt.hash);
      if(existingIndex !== -1) {
        // 重複が初めて見つかった場合
        // save_queListに最初に重複が見つかった位置+1から終端までの要素を保存
        procObj.savedata_que_list = cList.slice(i+1);
        // ダンプリスト削除
        cList.length = 0;    
        break;
       }
      }

      // 既存バフへ新規コメントを追加
      procObj.commentBufList = [...procObj.commentBufList, ...procObj.savedata_que_list];

      if(procObj.savedata_que_list.length !== 0) {
          // 既に同じファイルが存在するかチェック
          if (fileExists(lc_out_path)) {
            // ローカルデータへの追加書き込み
            fs.appendFileSync(lc_out_path, JSON.stringify(procObj.savedata_que_list, null, 2), 'utf-8');
            // ダンプリスト削除
            cList.length = 0;
            if(muteMode === true) {
              ;
            }else{
              console.log(`File already exists at ${lc_out_path}. Take Care of This File format JSON or not. Append Success!`);
            }          
            } else {
            // 新規作成
            fs.writeFileSync(lc_out_path, JSON.stringify(procObj.savedata_que_list, null, 2), 'utf-8');
            // ダンプリスト削除
            cList.length = 0;
            console.log(`Create New File at ${lc_out_path}.`);
            }

      }

       // パフォーマンス計測したいコード終了
       const endTime = Date.now();
       if(muteMode === true) {
        ;
      }else{
        for (let el of procObj.savedata_que_list) {
          console.log(`Username Canonical: ${el.usernameCanonical} Display Name: ${el.displayName} ML Sec: ${el.dateML} Hash: ${el.hash}`);
          /*
          console.log('Username Canonical:', el.usernameCanonical);
          console.log('Display Name:', el.displayName);
          console.log('subscriber', el.subscriber.alt);
          console.log('Text Fragment:', el.textFragment);
          console.log('stamp Image', el.stampImage.alt);
          console.log('Timestamp:', el.timeStamp);
          console.log('ML Sec:', el.dateML);
          console.log('Hash:', el.hash);
          */
        }
        console.log(`Execution time func_saveAndClearQueue: ${endTime - startTime}ms`);
        console.log('existing commentList(procObj.commentBufList):', procObj.commentBufList);
        console.log('new commentDump:', cList);
        console.log('new commentList:', procObj.savedata_que_list);
      }
     // セーブキューをクリア
     if(procObj.savedata_que_list.length !== 0) {
      procObj.savedata_que_list = [];
     }

  } catch (error) {
    console.error('Error saving to local data:', error);
  }
}

/**
 * outerHTMLの処理を逐次実行する
 * @param {myLib.pageHandleTemplate} page_handle - ページハンドル
 */
async function processChatMessage(page_handle, procObjfromParent) {
  try {
    let page = page_handle.page;
    const startTime = Date.now();
    const timeStamp =new Date().toLocaleString();

    let promise1 = page.evaluate(() => {
      /* ====================START BROWSER CONTEXT=============================== */
  
          // シリアライズ可能な形に変換
                let nodeList = document.querySelectorAll(':scope .chat-line__message');
                let comments =[];
                const chatTextsArray = Array.from(nodeList);    
                      comments = chatTextsArray.map((el) => 
                      {
                        let dateML = null;
                        
                        let sub_scope = el.querySelector(':scope img');
                        let sub_imgSrc = null;
                        let sub_alt = null;
                        if (sub_scope) {
                          sub_imgSrc = sub_scope.src;
                          sub_alt = sub_scope.alt;
                        }
                        // イメージスタンプコメント対策
                        let stampName = null;
                        let stampUrl = null;
                        let stamp_scope1 = el.querySelector(':scope .chat-image__container');
                        if(stamp_scope1) {
                          let stamp_ch = stamp_scope1.querySelector(':scope img');
                          if(stamp_ch) {
                            stampName = stamp_ch.alt;
                            stampUrl = stamp_ch.src;
                          }
                        }
                        
                        let disp_scope = el.querySelector(':scope .chat-author__display-name');
                        let displayName = null;
                        if(disp_scope) {
                          displayName = disp_scope.textContent;
                          const a = new Date();
                          dateML = a.getTime();
                        }

                        return {

                          usernameCanonical: el.getAttribute('data-a-user'),
                          displayName: displayName,
                          subscriber: {alt: sub_alt, src: sub_imgSrc},
                          textFragment: el.textContent,
                          stampImage: {alt: stampName, src: stampUrl},                          
                          info: {cur: 'processChatMessage_promise1', query: '.chat-line__message', log: 'commentProcesser'},
                          timestamp: null, // timestamp(ISO string)
                          dateML: dateML, //milliSec timedata Date型
                          error: null
                          // 他にも必要なプロパティを追加
                          };
    
                      });
                      return comments;
  
    /* ====================END BROWSER CONTEXT=============================== */        
        })
        .then(
          (datList) => {

            // パフォーマンス計測したいコード終了
              const endTime = Date.now();
              if(muteMode === true) {
                ;
              }else{
                console.log(`Execution time processChatMessage_promise1: ${endTime - startTime}ms`); // Success!
              }
              let lastComment;
              if(procObjfromParent.commentDataList.length > 0) {
                lastComment = procObjfromParent.commentDataList[procObjfromParent.commentDataList.length - 1];
              } else {
                lastComment = null;
              }

              procObjfromParent.commentDataList = datList.map((dat) => {
                 


                 let hash = null;
                 let commentData = {... myLib.commentDataTemplate};
                 commentData = {
                   hash: hash,
                   usernameCanonical: dat.usernameCanonical,
                   displayName: dat.displayName,
                   subscriber: {alt: dat.subscriber.alt, src: dat.subscriber.src},
                   textFragment: dat.textFragment,
                   stampImage: {alt: dat.stampImage.alt, src: dat.stampImage.src},
                   timestamp: timeStamp,  // timestamp(ISO string)
                   dateML: dat.dateML //milliSec timedata Date型
                 };
                 if(lastComment === null || (lastComment.timestamp_ml <= dat.timestamp)){
                   procObjfromParent.commentDataList.push(commentData);
                   lastComment = commentData;
                 }

                 return commentData;
              });
              return procObjfromParent.commentDataList;
          },
          (err) => {
            console.log('Err rejected', err); // Error!
            return err;
          });
       return promise1;

  } catch (error) {
    console.error('Error processing chat message:', error);
  }
}




// =================== InternalFunctionDefinitionEND ===================


// =================== MainFunctionDefinition ===================

/**
 * メイン関数 スクレイピング実行をする
 * 
 * @param {myLib.procObjectTemplate} procObjfromParent - 親プロセスから受け取るプロセスオブジェクト
 */
async function scraping_main(procObjfromParent) {

  // ブラウザの数を指定。スクレイピングプロセスにつき、基本1つ
  let numberOfBrowser = 1;
  const streamerName = procObjfromParent.userObjList[0].usernameCanonical;


    // 親プロセスのブラウザオブジェクトから継承し、初回のブラウザ起動
      let browObj = procObjfromParent.browObjList[0];
      let userObj = procObjfromParent.userObjList[0];

    // ブラウザの設定
    if(puppeteer === require('puppeteer-core')) {
      let exec_path = path.join(myLib.browserFolderPath, myLib.browserName);
      browObj.launchOptions.executablePath = exec_path;
      let browserDataRoot = path.join(myLib.browserDataPath, `./${myLib.browserDataDir}`);
      browObj.launchOptions.userDataDir = browserDataRoot;
    }

    // プロキシの設定
    if (myLib.PROXY_DISABLED === 'true') {
      // no proxy config
    }else{
        if (myLib.HTTP_PROXY) {
            newbrowObject.proxy.url = myLib.HTTP_PROXY;
            newbrowObject.proxy.port = myLib.PROXY_PORT;
            newbrowObject.proxy.user = myLib.PROXY_USER;
            newbrowObject.proxy.password = myLib.PROXY_PASSWORD;
            /* 認証プロキシの場合 */
            let proxyURL = `http://${newbrowObject.proxy.url}:${newbrowObject.proxy.port}`;
            //  proxyURL = `http://${newbrowObject.proxy.user}:${newbrowObject.proxy.password}@${newbrowObject.proxy.url}:${newbrowObject.proxy.port}`;
            console.log("I am test scraping. proxyURL:", proxyURL);
            newbrowObject.launchOptions.args.push(`--proxy-server=${proxyURL}`);
        }
      }
   // ユーザーエージェントの設定
        if (process.env.USER_AGENT) {
            browObj.launchOptions.args.push(`--user-agent=${process.env.USER_AGENT}`);
        }
   // シークレットモードの設定
        if (myLib.browserFolderPath === myLib.CHROME_FOLER_PATH) {
            browObj.launchOptions.args.push(' --incognito');
        }
  // 画面のサイズを設定。スクリーンショットを撮る場合は設定しておいたほうが良い
      browObj.launchOptions.defaultViewport = {
          width: 1920,
          height: 1080
      };
  // 起動
     browObj.browser = await puppeteer.launch(browObj.launchOptions);

    // ブラウザオブジェクトから、ページオブジェクトを設定し、URLへ遷移
     let tmp_array = await browObj.browser.pages();
     let page = tmp_array[0];
    // 画像や、動画(sript)の読み込みを省略して動作を改善する場合
    if (browObj.mode === 'strict') {      
          await page.setRequestInterception(true);
          page.on('request', (request) => {
             if (['script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
             } else {
                request.continue();
             }
             });
    }

         // ページオブジェクトの作成
          let new_target_id_Obj = { ...myLib.targetIDTemplate};
          new_target_id_Obj.sequence_num = 0;
          new_target_id_Obj.uid = userObj.uid;
          new_target_id_Obj.target_id = userObj.usernameCanonicall;
         
          let new_page_handle = { ...myLib.pageHandleTemplate};
          new_page_handle.page_id = 0;
          new_page_handle.page = page;
          new_page_handle.target_id_list.push(new_target_id_Obj);
          browObj.page_handle_list.push(new_page_handle);

          let target_id = userObj.usernameCanonical;
          let url = `${browObj.protocol}${browObj.baseURL}${target_id}`;
          console.log(url);
          browObj.page_handle_list[0].url = url;

          // 前処理

          /* プロキシの設定 */
          if (myLib.PROXY_DISABLED === 'true') {
             console.log("I am test_scraping. DISABLED PROXY");
          }else{
            /* 認証プロキシの場合 */
            if (myLib.PROXY_USER) {
              await browObj.page_handle_list[0].page.setExtraHTTPHeaders({
              Authorization: `Basic ${new Buffer(`${browObj.proxy.user}:${browObj.proxy.password}`).toString('base64')}`
              });
              console.log("basic認証 base64:", `Basic ${new Buffer(`${browObj.proxy.user}:${browObj.proxy.password}`).toString('base64')}`);
            }
          }

/* =======動画フェッチイベントハンドラの設定=====================================================*/
const userDirectoryPath = path.join(myLib.USER_DATA_PATH, `./${userObj.usernameCanonical}`);
const downloadPath = path.join(userDirectoryPath, './videos');
const assPath = path.join(userDirectoryPath, './ass');
const roamingPath = path.join(downloadPath, './roaming');
const configPath = path.join(downloadPath, './config');
const segInfo = [];
const mergedSegInfo = [];
const registerTable = new Set();

if(videoDonwload !== true) {
  ;
} else {
  // 初期化  
  // ダウンロード先ディレクトリが存在しない場合は作成
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }
    // ダウンロード先ディレクトリが存在しない場合は作成
    if (!fs.existsSync(assPath)) {
      fs.mkdirSync(assPath);
    }
    // ダウンロード先ディレクトリが存在しない場合は作成
    if (!fs.existsSync(roamingPath)) {
      fs.mkdirSync(roamingPath);
    }
    // ダウンロード先ディレクトリが存在しない場合は作成
    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath);
    }
    // キャッシュ削除
    const unlinkPromise = util.promisify(fs.unlink);
    const roamingVideoFiles = fs.readdirSync(roamingPath).filter(file => path.extname(file) === '.ts');
    roamingVideoFiles.map((el) => {
      const delFilePath = path.join(roamingPath, el);
      return unlinkPromise(delFilePath);
    });

  // ネットワークリクエストの追跡を有効にする
  await page.setRequestInterception(true);
  // リクエストの情報を格納するマップ
  const requestInfoMap = new Map();
  // レスポンスの情報を格納するマップ
  const respInfoMap = new Map();
  let masterSrc = null;
  let variantPlaylist = {};


  // リクエストが発生したときのイベントハンドラを設定
  page.on('request', (request) => {
    
    const rrU = request.url();
    const authority = new URL(rrU).hostname;
    const miniAuth = authority.substring(0, 30);
    const method = request.method();
    const interceptionId = request._interceptionId;

    if(muteMode === 'true') {
      ;
    }else{
      // console.log(`Request: ${interceptionId} ${method} ${miniAuth}`);
    }   
    
    if(authority.startsWith('usher')){
      masterSrc =rrU;
    }
    // リクエストを許可して続行
    request.continue();
  });


    // セットインターバルの設置 7秒ごとに動画ダウンロードを試みる
    setInterval(async () => {
      if(muteMode !== true) {
        console.log('動画ストリームダウンロード実行中...');
      } 
      // ダウンロード先ディレクトリが存在しない場合は作成
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
      }
      // ダウンロード先ディレクトリが存在しない場合は作成
      if (!fs.existsSync(roamingPath)) {
        fs.mkdirSync(roamingPath);
      }
              // 2GB制限で以降は上書きする
              const maxSizeBytes = 2 * 1024 * 1024 * 1024;  // 2GB
              const videoFiles = fs.readdirSync(downloadPath).filter(file => path.extname(file) === '.ts');
                const totalSize = videoFiles.reduce((acc, file) => {
                  const filePath = path.join(downloadPath, file);
                  const stats = fs.statSync(filePath);
                  return acc + stats.size;
                }, 0);
      
              if (totalSize >= maxSizeBytes) {
                const sortedVideoFiles = videoFiles.sort((a, b) => {
                  // ファイル名から正規表現を用いてタイムスタンプを抽出し、Dateオブジェクトへ格納比較
                  const timeA = a.match(/(\d{4}_\d{2}_\d{2}T\d{2}_\d{2}_\d{2}_\d{3}Z)/)[0];
                  const timeB = b.match(/(\d{4}_\d{2}_\d{2}T\d{2}_\d{2}_\d{2}_\d{3}Z)/)[0];
                  return (new Date(timeA) - new Date(timeB));
                });
                const oldestFile = sortedVideoFiles[0];
                const oldestFilePath = path.join(downloadPath, oldestFile);
                // 最も古いファイルを削除
                fs.unlinkSync(oldestFilePath);
              }

      if(masterSrc) {
        if(muteMode !== true) {
          console.log(`マスタープレイリストファイルを検出しました。ダウンロードを開始します`);
        }


        const currentTime = new Date().toString().replace(/[.\s:+()-]/g, '_');
        // マスターM3U8ファイルが見つかった
        const outputFileName = `${roamingPath}/master_${currentTime}.m3u8`;
        const filePath = path.join(roamingPath, outputFileName);

        try {
          const responsePromise = httpsRequest(masterSrc);
           responsePromise
           .then((response) => {
            const parser = new m3u8Parser.Parser();
            parser.push(response.data);
            parser.end();
  
            const parsedData = parser.manifest;
    
            // 選択条件（例: フレームレートと解像度）
            const EXAMPlE_ATTRS = [
              {"VIDEO": "chunked", "FRAME-RATE": 60, "RESOLUTION": {"width": 1920, "height": 1080}, "CODECS": "avc1.4D401F,mp4a.40.2"},
              {"VIDEO": "720p60", "FRAME-RATE": 60, "RESOLUTION": {"width": 1280, "height": 720}, "CODECS": "avc1.4D401F,mp4a.40.2"},
              {"VIDEO": "720p30", "FRAME-RATE": 30, "RESOLUTION": {"width": 1280, "height": 720}, "CODECS": "avc1.4D401F,mp4a.40.2"},
              {"VIDEO": "480p30", "FRAME-RATE": 30, "RESOLUTION": {"width": 852, "height": 480}, "CODECS": "avc1.4D401F,mp4a.40.2"},
              {"VIDEO": "360p30", "FRAME-RATE": 30, "RESOLUTION": {"width": 640, "height": 360}, "CODECS": "avc1.4D401F,mp4a.40.2"},
              {"VIDEO": "160p30", "FRAME-RATE": 30, "RESOLUTION": {"width": 284, "height": 160}, "CODECS": "avc1.4D401F,mp4a.40.2"}
             ];
             // frameRate: playlist.attributes["FRAME-RATE"]
             // width: playlist.attributes.RESOLUTION.width
             // height: playlist.attributes.RESOLUTION.height
            const ATTR_NAME = '720p60';
            // 選択したバリアントプレイリストの取得
              for (const playlist of parsedData.playlists) {
                if (playlist.attributes.VIDEO === ATTR_NAME) {
                  variantPlaylist = playlist;
                }
              }
              // 一応残す 上書き書き込み
              // fs.writeFileSync(filePath, response.data);
              
           })
          .catch((error) => {
            console.error(error);
          });
          // ここで待たずに次の処理に進む

        } catch (error) {
          console.error(error);
        }
   
      }
      // 選択したバリアントプレイリストをダウンロード
      if (variantPlaylist) {
        if(muteMode !== true) {
          console.log(`一定数のバリアントプレイリストファイルを検出しました。ダウンロードを開始します`);
        }
      
          try {
                const selectedPlaylist = variantPlaylist;
                const playlistUri = selectedPlaylist.uri;
                const attrInfo = selectedPlaylist.attributes;
                // Download the playlist
                const playlistResponse = await httpsRequest(playlistUri);
                const playlistContent = playlistResponse.data;
          
                // Extract segment URLs and PROGRAM-DATE-TIME values
                const segments = [];
                let match;
                const regex = /^#EXT-X-PROGRAM-DATE-TIME:(.+)\n#EXTINF:(\d+\.\d+),(.+)\n(.+)$/gm;
                while ((match = regex.exec(playlistContent)) !== null) {
                  const startTime = match[1];
                  const duration = match[2];
                  const url = match[4].trim();
                  // 重複しないように
                  if (registerTable.has(startTime)){
                    continue;
                  }else{
                    registerTable.add(startTime);
                    segments.push(
                      { startTime: startTime,
                        duration: duration,
                        url: url,
                        attrInfo: {frameRate: attrInfo["FRAME-RATE"], width: attrInfo.RESOLUTION.width, height: attrInfo.RESOLUTION.height, codecs: attrInfo.CODECS}
                      });
                  }
                }
          
                // Download and combine segments
                for (const segment of segments) {
                  if(muteMode === 'URL') {
                    ;
                  } else {
                    console.log(`Downloading segment: ${segment.url}`);
                  }
                  // const segmentResponsePromise = httpsRequest(segment.url);
                  // axiosを用いてストリーム形式で扱う
                  const readStreamResponsePromise = axios({
                    method: 'get',
                    url: segment.url,
                    responseType: 'stream', // レスポンスをストリーム形式で取得
                  });

                // レスポンスが完了したらファイルにパイプする
                readStreamResponsePromise
                .then((readStreamResp) => {
                  const convertedTimeDataString = segment.startTime.replace(/[.\s:+()-]/g, "_");
                  
                    const outputFileName = `TMPfragment_${convertedTimeDataString}to${segment.duration}seconds.ts`;
                    const filePath = path.join(roamingPath, outputFileName);
                    const writeStream = fs.createWriteStream(filePath);
                    readStreamResp.data.pipe(writeStream);
                    writeStream.on('error', (error) => {
                      //ループ頻度によるが、バリアントプレイリストの数が2なので、大丈夫なはず
                      registerTable.delete(segment.startTime);
                      console.error(error)
                    });
                    writeStream.on('finish', () => {
                      // Save segments to a file
                      segInfo.push({startTime: segment.startTime,  duration: segment.duration, filePath: filePath, attrInfo: segment.attrInfo});
                      if(muteMode !== true) {
                        console.log(`${outputFileName} Segments downloaded successfully.`);
                        console.log(readStreamResp.data);
                      }                                            
                    });        
                })
                .catch((error) => {
                  console.error(error);
                });

                // ここで待たずに次の処理に進む
                }
                          
              } catch (error) {
                console.error('Error:', error.message || error);
              }
       } else {
          console.error('Selected playlist not found.');
       }
      //roamingファイルの合成 total30～60秒ごとになるはず
      if(segInfo.length >= 14) {
        const startTime = segInfo[0].startTime;
        const convTimeDataString = startTime.replace(/[.\s:+()-]/g, "_");
        const totalDuration = 14*segInfo[0].duration; //30～60秒間のassファイル
        const assFileName = `addData_${convTimeDataString}to${Math.floor(totalDuration)}seconds.ass`;
        const assFolderPath = assPath; // ASS ファイルの保存先パスを指定
        const assFilePath = path.join(assFolderPath, assFileName);
        const width = segInfo[0].attrInfo.width;
        const height = segInfo[0].attrInfo.height;
        let context = 'default';

        if(streamerName) {
          if(procObjfromParent.userObjList[0].category) {
            context = `${streamerName} ${procObjfromParent.userObjList[0].category.textContent}`; //styleにセッションコンテキストを付与 (例 `karubi 雑談`
          } else {
            context = `${streamerName}`; //styleにセッションコンテキストを付与 (例 返信相手のユーザ名など
          }
        }
        
        // テンプレート
        const scriptInfoTemplate =`[Script Info]\n; Script generated by BK 2.0.2\nTitle: <untitled>\nOriginal Script: <unknown>\nPlayResX: ${width}\nPlayResY: ${height}\n`;
        
        const v4StylesTemplate = `[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Vesta,48,&H00FFFFFF,&H00FFFFFF,&H005D3934,&H80000000,0,0,0,0,100,100,0,0,1,3,1.5,2,64,64,33,1\nStyle: ${streamerName},Arial Rounded MT Bold,30,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,10,10,10,1\nStyle: ${streamerName} SING,Vesta,48,&H007D1C1F,&H806B00D9,&H00F9F8F6,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,8,63,63,32,1\nStyle: ${context},Vesta,48,&H00FFFFFF,&H00FFFFFF,&H005D3934,&H80000000,0,0,0,0,100,100,0,0,1,3,1.5,8,64,64,33,1\n`;
        const eventsHeaderTemplate = `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

        // シャロ―コピー作成
        procObjfromParent.commentDataList = procObjfromParent.commentBufList.slice();
          // const commentDataToAssList = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));                        
          // ASSファイルを作成または上書き
          fs.writeFileSync(assFilePath, scriptInfoTemplate + v4StylesTemplate + eventsHeaderTemplate);
          const targetTime = new Date(startTime);
          let endTime = new Date(startTime);
          endTime.setSeconds(targetTime.getSeconds() + totalDuration);
        
          // JSONデータをASSフォーマットにマッピングしてファイルに書き込む
          procObjfromParent.commentDataList.forEach((entry, index) => {
            const comTimeStamp = new Date(entry.timestamp);
            // 指定された時刻以降で、マージ動画のtotalDuration後の時刻より前のコメントを対象にする
            let i=0;
            if (comTimeStamp >= targetTime && comTimeStamp < endTime) {
              const startTime = `0:${String(comTimeStamp.getHours()).padStart(2, '0')}:${String(comTimeStamp.getMinutes()).padStart(2, '0')}:${String(comTimeStamp.getSeconds()).padStart(2, '0')}.${String(comTimeStamp.getMilliseconds()).padStart(2, '0')}`;
              const edDate = new Date(comTimeStamp.getTime() + 5000); // Startの5秒後まで表示する
              const endTime = `0:${String(edDate.getHours()).padStart(2, '0')}:${String(edDate.getMinutes()).padStart(2, '0')}:${String(edDate.getSeconds()).padStart(2, '0')}.${String(edDate.getMilliseconds()).padStart(2, '0')}`;
              let style = `Default`;
        
              if(streamerName) {
                if(procObjfromParent.userObjList[0].category) {
                  style = `${streamerName} ${procObjfromParent.userObjList[0].category.textContent}`; //styleにセッションコンテキストを付与 (例 `karubi 雑談`
                } else {
                  style = `${streamerName}`; //styleにセッションコンテキストを付与 (例 返信相手のユーザ名など
                }
              }
              const name = entry.usernameCanonical; // ユーザー名を使用
              // MarginVの計算（50ずつ追加し、250を超えたら0に戻す）
              const marginV = (index * 50) % 250;
              const text = `${entry.displayName}: ${entry.textFragment}`;
              const assLine = `Dialogue: 0,${startTime},${endTime},${style},${name},0000,0000,${marginV},,${text}`;

              fs.appendFileSync(assFilePath, assLine);
              console.log(`commentToAssList(procObj.commentDataList)...here timestamp:${entry.timestamp} username:${entry.usernameCanonical} comment:${entry.textFragment}`);

              // ソート効率のため、なにかしらの対策を行うべきか
              i++;
          }
          console.log(`${i}件のコメントをassファイルへ転送します`);

          });


        // segInfoをstartTimeの昇順でソート
        segInfo.sort((a, b) => {
          const timeA = new Date(a.startTime).getTime();
          const timeB = new Date(b.startTime).getTime();
    
          if (timeA < timeB) {
            return -1;
          } else if (timeA > timeB) {
            return 1;
          } else {
            return 0;
          }
        });
    
        // ffmpeg
        console.log('セグメント連結情報を保存しています');
        const configFileName = 'ffmpeg_input.txt';
        const cFilePath = path.join(configPath, configFileName);
        const ffConfig = segInfo.map(el => `file '${el.filePath}'`).join('\n');
        const convertedTimeDataString = segInfo[0].startTime.replace(/[.\s:+()-]/g, "_");
        const tsFilePath = path.join(downloadPath, `mergedStreamData_${convertedTimeDataString}to${Math.floor(totalDuration)}seconds.ts`);
        const mSegInfoFileName = 'saved_ffmpeg_input.txt';
        const mcFilePath = path.join(configPath, mSegInfoFileName);

        // 上書き書き込み
        fs.writeFileSync(cFilePath, ffConfig);
        console.log(`${configFileName} saved successfully.`);            
        // Use ffmpeg to concatenate the segments
        const ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${cFilePath}" -c copy "${tsFilePath}"`;
        const execPromise = util.promisify(ch.exec);

        // assファイル作成準備
        

        execPromise(ffmpegCommand)
        .then((readStreamResp) => {
      
          // 上位のセグメント情報を保存
          const mSegElem = { startTime: segInfo[0].startTime, duration: totalDuration, filePath: tsFilePath};
          mergedSegInfo.push(mSegElem);
          // テンプレートリテラルによるカスタムシリアライズ
          const serialData = `${mSegElem.startTime},${mSegElem.duration},${mSegElem.filePath}`
          // append または新規作成
          if (fs.existsSync(mcFilePath)) {
              fs.appendFileSync(mcFilePath, '\n' + serialData);
            } else {
              fs.writeFileSync(mcFilePath, serialData);
            }

          // 使用した断片のローミングデータを削除する
          console.log('ローミングデータの結合が完了しました。');
          const unlinkPromise = util.promisify(fs.unlink);
          segInfo.map((el) => {
            return unlinkPromise(el.filePath);
          });
          console.log('ローミングデータを削除しました。');
          // segInfoを空にする
          segInfo.length = 0;

        })
        .catch((error) => {
          console.error('動画キャプチャエラー:', error);
        });
      }
    }, 7000);
  

      

/* ==========tmp

        // 3秒ごとにセグメントを保存
        while (totalDuration >= 3) {
          const partialDuration = Math.min(totalDuration, 3);
          const partialSegments = segments.splice(0, Math.floor(partialDuration / segmentDuration));

          // 合計時間から3秒を引く
          totalDuration -= 3;

          // 合成して保存
          const currentTime = new Date().toISOString().replace(/[.\s:+()-]/g, ''); // 時刻情報を取得して、コロンとピリオドを削除
          const combinedVideo = Buffer.concat(partialSegments);
          const userDirectoryPath = path.join(myLib.USER_DATA_PATH, `./${userObj.usernameCanonical}`);
          const fullPath = path.join(userDirectoryPath, `combinedVideo_${currentTime}_${totalDuration}s.mp4`);
          fs.writeFileSync(fullPath, combinedVideo);

          const maxSizeBytes = 2 * 1024 * 1024 * 1024;  // 2GB
          // 2GB制限で以降は上書きする
          checkAndOverwriteVideos(userDirectoryPath, maxSizeBytes);

        }
      }

    }
==========tmp */

}
/* =======動画フェッチイベントハンドラ終了=====================================================*/

    const datPromise = await page.evaluate(() => {
      /* ====================START BROWSER CONTEXT=============================== */
                debugger; // chrome debug recommended
    
                const ch = document.querySelector('[data-a-target=stream-game-link]');
                if(ch) {
                  resolve({category: {textContent: ch.textContent, href: ch.href}});
                }
     })
     .then (
      (dat) => {
        procObjfromParent.userObjList[0].category = dat; //戻ったらcategory(雑談)をmyLibの方もいずれ編集追加したい
      },
      (err) => {
        console.log('Err rejected', err); // Error!
        return err;
      },
     )

                      
            /* ====================END BROWSER CONTEXT=============================== */
            
/*============================== 定期的にコメントを取得====================================================*/
    let chk_flg = 0;
      while(myLib.gv_isProcLoop)
      {
 
        /*
        await Promise.all([
          page_handle.page.goto(url),
          // page.click('body > div > p:nth-child(3) > a'),
          page_handle.page.waitForNavigation()
        ]);
        */
         await myLib.sleep(null,100);
         let newCommentList = [];
         newCommentList = await processChatMessage(page_handle, procObjfromParent);
         if( newCommentList.length !== 0) {
          await saveAndClearQueue(procObjfromParent, newCommentList);
          newCommentList = [];
         }else{
            if (newCommentList.length === 0) {
              chk_flg++;
              if(1000 < chk_flg) {
                               // onlineかどうかのフラグを取得
                               const promise1 = await page.evaluate(() => {
                                /* ====================START BROWSER CONTEXT=============================== */
                                              debugger; // chrome debug recommended
                                  
                                              const purpose = document.getElementById('offline-channel-main-content');
                                              return purpose;
                               })
                               .then (
                                (dat) => {
                                  resolve(dat);
                                },
                                (err) => {
                                  console.log('Err rejected', err); // Error!
                                  return err;
                                },
                               )
                               if(promise1){
                                process.exit();
                                // いずれcontrolにその旨送信したい
                               }
            
                                          
                                /* ====================END BROWSER CONTEXT=============================== */

              }
            }
          }
         await myLib.sleep(null, 15000);

        
      }
  
}
