//房间数据连接对象

var consts = require('../consts/consts');
var utils = require('../util/utils');
var roomDao = module.exports;
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);


/**
 *创建房间
 *@param {String} 房间名
 *@param {int} 创建人的id
 *@param {Function} 回调函数
 *@param {int} 房间id
 */
roomDao.createRoom = function  (name,create,cb) {
	var sql = 'insert into t_sys_room (room_name,room_creater) values (?,?)';
	var args = [name,create];


	pomelo.app.get('dbclient').query(sql, args, function(err, res) {

		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {

			utils.invokeCallback(cb, null, res.insertId);
			
		};
	});
};


/**
 *获得所有房间
 *@return {Array}
 */
roomDao.getAllRoom = function  (cb) {
	var sql = 'select * from t_sys_room ';
	


	pomelo.app.get('dbclient').query(sql, null, function(err, res) {

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