// ./myLib/index.js
// 使用例は const myLib = require('./myLib')
// からの myLib.gv_publicVariable;

const childProcess = require('child_process');
let path = require('path');
let { mainModule } = require('process');
const fs = require('fs');
const { join } = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');

    // ========================globalVariableDefinition==================================
    /**
     * グローバル変数の設定
     * @type {Object}
     * @property {string} NODEJS_FOLDER_PATH - Node.jsのパス
     * @property {string} JSON_DATA_PATH - JSONデータのパス
     * @property {string} PYTHON_SCRIPT_PATH - Pythonスクリプトのパス
     * @property {string} USER_DATA_PATH - ユーザーデータのパス
     * @property {string} DEFAULT_DIR_PATH - フォルダのデフォルトパス
     * @property {Array} admin_registerdChildProcObjList - 管理専用 子プロセスオブジェクトのリスト
     * @property {number} admin_gv_createdChildProcNum - 管理専用 作成された子プロセスの総数。proc_id割り当てに使用
     * @property {number} admin_gv_currentChildProcNum - 管理専用 子プロセスの総数
     * @property {boolean} gv_isProcLoop - outrHTMLの処理がループ中かどうかのフラグ
     * @property {number} gv_dbg_cnt - デバッグ用のカウンタ
     */
 let    gv_publicVariableSample = 'This is a public variable';
 let    NODEJS_FOLDER_PATH = process.env.NODEJS_FOLDER_PATH;
 let    JSON_DATA_PATH = process.env.JSON_DATA_PATH;
 let    PYTHON_SCRIPT_PATH = process.env.PYTHON_SCRIPT_PATH;
 let    USER_DATA_PATH = process.env.USER_DATA_PATH;
 let    DEFAULT_DIR_PATH = process.env.USER_DATA_PATH; // フォルダのパスが取得できない場合のデフォルトの値
 let    CHROME_FOLDER_PATH = process.env.CHROME_FOLDER_PATH; // C:\Program Files\Google\Chrome\Application
 let    EDGE_FOLDER_PATH = process.env.EDGE_FOLDER_PATH; // C:\Program Files (x86)\Microsoft\Edge\Application
 let    BROWSER_DATA_PATH = process.env.BROWSER_DATA_PATH;
 let    HTTP_PROXY = process.env.HTTP_PROXY;
 let    PROXY_PORT = process.env.PROXY_PORT;
 let    PROXY_USER = process.env.PROXY_USER;
 let    PROXY_PASSWORD = process.env.PROXY_PASSWORD;
 let    browserFolderPath = CHROME_FOLDER_PATH;
 let    browserDataPath = BROWSER_DATA_PATH;
 let    browserName = 'chrome.exe';
 let    browserDataDir = 'CrawlerChromeData';
 let    jsonfilename = {out: 'NewTestDataForWrite.json' , in: 'TargetHost.json'};
 let    admin_registerdChildProcObjList = []; // 管理専用 子プロセスオブジェクトのリスト
 let    admin_registerdUserObjList = []; // 管理専用 ユーザーオブジェクトのリスト
 let    admin_registerdTargetUserList =[]; // // 管理専用 ターゲットジェイソンデータのリスト
 let    admin_registerdbrowObjList =[]; // // 管理専用 ブラウザオブジェクトのリスト
 let    admin_checkTimeStampList =　[]; // // 管理専用 クローラからのタイムスタンプのリスト
 let    admin_gv_createdChildProcNum = 0; // 管理専用 作成された子プロセスの総数。proc_id割り当てに使用
 let    admin_gv_currentChildProcNum = 0; // 管理専用 子プロセスの総数
 let    admin_gv_createdChildBrowNum = 0; // 管理専用 作成されたブラウザの総数。brow_id割り当てに使用
 let    admin_gv_createdUserObjNum = 0; // 管理専用 作成されたユーザオブジェクトの総数。更新判断に使用
 let    gv_maxObjNumRestricted = 5; // 子プロセスオブジェクトのリストの最大値
 let    gv_maxBrowNumRestricted = 15;
 let    gv_isProcLoop = true; // outerHTMLの変換処理はデフォルトでtrue
 let    gv_dbg_cnt = 0;
 let    gv_entryTable = []; //再入禁止用ハッシュテーブル



 /*global_config*/
 let    PROXY_DISABLED = process.env.PROXY_DISABLED;
let puppeteer = require('puppeteer'); //let    puppeteer = require('puppeteer-core');

