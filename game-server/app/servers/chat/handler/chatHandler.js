var chatRemote = require('../remote/chatRemote');
var chatDao = require('../../../dao/chatDao');
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * 查询聊天记录
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.query = function  (msg,session,next){

	chatDao.query(msg.userid,msg.roomid,function 	 (err,res) {
			if (!!err) {
				next(null,{
					code:500,
					err:err
				});
			} else{

				next(null,{
					code:200,
					chatlog:res
				});
			};
	})
};

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {
	var rid = session.get('rid');
	var user = session.get('user');
	var channelService = this.app.get('channelService');
	var param = {
		route: 'onChat',
		msg: msg.content,
		from: user.user_name,
		target: msg.target
	};
	console.log(param);
	channel = channelService.getChannel(rid, false);
	var chat = {
		fromuserid:user.id,
		fromusername:user.user_name,
		room_id:msg.roomid,
		tousername : msg.target,
		cocntext:msg.content
	};
	//the target is all users
	if (msg.target === '*') {
		channel.pushMessage(param);
		chat.type = 0;
		chat.touserid = 0;
	}
	//the target is specific user
	else {
		chat.type = 1;
		chat.touserid = msg.userid;
		var tuid = msg.userid + '*' + msg.target;
		console.log('tuid:' + tuid);
		var member = channel.getMember(tuid);
		console.log('member:' + member);

		var tsid = member['sid'];
		console.log('tsid:' + tsid);
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	for(var s in chat){
		console.log('聊天内容:'+s+':'+chat[s]);
	}
	
	chatDao.insert(chat, function(err, res) {

		if ( !! err) {
			next(null, {
				code: 500,
				route: msg.route
			});
		} else {
			next(null, {
				code:200,
				route: msg.route
			});
		};
	})

};


/**
 *退出房间
 *
 *@param {Object}msg   userid,username
 *@param {Object}session
 *@param {Function} 回调函数
 */
handler.quit =function(msg,session,cb){
	var  channel = this.app.get('channelService').getChannel(session.get('rid'),false);
	var username = msg.username;
	var userid = msg.userid;
	var sid = this.app.get('serverId')
	console.log(username+'离开');
	if( !! channel) {
		var id = userid+'*'+username;
		console.log('id:'+id);
		console.log('sid:'+sid);
		channel.leave(id, sid);
	}
	else
	{
		console.log('离开没有找到channel');
	}
	var user = session.get('user');
	var param = {
		route: 'onLeave',
		username: username,
		userid:user.id
	};
	channel.pushMessage(param);

	cb(null,{
		code:200
	});
};