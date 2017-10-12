define(['vendor/jquery', 'vendor/ua-parser', 'app/util/util', 'app/util/emitor', 'app/config/config', '../model/userModel'], function($1, UAParser, util, emitor, config, userModel) {
	var region;

	function init() {
		region = $('.header-region')
			.on('click', '.login-region .placeholder', onLoginClick)
			// 注册
			.on('click', '.login-region .nav-btn-register', onRegisterClick)
			.on('click', '.login-region .login-menu > ul > li', onLoginMenuClick);

		kenrobot.on("user", "update", onUserUpdate);
		emitor.on("app", "start", onAppStart);
	}

	function onAppStart() {
		var message = region.find(".top-message");

		var ua = UAParser();
		var isChrome = /Chrome|Chromium/.test(ua.browser.name);
		var isWindows = /Windows/.test(ua.os.name);
		var isMac = /Mac\sOS/.test(ua.os.name);
		var is64 = /64/.test(ua.cpu.architecture);

		if(isChrome) {
			message.remove();
		} else {
			var name = isWindows ? `ChromeStandaloneSetup${is64 ? "64" : ""}.exe` : (isMac ? "googlechrome.dmg" : "google-chrome-stable_current_amd64.deb");
			message.find(".link").attr("href", config.url.chrome + name);
			message.on("click", ".x-close", _ => {
				message.remove();
			}).fadeIn(300);
		}
	}

	function onLoginClick(e) {
		var wrap = $(this).parent();
		if(wrap.hasClass("login")) {
			return;
		}

		kenrobot.trigger("login", "show");
	}

	function onRegisterClick(e) {
		var wrap = $(this).parent();
		if(wrap.hasClass("login")) {
			return;
		}

		kenrobot.trigger("login", "show", {type: "register"});
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