module.exports.gv_publicVariableSample = gv_publicVariableSample;
module.exports.NODEJS_FOLDER_PATH = NODEJS_FOLDER_PATH;
module.exports.JSON_DATA_PATH = JSON_DATA_PATH;
module.exports.PYTHON_SCRIPT_PATH = PYTHON_SCRIPT_PATH;
module.exports.USER_DATA_PATH = USER_DATA_PATH;
module.exports.DEFAULT_DIR_PATH = DEFAULT_DIR_PATH;
module.exports.CHROME_FOLDER_PATH = CHROME_FOLDER_PATH;
module.exports.EDGE_FOLDER_PATH = EDGE_FOLDER_PATH;
module.exports.BROWSER_DATA_PATH = BROWSER_DATA_PATH;
module.exports.HTTP_PROXY = HTTP_PROXY;
module.exports.PROXY_PORT = PROXY_PORT;
module.exports.PROXY_USER = PROXY_USER;
module.exports.PROXY_PASSWORD = PROXY_PASSWORD;
module.exports.EDGE_FOLDER_PATH = EDGE_FOLDER_PATH;
module.exports.browserFolderPath = browserFolderPath;
module.exports.browserDataPath = browserDataPath;
module.exports.browserName = browserName;
module.exports.browserDataDir = browserDataDir;
module.exports.jsonfilename = jsonfilename;
module.exports.admin_registerdChildProcObjList = admin_registerdChildProcObjList;
module.exports.admin_registerdUserObjList = admin_registerdUserObjList;
module.exports.admin_registerdTargetUserList = admin_registerdTargetUserList;
module.exports.admin_registerdbrowObjList = admin_registerdbrowObjList;
module.exports.admin_checkTimeStampList = admin_checkTimeStampList;
module.exports.admin_gv_createdChildProcNum = admin_gv_createdChildProcNum;
module.exports.admin_gv_currentChildProcNum = admin_gv_currentChildProcNum;
module.exports.admin_gv_createdChildBrowNum = admin_gv_createdChildBrowNum;
module.exports.admin_gv_createdUserObjNum = admin_gv_createdUserObjNum;
module.exports.gv_maxObjNumRestricted = gv_maxObjNumRestricted;
module.exports.gv_maxBrowNumRestricted = gv_maxBrowNumRestricted;
module.exports.gv_isProcLoop = gv_isProcLoop;
module.exports.gv_dbg_cnt = gv_dbg_cnt;
module.exports.gv_entryTable = gv_entryTable;

module.exports.PROXY_DISABLED = PROXY_DISABLED;
module.exports.puppeteer = puppeteer;




    // ========================globalVariableDefinitionEND==================================


  // =================== ObjectTemplateDefinition ==================

let  procObjectTemplate = {
    hash: null, //重複判定 proc_attr_usernameCanonical_proc `'scraping'_${target_obj.target_id}_proc`
    proc_attr: '',
    proc_id: null,
    proc_handle: {},
    session: '',
    handler_func: '',
    handler_args: [], // 例 sleep関数を呼び出す procObj.handler_args = [1000]; 意味 msg_dstが1秒スリープ。 例2 procObjectTemplate.handler_args = ['newArg1', 'newArg2'];
    proc_cmd: '', //sync_obj ... obj_dataを自身のproc_dataと同期させなさい(与えられたデータで更新しなさい)
    proc_data: {}, // プロセス生成などに用いる一時的なデータ置き場
    intervalTime: null, // 別プロセスへの一時的な停止リクエストのセッションでも用いる 自身のプロセスのインターバルタイムになる予定
    exec_filename: '',
    read_json_path: '',
    url: '',
    browObjList: [], // @param {array.<browObjectTemplate>}
    userObjList: [], // @param {array.<userObjectTemplate>}
    commentDataList: [], //@param {array.<commentDataTemplate>}
    commentBufList: [], //@param {array} Bufferdata for_commentDatalist
    rawHtmlList: [], //@param {array} Rawdata for_commentDatalist
    savedata_que_list: [], //que for save to local file
    info:'', //プロセス間データ転送による付帯情報 index等
    log:'', // プロセス間データ転送による追加テキストログ 説明用
    esc_flg: false
    };
module.exports.procObjectTemplate = procObjectTemplate;

let messageObjectTemplate = {
  src: null, //送信元プロセスのid -1はコントロール
  dst: null, //宛先プロセスのid -1はコントロール
  procObj: {...procObjectTemplate}, // 自身のprocObject
  obj_data: {}, // 渡したいオブジェクトのデータ
  };
module.exports.messageObjectTemplate = messageObjectTemplate;

