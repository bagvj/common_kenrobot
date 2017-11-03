;(function() {
	var whenReady = (function() {
	    var funcs = [];
	    var ready = false;
	    
	    function handler(e) {
	        if(ready) return;
	        
	        if(e.type === 'onreadystatechange' && document.readyState !== 'complete') {
	            return;
	        }
	        
	        for(var i=0; i<funcs.length; i++) {
	            funcs[i].call(document);
	        }
	        ready = true;
	        funcs = null;
	    }
	    if(document.addEventListener) {
	        document.addEventListener('DOMContentLoaded', handler, false);
	        document.addEventListener('readystatechange', handler, false);
	        window.addEventListener('load', handler, false);
	    }else if(document.attachEvent) {
	        document.attachEvent('onreadystatechange', handler);
	        window.attachEvent('onload', handler);
	    }

	    return function whenReady(fn) {
	        if(ready) { fn.call(document); }
	        else { funcs.push(fn); }
	    }
	})();

	var player;
	var scratch;

	var projectExtra = {};

	function init() {
		window.kenrobot = window.kenrobot || top.kenrobot;
		scratch = document.getElementById("ken-scratch");
		player = document.querySelector(".player");
		var toolbar = player.querySelector(".toolbar");

		window.JSeditorReady = JSeditorReady;

		if(!kenrobot || kenrobot.isPC) {
			toolbar.remove();
		}

		// window.kenrobot = {
		// 	view: {
		// 		callExt: callExt,
		// 		openSerialPort: openSerialPort,
		// 	},
		// };

		if(!kenrobot) {
			return;
		}

		if(!kenrobot.isPC) {
			toolbar.querySelector(".open").addEventListener("click", onOpenClick);
			toolbar.querySelector(".save").addEventListener("click", onSaveClick);
		}
		
		kenrobot.view.callExt = callExt;
		kenrobot.view.openSerialPort = openSerialPort;
		kenrobot.view.saveProject = saveProject;
		kenrobot.viewType = "scratch2";

		registerShortcut();
		kenrobot.on("app", "command", onCommand)
			.on("project", "open-by", onProjectOpenBy)
			.on("serial", "ready", onSerialPortReady)
			.on("serial", "data", onSerialPortData)
			.on("serial", "close", onSerialPortClose);
	}

	function onOpenClick(e) {
		onOpenProject();
	}

	function onSaveClick(e) {
		onSaveProject();
	}

	function JSeditorReady() {
		player.classList.add("loaded");
		setTimeout(_ => {
			player.querySelector(".loader").remove();
		}, 1000);

		return true;
	}

	function onProjectOpenBy(name, type) {
		if(type != "scratch2") {
			return
		}

		onOpenProject(name);
	}

	function onOpenProject(name) {
		kenrobot.postMessage("app:projectNewOpen", "scratch2", name).then(result => {
			projectExtra = result.extra;
			scratch.loadProject(result.data);
			projectExtra.name && scratch.setProjectName(projectExtra.name);

			if(kenrobot.getUserInfo()) {
				kenrobot.trigger("util", "message", "打开成功");
			} else {
				kenrobot.trigger("util", "message", "打开成功");
			}
		}, err => {
			kenrobot.trigger("util", "message", {
				text: "打开失败",
				type: "error",
			});
		});
	}

	function onSaveProject(saveAs) {
		var doSave = _ => {
			if(projectExtra.path) {
				scratch.exportProject(saveAs);
			} else if(saveAs || !projectExtra.name) {
				kenrobot.trigger("prompt", "show", {
					title: "项目保存",
					placeholder: "项目名字",
					callback: name => {
						if(!name) {
							kenrobot.trigger("util", "message", {
								text: "保存失败",
								type: "error",
							});
							return
						}

						projectExtra.name = name;
						scratch.setProjectName(projectExtra.name);
						scratch.exportProject(saveAs);
					}
				});
			} else {
				projectExtra.name && scratch.setProjectName(projectExtra.name);
				scratch.exportProject(saveAs);
			}
		}

		if(kenrobot.getUserInfo() || saveAs || projectExtra.hasShowSave) {
			doSave();
		} else {
			projectExtra.hasShowSave = true;
			kenrobot.trigger("save", "show", doSave);
		}
	}

	function saveProject(projectData, saveAs) {
		var promise
		if(saveAs) {
			promise = kenrobot.postMessage("app:projectNewSaveAs", projectExtra.name, "scratch2", projectData)
		} else {
			promise = kenrobot.postMessage("app:projectNewSave", projectExtra.name, "scratch2", projectData, projectExtra.path)
		}

		promise.then(result => {
			projectExtra = Object.assign(projectExtra, result);
			projectExtra.name && scratch.setProjectName(projectExtra.name);

			kenrobot.trigger("util", "message", "保存成功");
		}, err => {
			kenrobot.trigger("util", "message", {
				text: "保存失败",
				type: "error",
			});
		});
	}

	function registerShortcut() {
		var shortcuts = [{
			key: ["ctrl+n", "command+n"],
			callback: _ => onCommand("new-project"),
		}, {
			key: ["ctrl+o", "command+o"],
			callback: _ => onCommand("open-project"),
		}, {
			key: ["ctrl+s", "command+s"],
			callback: _ => onCommand("save-project"),
		}, {
			key: ["ctrl+shift+s", "command+shift+s"],
			callback: _ => onCommand("save-as-project"),
		}];

		kenrobot.delayTrigger(100, "shortcut", "register", shortcuts);
	}

	function onCommand(command, ...args) {
		switch (command) {
			case "new-project":
				projectExtra = {};
				scratch.newProject();
				break;
			case "open-project":
				var name = args[0]
				onOpenProject(name);
				break;
			case "save-project":
				onSaveProject();
				break;
			case "save-as-project":
				onSaveProject(true);
				break;
			case "undelete":
				scratch.undelete();
				break;
			case "toggle-samll-stage":
				scratch.toggleSmallStage();
				break;
			case "toggle-turbo-mode":
				scratch.toggleTurboMode();
				break;
			case "edit-block-colors":
				scratch.editBlockColors();
				break;
		}
	}

	const Device = {
	    TUDOU_MOVE: 52,
	    TUDOU_STOP: 53,
	    TUDOU_BATTERY: 54,
	    TUDOU_OBSTACLE: 55,
	    TUDOU_TRACKING: 56,
	    TUDOU_LED: 57,
	    TUDOU_BUZZER: 58,
	    TUDOU_IR: 59,
	    TUDOU_SERVO: 60,
	    TUDOU_RGBLED: 61,
	    
		KEDOU_MOVE: 62,
		KEDOU_STOP: 63,
		KEDOU_BATTERY: 64,
	 	KEDOU_OBSTACLE: 65,
	 	KEDOU_TRACKING: 66,
	 	KEDOU_VOICE: 67,
	};

	const Action = {
		GET: 1,
		RUN: 2,
		RESET: 4,
		START: 5,
	};

	const menuValues = {
		tudou_forward: 1,
		tudou_back: 2,
		tudou_turnLeft: 3,
		tudou_turnRight: 4,

		tudou_forwardLeft: 1,
		tudou_forwardRight: 2,
		tudou_backLeft: 3,
		tudou_backRight: 4,

		tudou_on: 1,
		tudou_off: 0,

		kedou_forward: 1,
		kedou_back: 2,
		kedou_turnLeft: 3,
		kedou_turnRight: 4,

		kedou_left: 1,
		kedou_center: 2,
		kedou_right: 3,

		kedou_leftEdge: 1,
		kedou_leftCenter: 2,
		kedou_rightCenter: 3,
		kedou_rightEdge: 4,

		kedou_sound_1: 1,
		kedou_sound_2: 2,
		kedou_sound_3: 3,
		kedou_sound_4: 4,
	};

	const actionValues = {
		tudou_move: [Action.RUN, Device.TUDOU_MOVE],
		tudou_stop: [Action.RUN, Device.TUDOU_STOP],
		tudou_battery: [Action.GET, Device.TUDOU_BATTERY],
		tudou_obstacle: [Action.GET, Device.TUDOU_OBSTACLE],
		tudou_tracking: [Action.GET, Device.TUDOU_TRACKING],
		tudou_led: [Action.RUN, Device.TUDOU_LED],
		tudou_buzzer: [Action.RUN, Device.TUDOU_BUZZER],
		tudou_ir: [Action.GET, Device.TUDOU_IR],
		tudou_servo: [Action.RUN, Device.TUDOU_SERVO],
		tudou_rgbled: [Action.RUN, Device.TUDOU_RGBLED],

		kedou_move: [Action.RUN, Device.KEDOU_MOVE],
		kedou_stop: [Action.RUN, Device.KEDOU_STOP],
		kedou_battery: [Action.GET, Device.KEDOU_BATTERY],
		kedou_obstacle: [Action.GET, Device.KEDOU_OBSTACLE],
		kedou_tracking: [Action.GET, Device.KEDOU_TRACKING],
		kedou_sound: [Action.RUN, Device.KEDOU_VOICE],
	};

	function callExt(ext, operation, ...args) {
		if(!actionValues[operation]) {
			// console.log(`unknow operation: ${operation}`);
			return;
		}

		var param = actionValues[operation].concat(Array.from(args).map(value => menuValues[value] !== undefined ? menuValues[value] : value));
		sendPackage.apply(this, param);
	}

	function openSerialPort() {
		kenrobot.trigger("serial", "open");
	}

	function sendPackage(action, ...args) {
		kenrobot.trigger("serial", "sendPackage", [0xff, 0x55, args.length + 2, 0, action].concat(args));
	}

	var lastPortId;
	function onSerialPortReady(portId) {
		lastPortId = portId;
		scratch.onSerialPortReady();
	}

	function onSerialPortData(portId, data) {
		lastPortId && lastPortId == portId && processData(data);
	}

	function onSerialPortClose(portId) {
		if(lastPortId && lastPortId == portId) {
			lastPortId = null;
			kenrobot.trigger("util", "message", {
				text: "串口已断开",
				type: "error",
			});
			scratch.onSerialPortClose();
		}
	}

	var receiveBuffer = [];
	var isParseStart = false;
	var parseIndex = 0;

	function processData(bytes) {
		if (receiveBuffer.length > 30) {
			receiveBuffer = [];
		}

		for (var index = 0; index < bytes.length; index++) {
			receiveBuffer.push(bytes[index])

			if (receiveBuffer.length < 2) {
				continue
			}

			if (receiveBuffer[receiveBuffer.length - 1] == 0x55 && receiveBuffer[receiveBuffer.length - 2] == 0xff) {
				isParseStart = true;
				parseIndex = receiveBuffer.length - 2;
			}

			if (receiveBuffer[receiveBuffer.length - 1] == 0xd && isParseStart) {
				isParseStart = false;

				var pos = parseIndex + 4;
				var device = receiveBuffer[pos];
				pos++;
				var type = receiveBuffer[pos];
				pos++;
				//1 byte 2 float 3 short 4 len+string 5 double
				var value;
				switch (type) {
					case 1:
						value = receiveBuffer[pos];
						pos++;
						break;
					case 2:
						value = readFloat(receiveBuffer, pos);
						pos += 4;
						break;
					case 3:
						value = readShort(receiveBuffer, pos);
						pos += 2;
						break;
					case 4:
						var len = receiveBuffer[pos];
						pos++;
						value = readString(receiveBuffer, pos, len);
						pos+= len;
						break;
					case 5:
						value = readDouble(receiveBuffer, pos);
						pos += 4;
						break;
					case 6:
						value = readInt(receiveBuffer, pos);
						pos += 4;
						break;
				}
				onPackageReceive(device, type, value);

				receiveBuffer = [];
			}
		}
	}

	function onPackageReceive(device, type, value) {
		if(type > 6 || type < 0) {
			scratch.responseValue();
		} else if(device == Device.TUDOU_IR) {
			value = value > 0 ? value : 0x10000 + value
			scratch.responseValue(value);
		} else {
			scratch.responseValue(value);
		}
	}

	function castDataView(bytes) {
		var dataView = new DataView(new ArrayBuffer(bytes.length))
		bytes.forEach((value, i) => dataView.setUint8(i, value))
		return dataView
	}

	function readFloat(arr, pos) {
	    return castDataView(arr.slice(pos, pos + 4)).getFloat32(0, true)
	}

	function readDouble(arr, pos) {
		return readFloat(arr, pos)
	}

	function readInt(arr, pos) {
		return castDataView(arr.slice(pos, pos + 4)).getInt32(0, true)
	}

	function readShort(arr, pos) {
		return castDataView(arr.slice(pos, pos + 2)).getInt16(0, true)
	}

	function readString(arr, pos, len) {
	    return arr.slice(pos, pos + len).map(value => String.fromCharCode(value)).join('')
	}

	whenReady(init);
})();