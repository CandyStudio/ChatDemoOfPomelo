module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, username,sid, name, flag, cb) {
	debugger;
	console.log('channel:'+ name);
	var channel = this.channelService.getChannel(name, flag);
	console.log('channel:'+channel);
	var param = {
		route: 'onAdd',
		userid:uid,
		username: username
	};
	channel.pushMessage('onAdd',param,null);

	if( !! channel) {
		channel.add(uid+'*'+username, sid);
	}

	cb(this.get(name, flag));
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		console.log('users:'+users[i]);
		var userId = users[i].split('*')[0];
		var username = users[i].split('*')[1];
		users[i] = {
			userid:userId,
			username:username
		} 
	}
	return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, user,sid, name) {
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	var username = user.user_name;
	if( !! channel) {
		var id = uid+'*'+username;
		channel.leave(id, sid);
	}
	
	var param = {
		route: 'onLeave',
		user: username
	};
	channel.pushMessage(param);
};
