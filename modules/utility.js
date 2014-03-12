var EXPORTED_SYMBOLS = [ 'utility' ];

Components.utils.import("resource://redthunderminebird/common.js");

var Utility = function() {

	this.xmltojson = function(xmltext) {
		var parse = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
		var xmlDoc = parse.parseFromString(xmltext, "application/xml");
		var loopParse = function(obj) {
			var res = {}, cacheTag = {};
			var ob = {}, att = obj.attributes;
			if (att != null && att.length != 0)
			{
				for ( var a = 0, lenA = att.length; a < lenA; a++)
				{
					ob[att[a].nodeName.toLowerCase()] = att[a].value;
				}
				res._attr = ob;
			}

			if (obj.childNodes.length > 0)
			{
				for ( var i = 0, len = obj.childNodes.length; i < len; i++)
				{
					var ch = obj.childNodes[i];
					if (ch.nodeType == 3)
					{
						if (ch.nodeValue.replace(/[\s|\t|\n]/g, "") == "" || ch.nodeValue == null)
							continue;
						else
							return ch.nodeValue;
					}
					else if (ch.nodeType == 1)
					{
						(ch.tagName in cacheTag) ? cacheTag[ch.tagName].push(arguments.callee(ch)) : cacheTag[ch.tagName] = [ arguments.callee(ch) ];
					}
				}
			}
			else
			{
				if (res._attr === undefined)
					return '';
				else
					return res._attr;
			}

			var objtype = "object";
			if (obj.getAttribute && obj.getAttribute('type'))
				objtype = obj.getAttribute('type');

			for ( var p in cacheTag)
			{
				//配列で長さが1の時は配列解除
				if (cacheTag[p].constructor == Array && cacheTag[p].length == 1)
				{
					//ただしtype属性でarrayが指定されていたら配列のまま
					if (objtype == 'array')
					{
						res[p] = cacheTag[p];
					}
					else
					{
						res[p] = cacheTag[p][0];
					}
				}
				//出ないなら単純に入れれば良い
				else
				{
					res[p] = cacheTag[p];
				}
			}
			return res;
		};
		return loopParse(xmlDoc);
	};

	this.jsontoxml = function(jsondata) {
		var escape = function(string) {
			return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
		};

		var result = '';
		var parse = function(key, value) {
			if (value.constructor == Array)
			{
				for ( var i = 0; i < value.length; i++)
				{
					parse(key, value[i]);
				}
			}
			else if (typeof (value) === 'object')
			{
				result += '<' + key + '>\n';
				for ( var name in value)
				{
					parse(name, value[name]);
				}
				result += '</' + key + '>\n';
			}
			else
			{
				result += '<' + key + '>' + escape('' + value) + '</' + key + '>\n';
			}
		};
		for ( var root in jsondata)
		{
			parse(root, jsondata[root]);
			break;
		}
		return result;
	};

	this.formatDate = function(target, deltadate) {
		if (deltadate !== undefined)
		{
			target = new Date(target.getTime() + deltadate * 3600 * 24 * 1000);
		}

		var year = target.getFullYear();
		var month = target.getMonth() + 1;
		var date = target.getDate();
		return year + '-' + (month < 10 ? '0' : '') + month + '-' + (date < 10 ? '0' : '') + date;
	};
};

var utility = new Utility();
