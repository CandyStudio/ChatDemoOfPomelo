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
    var  channel = channelService.getChannel(session.get('rid'),false);
	var chat = {
		fromuserid:user.id,
		fromusername:user.user_name,
		room_id:msg.roomid,
		tousername : msg.target,
		cocntext:msg.content
	};

	//the target is all users
	if (msg.target === '*') {

		chat.type = 0;
		chat.touserid = 0;
	}
	//the target is specific user
	else {
		chat.type = 1;
		chat.touserid = msg.userid;

	}
	for(var s in chat){
		console.log('聊天内容:'+s+':'+chat[s]);
	}
	
	chatDao.insert(chat, function(err, res) {
       console.log(err);
		if ( !! err) {
			next(null, {
				code: 500,
                err: err
			});
		} else {

            chatDao.queryByid(res.insertId,function(err,res){
                if(!!err){
                    next(null, {
                        code: 500,
                        err: err
                    });
                }else{
                    var chat = res[0];
                    var theChat = {route:'onChat',
                        from_user_name:chat['from_user_name'],
                        to_user_id:chat['to_user_id'],
                        to_user_name:chat['to_user_name'],
                        type:chat['type'],
                        context:chat['context'],
                        createtime:chat['createtime'],
                        room_id:chat['room_id']
                    };

//                    for(var t in chat){
//                        if(chat.hasOwnProperty(t)){
//                            theChat[t] = chat[t];
//                            console.log('key:'+t +'value:'+chat[t]);
//                        }
//
//                    }
                    var members = channel.getMembers();

                    if (msg.target === '*') {
                        channel.pushMessage(theChat);

                    }
                    else{
                        var tuid = msg.userid + '*' + msg.target;
                        var member = channel.getMember(tuid);
                        var tsid = member['sid'];
                        channelService.pushMessageByUids(theChat, [{
                            uid: tuid,
                            sid: tsid
                        }]);
                    }
                    next(null, {
                        code:200,
                        chat:res[0],
                        route:"onChat"
                    });
                }
            })  ;


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