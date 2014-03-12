Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

//ショートカット
function byid(id) {
	return document.getElementById(id);
};

function onLoad() {
	//読み込み
	byid('redthunderminebird-redmine').value = preference.getString('redmine');
	byid('redthunderminebird-apikey').value = preference.getString('apikey');
	byid('redthunderminebird-filter_project').value = preference.getString('filter_project');
	byid('redthunderminebird-filter_directory').value = preference.getString('filter_directory');
};

function onCommit() {
	//疎通確認
	var hostname = byid('redthunderminebird-redmine').value;
	var apikey = byid('redthunderminebird-apikey').value;
	var result = redmine.ping(hostname, apikey);
	if (!result)
	{
		alert('Redmineにアクセスできませんでした');
		return;
	}

	//保存
	preference.setString('redmine', hostname);
	preference.setString('apikey', apikey);
	preference.setString('filter_project', byid('redthunderminebird-filter_project').value);
	preference.setString('filter_directory', byid('redthunderminebird-filter_directory').value);

	//コールバックして終了
	window.arguments[0](hostname, apikey);
	close();
}

function onCancel() {
	close();
}
