var EXPORTED_SYMBOLS = [ 'redmine' ];

Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/utility.js", this);

var Redmine = function() {

	this.request = function(method, path, data) {
		//設定値と引数からURL生成
		var hostname = preference.getString("redmine");
		var apikey = preference.getString("apikey");
		var url = hostname + '/' + path + '?key=' + apikey;

		//リクエストを投げる
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		try
		{
			request.open(method, url, false);
			request.setRequestHeader("Content-Type", "text/xml");
			request.send(utility.jsontoxml(data));

			if (request.status >= 500)
				throw request;
		}
		catch (e)
		{
			throw request;
		}

		//基本的にはxmlが返るのでjsonにしてから返却する
		return utility.xmltojson(request.responseText);
	};

	this.ping = function(redmine, apikey) {
		//省略時は設定値を使用する
		if (redmine === undefined)
			redmine = preference.getString("redmine");
		if (apikey === undefined)
			apikey = preference.getString("apikey");

		//users/current.xmlをもって疎通確認とする
		var url = redmine + '/users/current.xml?key=' + apikey;

		//リクエストを投げる
		var result = null;
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		try
		{
			request.open('HEAD', url, false);
			request.setRequestHeader("Content-Type", "text/xml");
			request.send();

			result = (request.status == 200);
		}
		catch (e)
		{
			result = false;
		}
		return result;
	};

	this.create = function(ticket) {
		return this.request('POST', 'issues.xml', {
			issue : ticket,
		});
	};

	var myself = null;
	this.myself = function() {
		if (myself === null)
		{
			//取得
			var response = this.request('GET', 'users/current.xml', {});
			myself = response.user;
		}
		return myself;
	};

	var projects = null;
	this.projects = function() {
		if (projects === null)
		{
			//取得
			var response = this.request('GET', 'projects.xml', {});
			projects = response.projects.project;

			//識別子でフィルタ
			var filter = preference.getString("filter_project").replace(/\s/g, '').split(',');
			projects = projects.filter(function(project, i) {
				return filter.indexOf(project.id) == -1;
			});

			//fullnameプロパティを定義
			for ( var i = 0; i < projects.length; i++)
			{
				var project = projects[i];
				projects[i].fullname = (project.parent !== undefined ? project.parent.name + '/' : '') + project.name;
			}

			//fullnameでソート
			projects.sort(function(a, b) {
				return (a.fullname > b.fullname) ? 1 : -1;
			});
		}
		return projects;
	};

	var trackers = null;
	this.trackers = function() {
		if (trackers === null)
		{
			//取得
			var response = this.request('GET', 'trackers.xml', {});
			trackers = response.trackers.tracker;
		}
		return trackers;
	};

	this.recache = function() {
		//キャッシュを殺す
		myself = null;
		projects = null;
		trackers = null;
	};
};

var redmine = new Redmine();
