module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;


/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var uid = msg.userid;
	var sessionService = self.app.get('sessionService');

	//duplicate log in
	if ( !! sessionService.getByUid(uid)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}
	var channelService = self.app.get('channelService');
	var c1 = channelService.getChannel('name1', true);
	var c2 = channelService.getChannel('name2', true);
	var channels = self.app.get('channelService').getChannels();
	var names = [];
	for (var c in channels) {
		names.push(c);
	}
	session.bind(uid);

	var userDao = require('../../../dao/userDao');
	userDao.getUserInfoByID(uid, function(err, res) {
		if ( !! err) {
			next(null, {
				code: 500
			});
		} else {
			console.log('session bind'+res);
			session.set('user',res[0]);
			session.push('user');
			next(null, {
				code: 200,
				roomlist: names
			})
		};;
	});


};
handler.enterRoom = function(msg, session, next) {
	var self = this;
	// put user into channel
	session.set('rid', msg.channel);
	session.push('rid', function(err) {
		if (err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));
	self.app.rpc.chat.chatRemote.add(session, msg.userid, msg.username, self.app.get('serverId'), msg.channel, true, function(users) {
		next(null, {
			code: 200,
			users: users
		});
	});
};


/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if (!session || !session.uid) {
		return;
	}
	console.log('test:'+session.get('user'));
	app.rpc.chat.chatRemote.kick(session, session.uid,session.get('user'), app.get('serverId'), session.get('rid'), null);
};