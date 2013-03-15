/**
*Init Chatlog
*/
var Chatlog = function  (opts) {
	this.id = opts.id;

	this.username = opts.username;
	this.userid = opts.userid;
	this.type = opts.type;
	this.tousername = opts.tousername;
	this.touserid = opts.touserid;
	this.context = opts.context;
	this.createtime= opts.createtime;
	this.roomid = opts.roomid;
}

module.exports = Chatlog;