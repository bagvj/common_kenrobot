define(function() {
	var configs = {
		url: {
			kenrobot: "http://www.kenrobot.com",
			chrome: "http://www.kenrobot.com/download/chrome/",

			LOGIN: "http://server.kenrobot.com/api/auth/login",
			LOGOUT: "http://server.kenrobot.com/api/auth/logout",
			WEIXIN_QRCODE: "http://server.kenrobot.com/api/auth/weixin/token",
			WEIXIN_LOGIN: "http://server.kenrobot.com/api/auth/weixin/login",

			REGISTER: "http://server.kenrobot.com/register",
			FIND_PASSWORD: "http://server.kenrobot.com/password/email",

			projectSync: "http://userver.kenrobot.com/api/project/sync"
		},

		PUBLIC_KEY: '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7Jat1/19NDxOObrFpW8USTia6\nuHt34Sac1Arm6F2QUzsdUEUmvGyLIOIGcdb+F6pTdx4ftY+wZi7Aomp4k3vNqXmX\nT0mE0vpQlCmsPUcMHXuUi93XTGPxLXIv9NXxCJZXSYI0JeyuhT9/ithrYlbMlyNc\nwKB/BwSpp+Py2MTT2wIDAQAB\n-----END PUBLIC KEY-----\n',
	}

	return configs;
});
