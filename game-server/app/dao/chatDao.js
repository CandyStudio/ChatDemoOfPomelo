//聊天数据库连接对象

var consts = require('../consts/consts');
var utils = require('../util/utils');
var chatDao = module.exports;
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

/**
 *插入一条聊天记录
 *@param {Object} fromuserid, fromusername, touserid, tousername, type, cocntext, room_id
 *@param {Function} 回调函数
 *@return {Array}
 */
chatDao.insert = function(chat, cb) {
	
	var sql = 'insert into t_sys_chatlog (from_user_id,from_user_name,to_user_id,to_user_name,type,context,room_id) values(?,?,?,?,?,?,?)';
	vars = [chat.fromuserid, chat.fromusername, chat.touserid, chat.tousername, chat.type, chat.cocntext, chat.room_id];
	pomelo.app.get('dbclient').query(sql, vars, function(err, res) {

		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			utils.invokeCallback(cb, null, res);
		};
	});
};
/**
 *查询聊天记录
 *@param {int} 用户id
 *@param {int} 房间id
 *@param {Function} 回调函数
 *@return {Array}
 */
chatDao.query = function(userid, roomid, cb) {
    var sql = 'select * from t_sys_chatlog where (type=0 or from_user_id=? or to_user_id=?) and room_id = ? order by id desc limit 200';

    vars = [ userid,userid,roomid];

	pomelo.app.get('dbclient').query(sql, vars, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, {
				code: err.number,
				msg: err.message
			}, null);
		} else {
			
			utils.invokeCallback(cb, null, res);
		};
	})

};

/**
 * 查询聊天记录 通过id
 */
chatDao.queryByid = function(chatid, cb) {
    console.log('chatid :'+chatid);
    var sql = 'select * from t_sys_chatlog where id=? ';

    vars = [chatid];

    pomelo.app.get('dbclient').query(sql, vars, function(err, res) {
        if (err !== null) {
            utils.invokeCallback(cb, {
                code: err.number,
                msg: err.message
            }, null);
        } else {
            console.log('res:'+res);
            utils.invokeCallback(cb, null, res);
        };
    }) ;

};