let   userObjectTemplate = {
    seq_num: null, // 連番
    uid: 'uid_value', // 例： ユーザ固有のObjectid
    origin_idx: null, // 子プロセスがコピーした際のコピー元uid
    hash: 'hash_value',  // 例: hash値
    usernameCanonical: 'username_value',  // 例: ユーザー名
    displayName: 'display_name_value',  // 例: 表示名
    textFragment: 'text_fragment_value',  // 例: コメント
    user_folder_path: '', // ここにユーザ固有名のディレクトリを挿入 
    sex:'', // male,female
    vip_flag: false,  // 例: VIPフラグ
    streamer_flag: false, // 例： 配信者フラグ
    officialName: 'official_name_value',  // 例: 公式名
    user_profile: null,
    follower_num: 'follower_value',  // 例: フォロワー数
    link_url_list: [], // [{discord: https~}, {twitter: https~}]
    titleCategories: 'title_categories_value',  // 例: タイトルカテゴリ
    timestamp: 'time_stamp_value',  // 例: タイムスタンプ
    imgSrc: 'imgSrcURL',
    isOnline: false, // OnlineIDリストに新規挿入するかの判定に使用
    url:'', // 子プロセス生成の際、ターゲットURLを入れる
    now_scraping_running: false, // スクレイピングコントロールに使用
    current_audience: null, // 同時接続数
    session_time: null, // isOnlineになってからisOfflineになるまでのセッション中の配信時間
    total_time: null, // 総配信時間
    lastOnlineDate: 'lastOnlineDateString',
    account_registeredDate: null,
    account_frozenDate: null,
    update_time: null, // 変更されたタイムスタンプを取得 control側で最終的な更新データを判断
    tmp: {} //実行時間計測用runtimetmp
    };
module.exports.userObjectTemplate = userObjectTemplate;

   // browserObjectのひな形
let   browObjectTemplate = {
    hash: null,
    brow_id: 0, 
    browser: {},
    protocol: "https://",
    baseURL: "www.twitch.tv/",
    mode: '', /* ブラウザのscript読み込みを制限 */
    proxy: {url: '', port: '', user: '', password: ''}, /* httpプロキシに対応 */
    launchOptions: { 
//       executablePath: '' , /* ソース上で設定 */
       headless: false, /* ヘッドレスモードで起動するかどうか。デバッグ段階では false を設定することで動きを目視で確認できる */
       slowMo: 250, /* 各操作の前に入れる遅延(ms)を設定 */
       defaultViewport: null,  /* 画面のサイズを設定。スクリーンショットを撮る場合は設定しておいたほうが良い */
	     timeout: 30000, /* ブラウザの開始を待つ最長時間(ms)を設定。タイムアウトを無効にする場合 0 を設定*/
       args: [/* '--incognito' ブラウザをシークレットモードで起動 */]
    },
    page_handle_list: []  // @param {Array.<pageHandleTemplate>}
    };
   // page_handleのひな形
module.exports.browObjectTemplate = browObjectTemplate;

let  pageHandleTemplate = {
    page_id: 0,
    page:{},
    url:{},
    target_id_list: [], // @param {Array.<targetIDTemplate>}
    dir_list: [],
    query_list: [],
    emg_idx: 0
    };
  // target_idのひな形
module.exports.pageHandleTemplate = pageHandleTemplate;

let   targetIDTemplate = {
    sequence_num: null,
    uid: null,
    target_id: null
    };
module.exports.targetIDTemplate = targetIDTemplate;

  // コメントデータのひな形
let  commentDataTemplate = {
   hash:'', //hash
   usernameCanonical:'', // usernameCanonical
   displayName:'', // displayName 
   textFragment:'', // textFragment
   timestamp:'' // timestamp
   };
module.exports.commentDataTemplate = commentDataTemplate;

  // HTMLDOMのひな形
  let  htmlDomTemplate = {
    purpose: '',
    outerHTML: 'ch.outerHTML',
    tagName: 'ch.tagName',
    text: {el: null, label: null},
    href: {href: 'ch.href', textContent: 'siteName', label: 'csLabel'},
    img: {src: 'ch.src', alt: 'officialName'},
    csData: {
      currentAudience: {el: null, label: '視聴者数'},
      sessionTime: {el: null, label: 'csLabel'},
      userProfile: {el: 'profileData', label: 'csLabel'},
      followerNum: {el: -1, label: 'フォロワー数'},
      lastDate: {el: null, label: '前回の配信がある場合に入る値'}
    },
    tmpList: {any1: [], any2: []}, ///any3...[]
    info: {uid: -7, cur: 'current_func', query: 'que', log: ''},
    timestamp: null, // timestamp
    error: null
    };  
       // 他にも必要なプロパティを追加

 module.exports.htmlDomTemplate = htmlDomTemplate;

 // 定期的にデータを送信するインターフェースで使用
let  intervalSendDataTemplate = {
  hash: null, //hash
  objecttable1:[{}], // admin_registeredtable用
  objecttable2:[{}], // admin_registerdtable用 
  timestamp:'' // timestamp
  };
module.exports.intervalSendDataTemplate = intervalSendDataTemplate;




// =================== ObjectTemplateDefinition END ===================

/* ==================== handlerdefiniton ========================================================*/
let handlerFunctions = [
{name: 'start', fn: start, attr: 'async'},
{name: 'sleep', fn: sleep, attr: 'async'},
{name: 'blockTime', fn: blockTime, attr: 'sync'},
{name: 'judge_fork_process', fn: judge_fork_process, attr: 'async'}
];
module.exports.handlerFunctions = handlerFunctions;
/* ==================== handlerdefiniton END ========================================================*/

