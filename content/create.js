Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

var message = window.arguments[0];

function onLoad() {
	//プロジェクト一覧
	var projects = redmine.projects();
	var node = document.getElementById('project_id').childNodes[0];
	for ( var i = 0; i < projects.length; i++)
	{
		utility.appendMenuitem(node, projects[i].id, projects[i].fullname);
	}

	//トラッカー一覧
	var trackers = redmine.trackers();
	var node = document.getElementById('tracker_id').childNodes[0];
	for ( var i = 0; i < trackers.length; i++)
	{
		utility.appendMenuitem(node, trackers[i].id, trackers[i].name);
	}

	//添付ファイル一覧
	var files = message.getAttachments();
	for ( var i = 0; i < files.length; i++)
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

	//初期データ
	var defdata = message.toObject();
	var elements = document.getElementsByClassName('ticket_data');
	utility.jsontoform(defdata, elements);

	onProject();
}

function onProject() {
	//デフォルト設定用
	var user = redmine.myself();
	var project_id = document.getElementById('project_id').value;

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
	utility.appendMenuitem(node, user.id, bundle.GetStringFromName("value.myselfname"));
	var members = redmine.members(project_id);
	for ( var i = 0; i < members.length; i++)
	{
		if (user.id == members[i].user.id)
			continue;
		utility.appendMenuitem(node, members[i].user.id, members[i].user.name);
	}
	document.getElementById('assigned_to_id').value = user.id;

	//対象バージョン再構築
	var node = document.getElementById('fixed_version_id').childNodes[0];
	utility.removeChildren(node);
	var versions = redmine.versions(project_id);
	for ( var i = 0; i < versions.length; i++)
	{
		utility.appendMenuitem(node, versions[i].id, versions[i].name);
	}
}

function onCreate() {
	var elements = document.getElementsByClassName('ticket_data');
	var data = utility.formtojson(elements);

	data.files = [];
	var attachments = message.getAttachments();
	var fileelems = document.getElementsByClassName('attachment_data');
	for ( var i = 0; i < fileelems.length; i++)
	{
		if (fileelems[i].checked)
		{
			data.files.push(attachments[i]);
		}
	}

	//コールバック呼び出し(チケット登録できたらtrue)
	if (window.arguments[1](data))
	{
		close();
	}
}
