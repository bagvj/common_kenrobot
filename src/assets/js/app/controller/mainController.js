define(['vendor/jquery', 'vendor/pace', 'vendor/mousetrap', 'app/util/util', 'app/util/emitor', 'app/config/config', '../model/userModel'], function($1, pace, Mousetrap, util, emitor, config, userModel) {

	var iframe;
	var mousetrap;
	var shortcuts;

	function init() {
		kenrobot.getUserInfo = userModel.getUserInfo;
		
		$(window).on('contextmenu', onContextMenu).on('click', onWindowClick).on('resize', onWindowResize);

		iframe = window.frames["content-frame"];

		emitor.on("app", "start", onAppStart);
		kenrobot.on("util", "message", onUtilMessage)
			.on("shortcut", "register", onShortcutRegister)
			.on("user", "logout", onUserLogout)
			.on("user", "update", onUserUpdate);

		pace.start({
			elements: {
				selectors: ["#content-frame"],
			},
			ajax: false,
			document: false,
			restartOnPushState: false,
			restartOnRequestAfter: false,
		});
		pace.stop();
	}

	function onAppStart() {
		iframe.src = iframe.dataset.iframeSrc;
		delete iframe.dataset.iframeSrc;
		iframe.addEventListener("load", onIFrameLoad);
		pace.restart();

		userModel.check().always(_ => {
			kenrobot.trigger("user", "update");
		});
	}

	function onIFrameLoad() {
		setTimeout(_ => {
			mousetrap = Mousetrap(iframe.contentDocument);

			shortcuts && shortcuts.forEach(function(shortcut){
				mousetrap.bind(shortcut.key, function() {
					shortcut.callback && shortcut.callback();

					return false;
				});
			});
		}, 1000);
	}

	function onUtilMessage() {
		util.message.apply(this, arguments);
	}

	function onShortcutRegister(_shortcuts) {
		shortcuts = _shortcuts;
	}

	function onUserLogout() {
		userModel.logout().then(_ => {
			util.message("退出成功");
		}).always(_ => {
			kenrobot.trigger("user", "update");
		});
	}

	function onUserUpdate() {

	}

	function onContextMenu(e) {
		e.preventDefault();

		hideMenu();

		emitor.trigger("app", "contextMenu", e);

		return false;
	}

	function onWindowClick(e) {
		hideMenu();
	}

	function onWindowResize(e) {
		hideMenu();
		emitor.trigger("app", "resize", e);
	}

	function hideMenu() {
		$('.x-select, .x-context-menu').removeClass("active");
	}

	return {
		init: init,
	};
});