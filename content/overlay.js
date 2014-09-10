Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/message.js", this);
load("resource://redthunderminebird/utility.js", this);

function onCreate() {
	//redmineに接続できないならどうしようもない
	if (!redmine.ping())
	{
		alert(bundle.GetStringFromName("message.invalidredmine"));
		return;
	}

	//メッセージから得られる初期データ
	var message = new Message(gFolderDisplay.selectedMessage, document.commandDispatcher.focusedWindow.getSelection());
	message.encode(function() {
		//作成ダイアログを表示してチケット作成
		window.openDialog("chrome://redthunderminebird/content/create.xul", "createDialog", "chrome,centerscreen,modal", message, function(ticket) {
			//チケット作成
			var result = redmine.create(ticket);

			//issueがある=すべて成功した
			if (result.issue !== undefined)
			{
				message.setId(parseInt(result.issue.id));

				//@todo apiキーを付加しないとリダイレクトされてしまう
				//・オープン時のクッキー指定ミス？
				//・redmineのバグ？（http://www.redmine.org/issues/15926）
				var url = message.getUrl();
				window.openDialog("chrome://redthunderminebird/content/complete.xul", "completeDialog", "chrome,centerscreen,modal", {
					title : bundle.GetStringFromName("message.issuecreated"),
					label : url,
					value : url + '?key=' + preference.getString("apikey"),
				});

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
				alert(bundle.GetStringFromName("message.othererror"));
				return false;
			}
		});
	});

}

function onUpdate() {
	//redmineに接続できないならどうしようもない
	if (!redmine.ping())
	{
		alert(bundle.GetStringFromName("message.invalidredmine"));
		return;
	}

	//メッセージから得られる初期データ
	var message = new Message(gFolderDisplay.selectedMessage, document.commandDispatcher.focusedWindow.getSelection());
	message.encode(function() {
		//更新ダイアログを表示してチケット更新
		window.openDialog("chrome://redthunderminebird/content/update.xul", "updateDialog", "chrome,centerscreen,modal", message, function(ticket) {
			//チケット更新
			try
			{
				var result = redmine.update(ticket);
				logger.debug(result);

				message.setId(parseInt(ticket.id));

				var url = message.getUrl();
				window.openDialog("chrome://redthunderminebird/content/complete.xul", "completeDialog", "chrome,centerscreen,modal", {
					title : bundle.GetStringFromName("message.issueupdated"),
					label : url,
					value : url + '?key=' + preference.getString("apikey"),
				});

				return true;
			}
			catch (e)
			{
				logger.error(e);
				alert(bundle.GetStringFromName("message.othererror"));
				return false;
			}
		});
	});
}

function onOpen() {
	//メッセージから得られる初期データ
	var message = new Message(gFolderDisplay.selectedMessage, document.commandDispatcher.focusedWindow.getSelection());

	if (message.getId() != 0)
	{
		var url = message.getUrl() + '?key=' + preference.getString("apikey");
		openURL(url);
	}
}

function onRefer() {
	//メッセージから得られる初期データ
	var message = new Message(gFolderDisplay.selectedMessage, document.commandDispatcher.focusedWindow.getSelection());

	//関連付けダイアログを表示してチケット関連付け
	window.openDialog("chrome://redthunderminebird/content/refer.xul", "referDialog", "chrome,centerscreen,modal", message, function(ticket) {

		message.setId(parseInt(ticket.id));
		return true;
	});
}

window.addEventListener('load', function() {
	document.getElementById('mailContext').addEventListener('popupshowing', function(e) {
		var message = new Message(gFolderDisplay.selectedMessage, document.commandDispatcher.focusedWindow.getSelection());
		var id = message.getId();
		document.getElementById('ticket_open').setAttribute('disabled', id == 0);
		document.getElementById('ticket_update').setAttribute('disabled', id == 0);
	}, false);
}, true);
