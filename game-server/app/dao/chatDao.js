var consts = require('../consts/consts');
var utils = require('../util/utils');
var chatDao = module.exports;
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

chatDao.insert = function(chat, cb) {
	
	var sql = 'insert into t_sys_chatlog (from_user_id,from_user_name,to_user_id,to_user_name,type,context,room_id) values(?,?,?,?,?,?,?)';
	vars = [chat.fromuserid, chat.fromusername, chat.touserid, chat.tousername, chat.type, chat.cocntext, chat.room_id];
	pomelo.app.get('dbclient').query(sql, vars, function(err, res) {

		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			if ( !! res && res.length === 1) {

				utils.invokeCallback(cb, null, res);

			} else {
				utils.invokeCallback(cb, null, []);
			};
		};
	});
};

chatDao.query = function(userid, roomid, cb) {
	var sql = 'select * from t_sys_chatlog where type=0 or from_user_id=? or to_user_id=? limit 200';

	vars = [userid, userid];

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