"use strict";
/************************
 * objectStructure.ts  -- will find
 */

export { findObjectPartByProperty, findObjectPropertyValue, findAncestorDomNode };

type ObjectPropertyAsString = {[key: string]: unknown};
// CollectedResults should either be null or an array of string arrays that include null
type ObjectPartOptions = {
	findByValue?: boolean; // default=false; if true, will find the object part using property values instead of nanmes
	returnParentChain?: boolean; // default=false; if true, will return a reference to the object part as the
		// identifier chain from the root/parent point
	returnAllInstancesOfPropertyValues?: boolean; // default=false; if true, will return an array of all object
		// parts that have identical property values; only applies if 'findByValue' option set 'true'.
		// if 'returnParentChain' set true, will return the parent chain to parts
};

/**
 * @function findObjectPartByProperty --
 * @param {object} obj -- the object to be searched for properties or property values
 * @param {string} property -- will return the values of all properties found in an object,
 *     where the properties are given as strings in an array
 * @param {ObjectPartOptions?} options --
 *    findByValue
 *    returnParentChain
 *    returnAllInstancesOfPropertyValues
 * @returns
 */
function findObjectPartByProperty(
	obj: object,
	propertyOrValue: string,
	options?: ObjectPartOptions
): object | null {
	let result: object | null;

	if (Array.isArray(obj) == true || (obj as unknown[]).length) {
		if (searchArray(obj as unknown[], propertyOrValue, options) != null)
			return obj;
		else
			return null;
	} else
		result = searchObject([{itsChain: [], itsPoint: {}}], propertyOrValue, options);
	return result;
}

function findObjectPropertyValue(
	obj: object,
	value: string,
	options?: {returnParentChain?: boolean; returnAllInstancesOfPropertyValues?: boolean; findByValue: true}
): object | null {
	return findObjectPartByProperty(obj, value, options);
}

/**
 * @function searchObject -- will search an object to find a part of it specified by property name or property value
 * @param obj -- the object to be searched for specific property name or value
 * @param property
 * @param options
 * @returns null or the part of the object (or parent-chaing to object) for a propert name
 *    or one or more properties whose values searched by value
 */
function searchObject(
	obj: object,  // generally this will always be object type. Arrays will be diverted to other functions
	property: string, // regarded as string type or "Symbol.stringType"
	options?: ObjectPartOptions  // false: search by property, true: search by property value
): object | null {

	if (typeof obj != "object")
		return null;
	for (const prop in obj) {
		// is the target property found & if searching by value, is it the property?
		if (options?.findByValue == true) {
			if ((obj as ObjectPropertyAsString)[prop] == property) // property value found for target
				return obj;
			else if ((obj as unknown[])?.length) { // this is an array
				if (searchArray(obj as unknown[], property, options) != null)
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return (obj as any)[prop];
				else
					return null;
			} else if (typeof obj === "object" && obj != null)
				return searchObject(obj, property, options);
		} else if (prop == property)
			return obj;
	}
	return null;
}

/**
 * @function searchArray --
 * @param arr
 * @param property
 * @param value
 * @returns
 */
function searchArray(
	arr: unknown[],
	propertyOrValue: unknown,
	options?: ObjectPartOptions
): object | null {
	let result: unknown[] | object | null = null,
		collectedResults: unknown[] = [ ];

	for (const elem of arr) {
		if (Array.isArray(elem) == true) // property references an inner array
			result = searchArray(elem as unknown[], propertyOrValue, options);
		else if (typeof elem == "object")  // property references an inner object
			result = searchObject(elem as object, propertyOrValue as string, options);
		if (result && ((result as unknown[]).length &&
					(result as unknown[]).length >= 1 && (result as unknown[])[0] != null) || result != null)
			if (Array.isArray(result) == true)
				collectedResults = collectedResults.concat(result);
			else
				collectedResults.push(result);
		result = null;
	}
	if (collectedResults.length > 0)
		return collectedResults;
	return null;
}


/**
 *
 * @param {object} parameters -- arguments are properties
 *      child [htmlDomNode: required] -- the starting DOM node from which to start search
 *      name  [string: required] -- the nodeName property of a DOM node as a string / case not important
 *      class [string: optional] -- the class attribute of the ancestor, which can be used for search
 *      searchClass [string: optional] -- a partial string of class search.
 *      searchAttribute [array: optional] -- will search an ancestor for a particular attribute and its
 *                   value. Value is optional. Must be two-element array, with 1st element full attribute
 *                   name and 2nd element, if used, the full value of the attribute7
 */
function findAncestorDomNode(parameters: {
	child: HTMLElement,
	name: string,
	class?: string,
	searchClass?: string,
	searchAttribute?: string[]
}): HTMLElement | null {
	let regex: RegExp | undefined;

	if (parameters.searchClass)
		regex = new RegExp(parameters.searchClass);
	for (let targetNode = parameters.child; targetNode != null; targetNode = targetNode.parentNode as HTMLElement)
		if ((parameters.class || regex) && parameters.searchAttribute) {
			if (parameters.class) {
				if (targetNode.nodeName.toLowerCase() == parameters.name &&
									targetNode.className == parameters.class &&
									targetNode.getAttribute(parameters.searchAttribute[0]) == parameters.searchAttribute[1])
					return targetNode;
			} else if (targetNode.nodeName.toLowerCase() == parameters.name && regex &&
						targetNode.className.search(regex) >= 0 &&
						targetNode.getAttribute(parameters.searchAttribute[0]) == parameters.searchAttribute[1])
				return targetNode;
		} else if (parameters.class || regex) {
			if (parameters.class) {
				if (targetNode.nodeName.toLowerCase() == parameters.name &&
									targetNode.className == parameters.class)
					return targetNode;
			} else if (targetNode.nodeName.toLowerCase() == parameters.name && regex &&
						targetNode.className.search(regex) >= 0)
				return targetNode;
		} else if (parameters.searchAttribute) {
			if (targetNode.nodeName.toLowerCase() == parameters.name &&
						targetNode.getAttribute(parameters.searchAttribute[0]) == parameters.searchAttribute[1])
				return targetNode;
		} else if (targetNode.nodeName.toLowerCase() == parameters.name)
			return targetNode;
	return null;
}
