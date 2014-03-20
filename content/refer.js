Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/gloda/mimemsg.js");

Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

function onLoad() {
	//初期データ取得
	var defdata = window.arguments[0];

	//ディレクトリマッピング
	var directorys = preference.getObject('directories');
	var folder = window.opener.gFolderDisplay.displayedFolder.URI;
	var project_id = directorys[folder];
	if (!project_id)
		project_id = directorys[''];

	//チケットループ
	var cid = defdata.id;
	var node = document.getElementById('id').childNodes[0];
	var tickets = redmine.tickets(project_id, 50);
	for ( var i = 0; i < tickets.length; i++)
	{
		//名前が似ているなら初期選択とする
		if (defdata.id == 0 && cid == 0)
		{
			var as = tickets[i].subject.replace(/\[.*\]|\(.*\)|【.*】|re|fwd/gi, '');
			var bs = defdata.subject.replace(/\[.*\]|【.*】|re|fwd/gi, '');
			if (as.indexOf(bs) != -1 || bs.indexOf(as) != -1)
			{
				cid = tickets[i].id;
			}
		}
		utility.appendMenuitem(node, tickets[i].id, '#' + tickets[i].id + ':' + tickets[i].subject);
	}
	defdata.id = cid;

	//初期データ投入
	var elements = document.getElementsByClassName('ticket_data');
	for ( var i = 0; i < elements.length; i++)
	{
		var id = elements[i].getAttribute('id');
		if (defdata[id] !== undefined)
			elements[i].value = defdata[id];
	}
}

function onRefer() {
	var newid = document.getElementById('id').value;
	if (newid == 0)
	{
		alert('対象チケットが選択されていません');
		return;
	}

	if (window.arguments[1](newid))
	{
		close();
	}
}
