define(['vendor/jquery', 'vendor/jsencrypt', 'vendor/jszip', 'app/util/cast', 'app/config/config', './userModel'], function($1, JSEncrypt, JSZip, cast, config, userModel) {

	function list(type) {
		var promise = $.Deferred();
		type = type || "all";

		var sign = getSign();
		if(!sign) {
			setTimeout(_ => promise.reject(), 10);
			return promise;
		}

		$.ajax({
			type: "POST",
			url: config.url.projectSync + "/list",
			data: $.extend({type: type}, sign),
		}).then(result => {
			if(result.status != 0) {
				promise.reject(result.message);
				return;
			}
			promise.resolve(result.data);
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function upload(name, type, data) {
		var promise = $.Deferred();

		var sign = getSign();
		if(!sign) {
			setTimeout(_ => promise.reject(), 10);
			return promise;
		}

		zip(name, type, data).then(content => {
		    $.ajax({
		    	type: "POST",
		    	url: config.url.projectSync + "/upload",
		    	processData: false,
		    	headers: $.extend({name: encodeURI(name), type: type}, sign),
		    	data: content,
		    }).then(result => {
		    	if(result.status != 0) {
		    		promise.reject(result.message);
		    		return;
		    	}
		    	promise.resolve();
		    }, err => {
		    	promise.reject(err);
		    });
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function download(name, type) {
		var promise = $.Deferred();

		var sign = getSign();
		if(!sign) {
			setTimeout(_ => promise.reject(), 10);
			return promise;
		}

		$.ajax({
			type: "POST",
			url: config.url.projectSync + "/download",
			data: $.extend({name: name, type: type}, sign),
			xhr: _ => {
				var xhr = new window.XMLHttpRequest();
				xhr.responseType = 'arraybuffer';
				return xhr;
			}
		}).then(result => {
			unzip(name, type, result).then(data => {
				promise.resolve(data);
			}, err => {
				promise.reject(err);
			});
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function remove(name, type) {
		var promise = $.Deferred();

		var sign = getSign();
		if(!sign) {
			setTimeout(_ => promise.reject(), 10);
			return promise;
		}

		$.ajax({
			type: "POST",
			url: config.url.projectSync + "/delete",
			data: $.extend({name: name, type: type}, sign),
		}).then(result => {
			if(result.status != 0) {
				promise.reject(result.message);
				return;
			}
			promise.resolve();
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function zip(name, type, data) {
		var promise = $.Deferred();

		var archive = new JSZip();
		var relativePath = getProjectRelativePath(name, type);
		if(type == "edu" || type == "ide") {
			archive.file(`${relativePath}/project.json`, JSON.stringify(data));
			archive.file(`${relativePath}/${name}.ino`, data.project_data.code);
		} else if(type == "scratch2") {
			archive.file(relativePath, cast.base64ToArrayBuffer(data));
		} else if(type == "scratch3") {
			archive.file(relativePath, data);
		}

		archive.generateAsync({type:"arraybuffer"}).then(content => {
		    promise.resolve(content);
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function unzip(name, type, data) {
		var promise = $.Deferred();

		var archive = new JSZip();
		var relativePath = getProjectRelativePath(name, type, true);
		archive.loadAsync(data).then(_ => {
			archive.file(relativePath).async(type == "scratch2" ? "base64" : "string").then(content => {
				if(type == "edu") {
					try {
						content = JSON.parse(content);
					} catch(ex) {
						content = {};
					}
				}
				promise.resolve(content);
			}, err => {
				promise.reject(err);
			})
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function getSign() {
		var id =userModel.getUserId();
		if(!id) {
			return null;
		}

		var stamp = parseInt(new Date().getTime() / 1000);
		var crypto = new JSEncrypt.JSEncrypt();
		crypto.setPublicKey(config.PUBLIC_KEY);
		var sign = crypto.encrypt(`Kenrobot-${id}-${stamp}`);
		return {
			id: id,
			stamp: stamp,
			sign: sign,
		};
	}

	function getProjectRelativePath(name, type, flag) {
		var relativePath
		switch(type) {
			case "edu":
				relativePath = flag ? `${name}/project.json` : name
				break;
			case "ide":
				relativePath = flag ? `${name}/{name}.ino` : name
				break
			case "scratch2":
				relativePath = `${name}.sb2`
				break
			case "scratch3":
				relativePath = `${name}.json`
				break
		}

		return relativePath
	}

	return {
		list: list,
		remove: remove,
		download: download,
		upload: upload,
		zip: zip,
		unzip: unzip,
		getProjectRelativePath: getProjectRelativePath,
	}
})