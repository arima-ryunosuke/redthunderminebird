var EXPORTED_SYMBOLS = [ 'utility' ];

Components.utils.import("resource://redthunderminebird/common.js");

var Utility = function() {

	this.appendMenuitem = function(node, value, label) {
		var document = node.ownerDocument;
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute('value', value);
		menuitem.setAttribute('label', label);
		node.appendChild(menuitem);
		return menuitem;
	};
	
	this.appendListitem = function(node, value, label) {
		var document = node.ownerDocument;
		var listitem = document.createElement("listitem");
		listitem.setAttribute('value', value);
		listitem.setAttribute('label', label);
		node.appendChild(listitem);
		return listitem;
	};

	this.removeChildren = function(node) {
		for ( var i = node.childNodes.length - 1; i >= 0; i--)
		{
			node.removeChild(node.childNodes[i]);
		}
	};

	this.jsontoquery = function(json) {
		var result = '';
		for ( var k in json)
		{
			result += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(json[k]);
		}
		return result;
	};

	this.jsontoform = function(json, elements) {
		for ( var i = 0; i < elements.length; i++)
		{
			var id = elements[i].getAttribute('id');
			if (json[id] !== undefined)
			{
				if (elements[i].tagName == "checkbox")
					elements[i].checked = json[id];
				else
					elements[i].value = json[id];
			}
		}
	};

	this.formtojson = function(elements) {
		var result = {};
		for ( var i = 0; i < elements.length; i++)
		{
			var id = elements[i].getAttribute('id');
			if (elements[i].tagName == "checkbox")
				result[id] = elements[i].checked;
			else
				result[id] = elements[i].value;
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

	this.formatSize = function(source) {
		return String(source).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + ' bytes';
	};

	this.formatTicketSubject = function(object) {
		return '#' + object.id + ':' + object.subject;
	};
};

var utility = new Utility();
