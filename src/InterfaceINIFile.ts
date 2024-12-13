"use strict";

export { IniFile };

interface IniFilePart {
	sectionName?: string;
	nvPairs?: {
		name: string;
		value: string;
	}[];
}

// "class" iniFile

class IniFile {
	iniFilePath: string;
	iniFileContents: IniFilePart[];
	selectedSection: IniFilePart | null = null;

	constructor (filePath: string) {
		this.iniFilePath = filePath;
		this.iniFileContents = [];
	}

	loadIniFile(): Promise<{format: "json" | "text";content:string;}> {
		return new Promise<{format: "json" | "text";content:string;}>((resolve, reject) => {
			fetch(this.iniFilePath)
				.then(response => {
					const contentType = response.headers.get("Content-Type");

					if (contentType && contentType.includes("application/json")){
						response.json().then((response) => {
							resolve({format:"json",content: response});
						}).catch((err) => {
							reject(err);
						});
					} else {
						response.text().then((response) => {
							resolve({format:"text",content:response});
						}).catch((err) => {
							reject(err);
						});
					}
				}).catch((err) => {
					reject(err);
				});
		});
	}

	parseIniText(textContent: string): boolean {
		const lines: RegExpMatchArray | null = textContent.match(/\[\w+\]|\s*[#;]\s*.*|\w+=[a-zA-Z ._\d/{}",\-%:;@]+/g);
		let i: number,
			j: number,
			item: RegExpMatchArray | null,
			idx: number,
			sectionPart: {
				nvPairs?: {
					name: string;
					value: string;
				}[];
			} | null = null,
			value: string,
			variable: string;

		if (lines)
			for (i = 0, j = 1; i < lines.length; i++) {
				if ((item = lines[i].match(/^\s*[#;]\s*(.*)/)) != null) { // comment
					if (sectionPart)
						sectionPart.nvPairs!.push({
							name: "comment" + j++,
							value: item[1]
						});
				}
				else if ((item = lines[i].match(/\[(\w+)\]/)) != null) {
					idx = this.iniFileContents.push({
						sectionName: item[1]
					});
					sectionPart = this.iniFileContents[idx - 1];
					sectionPart.nvPairs = [];
				}
				else if ((item = lines[i].match(/(\w+)=(.*)/)) != null) { // nv pair
					// check for variables in the value part
					value = item[1];
					while (value.search(/@@/) >= 0) {
						variable = value.match(/(@@.*@@)/g)![1];
						value = value.replace(variable, this.searchName(value.match(/@@(.*)@@/g)![1]) as string);
					}
					sectionPart!.nvPairs!.push({
						name: item[1],
						value: item[2]
					});
				}
			}
		return true;
	}

	setSection(secname: string): boolean {
		let i: number;

		for (i = 0; i < this.iniFileContents.length; i++)
			if (this.iniFileContents[i].sectionName == secname)
				break;
		if (i == this.iniFileContents.length) {
			this.selectedSection = null;
			return false;
		}
		this.selectedSection = this.iniFileContents[i];
		return true;
	}

	getValue(name: string): string | boolean | null {
		let value: "true" | "false";

		for (let i = 0; i < this.selectedSection!.nvPairs!.length; i++)
			if (this.selectedSection!.nvPairs![i].name == name) {
				value = this.selectedSection!.nvPairs![i].value as "true" | "false";
				if (value == "true")
					return true;
				else if (value == "false")
					return false;
				else
					return value;
			}
		return null;
	}

	searchName(name: string): string | null {
		let i: number,
			j: number;

		for (i = 0; i < this.iniFileContents.length; i++)
			for (j = 0; j < this.iniFileContents![i].nvPairs!.length; j++)
				if (name == this.iniFileContents[i].nvPairs![j].name)
					return this.iniFileContents[i].nvPairs![j].value;
		return null;
	}
}
/* file contents read in as object into this.iniFileContents
	[ { sectionName: <name>, nvPairs:
		[ { name: <prop>, value: <propValue> },	]
	}, ]
*/