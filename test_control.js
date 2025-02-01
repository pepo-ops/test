const myLib = require('./myLib/index.js');
const myTable = require('./myLib/hash_table.js');
const shBuf = require('./myLib/sharedBuffer.js');
const { fork } = require('child_process');
const { spawn } = require("child_process");
let path = require('path');
let { mainModule } = require('process');
const fs = require('fs');
const { join } = require('path');
const crypto = require('crypto');

/* デバッグ用ブレークポイント */
console.log('I am in test_control START');

// =================== innerGlobalDataDefinition ==================

 

  

// =================== innerGlobalDataDefinition END ===================


  // =================== ProcessDefinition ===================
  
  // 起動するプロセスの数
  let numberOfProcesses = 2; // 任意の数に変更
  
  
  //プロセスコマンドとデータ例
  let proc_cmd_list = ['start','listen','handler','interrupt','stop','restart','kill','ack','reject','change'];
  let proc_session_list = ['restart', 'complete', 'request'];


  // =================== ProcessDefinitionEND ===================


  // =================== ProcessMain ===================
  let ControlProcObject = {
    ...myLib.procObjectTemplate,
    proc_attr: 'control',
    proc_id: -1,
    proc_cmd: 'start',
    exec_filename: 'test_control.js'
  }; //自身のプロセスオブジェクトを作成
  

    //JSONファイルの読み込み (同期的)
    let t_in_path = path.join(myLib.JSON_DATA_PATH, myLib.jsonfilename.in);
    let TargetJsonData = JSON.parse(fs.readFileSync(t_in_path, 'utf-8'));
    // この行はファイルの読み込みが完了するまで実行されません。
    let userObjList = [];
    let i = 0;
    let userJsonDataPathList = [];
    let updateTime = new Date().toLocaleString();
    
    // ターゲットユーザJSONのテーブル登録
    myLib.admin_registerdTargetUserList = {...TargetJsonData.TargetHosts, update_time: updateTime};
    
    // ユーザネームとフォルダパスの抽出
    for (let target_p of TargetJsonData.TargetHosts) {
      let fdpath_tmp = path.join(myLib.USER_DATA_PATH, target_p.usernameCanonical);
      let tname_tmp = target_p.usernameCanonical;
      let tmp = {...myLib.userObjectTemplate, uid: i, usernameCanonical: target_p.usernameCanonical, sex: target_p.presetSex};
      if (target_p.officialName) {
      tmp.officialName = target_p.officialName;
      tname_tmp = target_p.officialName;
      }
      userObjList.push(tmp);
      userJsonDataPathList.push({fdpath: fdpath_tmp, fname: tname_tmp});
      i++;
    }

    // 既存データのユーザ情報登録テーブルへの読み込み
     for (let path_info of userJsonDataPathList) {
      let u_path = path.join(path_info.fdpath, `${path_info.fname}_.json`);
      if (fs.existsSync(u_path))
      myLib.admin_registerdUserObjList.push(JSON.parse(fs.readFileSync(t_in_path, 'utf-8')));
     }

    // 各クローラープロセスにuserObjListのエントリ数を分散して割り当てる
   let targetEntriesPerProcess = Math.floor(userObjList.length / Math.min(numberOfProcesses, myLib.gv_maxObjNumRestricted));
  
   // メンテナンス性
   let MyprocObj = ControlProcObject;

   // プロセスオブジェクトリストへの初回登録 連番を付与してプロセスをコピー
    for (let i = 0; (i < numberOfProcesses) && (myLib.admin_gv_currentChildProcNum < myLib.gv_maxObjNumRestricted); i++) {
      
      let newProcObject = {
        ...myLib.procObjectTemplate,
        proc_attr: 'crawler',
        proc_id: i,
        proc_cmd: 'start',
        exec_filename: 'test_crawler.js' // この部分を適切なファイル名に修正してください
      };
      let j=0;
 
      // エントリー数分の配列を切り出し、userObjListに割り当てる
        for (let user_p of userObjList.slice(i * targetEntriesPerProcess, (i + 1) * targetEntriesPerProcess)) {
          newProcObject.userObjList.push({ ...user_p, seq_num: j });
          j++;
        }

            myLib.forkAndProcDataSendAsync(MyprocObj, newProcObject);
            newProcObject.proc_cmd = ''; //解放

    }

    console.log('I am in test_control Interval Start');

    let cnt=0;
    ControlProcObject.intervalTime = 3000; //やることを終えたため、インターバルを設定
    setInterval(() => {
        for(let childProcPtr of myLib.admin_registerdChildProcObjList) {
          cnt += childProcPtr.browObjList.length;
        }
      
      console.log("___admin_alive:");
      

      // 定期的に共有バッファからデータを取得
      console.log('___admin_adminテーブルへの登録');
      /*=====================DataMappingReadStart===========================*/
      
      let keyList = [];
      for(let i; i<myLib.gv_maxBrowNumRestricted; i++) {
        salt1 = `'crawler'_${i}_brow`;
        salt2 = `'scraping'_${i}_brow`;
        keyList.push(myLib.generateHash(salt1));
        keyList.push(myLib.generateHash(salt2));
      }
      
      let sharedBrowValues = [];
      for (let key of keyList) {
        sharedBrowValues.push(shBuf.popValueByKey(key)); 
      }
      
      let sharedTimeValues = shBuf.getAllEntry();
      shBuf.clearData();
      console.log('TimeData received in b.js:', sharedTimeValues);
      console.log('browObjData received in b.js:', sharedBrowValues);
 



    /*=====================DataRegisterFromBufferStart===========================*/

    for (const [key, value] of sharedTimeValues) {
       // if(myTable.gv_testHashTable.checkExist(myLib.generateHash(tObj))){      
       myTable.gv_testHashTable.registerData(key, value);  //テストデータを登録
       myTable.gv_testHashTable.showTable();
       //    }
    }
    

    for (const [key, value] of sharedTimeValues) {
       //if(myTable.gv_browHashTable.checkExist(browObj.hash)){
       myTable.gv_testHashTable.registerData(browObj.hash, browObj);
       myTable.gv_browHashTable.showTable('gv_browHashTable:');
       //}
    }
    

    /*=========================DataSeadStart===================*/

     /*=========================Announce===================*/

       myLib.admin_gv_createdChildBrowNum = myTable.gv_browHashTable.retLength();
       console.log(`___admin_message:createdProcNum ${myLib.admin_registerdChildProcObjList.length} createdbrowNum ${myLib.admin_gv_createdChildBrowNum}`);


    }, ControlProcObject.intervalTime);

    /* デバッグ用ブレークポイント */
console.log('I am in test_control END');

  // =================== ProcessMainEND ===================
