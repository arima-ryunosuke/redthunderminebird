Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/gloda/mimemsg.js");

Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

function onLoad() {
	//初期データ取得
	var defdata = window.arguments[0];
	if (preference.getBool('default_description'))
	{
		defdata.notes = defdata.notes.replace(/^(.*)(\r\n|\r|\n)/mg, function(m, m1, m2) {
			if (m.charAt(0) == '>')
				return m;
			else
				return m1 + '  ' + m2;
		});
	}

	//初期データ投入
	var elements = document.getElementsByClassName('ticket_data');
	for ( var i = 0; i < elements.length; i++)
	{
		var id = elements[i].getAttribute('id');
		if (defdata[id] !== undefined)
			elements[i].value = defdata[id];
	}

	//タイトル設定
	var ticket = redmine.ticket(defdata.id);
	document.getElementById('ticket_title').value = '#' + ticket.id + ':' + ticket.subject;
}

function onUpdate() {
	if (document.getElementById('id').value == 0)
	{
		alert('対象チケットが選択されていません');
		return;
	}

	//MIMEメッセージ変換
	MsgHdrToMimeMessage(window.opener.gFolderDisplay.selectedMessage, null, function(message, mimemessage) {

		//宣言と添付ファイル
		var data = {
			uploads : [],
		};

		var length = document.getElementById('is_attachment').checked ? mimemessage.allAttachments.length : 0;
		for ( var i = 0; i < length; i++)
		{
			var attachment = mimemessage.allAttachments[i];

			//添付ファイルストリーム
			// declare?
			// https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIChannel#open()
			var uri = Services.io.newURI(attachment.url, null, null);
			var channel = Services.io.newChannelFromURI(uri);
			var istream = channel.open();
			var bstream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
			bstream.setInputStream(istream);

			//ストリームからバイナリの読み込み
			var bytes = bstream.readByteArray(bstream.available());
			var buffer = new Int8Array(bytes);
			istream.close();
			bstream.close();

			//ファイルを登録してtokenを取得
			var result = redmine.upload(buffer);
			logger.debug(result.upload.token);

			//アップロードパラメータの追加
			var upload = {
				token : result.upload.token,
				filename : attachment.name,
				content_type : attachment.contentType,
				description : ' ',
			};
			data.uploads.push(upload);
		}

		//form data → json object
		var elements = document.getElementsByClassName('ticket_data');
		for ( var i = 0; i < elements.length; i++)
		{
			var id = elements[i].getAttribute('id');
			if (elements[i].tagName == "checkbox")
				data[id] = elements[i].checked;
			else
				data[id] = elements[i].value;
		}

		if (window.arguments[1](data))
		{
			close();
		}
	});
}
