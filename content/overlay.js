Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

function getMessageData() {
	//件名とボディ
	var message = gFolderDisplay.selectedMessage;

	var title = message.mime2DecodedSubject;

	var muri = message.folder.getUriForMsg(message);
	var messenger = Cc["@mozilla.org/messenger;1"].createInstance(Ci.nsIMessenger);
	var mservice = messenger.messageServiceFromURI(muri);
	var listener = Cc["@mozilla.org/network/sync-stream-listener;1"].createInstance(Ci.nsISyncStreamListener);
	mservice.streamMessage(muri, listener, null, null, false, "", false);
	var body = message.folder.getMsgTextFromStream(listener.inputStream, message.Charset, 65536, 32768, false, true, {});

	//選択中文字列があるならそちらを優先する
	var selection = document.commandDispatcher.focusedWindow.getSelection();
	if (selection.rangeCount && selection.getRangeAt(0).toString() !== '')
	{
		body = selection.getRangeAt(0).toString();
	}

	//チケットID取得
	var id = 0;
	for ( var i = 0; i < 1000; i++)
	{
		id = message.getUint32Property('redmineticketid');
		if (id != 0)
			break;

		if (message.threadParent == 0xffffffff)
			break;

		message = gDBView.db.GetMsgHdrForKey(message.threadParent);
	}

	//返却
	return {
		id : id,
		title : title,
		body : body,
	};
}

function onCreate() {
	//redmineに接続できないならどうしようもない
	if (!redmine.ping())
	{
		alert('Redmineの設定がされていません');
		return;
	}

	//メッセージから得られる初期データ
	var mail = getMessageData();
	var maildata = {
		subject : mail.title,
		description : mail.body,
	};

	//作成ダイアログを表示してチケット作成
	window.openDialog("chrome://redthunderminebird/content/creation.xul", "creationDialog", "chrome,centerscreen,modal", maildata, function(ticket) {
		//チケット作成
		var result = redmine.create(ticket);

		//issueがある=すべて成功した
		if (result.issue !== undefined)
		{
			//@todo apiキーを付加しないとリダイレクトされてしまう
			//・オープン時のクッキー指定ミス？
			//・redmineのバグ？（http://www.redmine.org/issues/15926）
			var url = preference.getString("redmine") + '/issues/' + result.issue.id;
			window.openDialog("chrome://redthunderminebird/content/complete.xul", "completeDialog", "chrome,centerscreen,modal", {
				title : '作成しました',
				label : url,
				value : url + '?key=' + preference.getString("apikey"),
			});

			//チケットIDを覚えておく
			var message = gFolderDisplay.selectedMessage;
			message.setUint32Property('redmineticketid', result.issue.id);

			return true;
		}
		//errorsがある=リクエストは成功したが、バリデーションエラーがある
		else if (result.errors !== undefined)
		{
			alert(result.errors.join('\n'));
			return false;
		}
		//htmlがある=リクエストが失敗した
		else if (result.html !== undefined)
		{
			alert(result.html.title);
			return false;
		}
		//それ以外は予測できない
		else
		{
			alert('作成処理中に予期せぬエラーが発生しました');
			return false;
		}
	});
}

function onUpdate() {
	//redmineに接続できないならどうしようもない
	if (!redmine.ping())
	{
		alert('Redmineの設定がされていません');
		return;
	}

	//メッセージから得られる初期データ
	var mail = getMessageData();
	var maildata = {
		id : mail.id,
		subject : mail.title,
		notes : mail.body,
	};

	//更新ダイアログを表示してチケット作成
	window.openDialog("chrome://redthunderminebird/content/update.xul", "updateDialog", "chrome,centerscreen,modal", maildata, function(ticket) {
		//チケット更新
		try
		{
			var result = redmine.update(ticket);
			logger.debug(result);

			var url = preference.getString("redmine") + '/issues/' + ticket.id;
			window.openDialog("chrome://redthunderminebird/content/complete.xul", "completeDialog", "chrome,centerscreen,modal", {
				title : '更新しました',
				label : url,
				value : url + '?key=' + preference.getString("apikey"),
			});

			//チケットIDを覚えておく
			var message = gFolderDisplay.selectedMessage;
			message.setUint32Property('redmineticketid', ticket.id);

			return true;
		}
		catch (e)
		{
			logger.error(e);
			alert('更新処理中に予期せぬエラーが発生しました');
			return false;
		}
	});
}

function onOpen() {
	var mail = getMessageData();
	if (mail.id != 0)
	{
		var url = preference.getString("redmine") + '/issues/' + mail.id + '?key=' + preference.getString("apikey");
		openURL(url);
	}
}

window.addEventListener('load', function() {
	document.getElementById('mailContext').addEventListener('popupshowing', function(e) {
		var mail = getMessageData();
		document.getElementById('ticket_open').setAttribute('disabled', mail.id == 0);
	}, false);
}, true);
