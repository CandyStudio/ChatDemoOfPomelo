var dispatcher = require('../../../util/dispatcher');
var consts = require('../../../consts/consts');
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
	var uid = msg.uid;
	if (!uid) {
		next(null, {
			code: 500
		});
		return;
	}
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if (!connectors || connectors.length === 0) {
		next(null, {
			code: 500
		});
		return;
	}
	// select connector
	var res = dispatcher.dispatch(uid, connectors);
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};


var userdao = require('../../../dao/userDao');
/**
 * Login
 * @param {Object} msg message from client
 * @param {Object} session
 * @next {Function} callback
 */
handler.login = function(msg, session, next) {
	
	console.log(msg);
	app = this.app;
	userdao.getUserInfo(msg.username, function(err, users) {
		if ( !! err) {
			console.log('err');
			console.log(err.errorcode);
			next(null, {
				code: 500,
				err: err
			});
		} else {
			if (users.length == 0) {
				next(null, {
					code: 500,
					err: {
						errorcode: consts.ErrorCode.NOUSERNAME
					}
				});
				return;
			} else {
				var user = users[0];
				if (user.user_pwd !== msg.password) {
					next(null, {
						code: 500,
						err: {
							errorcode: consts.ErrorCode.PASSWORDERROR
						}
					});
					return;
				};
			}

			var connectors = app.getServersByType('connector');
			if (!connectors || connectors.length === 0) {
				next(null, {
					code: 500

				});
				return;
			}
			// select connector
			var res = dispatcher.dispatch(user.id, connectors);
			next(null, {
				code: 200,
				host: res.host,
				port: res.clientPort,
				userid:user.id,
				role:user.user_role
			});
		};
	});
};
/**
 * 注册
 * @param {Object} msg message from client
 * @param {Object} session
 * @next {Function} callback
 */
handler.register = function(msg, session, next) {
	app = this.app;
	userdao.getUserInfo(msg.username, function(err, users) {
		if ( !! err) {
			console.log('err');
			console.log(err.errorcode);
			next(null, {
				code: 500,
				err: err
			});
		} else {
			if (users.length == 0) {
				userdao.createUser(msg.username, msg.password, msg.role, function(err, userid) {
					if (err !== null) {
						console.log('注册失败');
						console.log('err');
						console.log(err.errorcode);
						next(null, {
							code: 500,
							err: err
						});
					} else {
						var connectors = app.getServersByType('connector');
						if (!connectors || connectors.length === 0) {
							next(null, {
								code: 500

							});
							return;
						}
						
						var res = dispatcher.dispatch(userid, connectors);
						console.log('注册成功');
						next(null, {
							code: 200,
							host: res.host,
							port: res.clientPort,
							userid:userid
						});

					};
				});
			} else {
				console.log('已经存在用户');
				next(null, {
					code: 500,
					err: {
						errorcode: consts.ErrorCode.ALREADYHASUSER

					}
				});
			}
		};
	});
}