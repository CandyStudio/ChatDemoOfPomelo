//Room

/**
*Init room
*/
var Room = function  (opts) {
	this.id = opts.id;
	this.name = opts.name;
	this.createuserid = opts.createuserid;
	this.createtime = opts.createtime;
};

/**
*Expose 'Room' constructor
*/
module.exports = Room;
