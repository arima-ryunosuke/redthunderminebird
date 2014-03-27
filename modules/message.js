var EXPORTED_SYMBOLS = [ 'Message' ];

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/gloda/mimemsg.js");

Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/utility.js", this);

var Message = function(message, selection) {
	this.message = message;
	this.dbview = message.folder.msgDatabase;
	this.selection = selection;

	//MIMEメッセージ変換(syncにできない？)
	var subject = null;
	var body = null;
	var attachments = null;
	this.encode = function(callback) {
		MsgHdrToMimeMessage(this.message, null, function(message, mimemessage) {
			subject = message.mime2DecodedSubject;
			body = mimemessage.coerceBodyToPlaintext();
			attachments = [];
			for ( var i = 0; i < mimemessage.allAttachments.length; i++)
			{
				var attachment = mimemessage.allAttachments[i];

				//添付ファイルストリーム
				// declare?
				// https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIChannel#open()
				var uri = Services.io.newURI(attachment.url, null, null);
				var channel = Services.io.newChannelFromURI(uri);
				var istream = channel.open();
				var bstream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
				bstream.setInputStream(istream);

				//ストリームからバイナリの読み込み(bstream.available() is max 32768?)
				var bytes = bstream.readByteArray(attachment.size);
				istream.close();
				bstream.close();

				attachment.data = new Int8Array(bytes);
				attachments.push(attachment);
			}
			callback();
		});
	};

	this.getUrl = function() {
		var ticketid = this.getId();
		var url = preference.getString("redmine") + '/issues/' + ticketid;
		return url;
	};

	this.getId = function() {
		var thread = this.dbview.GetMsgHdrForKey(this.message.threadId);
		var ticketid = thread.getUint32Property('redmineticketid');
		return ticketid;
	};

	this.setId = function(id) {
		var thread = this.dbview.GetMsgHdrForKey(this.message.threadId);
		thread.setUint32Property('redmineticketid', id);
	};

	this.getSubject = function() {
		if(subject === null)
			subject = this.message.mime2DecodedSubject;
		return subject;
	};

	this.getBody = function() {
		if (this.selection && this.selection.rangeCount && this.selection.getRangeAt(0).toString() !== '')
		{
			return this.selection.getRangeAt(0).toString();
		}
		else
		{
			return body;
		}
	};

	this.getAttachments = function() {
		return attachments;
	};

	this.toObject = function() {
		var result = {
			id : this.getId(),
			subject : this.getSubject(),
			description : this.getBody(),
			notes : this.getBody(),
		};

		var directorys = preference.getObject('directories');
		var project_id = directorys[this.message.folder.URI];
		if (!project_id)
			project_id = directorys[''];

		result.project_id = project_id;
		result.tracker_id = preference.getString('default_tracker');

		var due_length = parseInt(preference.getInt('default_due'));
		if (!isNaN(due_length) && due_length > 0)
			result.due_date = utility.formatDate(new Date(), due_length);

		return result;
	};
};