Components.utils.import("resource://redthunderminebird/common.js");

load("resource://redthunderminebird/preference.js", this);
load("resource://redthunderminebird/redmine.js", this);
load("resource://redthunderminebird/utility.js", this);

var PAGE_UNIT = 10;
var currentpage = 0;
var message = window.arguments[0];

function onLoad() {
	//初期データ取得
	var defdata = onMore();

	//初期データ投入
	var elements = document.getElementsByClassName('ticket_data');
	utility.jsontoform(defdata, elements);
}

function onMore() {
	try
	{
		//チケットループ
		var defdata = message.toObject();
		var cid = defdata.id;
		var node = document.getElementById('ids');
		var offset = currentpage++ * PAGE_UNIT;
		var tickets = redmine.tickets(defdata.project_id, offset, PAGE_UNIT);
		for (var i = 0; i < tickets.length; i++)
		{
			//名前が似ているなら初期選択とする
			if (defdata.id == 0 && cid == 0)
			{
				var as = tickets[i].subject.replace(/\[.*\]|\(.*\)|【.*】|re|fwd/gi, '');
				var bs = defdata.subject.replace(/\[.*\]|【.*】|re|fwd/gi, '');
				if (as.indexOf(bs) != -1 || bs.indexOf(as) != -1)
				{
					cid = tickets[i].id;
				}
			}
			utility.appendListitem(node, tickets[i].id, utility.formatTicketSubject(tickets[i]));
		}
		node.scrollToIndex(offset);
		defdata.id = cid;
		return defdata;
	}
	catch (e)
	{
		logger.error(e);
		window.opener.alert(bundle.GetStringFromName("message.notfoundproject"));
		return close();
	}
}

function onTicket() {
	var id = document.getElementById('ids').value;
	document.getElementById('id').value = id;
	var ticket = redmine.ticket(id);
	document.getElementById('description').value = ticket.description;
}

function onRefer() {
	var newid = document.getElementById('id').value;
	if (newid == 0)
	{
		alert(bundle.GetStringFromName("message.notselectissue"));
		return;
	}

	var ticket = null;
	try
	{
		ticket = redmine.ticket(newid);
	}
	catch (e)
	{}
	if (ticket === null)
	{
		alert(bundle.GetStringFromName("message.notselectissue"));
		return;
	}

	if (window.arguments[1](ticket))
	{
		close();
	}
}
