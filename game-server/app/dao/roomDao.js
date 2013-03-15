var consts = require('../consts/consts');
var utils = require('../util/utils');
var roomDao = module.exports;
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

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
roomDao.getAllRoom = function  () {
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