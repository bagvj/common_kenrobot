define(['vendor/jquery', 'app/config/config'], function($1, config) {
	var userInfo;
	var emailReg =/^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;

	function getUserId() {
		return userInfo ? userInfo.user_id : 0;
	}

	function getUserInfo() {
		return userInfo;
	}

	function getUserName() {
		return userInfo ? userInfo.base_name : "";
	}

	function check() {
		var promise = $.Deferred();

		$.ajax({
			type: "GET",
			url: config.url.check,
		}).then(result => {
			if(result.status == 0) {
				userInfo = result.data;
				promise.resolve();
			} else {
				userInfo = null;
				promise.reject();
			}
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function login(username, password, autoLogin) {
		var promise = $.Deferred();

		var data = {};
		if(emailReg.test(username)) {
			data.email = username;
		} else {
			data.username = username;
		}
		data.password = password;

		$.ajax({
			type: "POST",
			url: config.url.LOGIN,
			data: data,
		}).then(result => {
			if(result.status == 0) {
				userInfo = result.data;
			}
			promise.resolve(result);
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function logout() {
		var promise = $.Deferred();

		userInfo = null;

		$.ajax({
			type: "GET",
			url: config.url.LOGOUT,
		}).then(_ => {
			promise.resolve();
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function weixinLogin(key, autoLogin) {
		var promise = $.Deferred();

		$.ajax({
			type: "POST",
			url: config.url.WEIXIN_LOGIN,
			data: {
				source: "weixin",
				login_key : key,
			},
		}).then(function(result) {
			if(result.status == 0 || result.status == 1) {
				userInfo = result.data;
			}
			promise.resolve(result);
		});

		return promise;
	}

	function weixinQrcode() {
		var promise = $.Deferred();

		$.ajax({
			type: "GET",
			url: config.url.WEIXIN_QRCODE,
		}).then(result => {
			promise.resolve(result);
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function register(fields) {
		var promise = $.Deferred();

		$.ajax({
			type: "POST",
			url: config.url.REGISTER,
			data: {
				email: fields.email,
				username: fields.username,
				password: fields.password,
				login: true,
			},
		}).then(function(result) {
			if(result.status == 0) {
				userInfo = result.data;
			}
			promise.resolve(result);
		});

		return promise;
	}

	function resetPassword(email) {
		var promise = $.Deferred();

		$.ajax({
			type: "POST",
			url: config.url.FIND_PASSWORD,
			data: {
				email: email,
			},
		}).then(result => {
			promise.resolve(result);
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	return {
		getUserId: getUserId,
		getUserInfo: getUserInfo,
		getUserName: getUserName,

		check: check,
		login: login,
		logout: logout,
		weixinLogin: weixinLogin,
		weixinQrcode: weixinQrcode,
		register: register,
		resetPassword: resetPassword,
	};
});