// ===================================GlobalFuncitonDefiniton=======================================


/* ==================== awモジュール ========================================================*/
  /**
   * awモジュールの関数 await wrapperモジュール
   * @type {Object}
   * @property {function} wrapper_forkAndSendProcSync - 関数の説明...
   * @property {function} wrapper_forkAndWaitEnd - 別の関数の説明...
   */

/**
 * process.sendのラッパー関数
 * @param {messageObjectTemplate} message - 宛先とソースを含んだprocObject
 * @returns {void}
 */
async function wrapper_process_send(message){
  process.send(message);
};
module.exports.wrapper_process_send = wrapper_process_send;

/**
 * LibraryFunction forkAndProcDataSendAsync
 * 子プロセスを生成する一連の処理の実行順序制御関数 リクエストハンドラから呼ばれた際でも、リクエストハンドラ依頼元のProcObjを用いて一連の処理を行う。 setUpChildLisnterは問題ない
 * @param {procObjectTemplate} MyprocObj - prco_dataに子プロセスに関する情報が格納された自らのプロセスのオブジェクト ここでのMyprocObjとはセッションオリジナルなプロセスのオブジェクトを指す(msgの一次的な宛先とは違う)
 * @returns {Promise<any>} - 処理が完了した際には結果を含むPromiseオブジェクト
 */
async function forkAndProcDataSendAsync(MyprocObj, newChildProcObj) {
  return new Promise((resolve, reject) => {
    if(!newChildProcObj.proc_attr){
      reject();
     }

    // 参照渡し
    let newProcObj = newChildProcObj;
    let command = path.join(process.env.NODEJS_FOLDER_PATH || process.env.DEFAULT_DIR_PATH, newProcObj.exec_filename);
    // 子プロセス生成
    newProcObj.proc_handle = childProcess.fork(command);
  
    if(!newProcObj.proc_handle) {
      console.log('___ERR_childProcHandleisNotSet REQUEST OF CHILD PROCESS CREATE IS REJECTED');
      reject();
    }
  
     // デバッグ用 --inspect=0 means random free port.
     // let myChild = childProcess.fork(command, [], { execArgv : ['--inspect=0'] });

     // procIDの割り当て
     newProcObj.proc_id = admin_gv_createdChildProcNum;
     newProcObj.session = null;

     const tmp = newChildProcObj.userObjList[0].usernameCanonical;
     if(tmp) {
       //ハッシュ生成
       let salt = `${newChildProcObj.proc_attr}_${tmp}_proc`;
       newChildProcObj.hash = generateHash(salt);
     }else{
      console.log('___ERR_childProcUserObjisNotSet REQUEST OF CHILD PROCESS CREATE IS REJECTED');
      reject();
     }

     // admin_子プロセスリストへの登録
     
     admin_registerdChildProcObjList.push( newProcObj);
     // 生成子プロセス数のカウントアップ
     admin_gv_createdChildProcNum++;
     admin_gv_currentChildProcNum++;
     // 子プロセスへ送信するメッセージオブジェクトの作成
     let src = -1; // メッセージソースはコントロールプロセスからに偽装されるが、念のためセッションオリジナルなMyprocObjは保持している
     let dst = newProcObj.proc_id;
     let msg = createMsg(src, dst, MyprocObj, newProcObj);
     
      setupChildProcessListeners(MyprocObj, newProcObj);
      sysReq(msg);
      resolve(msg);
  
  });
};
module.exports.forkAndProcDataSendAsync = forkAndProcDataSendAsync;



/* ==================== awモジュール終了 ========================================================*/


/*=========================browserContextModule=========================*/

  // const qList = ['a',':scope [class^=CoreText]','another-selector'];
  // 'live-time'
  // '#live-channel-about-panel'
  // ':scope [class^=CoreText]'
  /**
 * DOM内で再帰的に指定されたセレクタに一致する要素を検索する関数
 * @param {string[]} args - セレクタ文字列の配列
 * @param {Document | HTMLElement} [scope=document] - 検索範囲の要素またはドキュメント
 * @returns {NodeList} - セレクタに一致する要素のノードリスト
 */
  function getSelectorwrapper(args, scope = document) {

    const nodeList = scope.querySelectorAll(args[0]);
    args.shift();
    if (nodeList.length === 0) {
      return [] // クエリが残っているのにも関わらず、nodeが存在しない場合
    }
    if (args.length === 0) { // 仕事がないなら
      let arr = [];
      let dat = [];
      arr = Array.from(nodeList);
      for (let el of arr) {      
        dat.push(el.textContent);
      }
      return dat; //ゴミ出し
    }

  
    // 再帰的に処理を行う 
    let datList = [];     
      for (let newScope of nodeList) {
        let recRet = [];
        if (args.length) { // 仕事があるなら
          recRet = myfunc(args, newScope); // 部下にやらせる
        }
      }

      return datList;
  }
  // myfunc(['div', 'p', 'span']);
  // myfunc([':scope [class^=CoreText]']);
  // myfunc([':scope div']);
  // myfunc([':scope #live-channel-about-panel',':scope [class^=CoreText]']);
  // myfunc([':scope div',':scope [class^=CoreText]']);
  // myfunc([':scope div', ':scope p', ':scope span']);
