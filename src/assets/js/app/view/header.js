define(['vendor/jquery', 'app/util/util', 'app/config/config', '../model/userModel'], function($1, util, config, userModel) {
	var region;

	function init() {
		region = $('.header-region')
			.on('click', '.login-region .placeholder', onLoginClick)
			.on('click', '.login-region .login-menu > ul > li', onLoginMenuClick);
		
		kenrobot.on("user", "update", onUserUpdate);
	}

	function onLoginClick(e) {
		var wrap = $(this).parent();
		if(wrap.hasClass("login")) {
			return;
		}

		kenrobot.trigger("login", "show");
	}

	function onLoginMenuClick(e) {
		var action = $(this).data("action");
		switch(action) {
			case "setting":
				util.message("敬请期待");
				break;
			case "project-manager":
				kenrobot.trigger("project", "show");
				break;
			case "project-sync":
				kenrobot.trigger("project", "sync");
				break;
			case "logout":
				kenrobot.trigger("user", "logout");
				break;
		}
	}

	function onUserUpdate() {
		var userInfo = userModel.getUserInfo();
		var loginWrap = region.find(".login-region .wrap");
		if(userInfo) {
			loginWrap.addClass("login");
			loginWrap.find(".name").text(userInfo.base_name);
			var photo = loginWrap.find(".photo");
			photo.attr("src", userInfo.base_avatar || photo.data("defaultAvatar"));
		} else {
			loginWrap.removeClass("login");
			loginWrap.find(".name").text("未登录");
			var photo = loginWrap.find(".photo");
			photo.attr("src", photo.data("defaultAvatar"));
		}
	}

	return {
		init: init,
	}
});