let myLib = require('./myLib/index.js');
let shBuf = require('./myLib/sharedBuffer.js');
let { fork } = require('child_process');
let { spawn } = require('child_process');
let path = require('path');
let { mainModule } = require('process');
let puppeteer = myLib.puppeteer;
const fs = require('fs');
const { join } = require('path');
const crypto = require('crypto');
const { start } = require('repl');

/* デバッグ用ブレークポイント */
console.log('I am in test_crawler'); // set breakpoint here.

// ===変数の設定===

let isBreakMainLoop = false;


// ===システムコールで、親プロセスからのprocObjectデータ受信待ち処理終了===


// =================== innerGlobalDataDefinition ==================
// 内部共有グローバルバッファの設定

global.internalBrowBuf  = new shBuf.SharedBuffer();

 

  

// =================== innerGlobalDataDefinition END ===================



// =================== ProcessDefinition ===================

// 初回起動する子プロセスの数
let numberOfProcesses = 0; // 仕様


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
      // process.exit();
   });
    process.on('error', (error) => {
      console.error('Parent process error:', error);
      process.exit();
    });
    process.on('message', (msg) => {
      let ControlprocObj = myLib.cloneDeep(msg.procObj);
      let MyprocObj = myLib.cloneDeep(msg.obj_data);
 
    // : メッセージのルーティング処理
      switch (ControlprocObj.proc_attr) {
        case 'control':
          // control プロセスからのメッセージを処理
          console.log('コントロールからのメッセージが来ています', msg);
          //msgのオブジェクト開放
          msg.procObj = null;
          msg.obj_data = null;
          break;
   
        case 'crawler':
          // crawler プロセスへの処理
          console.error('destinationError:procObjの整合性に問題があります', msg);
          //msgのオブジェクト開放
          msg.procObj = null;
          msg.obj_data = null;
          return;

        case 'scraping':
          // scraping プロセスへの処理
          console.error('destinationError:procObjの整合性に問題があります', msg);
          //msgのオブジェクト開放
          msg.procObj = null;
          msg.obj_data = null;
          return;

      default:
      console.error('Unknown destination:', msg);
      return;
  }
      // ここでメッセージに基づく処理を追加
      console.log(`Received message from ${msg.src} process:`, msg);
      switch (ControlprocObj.proc_cmd) {
        case 'start':
// ============================ここにメイン処理を記述============================================================================
      //グローバルと同期して転送が反映されるように
      gv_CrawlerGlobalData = MyprocObj;
      crawler_main(MyprocObj);
      
      //後はインターバル
      MyprocObj.interval = 777;

      // // 定期的に内部tmpバッファデータを外部共有バッファに追加 
        setInterval(async () => {

     /*=========================DataReadEnd===================*/
          const tmpBrowObjEntries = global.internalBrowBuf.getAllEntry();

          // keyとvalueを取得
          for (const [key, value] of tmpBrowObjEntries) {
          shBuf.appendData(key, value);
          console.log(`key = ${key}, value = ${value}`);
          }
          console.log('___CRAWLER_dataSend_internalBrowBuf ', shBuf.showData);

          const newData = { timestamp: new Date().toISOString() };
          
          shBuf.appendData(newData, newData);
          console.log('___CRAWLER_dataSend', newData);
    

           /*=========================DataSeadEnd===================*/
      
        }, MyprocObj.interval); // ms分ごとに実行 (ミリ秒単位)

   

      // myLib.browserRestartInterval(MyprocObj.browObjList, 30);
            
 // ============================ここにメイン処理終了============================================================================
          break;
        case 'listen':
          // 'listen' コマンドの処理
          break;
        case 'handler':
          let handlerFunctionKey = ControlprocObj.handler_func;
          if (typeof myLib.handlerFunctions[handlerFunctionKey] === 'function') {
         // リクエストハンドラ関数が存在するかを確認し、存在する場合は呼び出す
            let args = ControlprocObj.args || [];
            myLib.handlerFunctions[handlerFunctionKey](msg, ...args);
          } else {
            console.error('Unknown command:', procObj);
          }
          break;
        case 'interrupt':
           // 'interrput' コマンドの処理
            break;
        case 'wait':
           // 'wait' コマンドを受け取ったらプロセスループを停止
           if (MyprocObj) { // プロセスオブジェクトがproc_dataに格納されていれば
           const interval = MyprocObj.intervalTime;
           isBreakMainLoop = false;
           // duration秒間の割り込み処理
           sleep(interval);
           console.log(`Interrupted for ${interval}seconds`);
           // ここでduration秒間だけの処理を実行
           isBreakMainLoop = true;
           }
          break;
        case  'sync':
          let newMyProcObj = MyprocObj;
          gv_CrawlerProcObj.proc_cmd = newMyProcObj.proc_cmd;
          gv_CrawlerProcObj.proc_attr = newMyProcObj.proc_attr;
          gv_CrawlerProcObj.session = newMyProcObj.session;
          gv_CrawlerProcObj.info = newMyProcObj.info;
          gv_CrawlerProcObj.log = newMyProcObj.log;
          console.log('CRAWLER:ProcObj_data_sync_done');
        
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
  // =================== ProcessField END ===================

  /**
 * onlineかどうかの判定関数
 * @param {number} ms - resolveのタイムアウト ms 
 * @param {myLib.pageHandleTemplate} page_handle - ページハンドル
 * @param {myLib.userObjectTemplate} newUserObject - ユーザーオブジェクト
 */
async function checkContent(ms, page_handle, userObj) {
  return new Promise((resolve, reject) => {
    console.log('I am checkContent page_hanldle:', page_handle);
    // パフォーマンス計測したいコード開始
    userObj.tmp.startTime = Date.now();
           // ページコントロールを取得
          const page = page_handle.page;


            // onlineかどうかのフラグを取得
            const promise1 = page.evaluate(() => {
/* ====================START BROWSER CONTEXT=============================== */
              debugger; // chrome debug recommended
  
              // パフォーマンス計測したいコード開始
              // const startTime = Date.now();
              const purpose = document.getElementById('live-channel-stream-information');
              return purpose;
             
          /*応急措置
              if(purpose) {
              return {
                purpose: purpose,
                //outerHTML: 'ch.outerHTML',
                //tagName: 'ch.tagName',
                //text: {el: purpose, label: null},
                //href: {href: 'ch.href', alt: 'ch.alt'},
                //img: {src: 'ch.src', alt: 'ch.alt'},
                info: {uid: 'userObj.uid', cur: 'checkContent_promise1', query: 'que', log: ''},
                //timestamp: startTime, // timestamp
                error: null
                // 他にも必要なプロパティを追加
                };
              }else{
                return {
                  purpose: purpose,
                  //outerHTML: 'ch.outerHTML',
                  //tagName: 'ch.tagName',
                  //text: {el: null, label: null},
                  //href: {href: 'ch.href', alt: 'ch.alt'},
                  //img: {src: 'ch.src', alt: 'ch.alt'},
                  info: {uid: 'userObj.uid', cur: 'checkContent_promise1', query: 'que', log: ''},
                  //timestamp: null, // timestamp
                  error: true
                  };
              }
          応急措置*/ 
          
/* ====================END BROWSER CONTEXT=============================== */
          })
          .then(
            (dat) => {
              resolve(dat);
          /*応急措置
              // おまじない
              //let hData = JSON.parse(JSON.stringify(dat));
              let hData = dat;
    
              console.log(hData); //dbg
              if(hData.purpose) {
                hData.info.uid = userObj.uid;
                userObj.is_online = true;
                resolve(hData);
              // パフォーマンス計測したいコード終了
              const endTime = Date.now();
              const StartTime = hData.timestamp;
              console.log(`Execution time judgeIsOnline(promise1) in func_checkContent: ${endTime - StartTime}ms`); // Success!
                       
              }
              else{
                hData.info.uid = userObj.uid;
                userObj.is_online = false;
                resolve(hData); // live-infoが存在しないという事が分かった状態
              }
          応急措置*/  
            },
            (err) => {
              console.log('Err rejected', err); // Error!
              return err;
            },
          );
              

          // 存在しないページの場合
            // core-error-messageを取得
            const promise3 = page.evaluate(() => {
  /* ====================START BROWSER CONTEXT=============================== */
  debugger; // chrome debug recommended
          
              // パフォーマンス計測したいコード開始
              const startTime = Date.now();
              let ch = document.querySelector('[data-a-target=core-error-message]');
              if(ch) {
                const purpose = ch.textContent;
              return {
                purpose: null,
                //outerHTML: 'ch.outerHTML',
                //tagName: 'ch.tagName',
                //text: {el: purpose, label: null},
                //href: {href: 'ch.href', alt: 'ch.alt'},
                //img: {src: 'ch.src', alt: 'ch.alt'},
                info: {uid: null, cur: 'checkContent_promise3', query: '[data-a-target=core-error-message]', log: 'check text is null or not'},
                timestamp: startTime, // timestamp
                error: null
                // 他にも必要なプロパティを追加
                };
              }else{
              return {
                purpose: undefined,
                //outerHTML: 'ch.outerHTML',
                //tagName: 'ch.tagName',
                //text: {el: null, label: null},
                //href: {href: 'ch.href', alt: 'ch.alt'},
                //img: {src: 'ch.src', alt: 'ch.alt'},
                info: {uid: 'userObj.uid', cur: 'checkContent_promise3', query: 'que', log: ''},
                timestamp: null, // timestamp
                error: true
                };  
              }
          })
/*===========================================*/
          .then(
            (dat) => {
              // おまじない
              let hData = JSON.parse(JSON.stringify(dat));
   
              if(hData.error) {
                hData.info.uid = userObj.uid;
                resolve(dat);
              } //クエリDOMが存在しない場合
              else{ 
              // パフォーマンス計測したいコード終了
                const endTime = Date.now();
                const StartTime = hData.timestamp;
                hData.info.uid = userObj.uid;
                console.log(`Execution time judgeIsFrozen(promise1) in func_checkContent: ${endTime - StartTime}ms`); // Success!

                if(userObj.account_frozenDate === null) {
                  userObj.account_frozenDate = new Date().toDateString(); //初めて凍結されたことが判明した日
                }
                resolve(dat);
              }
            },
            (err) => {
              console.log('Err rejected', err); // Error!
              return err;
            },
          );
    
  });
    
}


/**
 * ウェブコンテンツを収集する関数。isLiveの場合は、子プロセス起動キューへオブジェクトを挿入する
 * @param {number} ms - resolveのタイムアウト ms 
 * @param {myLib.pageHandleTemplate} page_handle - ページハンドル
 * @param {myLib.userObjectTemplate} userObj - ユーザーオブジェクト
 */
async function getContent(ms, page_handle, userObj) {
  return new Promise((resolve, reject) => {
  
    setTimeout(() => {
    let err = `func_getContent did not resolve within ${ms} ms.`;
    reject(err);
    }, ms);


  console.log('I am getContent page_hanldle:', page_handle);
            // パフォーマンス計測したいコード開始
            const startTime = Date.now();
     // ページコントロールを取得
    let page = page_handle.page;



    // 共通で走る処理
        // channel-info-contentを取得
        let promise1 = page.evaluate(() => {
   /* ====================START BROWSER CONTEXT=============================== */
        debugger; // chrome debug recommended 
          // パフォーマンス計測したいコード開始
          const startTime = Date.now();
          let scope = document.querySelector(':scope #live-channel-about-panel');
          let ch = scope.querySelector(':scope img');
          if(ch) {
            return htmlDomTemplate = {
              outerHTML: ch.outerHTML,
              tagName: ch.tagName,
              text: {el: ch.textContent, label: null},
              href: {href: ch.href, alt: ch.alt},
              img: {src: ch.src, alt: ch.alt},
              info: {uid: 'userObj.uid', cur: 'getContent_promise1', query: 'img', log: 'get first image img.src,img.alt'},
              timestamp: startTime, // timestamp
              error: null
              // 他にも必要なプロパティを追加
              };
            }else{
              return htmlDomTemplate = {
                outerHTML: 'ch.outerHTML',
                tagName: 'ch.tagName',
                text: {el: null, label: null},
                href: {href: 'ch.href', alt: 'ch.alt'},
                img: {src: 'ch.src', alt: 'ch.alt'},
                info: {uid: 'userObj.uid', cur: 'getContent_promise1', query: 'img', log: ''},
                timestamp: null, // timestamp
                error: true
                }; 
            }
          })
            .then(
              (dat) => {
                // シリアライズからオブジェクトへ変換
                // let hData = dat;  
                if(dat.error) {
                  dat.info.uid = userObj.uid;
                  return dat;
                } //クエリ取得失敗
                else{ 
                // パフォーマンス計測したいコード終了
                  const endTime = Date.now();
                  const StartTime = dat.timestamp;
                  dat.info.uid = userObj.uid;
                  console.log(`Execution time get_img_url(promise1) in func_getContent: ${endTime - StartTime}ms`); // Success!

                  // img要素のsrc(サムネイル)を取得
                  let imgSrc = dat.img.src;
                  let altText = dat.img.alt;
                  userObj.officialName = altText;
                  userObj.imgSrc = imgSrc;
                  userObj.update_time = new Date().toLocaleString();
                  // ディレクトリが無ければ作成し、ユーザメタデータを保存
                  Save_Image_JSON_mkdir(userObj);
                  console.log('promise success', dat);
                  return dat;
                }
              },
              (err) => {
                console.log('Err rejected', err); // Error!
                return err;
              },
            );
  
      
    // オンライン条件判定

    // onlineの際、つまり、channel-info-content内のlive-channel-stream-informationを検索
    if (userObj.isOnline) {
        let promise2 = page.evaluate(() => {
    /* ====================START BROWSER CONTEXT=============================== */
       
            const current_audience_el = document.querySelector('[data-a-target=animated-channel-viewers-count]').textContent;
            const current_audience_label = document.querySelector('[data-a-target=animated-channel-viewers-count]').getAttribute('aria-label');
     
            const session_time_el = document.querySelector('.live-time').textContent;
            const session_time_label = document.querySelector('.live-time').getAttribute('aria-label');
         
            let scope = document.querySelector(':scope #live-channel-about-panel');
            const userProfile_el = scope.querySelector(':scope p').textContent;
            const followerNum_el = scope.querySelector(':scope span').textContent;

              
                    // let nodeList = scope.querySelectorAll(':scope [class^=CoreText]');
                    // classの値が前方一致する要素を取得
                    // [2].textContentがフォロワー数
                    // [3].textContentがプロフィール
                    // 以降は環境による  

        // シリアライズ可能な形に変換
              let nodeList = scope.querySelectorAll(':scope a');
              let anchors =[];
              const coreTexts = Array.from(nodeList);    
                    anchors = coreTexts.map((elem) => 
                    {
                      return ({
                        href: elem.getAttribute('href'),
                        textContent: elem.textContent,
                        label: elem.getAttribute('aria-label')
                      });
                    });


        // nodeListのCoreTextたちから、文字列リテラルをそのまま返す実装で妥協しない
      
        
                       if(ch) {
                        return htmlDomTemplate = {

                            outerHTML: 'ch.outerHTML',
                            tagName: 'ch.tagName',
                            text: {el: ch.textContent, label: 'csLabel'},
                            href: {href: 'ch.href', textContent: 'siteName', label: 'csLabel'},
                            img: {src: 'ch.src', alt: 'officialName'},
                            csData: {
                              currentAudience: {el: current_audience_el, label: current_audience_label},
                              sessionTime: {el: session_time_el, label: session_time_label},
                              userProfile: {el: userProfile_el, label: 'csLabel'},
                              followerNum: {el: followerNum_el, label: 'csLabel'}
                            },
                            tmpList: {any1: anchors, any2: '[]'}, ///any3...[]
                            info: {uid: 'userObj.uid', cur: 'getContent_promise2', query: 'que', log: ''},
                            timestamp: null, // timestamp
                            error: null
                             // 他にも必要なプロパティを追加
                            }; 
                         
                        }else{
                          return htmlDomTemplate = {
                            outerHTML: 'ch.outerHTML',
                            tagName: 'ch.tagName',
                            text: {el: null, label: null},
                            href: {href: 'ch.href', textContent: 'siteName', label: 'csLabel'},
                            img: {src: 'ch.src', alt: 'officialName'},
                            csData: {
                              
                              sessionTime: {el: '1:20:22', label: 'csLabel'},
                              userProfile: {el: 'profileData', label: 'csLabel'},
                              followerNum: {el: '-1', label: 'csLabel'}
                            },
                            tmpList: {any: '[]', any2: '[]'}, ///any3...[]
                            info: {uid: 'userObj.uid', cur: 'getContent_promise2', query: 'que', log: ''},
                            timestamp: null, // timestamp
                            error: true
                            }; 
                        }

  /* ====================END BROWSER CONTEXT=============================== */        
      })
      .then(
        (dat) => {
          // シリアライズからオブジェクトへ変換
          let hData = dat;  
          if(hData.error) {
            hData.info.uid = userObj.uid;
            return hData;
          } //クエリ取得失敗
          else{ 
          // パフォーマンス計測したいコード終了
            const endTime = Date.now();
            const StartTime = hData.timestamp;
            console.log(`Execution time get_img_url(promise1) in func_getContent: ${endTime - StartTime}ms`); // Success!

            if (userObj.streamer_flag !== true) {
              userObj.streamer_flag = true;
            }

            userObj.isOnline = true;
            userObj.current_audience = hData.csData.currentAudience.el;
            userObj.session_time = hData.csData.sessionTime.el;
            userObj.user_profile = hData.csData.userProfile.el;
            userObj.follower_num = hData.csData.followerNum.el;
            userObj.link_list = hData.tmpList.any1;
            let updateTime = new Date().toLocaleString();
            userObj.update_time = updateTime;

            hData.info.uid = userObj.uid;
          
            // ディレクトリが無ければ作成し、ユーザメタデータを保存
            Save_Image_JSON_mkdir(userObj);
            console.log('getMainContent success', hData);
            return hData;
          }
        },
        (err) => {
          console.log('Err rejected', err); // Error!
          return err;
        },
      );

      const result = Promise.all([promise1, promise2])
      .then((dat) => {
        // パフォーマンス計測したいコード終了
        const endTime = Date.now();
        console.log(`Execution Success time func_getContent: ${endTime - startTime}ms`);
        console.log('user is onstream');
        resolve(dat);
      },
      (err) => {
        console.log('Err rejected'); // Error!
        reject(err);
      })

  }

    if (userObj.isOnline = false) {

    //オフラインならば何日前にオンラインだったかの要素を特定し取得
        let promise3 = page.evaluate(({}) => {
  /* ====================START BROWSER CONTEXT=============================== */
          // パフォーマンス計測したいコード開始
          const startTime = Date.now();
          let scope = document.querySelector(':scope .home');
          let nodeList = scope.querySelectorAll(':scope [class^=CoreText]');

          // あるなら、[1] に記載されている
                 // シリアライズ可能な形に変換
                 let texts =[];
                 const coreTexts = Array.from(nodeList);    
                       texts = coreTexts.map((el) => 
                       {
                         return ({
                            textContent: el.textContent,
                            label: el.getAttribute('aria-label')
                         });
                       });
        
          
                       if(texts) {
                        return {

                            outerHTML: 'ch.outerHTML',
                            tagName: 'ch.tagName',
                            text: {el: 'ch.textContent', label: 'csLabel'},
                            href: {href: 'ch.href', textContent: 'siteName', label: 'csLabel'},
                            img: {src: 'ch.src', alt: 'officialName'},
                            csData: {
                              currentAudience: {el: 'current_audience_el', label: 'current_audience_label'},
                              sessionTime: {el: 'session_time_el', label: 'session_time_label'},
                              userProfile: {el: 'userProfile_el', label: 'csLabel'},
                              followerNum: {el: 'followerNum_el', label: 'csLabel'},
                              lastDate: {el:texts[1].textContent, label: 'label'},
                            },
                            tmpList: {any1: texts, any2: '[]'}, ///any3...[]
                            info: {uid: 'userObj.uid', cur: 'getContent_promise3', query: '.home CoreText', log: 'Execution get_offline_schedule:'},
                            timestamp: null, // timestamp
                            error: null
                             // 他にも必要なプロパティを追加
                            }; 
                         
                        }else{
                          return {
                            outerHTML: 'ch.outerHTML',
                            tagName: 'ch.tagName',
                            text: {el: 'ch.textContent', label: 'csLabel'},
                            href: {href: 'ch.href', textContent: 'siteName', label: 'csLabel'},
                            img: {src: 'ch.src', alt: 'officialName'},
                            csData: {
                              
                              sessionTime: {el: '1:20:22', label: 'csLabel'},
                              userProfile: {el: 'profileData', label: 'csLabel'},
                              followerNum: {el: '-1', label: 'csLabel'}
                            },
                            tmpList: {any: '[]', any2: '[]'}, ///any3...[]
                            info: {uid: 'userObj.uid', cur: 'getContent_promise3', query: 'que', log: ''},
                            timestamp: null, // timestamp
                            error: true
                            }; 
                        }
         })
       /* ====================END BROWSER CONTEXT=============================== */
                        .then(
                          (dat) => {
                            // シリアライズからオブジェクトへ変換
                            let hData = dat;  
                            if(hData.error) {
                              hData.info.uid = userObj.uid;
                            } //クエリ取得失敗
                            else{ 
                            // パフォーマンス計測したいコード終了
                              const endTime = Date.now();
                              const StartTime = hData.timestamp;
                              const extractedText = hData.csData.lastDate.el;
                              console.log(`Execution time offlineContentsAnalyzer(promise3) in func_getContent: ${endTime - StartTime}ms`);
                              userObj.isOnline = false;
                              userObj.lastOnlineDate = extractedText;
                              // セッションタイムの初期化と、トータル配信時間の再計算
                              userObj.total_time += userObj.session_time;
                              userObj.session_time = null;
                              let updateTime = new Date().toLocaleString();
                              userObj.update_time = updateTime;

                              hData.info.uid = userObj.uid;
                            
                              // ディレクトリが無ければ作成し、ユーザメタデータを保存
                              Save_Image_JSON_mkdir(userObj);
                              console.log('getMainContent success', hData);
                            }
                            return dat;
                          },
                          (err) => {
                            console.log('Err rejected', err); // Error!
                            return err;
                          },
                        );

                      
                        const result = Promise.all([promise1, promise3])
                        .then((dat) => {
                          // パフォーマンス計測したいコード終了
                          const endTime = Date.now();
                          console.log(`Execution Success time func_getContent: ${endTime - startTime}ms`);
                          console.log('user is NOT onstream');
                          resolve(dat);
                        },
                        (err) => {
                          console.log('Err rejected'); // Error!
                          reject(err);
                        });
      }
   
  /* ================================== */


 });
}


  /**
 * ユーザ用の一時保存ディレクトリを作成し、画像をダウンロードして保存する関数。ユーザデータのJSONファイルも格納。
 * @param {myLib.userObjectTemplate} newUserObject - JSON形式で保存されるユーザオブジェクト
 * @param {string} newUserObject.imgSrc - ダウンロードする画像のURL
 * @param {string} newUserObject.usernameCanonical - カノニカルユーザーネーム
 */
async function Save_Image_JSON_mkdir(newUserObject) {
  console.log('I am Save_Image_JSON_mddir newUserObject:', newUserObject);
              // パフォーマンス計測したいコード開始
              const startTime = Date.now();
  let officialName = newUserObject.officialName;
  let usernameCanonical = newUserObject.usernameCanonical;
  // オフィシャルユーザーネームのディレクトリパスを作成
  let userDirectoryPath = path.join(myLib.USER_DATA_PATH, `./${usernameCanonical}`);
  newUserObject.user_folder_path = userDirectoryPath;

  // オフィシャルユーザーネームのディレクトリが存在しない場合は新規作成
  await createDirectory(userDirectoryPath);

  // 画像ファイルの保存先パスを作成(オフィシャルファイル名)
  let filePath = path.join(userDirectoryPath, `${officialName}_thumb.png`);



  // 画像をダウンロードして保存
  if (newUserObject.imgSrc !== null) {
      // 既に同じファイルが存在するかチェック
    if (fileExists(filePath)) {
    console.log(`File already exists at ${filePath}. Skipping download.`);
    } else {
      try {
        await myLib.downloadAndSaveImage(newUserObject.imgSrc, filePath, 'https://');
        console.log('Image downloaded and saved successfully.');
      } catch (error) {
        console.error('Error downloading or saving image:', error.message);
      }
    }
  }


  // JSONファイルの保存先パスを作成(オフィシャルファイル名)
  let jsonfilepath = path.join(userDirectoryPath, `${officialName}_.json`);

  // JSONデータをファイルに書き込む
    try {
      let updateTime = new Date().toLocaleString();
      newUserObject.update_time = updateTime;
      await fs.promises.writeFile(jsonfilepath, JSON.stringify(newUserObject, null, 2));
      console.log(`Saved user data to ${jsonfilepath}`);
    } catch (error) {
      console.error(`Error saving user data: ${error.message}`);
    }


  // targetJSONデータを更新
      let t_in_path = path.join(myLib.JSON_DATA_PATH, myLib.jsonfilename.in);
      let t_out_path = path.join(myLib.JSON_DATA_PATH, myLib.jsonfilename.out);
      let targetJsonData = JSON.parse(fs.readFileSync(t_in_path, 'utf-8'));

      for (let target_p of targetJsonData.TargetHosts) {
        if (target_p.usernameCanonical === usernameCanonical) {
          target_p.officialName = officialName;
          let updateTime = new Date().toLocaleString();
          targetJsonData.update_time = updateTime;
        }
      }
      try {
        if(targetJsonData) {
        await fs.promises.writeFile(t_out_path, JSON.stringify(targetJsonData, null, 2));
        console.log(`updated target json data to ${t_in_path}`);
        }
      } catch (error) {
        console.error(`Error updating target json data: ${error.message}`);
      }
      
                // パフォーマンス計測したいコード終了
                const endTime = Date.now();
                console.log(`Execution time func_Save_Image_JSON_mkdir: ${endTime - startTime}ms`);
}

/**
 * ディレクトリを作成する関数
 * @param {string} directoryPath - 作成するディレクトリのパス
 */
 async function createDirectory(directoryPath) {
  try {
    // ディレクトリを作成
    await fs.promises.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    // ディレクトリが既に存在する場合は何もせず、それ以外のエラーは再スロー
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * ファイルが存在するかチェックする関数
 * @param {string} filePath - チェックするファイルのパス
 * @returns {boolean} - ファイルが存在する場合は true、存在しない場合は false
 */
async function fileExists(filePath) {
  try {
    // ファイルのアクセスを試みる
    await fs.access(filePath);
    // ファイルが存在する場合は true を返す
    return true;
  } catch (error) {
    // ファイルが存在しない場合は false を返す
    return false;
  }
}

  /**
 * 非同期実行関数
 * @param {myLib.pageHandleTemplate} page_handle - ページハンドル
 * @param {myLib.browObjectTemplate} browObj - ブラウザオブジェクト
 * @param {myLib.procObjectTemplate} procObjfromParent - プロセスオブジェクト
 */
  async function page_goto_loop(page_handle, browObj, procObjfromParent) {

    let salt = `${page_handle.page_id}_${browObj.brow_id}_${procObjfromParent.proc_id}_page_goto_loop`;
    let hash = myLib.generateHash(salt);
    console.log('Salt:', salt);
    console.log('HashTable:', myLib.gv_entryTable);

    for (let entry of myLib.gv_entryTable) {
      if(hash === entry) {
        return;
      }else{
        continue;
      }
    }
    myLib.gv_entryTable.push(hash);
    
    for (let target_obj of page_handle.target_id_list) {
      // パフォーマンス計測したいコード開始
      const startTime = Date.now();
      if(isBreakMainLoop){
        break;
      }

        // 動画(script)の読み込みを省略して動作を改善する場合
        if (browObj.mode === 'strict') {
          await page_handle.page.setRequestInterception(true);
          page_handle.page.on('request', (request) => {
            if (['script'].indexOf(request.resourceType()) !== -1) {
              request.abort();
            } else {
              request.continue();
            }
          });
        }
        let target_id = target_obj.target_id;
        console.log('targetID:', target_id);
        console.log('pageID:', page_handle.page_id);
        let url = `${browObj.protocol}${browObj.baseURL}${target_id}`;
        console.log('url', url);
        page_handle.url = url;
        /* プロキシの設定 */
        if (myLib.PROXY_DISABLED === 'true') {
          console.log('I am test_crawler. DISABLED PROXY');
        }else{
          /* 認証プロキシの場合 */
          if (myLib.PROXY_USER) {
            await page_handle.page.setExtraHTTPHeaders({
            Authorization: `Basic ${new Buffer(`${browObj.proxy.user}:${browObj.proxy.password}`).toString('base64')}`
          });
            console.log('basic認証 base64:', `Basic ${new Buffer(`${browObj.proxy.user}:${browObj.proxy.password}`).toString('base64')}`);
          }
        }
        await myLib.sleep(null,50);
        await Promise.all([
          page_handle.page.goto(url, {waitUntil: ['load', 'networkidle2']}),
          // page.click('body > div > p:nth-child(3) > a'),
          page_handle.page.waitForNavigation()
        ]);
        //   if (myLib.PROXY_DISABLED === 'true') {
        //      /* 7秒待機 */
        //      await page_handle.page.waitForTimeout(1000 * 7.0);
        //   } else {
        //      /* 2秒待機 */
        //      await page_handle.page.waitForTimeout(1000 * 2.0);
        //   }
        // procObjfromParent.userObjListから、指定のUserObjectを参照
        //let userObjidx = 0;
        //for(let userObj of procObjfromParent.userObjList) {
        //  if(userObj.usernameCanonical === target_obj.target_id){
        //    break;
        //  }
        //  userObjidx++;
        //}
        

          myLib.sleep(null,77);
          //一次的撤退 await boundCheckContent; //試しに.callメソッドを使ってみる 名前空間thisを使用できるか?

          myLib.sleep(null,77);
         //一次的撤退 await boundGetContent;  //引数をbindで固定された関数を使用

        // 撤退 await pa_boundCheckContent(procObjfromParent.userObjList[target_obj.uid]);

        // この関数呼び出しで、オンラインフラグを設定する。
        let promise1 = await checkContent(5000, page_handle, procObjfromParent.userObjList[target_obj.uid]);
        let idx = target_obj.uid;

        // コンテンツ取得 // getcontentの遅延原因。存在しないものを探してる可能性
        //let promise2 = await getContent(5000, page_handle, procObjfromParent.userObjList[target_obj.uid]);
        
        // await Promise.all([promise1,promise2]);
        // console.log('chk_promise', promise1);
        // console.log('get_promise', promise2);


        // オンラインなら以下を実行
        // promise1 undefined問題 どれだけデータ少なくしても同期的に更新は難しい なぜかオンラインのときのみ、nullではなく、undefinedになるので、これでいきます。

        if(promise1 !== null && promise1===undefined) {
          // 子プロセス生成
          console.log('_____DBG_子プロセス生成', target_obj.target_id);

          // 子プロセス生成準備 子プロセスのuserObjList[0]はcrawlerのuserObjListの中の対象の[userObjidx]のディープコピー
          let userObjCpy = myLib.cloneDeep(procObjfromParent.userObjList[idx]);
          userObjCpy.url = url;
          userObjCpy.origin_idx = idx;
          userObjCpy.seq_num = 0;
          let updateTime = new Date().toLocaleString();
          userObjCpy.update_time = updateTime;

          let brow_cnt = myLib.admin_gv_createdChildBrowNum;

          let newBrowObjTmp = {...myLib.browObjectTemplate, brow_id: brow_cnt };

          // ブラウザオブジェクトテンプレートからオプションのみを生成
            // ブラウザの設定
            if(myLib.puppeteer === require('puppeteer-core')) {
            let exec_path = path.join(myLib.browserFolderPath, myLib.browserName);
            newBrowObjTmp.launchOptions.executablePath = exec_path;
            let browserDataRoot = path.join(myLib.browserDataPath, `./${myLib.browserDataDir}`);
            newBrowObjTmp.launchOptions.userDataDir = browserDataRoot;
            }
            // プロキシの設定
            if (myLib.PROXY_DISABLED === 'true') {
              // no proxy config
            }else{
            if (myLib.HTTP_PROXY) {
                newBrowObjTmp.proxy.url = myLib.HTTP_PROXY;
                newBrowObjTmp.proxy.port = myLib.PROXY_PORT;
                newBrowObjTmp.proxy.user = myLib.PROXY_USER;
                newBrowObjTmp.proxy.password = myLib.PROXY_PASSWORD;
                /* 認証プロキシの場合 */
                let proxyURL = `http://${newBrowObjTmp.proxy.url}:${newBrowObjTmp.proxy.port}`;
                // proxyURL = `http://${newbrowObject.proxy.user}:${newbrowObject.proxy.password}@${newbrowObject.proxy.url}:${newbrowObject.proxy.port}`;
                console.log('I am test crawler. proxyURL:', proxyURL);
                newBrowObjTmp.launchOptions.args.push(`--proxy-server=${proxyURL}`);
                }
              }
          // ユーザーエージェントの設定
            if (process.env.USER_AGENT) {
              newBrowObjTmp.launchOptions.args.push(`--user-agent=${process.env.USER_AGENT}`);
                }

                const salt1 = `'scraping'_${newBrowObjTmp.brow_id}_brow`;
                newBrowObjTmp.hash = myLib.generateHash(salt1);
          
          let newProcObj = { ...myLib.procObjectTemplate };
          newProcObj.proc_attr = 'scraping';
          newProcObj.exec_filename = 'test_scraping.js';
          const salt2 = `'scraping'_${target_obj.target_id}_proc`;
          newProcObj.hash = myLib.generateHash(salt2);
          newProcObj.proc_handle = null;
          newProcObj.session = null;
          newProcObj.handler_func = null;
          newProcObj.proc_cmd = 'start';
          newProcObj.browObjList.push(newBrowObjTmp);
          
          const newData = { timestamp: new Date().toISOString() };
          global.internalBrowBuf.appendData(newBrowObjTmp.hash, newBrowObjTmp);


          // 子プロセスのuserObjList[0]とcrawlerのuserObjListを同期しない
          newProcObj.userObjList.push(userObjCpy);
        

          // 親プロセスに子プロセス生成リクエストを送信 (リクエストハンドラ関数 judge_spawn_processの呼び出し要求)
          let src = procObjfromParent.proc_id;
          let dst = -1;
          procObjfromParent.session = 'request';
          procObjfromParent.handler_func = 'judge_fork_process';
          procObjfromParent.proc_cmd = 'handler';
         

          let msg = myLib.createMsg(src, dst, procObjfromParent, newProcObj);
 
          myLib.sysReq(msg);
          

          //成功すれば、子プロセス生成 (リクエストハンドラ関数wrapper_spawnChildProcessが呼び出される)
          //失敗時の処理は未実装。失敗時の判定をするには、子プロセス側がrunning開始時とrunning終了時にisRunning情報を送信する必要がある。
          //また、子プロセスから10分間応答がなかったらcontrolは子プロセスをrestartするよう中間プロセスに指令を出す。 
        }                        
 
      // パフォーマンス計測したいコード終了
      const endTime = Date.now();
      console.log(`Execution time function:page_goto_loop(page_id_${page_handle.page_id} brow_id_${browObj.brow_id} proc_id_${procObjfromParent.proc_id} proc_attr_${procObjfromParent.proc_attr}): ${endTime - startTime}ms`);
    }
  return;
}

/**
 * メイン関数 クローラー実行をする
 * 
 * @param {myLib.procObjectTemplate} procObjfromParent - 親プロセスから受け取るプロセスオブジェクト
 */
async function crawler_main(procObjfromParent) {
  // 関数外での更新が反映されるように
  gv_CrawlerProcObj = procObjfromParent;

    // console.log('userObjList', procObjfromParent.userObjList);
    // ブラウザの数を指定。クローラーにつき、適宜設定
    let numberOfBrowser = 1;

    // ページの数を指定。クローラーにつき、適宜設定
    let numberOfPagePerBrowser = 2;

    // 総ページ数の算出
    let totalpageEntries = numberOfBrowser * numberOfPagePerBrowser;
    
    // 各ブラウザのページにuserObjListのエントリ数を分散して割り当てる
    let targetEntriesPerPage = Math.floor(procObjfromParent.userObjList.length / totalpageEntries);

    let bList = [];
      // ブラウザオブジェクトテンプレートからインスタンスを生成し、初回のブラウザ起動
      for (let i = 0; i < numberOfBrowser; i++) {
        let newbrowObject = { ...myLib.browObjectTemplate};
        const salt1 = `'crawler'_${newbrowObject.brow_id}_brow`;
        newbrowObject.brow_id = i;
        newbrowObject.hash = myLib.generateHash(salt1);
        // ブラウザの設定
        if(puppeteer === require('puppeteer-core')) {
        let exec_path = path.join(myLib.browserFolderPath, myLib.browserName);
        newbrowObject.launchOptions.executablePath = exec_path;
        let browserDataRoot = path.join(myLib.browserDataPath, `./${myLib.browserDataDir}`);
        newbrowObject.launchOptions.userDataDir = browserDataRoot;
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
            // proxyURL = `http://${newbrowObject.proxy.user}:${newbrowObject.proxy.password}@${newbrowObject.proxy.url}:${newbrowObject.proxy.port}`;
            console.log('I am test crawler. proxyURL:', proxyURL);
            newbrowObject.launchOptions.args.push(`--proxy-server=${proxyURL}`);
            }
          }
      // ユーザーエージェントの設定
        if (process.env.USER_AGENT) {
          newbrowObject.launchOptions.args.push(`--user-agent=${process.env.USER_AGENT}`);
            }
      // 画面の大きさの設定
      newbrowObject.launchOptions.defaultViewport = null;
      // シークレットモードの設定
      // if (myLib.browserFolderPath === myLib.CHROME_FOLER_PATH) {
      //   newbrowObject.launchOptions.args.push(' --incognito');
      //       }

          newbrowObject.browser = await puppeteer.launch(newbrowObject.launchOptions);
           // ページハンドルテンプレートからインスタンスを生成
           let page_list = [];
           for (let j = 0; j < numberOfPagePerBrowser; j++) {
              let new_page_handle = { ...myLib.pageHandleTemplate, target_id_list: [], page_id: j };
              if (j === 0) {
                let tmp_array = await newbrowObject.browser.pages();
                new_page_handle.page = tmp_array[0];
              } else {
                new_page_handle.page = await newbrowObject.browser.newPage();
                // await new_page_handle.page.setJavaScriptEnabled(false);
              }
              // ターゲットIDテンプレートからインスタンスを生成
              // エントリー数分の配列を切り出し、target_idに割り当てる
              let td_list = [];
              let seq=0;
              for (let k = ((j * targetEntriesPerPage)+(i * numberOfPagePerBrowser * targetEntriesPerPage)); k < (((j + 1) * targetEntriesPerPage)+(i * numberOfPagePerBrowser * targetEntriesPerPage)); k++) {
                  let new_targetID_Obj = { ...myLib.targetIDTemplate };  
                  new_targetID_Obj.sequence_num = seq;
                  new_targetID_Obj.uid = k;
                  new_targetID_Obj.target_id = procObjfromParent.userObjList[k].usernameCanonical;
                  td_list.push(new_targetID_Obj);
                  procObjfromParent.userObjList[k].seq_num = seq;
                  seq++;
              }
              new_page_handle.target_id_list = td_list;
              page_list.push(new_page_handle);
            }
            console.log('proc_id:', procObjfromParent.proc_id);
            console.log('page_list:', page_list);
            newbrowObject.page_handle_list = page_list;
            bList.push(newbrowObject);
            global.internalBrowBuf.appendData(newbrowObject.hash, newbrowObject);
            console.log('___Crawler__crawelrmain_currentBrowObjisPushed', newbrowObject);
            global.internalBrowBuf.showData();
                    
           }
      procObjfromParent.browObjList = bList;
             
    //クローラーメインループ
    // while(true){
  
          // 対象のtarget_idのページを開く。全てのtarget_idを消化したら次の行へ進む。
          for (let browObj of procObjfromParent.browObjList) {
            
            if(isBreakMainLoop){
              break;
            }
            for (let page_handle of browObj.page_handle_list) {
              if(isBreakMainLoop){
                break;
              }
              page_goto_loop(page_handle, browObj, procObjfromParent);
              await myLib.sleep(null, 20);
            }
          }

    // }
};