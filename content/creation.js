Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

function onLoad() {
	// menuitemを追加するcloser
	var addMenuitem = function(id, value, label) {
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute('value', value);
		menuitem.setAttribute('label', label);
		document.getElementById(id).childNodes[0].appendChild(menuitem);
		return menuitem;
	};

	//ユーザ一覧(現在のところ自分自身のみ)
	var user = redmine.myself();
	addMenuitem('assigned_to_id', user.id, user.lastname + user.firstname + '(※変更できません)');

	//プロジェクト一覧
	var projects = redmine.projects();
	for ( var i = 0; i < projects.length; i++)
	{
		var project = projects[i];
		addMenuitem('project_id', project.id, project.fullname);
	}

	//トラッカー一覧
	var trackers = redmine.trackers();
	for ( var i = 0; i < trackers.length; i++)
	{
		var tracker = trackers[i];
		addMenuitem('tracker_id', tracker.id, tracker.name);
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
	defdata.assigned_to_id = user.id;
	defdata.project_id = project_id;
	defdata.tracker_id = preference.getString('default_tracker');
	defdata.due_length = preference.getInt('default_due');
	if (preference.getBool('default_description'))
	{
		defdata.description = '    ' + defdata.description.replace(/(\r\n)|(\r)|(\n)/g, '\n    ');
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
		data[id] = elements[i].value;
	}

	//コールバック呼び出し(チケット登録できたらtrue)
	if (window.arguments[1](data))
		close();
}
