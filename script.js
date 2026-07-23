// alert("script.js Ver2");
//////////////////////////////////////////////////////
// 検索用Map　の宣言（納品書のデータを入れるMap)
//////////////////////////////////////////////////////

const invoiceMap = new Map();
  // ここで指定しないと、全ての関数で共有できない


//////////////////////////////////////////////////////
// ページを開いたら納品書を取得
//////////////////////////////////////////////////////

window.onload=function(){


	//	fetch("https://script.google.com/macros/s/AKfycbwiFWs9TTLqKIqcJwrFGPmApoAmDkBuxVBFWKxRU4cU1-Ql3ZwQDlfVRhYu-Le_06bt/exec")
	//	.then(r => r.json())
	//	.then(loadMap);

	fetch("https://script.google.com/macros/s/AKfycbwiFWs9TTLqKIqcJwrFGPmApoAmDkBuxVBFWKxRU4cU1-Ql3ZwQDlfVRhYu-Le_06bt/exec")
	.then(r => {
		console.log("Response:", r);
		return r.json();
	})
	.then(data => {
		console.log("Data:", data);
		loadMap(data);
	})
	.catch(err => {
		console.error("Fetch Error:", err);
	});


}



function loadMap(values){

    //  console.log(values);

    values.forEach(row=>{

        invoiceMap.set(

            row.barcode,

            row

        );


    });


    createInvoiceList(values);

    //alert(invoiceMap.get("1111"));
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

function createInvoiceList(values){

    const tbody = document.getElementById("invoiceTableBody");
    tbody.innerHTML = "";

    values.forEach(item => {

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

document
.getElementById("HTMLbarcodeInputField")
.addEventListener(

"keydown",

function(e){

    if(e.key==="Enter"){

        checkBarcode();

    }

});


//////////////////////////////////////////////////////
// 履歴へ追加
//////////////////////////////////////////////////////

function addHistory(barcode, item){

    const tbody = document.getElementById("historyBody");

    const tr = document.createElement("tr");

    const tdTime = document.createElement("td");
    tdTime.textContent = new Date().toLocaleTimeString();

    const tdBarcode = document.createElement("td");
    tdBarcode.textContent = barcode;


    const tdName = document.createElement("td");
    if(item){

      tdName.textContent = item.name;

    }else{

      tdName.textContent = "? 商品が見つかりません";

    }

    tr.appendChild(tdTime);
    tr.appendChild(tdBarcode);
    tr.appendChild(tdName);

    tbody.prepend(tr);

}


//////////////////////////////////////////////////////
// バーコード検索
//////////////////////////////////////////////////////

function checkBarcode(){

  //console.log(barcode);

    const barcode=document.getElementById("HTMLbarcodeInputField").value;
    
      //  console.log(barcode);
      //  console.log(typeof barcode);

    const item=invoiceMap.get(barcode);

    

    if(item){
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

        //    ↓でHTML用納品書リストの□を??に変える
        document.getElementById("invoiceTableCheck-" + barcode).textContent = "?";

        document.getElementById("result").innerHTML=

            "<span class='ok'>〇 "+item.name+"</span>"; //　入力された番号が納品書A1の中にあれば◯と商品名が表示される

     
    }

    else{

        document.getElementById("result").innerHTML=

            "<span class='ng'>× 見つかりません</span>";

    }

    document.getElementById("HTMLbarcodeInputField").value="";

    document.getElementById("HTMLbarcodeInputField").focus();

    //  console.log(typeof Array.from(invoiceMap)[0][0]);

        //    ↓バーコードを読み込む度に履歴を記録していく
        addHistory(barcode, item);


}


///////////////////////////////////////////////////////
//QRコードの作成と表示
///////////////////////////////////////////////////////

console.log(window.location.href);

new QRCode(document.getElementById("QRcode"), {

  //  text: window.location.href,　←これだと変な所に飛ばされる
  //	text: "https://script.google.com/macros/s/AKfycbzai84WZTv13V9aztLNcCkgYdTFui-4QeOtIiiDl3jd_8vUbRjf5hAEshVUrTZhQVu79Q/exec",
  //		↑ここもgas用のコーディング（GASのURL）
  text: "https://kikyolab.github.io/delivery-check/",
  width: 250,
  height: 250

});


//////////////////////////////////////////////////////
// カメラ起動
//////////////////////////////////////////////////////

document
.getElementById("startCamera")
.addEventListener("click", startCamera);


// functionの中にいるならこれで良いが、"reader"がないのでは？
// let html5QrCode; ←これがエラー

const html5QrCode = new Html5Qrcode("cameraReader");

let lastBarcode = "";
let hitCount = 0;

function startCamera(){

	//alert( window.top==window.self);
    //  const html5QrCode = new Html5Qrcode("reader");
    //    ↑ここだとこのファンクションの外で使えないので外に移動


    html5QrCode.start(

        { facingMode: "environment" },

        {
		fps: 8,
		qrbox: 250
		//qrbox: { width: 350, height: 150 }
        },

        function(decodedText){



		if (decodedText === lastBarcode) {
		
		    hitCount++;
		
		} else {
		
		    lastBarcode = decodedText;
		    hitCount = 1;

		}

		alert(decodedText + "　回数：" + hitCount);

		document.getElementById("result").innerHTML =
		    decodedText + "　回数：" + hitCount;

		if (hitCount >= 3) {

			// まず止める
			//html5QrCode.stop();←これだけでも問題ないが、止めてから処理したいから↓にする
			
			html5QrCode.stop().then(() => {
				
				// バーコードをセットする
				document.getElementById("HTMLbarcodeInputField").value = decodedText;
				
				//万が一の再利用の為にチェック用バーコード変数をクリアする
				lastBarcode = "";
				hitCount = 0;
				
				checkBarcode();
			})
			.catch(err => {
				console.error(err);
			});

		}


            
            //console.log(decodedText);

        }

    );

}