// 使用例:
// div, p, span タグ内で再帰的に要素を検索し、結果を取得する
//const result = myfunc(['div', 'p', 'span']);
//console.log(result);

module.exports.getSelectorwrapper = getSelectorwrapper;


/*=========================browserContextModuleEnd=========================*/

/* ==================== handlerモジュール ========================================================*/
  /**
   * handlerモジュールの関数 リクエストハンドラ関数
   * @type {Object} handlerFunctions
   * @property {function} start - 関数の説明...
   * @property {function} sleep - 別の関数の説明...
   * @property {function} judge_fork_process - 別の関数の説明...
   */
  // リクエストハンドラ関数のテンプレート

/**
 * handlerFunction: async start メイン関数 main(gv_proc_Obj)へのkickを行う。
 * @param {messageObjectTemplate} msg - メッセージオブジェクト
 * @returns {Promise<void>} - 非同期処理のためのPromiseオブジェクト
 */
async function start(msg){
  console.log('Executing Process start');
  let gv_procObj = msg.obj_data;
  await main(gv_procObj);
};
module.exports.start = start;

/**
* handlerFunction: async sleep 指定された時間だけ非同期に待機する関数
* @param {messageObjectTemplate} msg - メッセージオブジェクト
*   @property {number} dst - スリープ対象のプロセスID
* @param {number} ms - 待機する時間（ミリ秒）
* @returns {Promise<string>} - 指定された時間が経過した後のメッセージを含むPromiseオブジェクト
*/
async function sleep(msg, ms){
  return new Promise((resolve) => {
    setTimeout(() => {
      if(msg === null) {
        resolve(`${ms}ms秒経過`);
      } else {
        resolve(`${msg.procObj.proc_attr}:proc_id:${msg.dst}...${ms}ms秒経過`);
      }
    }, ms);
  })
};
module.exports.sleep = sleep;

/**
* handlerFunction: blockTime // 指定した`timeout`ミリ秒経過するまで同期的にブロックする関数
* @param {messageObjectTemplate} msg - メッセージオブジェクト
*   @property {number} dst - スリープ対象のプロセスID
* @param {number} ms - 待機する時間（ミリ秒）
* @returns {Promise<string>} - 指定された時間が経過した後のメッセージを含むPromiseオブジェクト
*/

function blockTime(msg, ms) {
  // Date.now()は現在の時間をUnix時間（1970年1月1日午前0時0分0秒から経過した時間）のミリ秒を返す
  const startTime = Date.now();
  // `ms`ミリ秒経過するまで無限ループをする
  while (true) {
      const diffTime = Date.now() - startTime;
      if (diffTime >= ms) {
          return; // 指定時間経過したら関数の実行を終了
      }
  }
}
module.exports.blockTime = blockTime;

