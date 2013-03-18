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
				console.log(res);
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
				route: msg.route
			});
		};
	})

};