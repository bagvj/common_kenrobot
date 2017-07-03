define(function() {
	var configs = {
		//基本配置
		base: {
			url: {
				kenrobot: "http://www.kenrobot.com",
				chrome: "http://www.kenrobot.com/download/chrome/",
				check: "http://userver.kenrobot.com/sso/userinfo",
				login: "http://userver.kenrobot.com/sso/login",
				logout: "http://userver.kenrobot.com/sso/logout",
				loginQrcode: "http://userver.kenrobot.com/api/wechat/scanlogin/token",
				register: "http://userver.kenrobot.com/api/user/register",
				findPassword: "http://userver.kenrobot.com/password/email",
				projectSync: "http://userver.kenrobot.com/api/project/sync"
			},

			PUBLIC_KEY: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7Jat1/19NDxOObrFpW8USTia6\nuHt34Sac1Arm6F2QUzsdUEUmvGyLIOIGcdb+F6pTdx4ftY+wZi7Aomp4k3vNqXmX\nT0mE0vpQlCmsPUcMHXuUi93XTGPxLXIv9NXxCJZXSYI0JeyuhT9/ithrYlbMlyNc\nwKB/BwSpp+Py2MTT2wIDAQAB\n-----END PUBLIC KEY-----\n',
		},
		//调试模式
		debug: {
			debug: true,
		}
	}

	return Object.assign({}, configs.base, configs.debug.debug ? configs.debug : {})
});