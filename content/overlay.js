Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);


function onLoad() {}

function onDialog() {
	//redmineに接続できないならどうしようもない
	if (!redmine.ping())
	{
		alert('Redmineの設定がされていません');
		return;
	}

	//メッセージペインから件名と本文を取得
	var messagepane = document.getElementById('messagepane');
	var title = messagepane.contentDocument.getElementsByTagName('title')[0];
	var body = messagepane.contentDocument.getElementsByTagName('body')[0];

	//選択メッセージなし
	if (!(title && body))
	{
		alert('メッセージが選択されていません');
		return;
	}

	//文字列抽出
	title = title.textContent;
	body = body.textContent;

	//選択中文字列があるならそちらを優先する
	var selection = document.commandDispatcher.focusedWindow.getSelection();
	if (selection.rangeCount && selection.getRangeAt(0).toString() !== '')
	{
		body = selection.getRangeAt(0).toString();
	}

	//メッセージから得られる初期データ
	var maildata = {
		subject : title,
		description : body,
	};

	//登録ダイアログを表示してチケット作成
	window.openDialog("chrome://redthunderminebird/content/creation.xul", "creationDialog", "chrome,centerscreen,modal", maildata, function(ticket) {
		//チケット作成
		var result = redmine.create(ticket);

		//issueがある=すべて成功した
		if (result.issue !== undefined)
		{
			var url = preference.getString("redmine") + '/issues/' + result.issue.id;
			alert('作成しました：' + url);
			return true;
		}
		//errorsがある=リクエストは成功したが、バリデーションエラーがある
		else if (result.errors !== undefined)
		{
			alert(result.errors.error.join('\n'));
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
			alert('登録処理中に予期せぬエラーが発生しました');
			return false;
		}
	});
}
