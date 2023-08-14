"use strict";

type TResolvedPath = {
	leading: string;
	fObject: string | null;
} | null;


function consoleColors(
	txt: string,
	fcolor: "red" | "green" | "yellow" | "blue" | "purple" | "cyan",
	options? : {
		bcolor?: "red" | "green" | "yellow" | "blue" | "purple" | "cyan",
		makeForeBright?: boolean;
		makeBackBright?: boolean;
		includeReset?: boolean;
	}
): string {
	let val: number = 0,
			str: string = "\u001b[1;";

	switch (fcolor) {
	case "red":
		val += 31;
		break;
	case "green":
		val += 32;
		break;
	case "yellow":
		val += 33;
		break;
	case "blue":
		val += 34;
		break;
	case "purple":
		val += 35;
		break;
	case "cyan":
		val += 36;
		break;
	}
	if (options && options.makeForeBright == true)
		val += 60;
	str += val + "m";
	if (options && options.bcolor) {
		val = 0;
		str += "\u001b[1;"
		switch (fcolor) {
		case "red":
			val += 41;
			break;
		case "green":
			val += 42;
			break;
		case "yellow":
			val += 43;
			break;
		case "blue":
			val += 44;
			break;
		case "purple":
			val += 45;
			break;
		case "cyan":
			val += 46;
			break;
		}
		if (options && options.makeBackBright == true)
			val += 60;
		str += val + "m";
	}
	str += txt;
	if (options && options.includeReset == true)
		str += "\u001b[0m";
	return str;
}

/*
function resolveLeadingPath(
	rootPath: string,
	targetPath: string | null
): TResolvedPath {
	let parentDirCounts: string[] = [],
		tpInit = targetPath,
		idx: number,
		temp: string;

	if ((idx = rootPath.search(/\$\(dirname\)/)) >= 0) {
		if (rootPath.search(/\s*\$\(dirname\)/) < 0)
			return null;
		rootPath = rootPath.substring(0, idx) + __dirname + rootPath.substring(idx + 10);
	}
	rootPath = rootPath.replace(/\\/g, "/");
	if (rootPath == "." || rootPath == "./")
		rootPath = process.cwd();
	if (rootPath.search(/\.\.|\.\.\/|\/\.\./) >= 0) {
		targetPath = rootPath;
		rootPath = process.cwd();
	}
	rootPath = rootPath.replace(/\\/g, "/");
	if (targetPath) {
		if ((idx = targetPath.search(/\$\(dirname\)/)) >= 0) {
			if (rootPath.search(/\s*\$\(dirname\)/) < 0)
				return null;
			targetPath = (targetPath.substring(0, idx) + __dirname + targetPath.substring(idx + 10));
		}
		targetPath = targetPath.replace(/\\/g, "/");

		if (targetPath == "..")
			targetPath = "../";
		if (targetPath.search(/^\/\.\.\//) == 0 || targetPath.search(/^\.\/|^\.$/) == 0)
			targetPath = targetPath.substring(1);
		temp = targetPath.replace(/\.\.\//g, "../###");
		parentDirCounts = temp.split("###");
		if (parentDirCounts.length > 1 && parentDirCounts[0] != "../")
			return null;
		while (parentDirCounts[0] == "../") {
			parentDirCounts.shift();
			rootPath = rootPath.substring(0, rootPath.lastIndexOf("/"));
		}
		if (parentDirCounts[0].charAt(0) != "/")
			parentDirCounts[0] = "/" + parentDirCounts[0];
		if (tpInit == null) {
			if (parentDirCounts[0] != "/")1
				if (parentDirCounts[0].charAt(0) != "/")
					rootPath = rootPath + "/" + parentDirCounts[0];
				else
					rootPath += parentDirCounts[0];
			targetPath = null;
		}
	}
	return {
		leading: rootPath,
		fObject: targetPath ? parentDirCounts[0] : null
	}
} */


