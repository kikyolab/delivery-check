//////////////////////////////////////////////////////
// 検索用Map　の宣言（納品書のデータを入れるMap)
//////////////////////////////////////////////////////

const invoiceMap = new Map();
const history = [];
// ここで指定しないと、全ての関数で共有できない

//////////////////////////////////////////////////////
// ページを開いたら納品書を取得
//////////////////////////////////////////////////////

window.onload = function () {
  fetch(
    "https://script.google.com/macros/s/AKfycbwiFWs9TTLqKIqcJwrFGPmApoAmDkBuxVBFWKxRU4cU1-Ql3ZwQDlfVRhYu-Le_06bt/exec",
  )
    .then((r) => {
      //console.log("Response:", r);
      return r.json();
    })
    .then((data) => {
      //console.log("Data:", data);
      loadMap(data);
    })
    .catch((err) => {
      //console.error("Fetch Error:", err);
    });
};

function loadMap(values) {
  //  console.log(values);

  values.forEach((row) => {
    invoiceMap.set(
      row.barcode,

      row,
    );
  });

  createInvoiceList(values);

  // console.log(JSON.stringify(Object.fromEntries(invoiceMap),null,2));
  // Object.fromEntries(マップの名前)　←この部分でMapオブジェクトを連想配列（javascriptオブジェクト）に変換する
  //      JSON.stringifyはMapをそのまま渡しても空白にするので連想配列に変形させる必要がある
  // JSON.stringify(変改したいオブジェクト(データ), 特定のデータだけを抜く時に指定(今回は全部なのでnull), インデント数(左側に空白何個かを空けてレコード単位で読みやすくする))

  // values.forEach(row =>{処理});　は配列専用のfor文
  //    valuesはここに来た時に受け取ったMapデータ（gasで作ったヤツ）

  //console.log(Array.from(invoiceMap));
}

////////////////////////////////////////////////////////
//  納品テーブルにリストを入れる処理
////////////////////////////////////////////////////////

function createInvoiceList(values) {
  const tbody = document.getElementById("invoiceTableBody");

  tbody.innerHTML = "";

  values.forEach((item) => {
    const tr = document.createElement("tr");
    tr.id = "invoiceTableRow-" + item.barcode;

    const tdCheck = document.createElement("td");
    tdCheck.id = "invoiceTableCheck-" + item.barcode;
    tdCheck.textContent = "□";

    const tdName = document.createElement("td");
    tdName.textContent = item.name;

    const tdQty = document.createElement("td");
    tdQty.textContent = item.qty;

    tr.appendChild(tdCheck);
    tr.appendChild(tdName);
    tr.appendChild(tdQty);

    tbody.appendChild(tr);
  });
}

//////////////////////////////////////////////////////
// Enterキーでバーコード処理
//////////////////////////////////////////////////////

document.getElementById("HTMLbarcodeInputField").addEventListener(
  "keydown",

  function (e) {
    if (e.key === "Enter") {
      checkBarcode();
    }
  },
);



//////////////////////////////////////////////////////
// 履歴へ追加
//////////////////////////////////////////////////////

function addHistory(barcode, item) {
  //const tbody = document.getElementById("historyBody");

  const name = item ? item.name : "リストに無い"
  // if文の三項演算子 (条件 ? 条件が真のとき : 条件が偽のとき)
  //  同じ処理
  //    const name;
  //    if( item ){ name = item.name; }else{ name = "リストに無い"; }

  history.unshift({

    barcode: barcode,
    name: name

  });


  const tbody = document.getElementById("historyBody")

  //console.log("historyBody確認", tbody);
  

  const tr = document.createElement("tr");

  const tdTime = document.createElement("td");
  
  tdTime.textContent = new Date().toLocaleTimeString();

  const tdBarcode = document.createElement("td");
  tdBarcode.textContent = barcode;

  const tdName = document.createElement("td");
  if (item) {
    tdName.textContent = item.name;
  } else {
    tdName.textContent = "☓ 商品が見つかりません";
  }

  tr.appendChild(tdTime);
  tr.appendChild(tdBarcode);
  tr.appendChild(tdName);

  tbody.prepend(tr);
}

//////////////////////////////////////////////////////
// バーコード検索
//////////////////////////////////////////////////////

