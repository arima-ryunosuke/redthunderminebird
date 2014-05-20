Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

var message = window.arguments[0];

function onLoad() {
	//添付ファイル一覧
	var files = message.getAttachments();
	for (var i = 0; i < files.length; i++)
	{
		var row = document.createElement('row');
		var checkbox = document.createElement('checkbox');
		var label = document.createElement('label');

		checkbox.setAttribute('label', files[i].name);
		checkbox.setAttribute('class', 'attachment_data');
		checkbox.setAttribute('style', 'padding:0px;margin:0px;');

		label.setAttribute('value', utility.formatSize(files[i].size));

		row.appendChild(checkbox);
		row.appendChild(label);

		document.getElementById('ticket_files').appendChild(row);
	}

	//初期データ設定
	var defdata = message.toObject();
	var elements = document.getElementsByClassName('ticket_data');
	utility.jsontoform(defdata, elements);

	//タイトル設定
	try
	{
		var ticket = redmine.ticket(defdata.id);
		document.getElementById('ticket_title').value = utility.formatTicketSubject(ticket);
	}
	catch (e)
	{
		logger.error(e);
		window.opener.alert(bundle.GetStringFromName("message.notfoundreferedissue"));
		return close();
	}

	onProject();
}

function onProject() {
	//デフォルト設定用
	var user = redmine.myself();
	var project_id = message.getProjectId();

	//プロジェクト存在確認
	try
	{
		redmine.project(project_id);
	}
	catch (e)
	{
		logger.error(e);
		window.opener.alert(bundle.GetStringFromName("message.notfoundproject"));
		return close();
	}

	//担当者再構築
	var node = document.getElementById('assigned_to_id').childNodes[0];
	utility.removeChildren(node);
	utility.appendMenuitem(node, "", bundle.GetStringFromName("value.nochange"));
	utility.appendMenuitem(node, user.id, bundle.GetStringFromName("value.myselfname"));
	var members = redmine.members(project_id);
	for (var i = 0; i < members.length; i++)
	{
		if (user.id == members[i].user.id)
			continue;
		utility.appendMenuitem(node, members[i].user.id, members[i].user.name);
	}
	document.getElementById('assigned_to_id').value = "";
}

function onUpdate() {
	if (document.getElementById('id').value == 0)
	{
		alert(bundle.GetStringFromName("message.notselectissue"));
		return;
	}

	var elements = document.getElementsByClassName('ticket_data');
	var data = utility.formtojson(elements);

	data.files = [];
	var attachments = message.getAttachments();
	var fileelems = document.getElementsByClassName('attachment_data');
	for (var i = 0; i < fileelems.length; i++)
	{
		if (fileelems[i].checked)
		{
			data.files.push(attachments[i]);
		}
	}

	//コールバック呼び出し(チケット更新できたらtrue)
	if (window.arguments[1](data))
	{
		close();
	}
}
