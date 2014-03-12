var EXPORTED_SYMBOLS = [ 'preference' ];

Components.utils.import("resource://redthunderminebird/common.js");

var Preference = function() {
	log('Preference constractor');

	var klass = Cc["@mozilla.org/preferences-service;1"];
	var service = klass.getService(Ci.nsIPrefService);
	var branch = service.getBranch("extensions.redthunderminebird.");

	this.getInt = function(key) {
		log('getInt:', key);
		return branch.getIntPref(key);
	};

	this.setInt = function(key, value) {
		log('setInt:', key);
		return branch.setIntPref(key, value);
	};

	this.getBool = function(key) {
		log('getBool:', key);
		return branch.getBoolPref(key);
	};

	this.setBool = function(key, value) {
		log('setBool:', key);
		return branch.setBoolPref(key, value);
	};

	this.getString = function(key) {
		log('getString:', key);
		return decodeURI(branch.getCharPref(key));
	};

	this.setString = function(key, value) {
		log('setString:', key);
		return branch.setCharPref(key, encodeURI(value));
	};

	this.getObject = function(key) {
		log('getObject:', key);
		return JSON.parse(this.getString(key));
	};

	this.setObject = function(key, value) {
		log('setObject:', key);
		return this.setString(key, JSON.stringify(value));
	};
};

var preference = new Preference();
