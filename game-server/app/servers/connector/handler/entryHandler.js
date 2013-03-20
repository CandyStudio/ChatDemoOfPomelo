var consts = require('../../../consts/consts');
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
	var username = msg.username;
	var uid = msg.userid + '*' + username;
	var sessionService = self.app.get('sessionService');
	//duplicate log in
	if ( !! sessionService.getByUid(uid)) {
		console.log('重复登陆');
		next(null, {
			code: 500,
			err: {
				errorcode: 3,
				msg: '已经登陆了'
			}
		});
		return;
	}

	var onlineuser = this.app.get('onlineuser');
	this.app.set('onlineuser', ++onlineuser);
	console.log('当前在线人数:', onlineuser);


	var channelService = self.app.get('channelService');
	var c1 = channelService.getChannel('1', true);
	var c2 = channelService.getChannel('2', true);
	c1.channelname = 'name1';
	c2.channelname = 'name2';
	var channels = channelService.getChannels();
	var names = [];
	for (var c in channels) {
		var ch = channels[c];
        console.log(ch.getMembers());
        console.log(ch.getMembers().length);
        console.log(ch.usercount);
        if(!!ch.usercount)
        {

        }
        else{
            ch.usercount = 0;
        }
		names.push({
			id: c,
			name: ch.channelname,
			count:ch.usercount
		});
	}
	session.bind(uid);
	session.on('closed', onUserLeave.bind(null, self.app));
	var userDao = require('../../../dao/userDao');
	userDao.getUserInfoByID(msg.userid, function(err, res) {
		if ( !! err) {
			next(null, {
				code: 500
			});
		} else {
			console.log('session bind' + res);
			session.set('user', res[0]);
			session.push('user');
			next(null, {
				code: 200,
				roomlist: names,
                onlineuser:onlineuser
			})
		};
	});


};


/**
 * 进入房间
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enterRoom = function(msg, session, next) {
	var self = this;
	// put user into channel
	session.set('rid', msg.channel);
	session.push('rid', function(err) {
		if (err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});

	self.app.rpc.chat.chatRemote.add(session, msg.userid, msg.username, self.app.get('serverId'), msg.channel, true, function(users) {
		next(null, {
			code: 200,
			users: users
		});
	});
};
/**
 * 创建房间
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.createRoom = function(msg, session, next) {

	var roomDao = require('../../../dao/roomDao');
	var app = this.app;
	roomDao.createRoom(msg.channel, msg.userid, function(err, roomid) {

		if ( !! err) {
			next(null, {
				code: 500,
				err: err
			});
		} else {
			var channelService = app.get('channelService');
			console.log('创建房间:channelService:' + channelService);
			var channel = channelService.createChannel(roomid);
			console.log('创建房间:channel:' + channel);
			channel.channelname = msg.channel;
			next(null, {
				code: 200,
				roomid: roomid,
                count:0
			});
		};
	});
};



/**
 *退出房间
 *
 *@param {Object}msg   userid,username
 *@param {Object}session
 *@param {Function} 回调函数
 */
handler.quit = function(msg, session, cb) {

	var username = msg.username;
	var userid = msg.userid;
	var uid = userid + '*' + username;
	var sid = this.app.get('serverId')
	console.log(username + '离开');
	this.app.rpc.chat.chatRemote.kick(session, uid, session.get('user'), sid, session.get('rid'), null);
	cb(null, {
		code: 200
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
		console.log('用户离开 但没找到session uid');
		return;
	}
	var onlineuser = app.get('onlineuser');
	app.set('onlineuser', --onlineuser);
	console.log('当前在线人数:', onlineuser);

	var rid = session.get('rid');
	if ( !! rid) {
		app.rpc.chat.chatRemote.kick(session, session.uid, session.get('user'), app.get('serverId'), session.get('rid'), null);
	};



};