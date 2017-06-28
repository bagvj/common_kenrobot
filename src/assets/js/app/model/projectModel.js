define(['vendor/jquery', 'vendor/jsencrypt', 'vendor/jszip', 'app/config/config', './userModel'], function($1, JSEncrypt, JSZip, config, userModel) {

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

		if(type != "scratch2") {
			setTimeout(_ => promise.reject(), 10);
			return promise;
		}

		var zip = new JSZip();
		var relativePath = getProjectRelativePath(name, type);
		if(type == "scratch2") {
			zip.file(relativePath, data);
		}

		zip.generateAsync({type:"blob"}).then(content => {
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
			data: $.extend({name: name, type: type}, sign)
		}).then(result => {
			var zip = new JSZip();
			var relativePath = getProjectRelativePath(name, type, true);
			zip.loadAsync(result, {base64: true}).then(_ => {
				zip.file(relativePath).async().then(content => {
					console.dir(content);
					promise.resolve(content);
				}, err => {
					promise.reject(err);
				})
			}, err => {
				promise.reject(err);
			});
		}, err => {
			promise.reject(err);
		});

		return promise;
	}

	function base64ToArrayBuffer(base64) {
	    var binary_string =  window.atob(base64);
	    var len = binary_string.length;
	    var bytes = new Uint8Array( len );
	    for (var i = 0; i < len; i++)        {
	        bytes[i] = binary_string.charCodeAt(i);
	    }
	    return bytes.buffer;
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
			case "ide":
				relativePath = flag ? `${name}/project.json` : name
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
	}
})