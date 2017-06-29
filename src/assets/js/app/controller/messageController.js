define(['vendor/jquery', 'vendor/download', 'app/util/cast', 'app/model/projectModel'], function($1, download, cast, projectModel) {

	function init() {
		if(!window.kenrobot) {
			return
		}

		registerMessage("projectList", onProjectList);
		registerMessage("projectDelete", onProjectDelete);

		registerMessage("projectNewSave", onProjectNewSave);
		registerMessage("projectNewSaveAs", onProjectNewSaveAs);
		registerMessage("projectNewOpen", onProjectNewOpen);
	}

	function onProjectList(type) {
		type = type || "all";
		return projectModel.list(type);
	}

	function onProjectDelete(name, type) {
		return projectModel.remove(name, type);
	}

	function onProjectNewSave(name, type, data, savePath) {
		if(!kenrobot.getUserInfo()) {
			return onProjectNewSaveAs(name, type, data);
		}

		var promise = $.Deferred();
		projectModel.upload(name, type, data).then(_ => {
			promise.resolve({
				name: name,
				type: type,
			});
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function onProjectNewSaveAs(name, type, data, savePath) {
		var promise = $.Deferred();

		if(type == "scratch2") {
			var downloadName = projectModel.getProjectRelativePath(name, type, true);
			download(cast.base64ToArrayBuffer(data), downloadName);
			resolvePromise(true, promise);
		}
		else if(type == "scratch3") {
			var downloadName = projectModel.getProjectRelativePath(name, type, true);
			download(data, downloadName, "application/json");
			resolvePromise(true, promise);
		} else {
			projectModel.zip(name, type, data).then(content => {
				download(content, `${name}.zip`, "application/zip");
				promise.resolve();
			}, err => {
				promise.reject(err);
			});
		}
		
		return promise;
	}

	function onProjectNewOpen(type, name) {
		var promise = $.Deferred();

		if(type != kenrobot.viewType) {
			return rejectPromise(false, promise);
		}

		if(name) {
			if(!kenrobot.getUserInfo()) {
				return rejectPromise(false, promise);
			}

			projectModel.download(name, type).then(data => {
				promise.resolve({
					extra: {
						name: name,
						type: type,
					},
					data: data,
				});
			}, err => {
				promise.reject(err);
			});
		} else {
			var acceptType;
			if(type == "edu") {
				acceptType = ".json";
			} else if(type == "ide") {
				acceptType = ".ino";
			} else if(type == "scratch2") {
				acceptType = ".sb2";
			} else if(type == "scratch3") {
				acceptType = ".json";
			}

			openFile(acceptType, type == "scratch2" ? "binary" : "text").then(data => {
				if(type == "edu") {
					data = JSON.parse(data);
				} else if(type == "scratch2") {
					data = cast.arrayBufferToBase64(data);
				}

				promise.resolve({
					extra: {
						type: type,
					},
					data: data,
				});
			}, err => {
				promise.reject(err);
			});
		}

		return promise;
	}

	function openFile(acceptType, type) {
		var promise = $.Deferred();

		type = type || "text";

		var target = $(".open-file").prop("accept", acceptType).replaceWith(`<input class="open-file" type="file" accept="${acceptType}" />`).on("change", _ => {
			var file = target[0].files[0];
			var reader = new FileReader();
			reader.addEventListener("load", e => {
				promise.resolve(reader.result);
			});
			type == "text" ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
		}).trigger('click');

		return promise;
	}

	function registerMessage(name, callback) {
		var eventName = `app:${name}`
		kenrobot.registerMessage(eventName, (...args) => {
			var promise = callback.apply(this, args) || resolvePromise()
			return promise
		})
	}

	function resolvePromise(result, promise) {
		promise = promise || $.Deferred()

		setTimeout(_ => {
			promise.resolve(result)
		}, 10)

		return promise
	}

	function rejectPromise(result, promise) {
		promise = promise || $.Deferred()

		setTimeout(_ => {
			promise.reject(result)
		}, 10)

		return promise
	}

	return {
		init: init
	};
})