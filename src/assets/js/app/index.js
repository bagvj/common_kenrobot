define(['app/util/kenrobot', 'app/util/emitor', 'app/util/report', 'app/config/config', './controller/index', './view/index'], function(kenrobot, emitor, report, config, controller, view) {

	function init() {
		window.kenrobot = kenrobot;
		
		report.init(config.debug);
		controller.init();
		view.init();

		emitor.trigger('app', 'start');
	}

	return {
		init: init,
	}
});