/**
* handlerFunction: async judge_fork_process コントロール専用 プロセスの作成が可能か判定し、結果に応じた処理を行う関数。 子プロセスからリクエストを受けてキックされる。
* @param {messageObjectTemplate} msg - メッセージオブジェクト。以下のプロパティを含む。
*   @property {string} src - メッセージの送信元を示す文字列
*   @property {string} dst - メッセージの送信先を示す文字列
*   @property {procObjectTemplate} procObj - 子プロセスのプロパティオブジェクト
* @returns {void}
*/
async function judge_fork_process(msg) {
  

  //キック後なる早でディープコピーを作成 プロセス間でデータの読み書きは最低限に
  let procObjFromRequestHandlerOrigin = cloneDeep(msg.procObj); //プロセスハンドルの実体だけはページオブジェクトの性質上、コントロール以外にコピーできないので実体作成前にコピーしておく

  let newChildProcPtr = cloneDeep(msg.obj_data);
  // メッセージのオブジェクト開放
  msg.procObj = null;
  msg.obj_data = null;

  //エラーレスポンス用のダミープロセスオブジェクト
  const ControlProcDum = {...procObjectTemplate, proc_id: -1, proc_attr: 'control', proc_cmd: 'sync'}
  // セッションオリジナルなピアへのレスポンスメッセージを作成
  let src = msg.dst;
  let dst = msg.src;
  procObjFromRequestHandlerOrigin.proc_cmd = '';
  procObjFromRequestHandlerOrigin.session = '';
  procObjFromRequestHandlerOrigin.log = 'create_proc_denied.session_disconnected...';
  let err_resp_msg = {...messageObjectTemplate};
  err_resp_msg = createMsg(src, dst, ControlProcDum, procObjFromRequestHandlerOrigin);
  
  
  if(admin_gv_currentChildProcNum < gv_maxObjNumRestricted) {
    
    if(!newChildProcPtr.proc_attr) {
       //エラーレスポンス // adminテーブルから持ってくるように変更してみたい。adminテーブルから持ってこれなかったら再度こっちらにコールバックする
       console.log("___ERR_ proc_attr is undefine or null cant create new process");
       return;
    }
    switch(newChildProcPtr.proc_attr) {
      case 'control':
        //エラーレスポンス        
          console.log("cant create new control process");
           sysReq(err_resp_msg);
          // 要求プロセス側(crawlerがcmdsyncSessionで、syncSessiion処理を行う。関数syncSessionを作成し、sessionのstringに応じてグローバル変数に登録する)
          // 要求プロセス側(その後、createProcReqセッション内でinfoを見て、response:'done'ならprocPtrをローカル子プロセスレジスタテーブルに登録、'denied'なら何もしない)
          break;
    
      case 'crawler': //未実装       
        //エラーレスポンス
          console.log("cant create new crawler process unimplement");
           sysReq(err_resp_msg);       
          // 要求プロセス側(crawlerがcmdsyncSessionで、syncSessiion処理を行う。関数syncSessionを作成し、sessionのstringに応じてグローバル変数に登録する)
          // 要求プロセス側(その後、createProcReqセッション内でproc_dataを見て、response:'done'ならprocPtrをローカル子プロセスレジスタテーブルに登録、'denied'なら何もしない)
      break;
    
      case 'scraping':
        let isDuplicate = false;
        // admin_registerdChildProcObjList内で条件に合致する要素が存在するか確認
        for (let ptr of admin_registerdChildProcObjList) {
          if (ptr.hash === newChildProcPtr.hash) {
            // 条件に合致する要素(proc_attr(scraping)とカノニカルユーザネームが共に重複するプロセス)が存在する場合、Duplicateとする
            isDuplicate = true;
            break;
          }
        };
        await sleep(null, 20);
        if(isDuplicate) { //NG その旨送信
          //エラーレスポンス
            console.log("cant create duplicated process", newChildProcPtr);
            sysReq(err_resp_msg);

          }else{
          
            if(gv_maxObjNumRestricted < admin_gv_currentChildProcNum) {
              console.log('___admin REQUEST OF CHILD PROCESS CREATE IS REJECTED');
              reject();
            }else{ //OK 直接プロセスforkを実行
              await forkAndProcDataSendAsync(procObjFromRequestHandlerOrigin, newChildProcPtr);
              // adminへ新規にコピーされた子プロセス専用のユーザオブジェクトを登録
              newChildProcPtr.userObjList[0].uid = admin_gv_createdUserObjNum;
              admin_registerdUserObjList.push(newChildProcPtr.userObjList[0]);
              // 新規にコピーされた子プロセス専用のユーザオブジェクトをカウントアップ
              admin_gv_createdUserObjNum++;

              // エラー用だったprocObjFromRequestHandlerOriginを完了後初期化向けに再設定
              procObjFromRequestHandlerOrigin.proc_cmd = '';
              procObjFromRequestHandlerOrigin.session = '';
              procObjFromRequestHandlerOrigin.proc_data = null;
              procObjFromRequestHandlerOrigin.log = 'newChild proc_id is in proc.info here';
              procObjFromRequestHandlerOrigin.info = newChildProcPtr.proc_id;

              // 完了... Crawlerにproc_idを渡し、procObjの初期化もリクエスト
              let resp = createMsg(src, dst, ControlProcDum, procObjFromRequestHandlerOrigin);
        
              sysReq(resp);

   
              // 孫プロセスにおいて、定期的にサイトオンライン情報をチェックし、オフラインとなったらフラグを設定して task_killの要求を出す。
              // isOnline: false, //OnlineIDリストに新規挿入するかの判定に使用
              // now_scraping_running: false, //スクレイピングコントロールに使用
              // task_killの要求を受け取ったら、task_killし、gv_テーブル情報を更新する
            }
          }
    break;

    default:
    console.log("ERROR: NO ATTRIBUTE");
    break;
   }
 }
 return;

  };
module.exports.judge_fork_process = judge_fork_process;

  // ========================handlerFunctionDefinitionEND===============================


/* ==================== commonモジュール ========================================================*/
   /**
   * commonモジュールの関数 コモンモジュール
   * @type {Object}
   * @property {function} sysReq - 関数の説明...
   * @property {function} createMsg - 別の関数の説明...
   * @property {function} setupChildProcessListeners - 別の関数の説明...
   * @property {function} cloneDeep - 別の関数の説明...
   * @property {function} downloadAndSaveImage - 別の関数の説明...
   */

   /**
   * メッセージを指定した宛先に送る
   * 親プロセスへ送信したい場合、session="response", 'request' とする必要がある。
   * @param {number} ms - タイムアウト値 ms
   * @param {messageObjectTemplate} message - 宛先とソースを含んだprocObject
   * @returns {Promise} - promise
   */
