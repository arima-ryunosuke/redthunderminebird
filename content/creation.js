Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

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

	//thunderbirdフォルダとredmineプロジェクトのマッピング
	var directorys = preference.getObject('directories');
	var folder = window.opener.gFolderDisplay.displayedFolder.URI;

	//デフォルトor未指定ならデフォルト
	var project_id = directorys[folder];
	if (!project_id)
		project_id = directorys[''];

	//初期データ取得
	var defdata = window.arguments[0];
	defdata.project_id = project_id;
	defdata.tracker_id = preference.getString('default_tracker');
	defdata.due_length = preference.getInt('default_due');
	if (preference.getBool('default_description'))
	{
		defdata.description = defdata.description.replace(/^(.*)$/mg, function(m) {
			if (m.charAt(0) == '>')
				return m;
			else
				return m + '  ';
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
}

function onProject() {
	//デフォルト設定用
	var user = redmine.myself();
	var project_id = document.getElementById('project_id').value;

	//担当者再構築
	var node = document.getElementById('assigned_to_id').childNodes[0];
	utility.removeChildren(node);
	utility.appendMenuitem(node, user.id, '<< 自分 >>');
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
	//開始日時
	var data = {
		start_date : utility.formatDate(new Date()),
	};

	//指定されているなら終了日時
	var due_length = parseInt(document.getElementById('due_length').value);
	if (!isNaN(due_length) && due_length > 0)
		data.due_date = utility.formatDate(new Date(), due_length);

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

	//コールバック呼び出し(チケット登録できたらtrue)
	if (window.arguments[1](data))
		close();
}
