/**
*Init Chatlog
*/
var Chatlog = function  (opts) {
	this.id = opts.id;
	this.username = opts.username;
	this.type = opts.type;
	this.tousername = opts.tousername;
	this.context = opts.context;
	this.createtime= opts.createtime;
	this.roomId = opts.roomId;
}

module.exports = Chatlog;