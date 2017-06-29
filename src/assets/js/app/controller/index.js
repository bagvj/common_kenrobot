define(['./mainController', './messageController'], function(mainController, messageController) {

	function init() {
		mainController.init();
		messageController.init();
	}

	return {
		init: init,
	};
});