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
var log = function() {
	if (!DEBUG)
		return;

	var message = '';
	for ( var i = 0; i < arguments.length; i++)
	{
		if (arguments[i] === undefined)
			arguments[i] = typeof (arguments[i]);

		if (typeof (arguments[i]) == 'string')
		{
			message += arguments[i];
		}
		else
		{
			message += JSON.stringify(arguments[i], null, 2);
		}
	}
	consoleService.logStringMessage(message);
};

//キャッシュ無効モジュール読み込み
var load = function(module, scope) {
	var query = DEBUG ? '?' + (new Date()).getTime() : '';
	return Cu.import(module + query, scope);
};