function checkBarcode() {

  const barcode = document.getElementById("HTMLbarcodeInputField").value;
  const item = invoiceMap.get(barcode);

  if (item) {
    //    itemがtrueとみなされる値（thuthy）なら。という意味
    //        undefinedやnullはelseになる
    //        数値があったらというわけではない（0や空白だけでもelseになる）
    //      今回はデータがヒットしたら値が入るのでこれだけで良い

    const tbody = document.getElementById("historyBody");

    //google.script.run
    //.checkItem(item.sheetRow);
    //  冒頭の長文説明のヤツ
    //      スプレットシートに??を追加するだけでHTMLでは何もしないので .withSuccessHandler()が無い書き方
    //	ここもgas用なのでコメントアウト

    //    ↓でHTML用納品書リストの□を☑に変える
    document.getElementById("invoiceTableCheck-" + barcode).textContent = "✓";

    document.getElementById("result").innerHTML =
      "<span class='ok'>〇 " + item.name + "</span>"; //　入力された番号が納品書A1の中にあれば◯と商品名が表示される
  } else {
    document.getElementById("result").innerHTML =
      "<span class='ng'>× 見つかりません</span>";
  }

  document.getElementById("HTMLbarcodeInputField").value = "";

  //document.getElementById("HTMLbarcodeInputField").focus();
  //  ↑手入力専用の頃に入力欄にフォーカスする事でソフトウェアキーボードを表示させたりしていた
  //    カメラ読み取りを前提にして、入力欄は補助としたため不要になった
  //        むしろ自動でソフトウェアキーボードが出て邪魔になる

  //  console.log(typeof Array.from(invoiceMap)[0][0]);

  //    ↓バーコードを読み込む度に履歴を記録していく
  addHistory(barcode, item);

  // itemをスキャン成功後の処理（checkBarcode()を呼び出す関数）でも使いたいのでreturnする
  return item;
}

///////////////////////////////////////////////////////
//QRコードの作成と表示
///////////////////////////////////////////////////////

//console.log(window.location.href);

new QRCode(document.getElementById("QRcode"), {
  //  text: window.location.href,　←これだと変な所に飛ばされる
  text: "https://kikyolab.github.io/delivery-check/",
  width: 250,
  height: 250,
});

//////////////////////////////////////////////////////
// カメラ起動
//////////////////////////////////////////////////////


// functionの中にいるならこれで良いが、"reader"がないのでは？
// let html5QrCode; ←これがエラー

const html5QrCode = new Html5Qrcode("cameraReader");

let lastBarcode = "";
let hitCount = 0;
let cameraProcessing = false;
let cameraRunning = false;

//  カメラの連続読み込み防止のためのフラグ
let scanLocked = false;
let cooldown = false;
let noReadCount = 0;

//  通信関係のグローバル関数
let postScanList = []; // 通信用に読み取った行番号を入れる配列
let sendingFLG = false; // 送信中フラグ


//document.getElementById("startCamera").addEventListener("click", startCamera); ←カメラを止める方法がない頃のヤツ
document.getElementById("startCamera").addEventListener("click", async () => {
  
  //alert("ボタン押された");
  
  if (cameraRunning) {
    //カメラ停止
    await html5QrCode.stop();
    cameraRunning = false;

    document.getElementById("startCamera").textContent = "カメラ起動";

    await sendScanList();

    //const response =
    //  await fetch("https://script.google.com/macros/s/AKfycbwiFWs9TTLqKIqcJwrFGPmApoAmDkBuxVBFWKxRU4cU1-Ql3ZwQDlfVRhYu-Le_06bt/exec", {
    //    method: "POST",
    //    body: "2"
    //  });

    //const result = await response.text();

    //console.log(result);

  } else {
    // カメラ開始

    //alert("start直前");

    await startCamera();
    cameraRunning = true;

    document.getElementById("startCamera").textContent = "カメラ停止";
  }
});

