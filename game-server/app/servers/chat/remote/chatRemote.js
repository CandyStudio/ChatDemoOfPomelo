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
	console.log('uid:'+uid);
	console.log('username:'+username);
	console.log('channel:'+ name);
	var channel = this.channelService.getChannel(name, flag);
	console.log('channel:'+channel);
	var param = {
		route: 'onAdd',
		userid:uid,
		username: username
	};
	
	channel.pushMessage(param);

	if( !! channel) {
		console.log('add sid:'+sid);
		channel.add(uid+'*'+username, sid);
        console.log(channel.usercount);
        channel.usercount++;
        console.log(channel.usercount);
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
	console.log('离开uid',uid);
	console.log('离开sid',sid);
	console.log('离开name',name);
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	var username = user.user_name;
	console.log('离开username',username);
	console.log(username+'离开');
	if( !! channel) {
		var id = uid;
		channel.leave(id, sid);
        console.log(channel.usercount);
        channel.usercount--;
        console.log(channel.usercount);
	}
	else
	{
		console.log('离开没有找到channel');
	}
	var param = {
		route: 'onLeave',
		username: username,
		userid:user.id
	};
	channel.pushMessage(param);
};
