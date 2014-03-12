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
			request.setRequestHeader("Content-Type", "application/json");
			request.send(JSON.stringify(data));

			if (request.status >= 300)
				throw request;
		}
		catch (e)
		{
			throw request;
		}

		//オブジェクトにして返却
		return JSON.parse(request.responseText);
	};

	this.ping = function(redmine, apikey) {
		//省略時は設定値を使用する
		if (redmine === undefined)
			redmine = preference.getString("redmine");
		if (apikey === undefined)
			apikey = preference.getString("apikey");

		//users/current.jsonをもって疎通確認とする
		var url = redmine + '/users/current.json?key=' + apikey;

		//リクエストを投げる
		var result = null;
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		try
		{
			request.open('HEAD', url, false);
			request.setRequestHeader("Content-Type", "application/json");
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
		return this.request('POST', 'issues.json', {
			issue : ticket,
		});
	};

	var myself = null;
	this.myself = function() {
		if (myself === null)
		{
			//取得
			var response = this.request('GET', 'users/current.json', {});
			myself = response.user;
		}
		return myself;
	};

	var projects = null;
	this.projects = function() {
		if (projects === null)
		{
			//取得
			var response = this.request('GET', 'projects.json', {});
			projects = response.projects;

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

	var members = {};
	this.members = function(project_id) {
		if (members[project_id] === undefined)
		{
			//取得(権限の関係で例外が飛びやすい)
			try
			{
				var response = this.request('GET', 'projects/' + project_id + '/memberships.json', {});
				members[project_id] = response.memberships;
			}
			catch (e)
			{
				//気休めに自分自身を入れておく
				var myself = this.myself();
				myself.name = myself.lastname;
				members[project_id] = [ {
					user : myself
				} ];
			}
		}
		return members[project_id];
	};

	var versions = {};
	this.versions = function(project_id) {
		if (versions[project_id] === undefined)
		{
			//取得
			var response = this.request('GET', 'projects/' + project_id + '/versions.json', {});
			versions[project_id] = response.versions;
		}
		return versions[project_id];
	};

	var trackers = null;
	this.trackers = function() {
		if (trackers === null)
		{
			//取得
			var response = this.request('GET', 'trackers.json', {});
			trackers = response.trackers;
		}
		return trackers;
	};

	this.recache = function() {
		//キャッシュを殺す
		myself = null;
		projects = null;
		members = null;
		versions = null;
		trackers = null;
	};
};

var redmine = new Redmine();