async function startCamera() {
  try{
  console.log("startCamera開始");

  const QR_WIDTH_RATE = 0.85; //　画面幅に対する読み取り枠の横幅（割合)
  const QR_HEIGHT_RATE = 0.4; //　画面幅に対する読み取り枠の高さ（割合)

  // 読み取り枠の実際の数値を計算
  const qrWidth = Math.floor(window.innerWidth * QR_WIDTH_RATE);
  const qrHeight = Math.floor(window.innerWidth * QR_HEIGHT_RATE);


  /////////////////////////////////////////////////////////////////////////
  //  ここからスキャン関連の分岐（html50QrCode)
  // html5QrCode.star()←これに引数を渡す
  //  html5QrCode.star( cameraconfig, config, onScanSuccess, onScanFailure )まである
  //    引数を｛｝で指定して[,]で区切る。引数が関数ならfunction(){}で渡せる
  /////////////////////////////////////////////////////////////////////////
  await html5QrCode.start(
 
    //  >引数1（cameraconfig)：どのカメラを使用するかの指定（facingMode="user"なら画面側、facingMode="environment"なら背面
    { facingMode: "environment" },
    //{ facingMode: "user" },

    //  =>引数2 (config)：読み取り設定（撮影範囲、fps設定など）
    {
      fps: 10,
      qrbox: {
        width: qrWidth,
        height: qrHeight
      },
    },

    //  =>引数3(onScanSuccess)：解析に成功時の処理(decodedTextは名称自由な変数名。その値はhtml5QrCodeから渡される第一引数)
    async function (decodedText) {
      
      if (scanLocked) return; // ←ロックされている状態(scanLocked===true)ならココで抜ける
        // ↓と同じ意味の省略形
        //if(scanLocked){ return; }

      //  読み込まれたバーコードが連続3回同じ数字かチェック（誤読回避処理）
      if (decodedText === lastBarcode) {

        hitCount++;

      } else {

        lastBarcode = decodedText;
        hitCount = 1;
      }

      //  正確に読み込んだかの判断（3回連続同じ数字 + サーバ送信処理などを行っていない + 撮影成功のバーコードが映り続けていない)
      if (hitCount >= 3 && !cameraProcessing && !scanLocked) {

        // スキャンを停止するフラグ処理
        lockScannerFlg();

        // スキャン成功を音で知らせる
        playBeep();

        // HTMLにスキャンしたバーコードを渡す
        setBarcodeHtmlInput(decodedText);

        //console.log("ロック設定", scanLocked);
        const successItem = checkBarcode();

        // 読み取った商品の行番号を保存
        if( successItem ){

          postScanList.push({
            row: successItem.sheetRow,
            barcode: decodedText
          });

        }

      }
    },

    //  =>引数4(onScanFailure) ：解析に失敗時の処理（errorMessageは名称自由な変数。値はhtml5QrCodeから渡される）
    //      もし、次のスキャンを待機時間だけでやるなら、このファンクション全体が不要
    //        第三引数最後のsetTimeoutのミリ秒を増やすだけで良い
    function (errorMessage) {

      console.log("読み取り失敗", errorMessage);
      
      if (scanLocked) {

        // クールダウン中は無視(ここで処理終了)
        if( cooldown ) return;

        noReadCount++;

        //　10回失敗したら読み込みを止める（fpsが10で、ここが20だと2秒でカウントが終わり次を撮影する
        if (noReadCount >= 20) {

          //バーコードを読む状態に戻す処理
          resetBarcodeScan();

        }
      }
    }

  );

  console.log("カメラ起動成功");
} catch(error){
  console.error( "カメラ起動失敗", error );
}
}

/////////////////////////////////////////////////////////////
//  GASへ送信する
/////////////////////////////////////////////////////////////
async function sendScanList(){
  if(postScanList.length === 0){

    console.log("送信データなし");
    return;

  }

  if( sendingFLG ){

    console.log("送信中");
    return;

  }

  sendingFLG = true;

  try{
    console.log("送信データ", postScanList);
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwiFWs9TTLqKIqcJwrFGPmApoAmDkBuxVBFWKxRU4cU1-Ql3ZwQDlfVRhYu-Le_06bt/exec",
      {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify( postScanList )
      }
    );

    const result = await response.text();

    console.log("GAS返答", result);


    if( result === "OK"){

      console.log("送信成功");

      //成功したら削除
      postScanList = [];

    } else {

      console.log("GASエラー");

      //配列は残す

    }

  }catch( error ){
    console.log("通信エラー", error );
    //配列は残す
  } finally {
    sendingFLG = false;
  }

  //sendingFLG = false;

}

/////////////////////////////////////////////////////////////
//  バーコードを読める状態に戻す処理
/////////////////////////////////////////////////////////////
function resetBarcodeScan(){

  scanLocked = false; //  読み取り許可を戻す
  cooldown = false; //　次の処理をするまでの時間FLG
  noReadCount = 0;  //  消失判定カウンターを戻す
  hitCount = 0; //  前のバーコードのカウントをクリア
  lastBarcode = ""; //  前の商品との比較をリセット
  cameraProcessing = false;

}


///////////////////////////////////////////////////////////
// スキャンが成功しても一時的に処理を停止するためのフラグ処理
///////////////////////////////////////////////////////////
function lockScannerFlg(){
  cameraProcessing = true;
  scanLocked = true;
  noReadCount = 0;
  cooldown = true;

  setTimeout(() => {
    cooldown = false;
  },2000);
}

///////////////////////////////////////////////////////////
// スキャンされたバーコードをHTMLのINPUTエリアに渡す
///////////////////////////////////////////////////////////
function setBarcodeHtmlInput(decodedText){
  document.getElementById("HTMLbarcodeInputField").value = decodedText;
}


/////////////////////////////////////////////////////////
// 読み取り完了を知らせるビープ音の設定部分
/////////////////////////////////////////////////////////

const BEEP_FREQ = 1200; // ヘルツ（数字が大きいほど高音）
const BEEP_VOLUME = 0.1; // ボリューム（0:無音、1:既定、2:倍）
const BEEP_TIME = 80; // ビープ音の時間(ミリ秒)

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const gainNode = audioCtx.createGain();
gainNode.gain.value = BEEP_VOLUME;
gainNode.connect(audioCtx.destination);

function playBeep() {
  const osc = audioCtx.createOscillator();

  osc.connect(gainNode);
  osc.type = "sine";
  osc.frequency.value = BEEP_FREQ;

  osc.start();

  setTimeout(() => {
    osc.stop();
  }, BEEP_TIME);
}
