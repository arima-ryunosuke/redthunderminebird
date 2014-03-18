var EXPORTED_SYMBOLS = [ 'redmine' ];

Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/utility.js", this);

var Redmine = function() {
	logger.debug('Redmine constractor');

	this.request = function(method, path, data, type) {
		logger.debug('request:', method, path);

		//設定値と引数からURL生成
		var hostname = preference.getString("redmine");
		var apikey = preference.getString("apikey");
		var url = hostname + '/' + path + '?key=' + apikey;

		//コンテントタイプはデフォルトでjson
		if (type === undefined)
			type = 'application/json';

		//GETはクエリ化する
		if (method == 'GET' && data !== undefined)
		{
			url += utility.jsontoquery(data);
		}

		//リクエストボディ生成
		var body = "";
		if (method != 'GET' && data !== undefined)
		{
			switch (type)
			{
				case 'application/json':
					body = JSON.stringify(data);
					break;
				case 'application/octet-stream':
					body = data;
					break;
				default:
					throw 'undefined content-type';
			}
		}

		//リクエストを投げる
		var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		try
		{
			logger.debug('request request:', url);

			request.open(method, url, false);
			request.setRequestHeader("Content-Type", type);
			request.send(body);

			logger.debug('request status:', request.status);
			logger.debug('request response:', request.responseText);

			if (request.status >= 300 && request.status != 422)
				throw request;
		}
		catch (e)
		{
			throw request;
		}

		//文字列なら(多分JSON文字列なので)オブジェクトにして返却
		var result = request.responseText;
		if (result != 0)
			result = JSON.parse(result);

		return result;
	};

	this.ping = function(redmine, apikey) {
		//退避
		var _redmine = preference.getString("redmine");
		var _apikey = preference.getString("apikey");

		//上書き
		if (redmine !== undefined)
			preference.setString("redmine", redmine);
		if (apikey !== undefined)
			preference.setString("apikey", apikey);

		//確認
		var result = true;
		try
		{
			//REST APIの対応可否やバージョンチェックをした方がいい
			this.request('GET', '/users/current.json');
		}
		catch (e)
		{
			result = false;
		}

		//復元
		preference.setString("redmine", _redmine);
		preference.setString("apikey", _apikey);

		return result;
	};

	this.upload = function(data) {
		logger.debug('upload:', data.length);

		return this.request('POST', 'uploads.json', data, 'application/octet-stream');
	};

	this.create = function(ticket) {
		logger.debug('create:', ticket);

		return this.request('POST', 'issues.json', {
			issue : ticket,
		});
	};

	this.update = function(ticket) {
		logger.debug('update:', ticket);

		return this.request('PUT', 'issues/' + ticket.id + '.json', {
			issue : ticket,
		});
	};

	this.ticket = function(id) {
		logger.debug('ticket:', id);

		//取得
		var response = this.request('GET', 'issues/' + id + '.json');
		return response.issue;
	};

	this.tickets = function(project_id, limit) {
		logger.debug('tickets:', project_id, limit);

		//取得
		var response = this.request('GET', 'projects/' + project_id + '/issues.json', {
			limit : limit,
		});
		return response.issues;
	};

	var myself = null;
	this.myself = function() {
		logger.debug('myself');

		if (myself === null)
		{
			//取得
			var response = this.request('GET', 'users/current.json');
			myself = response.user;
		}
		return myself;
	};

	var projects = null;
	this.projects = function() {
		logger.debug('projects');
		if (projects === null)
		{
			//取得
			var response = this.request('GET', 'projects.json');
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
		logger.debug('members:', project_id);
		if (members[project_id] === undefined)
		{
			//取得(権限の関係で例外が飛びやすい)
			try
			{
				var response = this.request('GET', 'projects/' + project_id + '/memberships.json');
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
		logger.debug('versions:', project_id);
		if (versions[project_id] === undefined)
		{
			//取得
			var response = this.request('GET', 'projects/' + project_id + '/versions.json');
			versions[project_id] = response.versions;
		}
		return versions[project_id];
	};

	var trackers = null;
	this.trackers = function() {
		logger.debug('trackers');
		if (trackers === null)
		{
			//取得
			var response = this.request('GET', 'trackers.json');
			trackers = response.trackers;
		}
		return trackers;
	};

	this.recache = function() {
		logger.debug('recache');
		//キャッシュを殺す
		myself = null;
		projects = null;
		members = null;
		versions = null;
		trackers = null;
	};
};

var redmine = new Redmine();
