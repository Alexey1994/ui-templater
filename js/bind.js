var currentElementContext

function constant(initialValue) {
	var bind = {
		set: function(newValue) {
			return initialValue
		},
		
		get: function() {
			return initialValue
		},
		
		bind: function(changeDetector) {
			
		},
		
		unbind: function(changeDetector) {
			
		},
		
		unbindAll: function() {
			
		}
	}
	
	currentElementContext.binds.push(bind)
	
	return bind
}

function variable(initialValue) {
	var currentValue = initialValue
	var changeDetectors = []
	
	var bind = {
		set: function(newValue) {
			var oldValue = currentValue
			
			changeDetectors.concat([]).forEach(function(changeDetector) {
				changeDetector(newValue, oldValue)
			})
			
			currentValue = newValue
			
			return oldValue
		},
		
		get: function() {
			return currentValue
		},
		
		bind: function(changeDetector) {
			changeDetectors.push(changeDetector)
		},
		
		unbind: function(changeDetector) {
			var changeDetectorIndex = changeDetectors.indexOf(changeDetector)
			
			if(changeDetectorIndex >= 0) {
				changeDetectors.splice(changeDetectorIndex, 1)
			}
		},
		
		unbindAll: function() {
			changeDetectors.splice(0, changeDetectors.length)
		}
	}
	
	currentElementContext.binds.push(bind)
	
	return bind
}

function array(initialValue) {
	var bind = variable(initialValue)
	
	bind.insert = function(item, place) {
		if(typeof place === 'number') {
			bind.get().splice(place, 0, item)
			bind.set(bind.get())
		}
		else {
			bind.get().push(item)
			bind.set(bind.get())
		}
	}
	
	bind.remove = function(place) {
		bind.get().splice(place, 1)
		bind.set(bind.get())
	}
	
	return bind
}

function unaryOperator(value, computer) {
	var v = value.get()
	var result = variable(computer(v))
	
	value.bind(function(changedValue) {
		result.set(computer(changedValue))
	})
	
	return result
}

function binaryOperator(value1, value2, computer) {
	var v1 = value1.get()
	var v2 = value2.get()
	var result = variable(computer(v1, v2))
	
	value1.bind(function(changedValue) {
		result.set(computer(changedValue, value2.get()))
	})
	
	value2.bind(function(changedValue) {
		result.set(computer(value1.get(), changedValue))
	})
	
	return result
}

function neg(value) {
	return unaryOperator(value, function(v) {
		return -v
	})
}

function not(value) {
	return unaryOperator(value, function(v) {
		return !v
	})
}

function add(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 + v2
	})
}

function sub(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 - v2
	})
}

function mul(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 * v2
	})
}

function div(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 / v2
	})
}

function mod(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 % v2
	})
}

function equal(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 === v2
	})
}

function notEqual(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 !== v2
	})
}

function lesser(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 < v2
	})
}

function lesserOrEqual(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 <= v2
	})
}

function greater(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 > v2
	})
}

function greaterOrEqual(value1, value2) {
	return binaryOperator(value1, value2, function(v1, v2) {
		return v1 >= v2
	})
}