function getRandomIntegerInRange(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function numberWithThousandsSeparator(number: number, separator: string) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
/**
 * Splices text within a string.
 * @param {int} offset The position to insert the text at (before)
 * @param {string} text The text to insert
 * @param {int} [removeCount=0] An optional number of characters to overwrite
 * @returns {string} A modified string containing the spliced text.
 */

class StringEnhanced extends String {
    StringEnhanced () {}

    splice(
        offset: number,
        text: string,
        removeCount: number = 0
    ) {
        let calculatedOffset: number = offset < 0 ? this.length + offset : offset;
        if (!removeCount)
            removeCount = 0;
        return this.substring(0, calculatedOffset) + text + this.substring(calculatedOffset + removeCount);
    }
}

function formatDateTime(date: Date, format: string) {
    var wday: string = "",
        separator: string = " ",
        definedPattern: RegExpMatchArray | null,
        component: string | null,
        components: string[] = [],
        factors: number, // WDMYHMS 4218421
        pattern: RegExp = /^\s*([w]{3,4}\s*,?\s)*([dD]{1,2}|[mM]{2,4}|[yY]{2,4})([\.\-\/\s])([dD]{1,2},*|[mM]{2,4}|[yY]{2,4})([\.\-\/\s])([dD]{1,2}|[mM]{2,4}|[yY]{2,4}),?(\s+([hH]{1,2}):([mM]{1,2})(:[sS]{1,2})*)*$/,
        monthNames: string[] = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ],
        weekdayNames: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (date instanceof Date == false)
        throw "not instanceof Date";
    if (date == new Date())
        return "no date";
    if ((definedPattern = format.match(pattern)) != null) {
        if (definedPattern[1]) { // found day pattern
            if (definedPattern[1].search(/[dD]{4}/) >= 0)
                wday = weekdayNames[date.getDay()];
            else if (definedPattern[1].search(/[dD]{4}/) >= 0)
                wday = weekdayNames[date.getDay()].substring(0, 3);
            if (wday && definedPattern[1].search(/,/) > 0) {
                wday += ",";
            }
        }
        if (wday.length == 0 && (definedPattern[3] == definedPattern[5]))
            separator = definedPattern[3];
        // check month day year any order
        if ((component = processDateComponent(definedPattern[2], separator)) == null)
            return doDefault();
        else
            components.push(component);
        if ((component = processDateComponent(definedPattern[4], separator)) == null)
            return doDefault();
        else
            components.push(component);
        if ((component = processDateComponent(definedPattern[6], " ")) == null)
            return doDefault();
        else
            components.push(component);
        // check hour minute seconds
        if (definedPattern[7]) { // Hours found!
            if ((component = processDateComponent(definedPattern[8])) == null)
                return doDefault();
            else
                components.push(component);
            if ((component = processDateComponent(definedPattern[9])) == null)
                return doDefault();
            else
                components.push(component);
        }
        if (definedPattern[10]) // Seconds found!
            if ((component = processDateComponent(definedPattern[10])) == null)
                return doDefault();
            else
                components.push(component);
        else {
            var comp = components[components.length - 1];
            components[components.length - 1] = comp.substr(0, comp.length - 1);
        }

        function processDateComponent(
            component: string,
            delimiter?: string
        ): string | null { // WDMYHMS 4218421
            if (!delimiter)
					delimiter = "/";
            switch (component) {
                case "d":
                case "D":
                    if ((factors & 0x40) != 0) return null;
                    factors |= 0x40;
                    return date.getDate() + delimiter;
                case "dd":
                case "DD":
                    if ((factors & 0x40) != 0) return null;
                    factors |= 0x40;
                    return (date.getDate().toString().length < 2 ? "0" + date.getDate() : date.getDate()) + delimiter;
                case "h":
                case "hh": // 12-hour clock
                    if ((factors & 0x04) != 0) return null;
                    factors |= 0x04;
                    if (component.length == date.getHours().toString().length)
                        return (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) + ":";
                    else
                        return "0" + (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) + ":";
                case "H": // 24-hour clock
                case "HH":
                    if ((factors & 0x04) != 0) return null;
                    factors |= 0x04;
                    if (component.length == date.getHours().toString().length)
                        return date.getHours() + ":";
                    else
                        return "0" + date.getHours() + ":";
                case "M":
                case "m":
                    if ((factors & 0x02) != 0) return null;
                    factors |= 0x02;
                    return date.getMinutes() + delimiter;
                case "MM":
                case "mm":
                    if ((factors & 0x10) != 0) {
                        if ((factors & 0x02) != 0) return null;
                        factors |= 0x02;
                        if (component.length > date.getMinutes().toString().length)
                            return "0" + date.getMinutes() + ":";
                        else
                            return date.getMinutes() + ":";
                    }
                    factors |= 0x10;
                    return (date.getMonth() + 1) + delimiter;
                case "MMM":
                case "mmm":
                    if ((factors & 0x10) != 0) return null;
                    factors |= 0x10;
                    return monthNames[date.getMonth()].substring(0, 3) + " ";
                case "MMMM":
                case "mmmm":
                    if ((factors & 0x10) != 0) return null;
                    factors |= 0x10;
                    return monthNames[date.getMonth()] + " ";
                case "s":
                case "ss":
                case "S":
                case "SS":
                    if ((factors & 0x01) != 0) return null;
                    factors |= 0x01;
                    return date.getSeconds().toString();
                case "YY":
                case "yy":
                    if ((factors & 0x08) != 0) return null;
                    factors |= 0x08;
                    return date.getFullYear().toString().substring(2) + delimiter;
                case "YYYY":
                case "yyyy":
                    if ((factors & 0x08) != 0) return null;
                    factors |= 0x08;
                    return date.getFullYear() + delimiter;
                default:
                    return null;
            }
        }
    } else
        return doDefault();

    function doDefault(): string {
        return wday + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear() +
            (format.search(/[Hh]/) < 0 ? "" : " " + date.getHours() + " " + date.getMinutes()) +
            (format.search(/[Ss]/) < 0 ? "" : " " + date.getSeconds());
    }
    return wday + components.join("") + (format.search(/h/) > 0 ? (date.getHours() < 12 ? " a.m." : " p.m.") : "");
}

