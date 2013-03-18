//用户数据连接对象

var consts = require('../consts/consts');
var utils = require('../util/utils');
var userDao = module.exports;
var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var User = require('../domain/user');



/**
 *获得用户信息
 *@param {String} 用户名
 *@param {Function} 回调函数
 *@return {Array}
 */
userDao.getUserInfo = function(username, cb) {
	var sql = 'select * from t_sys_user where user_name = ?  ';
	var args = [username];


	pomelo.app.get('dbclient').query(sql, args, function(err, res) {

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

/**
 *通过用户id获得用户信息
 *@param {int} 用户id
 *@param {Function} 回调函数
 *@return {Array}
 */
userDao.getUserInfoByID = function(id, cb) {
	var sql = 'select * from t_sys_user where id = ?  ';
	var args = [id];


	pomelo.app.get('dbclient').query(sql, args, function(err, res) {

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
/**
 *创建用户
 *@param {String} 用户名
 *@param {String} 密码
 *@param {int} 角色
 *@param {Function} 回调函数
 *@return {int} 用户id
 */
userDao.createUser = function(username, pwd, role, cb) {
	var sql = 'insert into t_sys_user (user_name,user_pwd,user_role) values(?,?,?)';
	var args = [username, pwd, role];

	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, {
				code: err.number,
				msg: err.message
			}, null);
		} else {
			
			utils.invokeCallback(cb, null, res.insertId);
		};
	})

};