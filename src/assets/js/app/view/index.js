define(['./header', './dialog/login', './dialog/project', './dialog/save', './dialog/prompt'], function(header, login, project, save, prompt) {

	function init() {
		header.init();
		
		login.init();
		project.init();
		save.init();
		prompt.init();
	}

	return {
		init: init,
	};
});