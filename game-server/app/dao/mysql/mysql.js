//mysql CRUD 增加(Create)、查询(Retrieve)（重新得到数据）、更新(Update)和删除(Delete)
var sqlclient = module.exports;

var _pool;

var NND = {};

/*
* Init sql connection pool
* @param {Object} app Tge app for cerver.
*/

NND.init = function  (app) {
	_pool = require('./dao-pool').createMysqlPool(app);
};

/**
* Excute sql statement
* @param {String} sql Statement The sql need to excute.
* @Param {Object} args The agrs for the sql.
* @param {function} cb Callback function.
*/
NND.query = function  (sql,args,cb) {
	console.log('query :'+arguments);
	_pool.acquire(function  (err,client) {
		if (!!err) {
			console.log('[sqlqueryErr] '+err.stack);
			return;
		};
		client.query(sql,args,function  (err,res) {
			_pool.release(client);
			cb(err,res);
		});
	});
};

/**
* Close connection pool.
*/
NND.shutdown = function  () {
	_pool.destoryAllNow();
};

/**
* init database
*/

sqlclient.init = function  (app) {
	if (!!_pool) {
		return sqlclient;
	}else{
		NND.init(app);
		sqlclient.insert = NND.query;
		sqlclient.update = NND.query;
		sqlclient.delete = NND.query;
		sqlclient.query = NND.query;
		return sqlclient;
	}
};


/**
* shutdown database
*/

sqlclient.shutdown = function  (app) {
	NND.shutdown(app);
}



