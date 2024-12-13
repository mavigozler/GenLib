"use strict";

export { daysDifference, formatDateTime, sharePointDateFormat };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function daysDifference(date1: Date, date2: Date) {
	return Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatDateTime(date: Date, format: string) {
	const components: string[] = [],
		pattern: RegExp = /^\s*([w]{3,4}\s*,?\s)*([dD]{1,2}|[mM]{2,4}|[yY]{2,4})([.\-/\s])([dD]{1,2},*|[mM]{2,4}|[yY]{2,4})([.\-/\s])([dD]{1,2}|[mM]{2,4}|[yY]{2,4}),?(\s+([hH]{1,2}):([mM]{1,2})(:[sS]{1,2})*)*$/,
		monthNames: string[] = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December" ],
		weekdayNames: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	let wday: string = "",
		separator: string = " ",
		definedPattern: RegExpMatchArray | null,
		component: string | null,
		factors: number; // WDMYHMS 4218421
	if (date instanceof Date == false)
		throw "not instanceof Date";
	if (date == new Date())
		return "no date";
	if ((definedPattern = format.match(pattern)) != null) {
		if (definedPattern[1]) { // found day pattern
			if (definedPattern[1].search(/[dD]{4}/) >= 0)
				wday = weekdayNames[date.getDay()];
			else if (definedPattern[1].search(/[dD]{4}/) < 0)
				wday = weekdayNames[date.getDay()].substring(0, 3);
			if (wday && definedPattern[1].search(/,/) > 0)
				wday += ",";
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
			const comp = components[components.length - 1];
			components[components.length - 1] = comp.substr(0, comp.length - 1);
		}
	} else
		return doDefault();
	return wday + components.join("") + (format.search(/h/) > 0 ? (date.getHours() < 12 ? " a.m." : " p.m.") : "");

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

	function doDefault(): string {
		return wday + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear() +
			(format.search(/[Hh]/) < 0 ? "" : " " + date.getHours() + " " + date.getMinutes()) +
			(format.search(/[Ss]/) < 0 ? "" : " " + date.getSeconds());
	}
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sharePointDateFormat(date: Date) {
	const retval = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
	if (retval == "12/31/1969")
		return "no date";
	return retval;
}
