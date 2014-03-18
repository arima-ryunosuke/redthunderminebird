Components.utils.import("resource://redthunderminebird/common.js");

function onLoad() {
	var title = document.getElementById('redthunderminebird-title');
	title.value = window.arguments[0].title;

	var link = document.getElementById('redthunderminebird-link');
	link.value = window.arguments[0].label;
}

function onTicket() {
	openURL(window.arguments[0].value);
};
