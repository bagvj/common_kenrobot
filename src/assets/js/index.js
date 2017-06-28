require.config({
	baseUrl: "assets/js",
});

require(['./app/index'], function(app) {
	app.init();
});
