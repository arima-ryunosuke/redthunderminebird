var EXPORTED_SYMBOLS = [ 'preference' ];

Components.utils.import("resource://redthunderminebird/common.js");

var Preference = function() {

	var klass = Cc["@mozilla.org/preferences-service;1"];
	var service = klass.getService(Ci.nsIPrefService);
	var branch = service.getBranch("extensions.redthunderminebird.");

	this.getInt = function(key) {
		return branch.getIntPref(key);
	};

	this.setInt = function(key, value) {
		return branch.setIntPref(key, value);
	};

	this.getBool = function(key) {
		return branch.getBoolPref(key);
	};

	this.setBool = function(key, value) {
		return branch.setBoolPref(key, value);
	};

	this.getString = function(key) {
		return decodeURI(branch.getCharPref(key));
	};

	this.setString = function(key, value) {
		return branch.setCharPref(key, encodeURI(value));
	};

	this.getObject = function(key) {
		return JSON.parse(this.getString(key));
	};

	this.setObject = function(key, value) {
		return this.setString(key, JSON.stringify(value));
	};
};

var preference = new Preference();
