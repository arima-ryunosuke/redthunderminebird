var EXPORTED_SYMBOLS = [ 'DEBUG', 'Cc', 'Ci', 'Cu', 'load', 'log' ];

//デバッグフラグ
var DEBUG = true;

//ショートカット
var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

//コンソール
var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

//コンソール書き出し
var log = function(message) {
	if (message instanceof Object)
	{
		consoleService.logStringMessage(JSON.stringify(message, null, 2));
	}
	else if (message instanceof String)
	{
		consoleService.logStringMessage(message);
	}
	else
	{
		consoleService.logStringMessage(message);
	}
};

//キャッシュ無効モジュール読み込み
var load = function(module, scope) {
	var query = DEBUG ? '?' + (new Date()).getTime() : '';
	return Cu.import(module + query, scope);
};
