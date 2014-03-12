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

	this.removeChildren = function(node) {
		for ( var i = node.childNodes.length - 1; i >= 0; i--)
		{
			node.removeChild(node.childNodes[i]);
		}
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
