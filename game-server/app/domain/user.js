//User

/**
* Initialize a new 'User' with given 'opts'
*
* @param {Object} opts
* @api public
*/
var User = function  (opts) {
	this.id = opts.id;
	this.user_name = opts.user_name;
	this.user_pwd = opts.user_pwd;
	this.user_role = opts.user_role;
	this.createtime = opts.createtime;
};

/**
* Expose 'Entity' constructor
*/

module.exports = User;