async function sysReq(message){
  if(!message)
   {
      console.log('___ERR_MessageSendingERROR:message is undefined');
      return;
   }
    if(message.dst == -1){
      wrapper_process_send(message);
      console.log('ProceessMessage send to Control done', message)
    }else{
      let proc_handle;
      for(let ptr of admin_registerdChildProcObjList){
        if(ptr.proc_id === message.dst) {
        proc_handle = ptr.proc_handle;
        break;
        }
      }
      if (proc_handle === null){
        console.log('___ERR_MessageSendingERROR:ourChildIdIsNotRegistered');
        return;
      }
       if (typeof proc_handle === 'object') {
        proc_handle.send(message);
        return;
      }else{
        console.log('___ERR_MessageSendingERROR:');
        return;
      }
    }
};
module.exports.sysReq = sysReq;
  
  /**
   * メッセージオブジェクトの作成関数。
   * @param {} src - ソース 'control','crawler','scraping'
   * @param {} dst - 宛先   'control','crawler','scraping'
   * @param {procObjectTemplate} MyprocObj - セッションオリジナルなMyprocObject
   * @return {messageObjectTemplate} messageObject
   */
function createMsg(src, dst, MyprocObj, obj_data) {
    // メッセージオブジェクトの作成
    let messageObject = {...messageObjectTemplate};
    messageObject.src = src;
    messageObject.dst = dst;
    messageObject.procObj = MyprocObj;
    messageObject.obj_data = obj_data;
    return messageObject;
};
module.exports.createMsg = createMsg;
  
   /**
   * @param {procObjectTemplate} childProcObj - 子プロセスに関するデータオブジェクト
   *    - proc_cmd: コマンドの種類を示す文字列
   *    - proc_data: コマンドに関連するデータを含むオブジェクト（例: { duration: 10 }）
   *    - proc_handle: 対象の子プロセスのハンドル
   *    - handler_func: 'handler' コマンド時に実行されるリクエストハンドラ関数の名前
   * @returns {void}
   *    - この関数は返り値を返さず、設定が完了したらリターンします。
   *    - 設定が完了すると、対象の子プロセスに対してイベントリスナーが登録されます。
   * 
   * イベントリスナー:
   * - 'exit': 子プロセスが終了する際に発生するイベントに対する処理を登録します。
   *   終了コードとシグナルをログに出力し、必要に応じてプロセスを再起動します。
   * 
   * - 'error': 子プロセスでエラーが発生した際に発生するイベントに対する処理を登録します。
   *   エラーメッセージをログに出力します。
   * 
   * - 'message': 子プロセスからメッセージが送信された際に発生するイベントに対する処理を登録します。
   *   受け取ったメッセージに基づいてさまざまな処理を行います。
   *   - 'start' コマンド: エラーログを出力して処理を中断します。
   *   - 'listen' コマンド: 特定の処理を行います。
   *   - 'handler' コマンド: 有効なリクエストハンドラ関数が指定されていれば実行します。
   *   - 'interrupt' コマンド: 子プロセス内ループへの割り込みを指示します。
   *   - 'wait' コマンド: 親プロセスの割り込み処理を待機します。
   *   - その他のコマンドに対する処理を実装します。
   *   - デフォルト: 未知のコマンドの場合、処理を中断します。
   */
   /**
   * 子プロセスに関するイベントリスナーを設定する関数
   * @param {procObjectTemplate} MyProcObj - 生成主体のプロセスオブジェクト
   * @param {procObjectTemplate} newChildProcObj - 生成したプロセスオブジェクト
   * @returns {void}
   */
