function render(component, props, structure, parent, contentChildren) {
	var elementContext = {
		place: document.createComment('ref'),
		binds: [],
		children: []
	}
	
	function destroy() {
		elementContext.binds.forEach(function(bind) {
			bind.unbindAll()
		})
		elementContext.binds.splice(0, elementContext.binds.length)
		
		elementContext.children.forEach(function(child) {
			child.destroy()
		})
		elementContext.children.splice(0, elementContext.children.length)
	}
	
	var prevElementContext = currentElementContext
	currentElementContext = elementContext
	
	if(typeof component === 'string') {
		if(component == 'if') {
			parent.place.parentNode.insertBefore(elementContext.place, parent.place)
			
			elementContext.destroy = function() {
				destroy()
				parent.place.parentNode.removeChild(elementContext.place)
			}
			
			elementContext.children.forEach(function(child) {
				child.destroy()
			})
			elementContext.children.splice(0, elementContext.children.length)
			
			if(props.get()) {
				if(structure) {
					structure.forEach(function(innerElement) {
						var innerElementContext = render(innerElement[0], innerElement[1], innerElement[2], elementContext, contentChildren)
						elementContext.children.push(innerElementContext)
					})
				}
			}
			
			props.bind(function(newValue) {
				elementContext.children.forEach(function(child) {
					child.destroy()
				})
				elementContext.children.splice(0, elementContext.children.length)
				
				if(newValue) {
					if(structure) {
						structure.forEach(function(innerElement) {
							var innerElementContext = render(innerElement[0], innerElement[1], innerElement[2], elementContext, contentChildren)
							elementContext.children.push(innerElementContext)
						})
					}
				}
			})
		}
		else if(component == 'for') {
			parent.place.parentNode.insertBefore(elementContext.place, parent.place)
			
			elementContext.destroy = function() {
				destroy()
				parent.place.parentNode.removeChild(elementContext.place)
			}
			
			if(structure) {
				props.get().forEach(function(item) {
					var innerElementContext = render(structure, item, undefined, elementContext, contentChildren)
					elementContext.children.push(innerElementContext)
				})
				
				props.bind(function(items) {
					elementContext.children.forEach(function(child) {
						child.destroy()
					})
					elementContext.children.splice(0, elementContext.children.length)
					
					items.forEach(function(item) {
						var innerElementContext = render(structure, item, undefined, elementContext, contentChildren)
						elementContext.children.push(innerElementContext)
					})
				})
			}
		}
		else if(component == 'text') {
			parent.place.parentNode.insertBefore(elementContext.place, parent.place)
			
			elementContext.destroy = function() {
				parent.place.parentNode.removeChild(elementContext.element)
				destroy()
				parent.place.parentNode.removeChild(elementContext.place)
			}
			
			if(typeof props == 'string') {
				elementContext.element = document.createTextNode(props)
			}
			else {
				elementContext.element = document.createTextNode(props.get())
				
				props.bind(function(newValue) {
					elementContext.element.data = newValue
				})
			}
			
			parent.place.parentNode.insertBefore(elementContext.element, elementContext.place)
		}
		else {
			elementContext.element = document.createElement(component)
			parent.place.parentNode.insertBefore(elementContext.element, parent.place)
			elementContext.element.appendChild(elementContext.place)
			
			elementContext.destroy = function() {
				destroy()
				elementContext.element.removeChild(elementContext.place)
				parent.place.parentNode.removeChild(elementContext.element)
			}
			
			if(props) {
				Object.keys(props).forEach(function(prop) {
					var propValue = props[prop]
					
					if(typeof propValue === 'string') {
						elementContext.element.setAttribute(prop, props[prop])
					}
					else if(typeof propValue === 'function') {
						elementContext.element[prop] = propValue
					}
					else {
						elementContext.element.setAttribute(prop, propValue.get())
						
						propValue.bind(function(newValue) {
							elementContext.element.setAttribute(prop, newValue)
						})
					}
				})
			}
			
			if(structure) {
				structure.forEach(function(innerElement) {
					if(innerElement === 'content') {
						if(contentChildren) {
							contentChildren.forEach(function(contentChild) {
								var innerElementContext = render(contentChild[0], contentChild[1], contentChild[2], elementContext, undefined)
								elementContext.children.push(innerElementContext)
							})
						}
					}
					else {
						var innerElementContext = render(innerElement[0], innerElement[1], innerElement[2], elementContext, contentChildren)
						elementContext.children.push(innerElementContext)
					}
				})
			}
		}
	}
	else {
		parent.place.parentNode.insertBefore(elementContext.place, parent.place)
		
		elementContext.destroy = function() {
			destroy()
			parent.place.parentNode.removeChild(elementContext.place)
		}
		
		var elementStructure = component.bind(elementContext)(props)
		
		elementStructure.forEach(function(innerElement) {
			elementContext.children.push(render(innerElement[0], innerElement[1], innerElement[2], elementContext, structure))
		})
	}
	
	currentElementContext = prevElementContext
	
	return elementContext
}

function root(htmlElement) {
	var elementContext = {
		place: document.createComment('ref'),
		binds: [],
		children: [],
		
		destroy: function() {
			elementContext.binds.forEach(function(bind) {
				bind.unbindAll()
			})
			elementContext.binds.splice(0, elementContext.binds.length)
			
			elementContext.children.forEach(function(child) {
				child.destroy()
			})
			elementContext.children.splice(0, elementContext.children.length)
			
			htmlElement.removeChild(elementContext.place)
		}
	}
	
	htmlElement.appendChild(elementContext.place)
	
	return {
		render: function(component, props, structure) {
			elementContext.children.push(render(component, props, structure, elementContext))
			return elementContext
		}
	}
}