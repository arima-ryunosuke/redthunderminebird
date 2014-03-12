Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

//ショートカット
function byid(id) {
	return document.getElementById(id);
};

function onLoad() {
	// menuitemを追加するcloser
	var appendMenuitem = function(node, value, label) {
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute('value', '' + value);
		menuitem.setAttribute('label', '' + label);
		node.appendChild(menuitem);
		return menuitem;
	};

	//アカウント一覧
	var account_manager = Cc["@mozilla.org/messenger/account-manager;1"].getService(Ci.nsIMsgAccountManager);
	var accounts = account_manager.accounts;
	for ( var i = 0; i < accounts.length; i++)
	{
		var account = accounts.queryElementAt(i, Ci.nsIMsgAccount);
		var value = account.incomingServer.rootFolder.URI;
		var name = account.incomingServer.prettyName;
		appendMenuitem(byid('redthunderminebird-account').childNodes[0], value, name);
	}

	//読み込み
	byid('redthunderminebird-redmine').value = preference.getString('redmine');
	byid('redthunderminebird-apikey').value = preference.getString('apikey');
	byid('redthunderminebird-account').value = preference.getString('account');
	byid('redthunderminebird-filter_project').value = preference.getString('filter_project');
	byid('redthunderminebird-filter_directory').value = preference.getString('filter_directory');

};

function onCommit() {
	//アカウント確認
	var account = byid('redthunderminebird-account').value;
	if (!account)
	{
		alert('アカウントを選択して下さい');
		return;
	}
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
	preference.setString('account', account);
	preference.setString('filter_project', byid('redthunderminebird-filter_project').value);
	preference.setString('filter_directory', byid('redthunderminebird-filter_directory').value);

	//コールバックして終了
	window.arguments[0](hostname, apikey);
	close();
}

function onCancel() {
	close();
}