async function setupChildProcessListeners(MyProcObj, newChildProcObj) {
  if(!newChildProcObj)
  {
    console.log('___ERR_childProcObjisNotInitialized_failedToSetupChildProcListner');
    return;
  }
      // 関数内の実装はコメントに従って子プロセスに関するイベントリスナーの設定を行っています。
      // 特に 'exit', 'error', 'message' イベントに対する処理が明示されています。
      // 'exit' イベントでは、プロセスが 'restart' セッションの場合に新しいプロセスを生成し、
      // イベントリスナーを再設定しています。
  
  
      newChildProcObj.proc_handle.on('exit', (code, signal) => {
           console.log(`Child process exited with code ${code} and signal ${signal}`);
            // 必要に応じてプロセスを再起動する処理
              if(newChildProcObj.session === 'restart') {         
                // 新しいプロセスを生成
               forkAndProcDataSendAsync(MyProcObj, newChildProcObj);
              }
        });
         newChildProcObj.proc_handle.on('error', (error) => {
           console.error('Child process error:', error);
        });
        newChildProcObj.proc_handle.on('message', (msg) => {
            // ここでメッセージに基づく処理を追加
            console.log(`Received message from ${msg.src} process:`, msg);
            let rcv_procObj = msg.procObj;
            let rcv_obj_data = msg.obj_data;
        switch(rcv_procObj.proc_cmd){
          case 'start':
            console.error('cant start from childprocess order. rcv_procObj:', rcv_procObj);
          break;

          case 'request':
            if (rcv_procObj.session === 'interval')
            {
              console.log("rquest is not implement.rcv_obj_data=>>>", rcv_obj_data);
            }else{
              console.log("__ERR");
            }
            break;
  
          case 'listen':
          break;
          case 'handler':
            const found = handlerFunctions.find((element) => element.name === rcv_procObj.handler_func);
            if (typeof found.fn === 'function') {
          // 'handler' コマンドかつ有効なリクエストハンドラ関数が指定されていれば実行
          let args = rcv_procObj.args || []; // args プロパティが存在しない場合は空の配列を使用
          found.fn(msg, ...args);
          //ハンドラをキックしたので、procObj初期化要求の応答を返す
          rcv_procObj.handler_args = [];
          rcv_procObj.handler_func = '';
          rcv_procObj.proc_cmd = '';
          let resp = {...messageObjectTemplate};
          let src = msg.dst;
          let dst = msg.src;
          let obj_data =rcv_procObj;
          MyProcObj.proc_cmd = 'sync_obj' //crawlerに対して、obj_dataの値で強制的にproc情報を同期させる
          
          resp = createMsg(src, dst, MyProcObj, obj_data);
          sysReq(resp);
          
            }else{
            console.error('Unknown command. rcv_procObj:', msg.procObj);
            }
          break;
          case 'interrupt':
            // 子プロセスからの'interrput' 要求の処理
            // 子プロセスの依頼したdurationだけ子プロセス内ループへの割り込みを指示
            rcv_procObj.proc_cmd = 'wait';
            // 未実装 handler interrupt()
          break;
          case 'wait':
            console.log('Received interrupt request from child process. Waiting...');
            // ここで親プロセスの割り込み処理を実行
            break;
          case 'stop':
            console.log('Received stop request from child process.');
            // ここで親プロセスの停止処理を実行
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
  };
module.exports.setupChildProcessListeners = setupChildProcessListeners;

  /**
 * 定期的にブラウザのリソース解放と再起動を行う関数
 * @param {Array.<browObjectTemplate>} browObjList - ブラウザオブジェクトのリスト
 * @param {number} min - 何分で再起動するかの設定
 */
async function browserRestartInterval(browObjList, min) {
    setInterval(async () => {

      // ブラウザオブジェクトのインデックスのクリア
      for (let browObj of browObjList) {
        for (let page_handle of browObj.page_handle_list) {
          page_handle.emg_index = 0;
        }
        // ブラウザのリソース解放
        await browObj.browser.close();
      }

      // ブラウザオブジェクトのハンドルを書き換え
      for (let browObj of browObjList) {
      // 新しいブラウザの起動
          browObj.browser = puppeteer.launch(browObj.launchOptions);
          // ページオブジェクトのハンドルを書き換え
              for (let page_handle of browObj.page_handle_list) {
                page_handle.page = browObj.browser.newPage();
              }
      }     
  }, min * 60 * 1000); // min分ごとに実行 (ミリ秒単位)
};
module.exports.browserRestartInterval = browserRestartInterval;



/**
 * オブジェクトや配列を再帰的に深くコピーする関数
 *
 * @param {*} obj - コピー対象のオブジェクトや配列
 * @returns {*} - コピーされたオブジェクトや配列
 */
function cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') {
    return obj;
    }

    if (Array.isArray(obj)) {
    // 配列の場合
      return obj.map(item => cloneDeep(item));
    } else {
    // オブジェクトの場合
     const clonedObj = {};
     for (const key in obj) {
       if (obj.hasOwnProperty(key)) {
         clonedObj[key] = cloneDeep(obj[key]);
       }
     }
     return clonedObj;
    }
  };
module.exports.cloneDeep = cloneDeep;

async function downloadAndSaveImage(url, filePath, protocol) {
  let mod;
  if (protocol === "http://") {
    mod = http;
  }
  if (protocol === "https://") {
    mod = https;
  }
  return new Promise((resolve, reject) => {
      const request = mod.get(url, (response) => {
        const chunks = [];
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
  
        response.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          await fs.promises.writeFile(filePath, buffer);
          resolve(filePath);
        });
      });
  
      request.on('error', (error) => {
        reject(error);
      });
  });

};
module.exports.downloadAndSaveImage = downloadAndSaveImage;

// 関数:ハッシュ関数の実装（SHA-256）
function generateHash(data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
};
module.exports.generateHash = generateHash;


  // ========================commonFunctionDefinitionEND===============================


    // ========================publicFunctionDefinition==================================
    /**
     * This is a public function.
     */
function publicFunction() {
      console.log('This is a public function');
    };
module.exports.publicFunction = publicFunction;
    // ========================publicFunctionDefinitionEND===============================