function sharePointDateFormat(date: Date) {
    var retval;
    retval = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    if (retval == "12/31/1969")
        return "no date";
    return retval;
}

function deduplicate(array: any[]): any[] {
    return Array.from(new Set(array));
}

Number.isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
};

function stringifyType(arg: any) {
    var argType = typeof arg;
    if (arg instanceof Array)
        return "array of length " + arg.length;
    if (arg instanceof Date)
        return "date";
    if (argType == "number")
        if (Number(arg) === arg && arg % 1 === 0)
            return "integer";
        else if (Number(arg) === arg && arg % 1 !== 0)
        return "float";
    else
        return "number of some type";
    if (argType == "string")
        return "string of length " + arg.length;
    if (arg === null)
        return "null";
    return argType;
}

function daysDifference(date1: Date, date2: Date) {
    return Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}


// JSON.stringify(JSON.decycle(a));
//  removes circular references
class JSONextended {
	replacer: ((arg: object) => object) | null = null;
	objects: WeakMap<any, any> | null = null;

	JSONextended() {}

	decycle(
		object: object,
		replacer: (arg: object) => object
	) {
		this.objects = new WeakMap(); // object to path mappings
		this.replacer = replacer;
		return this.derez(object, "$");
	}

	derez(
		value: object | any[],
		path: string
	) {
		let oldPath: string, // The path of an earlier occurance of value
      	nu: any | any[]; // The new object or array

		if (this.replacer)
			value = this.replacer(value);
		if (typeof value === "object" && value !== null && !(value instanceof Boolean) && !(value instanceof Date) &&
					!(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {
			if (this.objects && (oldPath = this.objects.get(value)) !== null)
				return {$ref: oldPath};
			this.objects && this.objects.set(value, path);
			if (Array.isArray(value) == true) {
				nu = [];
				(value as any[]).forEach((element, i) => {
					nu[i] = this.derez(element, `${path}[${i}]`);
				});
			} else { // value is object
				nu = {};
				Object.keys(value as object).forEach((name) => {
					nu[name] = this.derez(
						(value as any)[name],
						`${path}[${JSON.stringify(name)}]`
					);
				});
			}
			return nu;
		}
		return value;
	}
}


function getRandom(
	minORset: number | number[],
	max?: number
) {
	if (Array.isArray(minORset) == true) // an array set of numbers
		return ((minORset as number[])[Math.round(Math.random() * ((minORset as number[]).length - 1))]);
	return (minORset as number + Math.random() * (max! - (minORset as number)));
}

/**
 * @function areEqual -- tests whether to floating points are equal within a delta
 * 	default delta is
 * @param value1
 * @param value2
 * @param delta
 */

function areEqual(
   value1: number,
   value2: number,
   delta: number = Number.EPSILON
): boolean {
	return Math.abs(value1 - value2) < delta;
}