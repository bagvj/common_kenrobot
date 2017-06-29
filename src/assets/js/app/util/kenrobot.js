define(['vendor/jquery'], function($) {
	var registeredEvents = {}

	function registerMessage(name, callback) {
		if(!registeredEvents[name]) {
			registeredEvents[name] = callback;
		}

		return this
	}

	function postMessage(name, ...args) {
		var promise = $.Deferred()
		var callback = registeredEvents[name]
		if(!callback) {
			console.log(`Unhandled message: ${name}`)
			setTimeout(_ => promise.reject(), 10)
			return promise
		}

		callback.apply(this, args).then(result => {
			promise.resolve(result)
		}, err => {
			promise.reject(err)
		}, progress => {
			promise.notify(progress)
		})

		return promise
	}

	var hanlderMap = {}
	var delayTimers = {}

	function getEventName(target, type) {
		return target + "_" + type
	}

	function on(target, type, callback, options) {
		options = options || {}
		options.priority = options.priority || 0
		options.canReset = options.canReset !== false

		var name = getEventName(target, type)
		var hanlders = hanlderMap[name]
		if(!hanlders) {
			hanlders = []
			hanlderMap[name] = hanlders
		}
		hanlders.push({
			callback: callback,
			options: options,
		})

		return this
	}

	function off(target, type, callback) {
		var name = getEventName(target, type)
		var hanlders = hanlderMap[name]
		if(!hanlders) {
			return this
		}

		for(var i = 0; i < hanlders.length; i++) {
			var handler = hanlders[i]
			if(handler.callback == callback) {
				hanlders.splice(i, 1)
				break
			}
		}

		return this
	}

	function trigger(target, type, ...args) {
		var name = getEventName(target, type)
		var hanlders = hanlderMap[name]
		if(!hanlders) {
			return this
		}

		hanlders = hanlders.concat().sort(function(a, b) {
			return b.options.priority - a.options.priority
		})

		for(var i = 0; i < hanlders.length; i++) {
			var handler = hanlders[i]
			handler.callback.apply(this, args)
		}

		return this
	}

	function delayTrigger(time, target, type, ...args) {
		var self = this
		var name = getEventName(target, type)
		var timerId = delayTimers[name]
		timerId && clearTimeout(timerId)
		timerId = setTimeout(function() {
			delete delayTimers[name]
			trigger.apply(self, [target, type].concat(args))
		}, time)
		delayTimers[name] = timerId

		return this
	}

	var view = {}

	function reset() {
		for(var key in hanlderMap) {
			var hanlders = hanlderMap[key]
			for(var i = hanlders.length - 1; i >= 0; i--) {
				var hanlder = hanlders[i]
				if(hanlder.options.canReset) {
					hanlders.splice(i, 1)
				}
			}
			if(hanlders.length == 0) {
				delete hanlderMap[key]
			}
		}
		for(var key in delayTimers) {
			var timerId = delayTimers[key]
			timerId && clearTimeout(timerId)
			delete delayTimers[key]
		}
		delayTimers = {}

		Object.keys(view).forEach(key => {
			delete view[key]
		})

		return this
	}

	return {
		isPC: false,
		registerMessage: registerMessage,
		postMessage: postMessage,

		on: on,
		off: off,

		trigger: trigger,
		delayTrigger: delayTrigger,

		reset: reset,
		view: view,
	}
});