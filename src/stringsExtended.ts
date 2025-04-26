"use strict";

import * as fs from "fs";
import * as readline from "node:readline/promises";

export {
	string2RE, 
	strchcount, getCharPositionFromLineNumber, insertStringInString,
	findSubstringIndex, longestCommonSubstring, findLineNumber,
	runTestSuite, basename, longestCommonPath, fwdSlash, showRelativePath,
	convertCtrlToPrintForm
};

function string2RE(str: string): RegExp {
	if (typeof str !== "string")
		throw new TypeError(`Expected a string as input -- type given was '${typeof str}'`);
	return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

function strchcount (
	testStr: string,
	char: string
): number {
	return (testStr.match(new RegExp(char, "g")) || []).length;
}

function insertStringInString(target: string, insert: string, position: number): string {
	const targetCopy = target;
	return targetCopy.slice(0, position) + insert + targetCopy.slice(position);
}

function getCharPositionFromLineNumber(str: string, linenum: number): number {
	const strLines = str.split("\n");
	let charOffset = 0;

	for (let line = 0; line < linenum; line++)
		charOffset += strLines[line].length + 1;
	return charOffset;
}

function convertCtrlToPrintForm(ctrlString: string): string {
	return ctrlString.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}

function basename(path: string): string {
	if (typeof path !== "string")
		return "*** ERROR: argument was not of type 'string' ***";
	else if (path.length == 0)
		return "*** ERROR: argument was an empty string ***";
	return path.match(/[/\\]?([^/\\]+)$/)![1];
}

function findSubstringIndex(haystack: string, needle: string): number {
	for (let i = 0; i <= haystack.length - needle.length; i++) {
		let j;
		for (j = 0; j < needle.length; j++)
			if (haystack[i + j] !== needle[j])
				break;
		if (j === needle.length)
			return i; // Found the substring at index i
	}
	return -1; // Substring not found
}

function longestCommonSubstring(S: string, T: string): string | undefined {
	const r = S.length;
	const n = T.length;

	// Initialize the 2D array L with zeroes
	const L = Array.from({ length: r + 1 }, () => Array(n + 1).fill(0));
	let z = 0;
	let ret = new Set();

	for (let i = 1; i <= r; i++) {
		for (let j = 1; j <= n; j++) {
			if (S[i - 1] === T[j - 1]) {
				if (i === 1 || j === 1) {
					L[i][j] = 1;
				} else {
					L[i][j] = L[i - 1][j - 1] + 1;
				}
				if (L[i][j] > z) {
					z = L[i][j];
					ret = new Set([S.slice(i - z, i)]);
				} else if (L[i][j] === z) {
					ret.add(S.slice(i - z, i));
				}
			} else {
				L[i][j] = 0;
			}
		}
	}
	const soln = Array.from(ret) as string[];
	return  soln.length > 1 ? undefined : soln[0];
}

function fwdSlash(paths: string): string
function fwdSlash(paths: string[]): string[]
function fwdSlash(paths: string | string[]): string | string[] {
	if (typeof paths == "string")
		return paths.replace(/\\/g, "/");
	return paths.map(elem => elem.replace(/\\/g, "/"));
}

function longestCommonPath(path1: string, path2: string): string | undefined {
	const longestPathString = longestCommonSubstring(fwdSlash(path1), fwdSlash(path2));
	if (longestPathString) {
		const pathlen = longestPathString.length;
		if (path1[pathlen] == "/" && path2[pathlen] == "/")
			return longestPathString;
		else
			return longestPathString.substring(0, longestPathString.lastIndexOf("/"));
	}
	return undefined;
}

function showRelativePath(indexFile: string, referenceFile: string): string {
	const workingIndex = indexFile.replace(/\\/g, "/").split("/"),
		workingReference = referenceFile.replace(/\\/g, "/").split("/"),
		relativePath: string[] = [];
	let indexShift: string | undefined,
		referenceShift: string | undefined;
   if (workingIndex[0] == "")
      workingIndex.shift();
   if (workingReference[0] == "")
      workingReference.shift();
   // start from root both paths, eliminate each path segment until not identical
   while (workingReference.length > 1 && workingIndex.length > 1 &&
         (indexShift = workingIndex.shift()) && (referenceShift = workingReference.shift()) &&
         indexShift == referenceShift)
      relativePath.push("");
   // index and reference paths contain in 'shift' that last pulled path segement
   if (workingIndex.length > workingReference.length) {
      // if workingIndex has just one left, it's index file
      if (workingIndex.length > 1 && workingReference.length > 1)
         relativePath.push(".."); // push current shift as parent jump
      while (workingIndex.length > 1 && workingIndex.shift()!)
         relativePath.push("..");
      if (workingReference.length > 1)
         relativePath.push(referenceShift!);
   } else
      relativePath.push(".");
   // now add names of the workingReference to reference file
   while (workingReference.length > 1)
      relativePath.push(workingReference.shift()!)
   relativePath.push(workingReference.shift()!);  // add the reference file point
	return relativePath.filter(elem => elem != "").join("/");
}

/**
 * @function findLineNumber -- uses Node readline() to search string 'searchPattern' to find
 * 		all the lines or just the first line in which the pattern occurs in the file
 * @param {string} filePath -- path of file to open.
 * @param {string} searchPattern -- string indicating pattern to search
 * @param {boolean} firstInstanceOnly -- returns only the line info which is first occurrence
 * @returns
 */
function findLineNumber(
	filePath: string,
	searchPattern: RegExp,
	firstInstanceOnly: boolean
): Promise<{
	lineno: number;
	lineText: string;
}[]> {
	return new Promise<{lineno: number;lineText: string;}[]>((resolve, reject) => {
		const fileStream = fs.createReadStream(filePath);
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity
		});
		let lineNumber = 0;
		const foundLines: {
			lineno: number;
			lineText: string;
		}[] = [];
		let resolved = false;

		rl.on('line', (line: string) => {
			lineNumber++;
			if (line.search(searchPattern) >= 0) {
				foundLines.push({
					lineno: lineNumber,
					lineText: line
				});
				if (firstInstanceOnly && !resolved) {
					// Resolve the promise and close the file stream immediately
					resolved = true;
					rl.close();
					fileStream.destroy(); // This will ensure the stream is fully closed
					resolve(foundLines);
				}
			}
		});

		rl.on('close', () => {
			// If firstInstanceOnly is false, resolve after reading all lines
			if (!resolved) {
				resolve(foundLines);
			}
		});
		rl.on('error', (err: Error) => {
			reject(err);
		});
	});
}

// Example usage
//const S = "abcdxyz";
//const T = "xyzabcd";
//console.log(longestCommonSubstring(S, T)); // ["abcd"]

// Testing code

// Test of insertStringInString() and getCharPositionFromLineNumber()
function runTestSuite() {
	const fileContent = `"use strict";

	function CreateUUID() {
		 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			  const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			  return v.toString(16);
		 });
	}
	function hasFormProperty(element) {
		 if (typeof element === 'object' && element !== null)
			  return 'form' in element;
		 return false;
	}

	//# sourceMappingURL=etc.js.map
	`;

	console.log("--- body start ---");
	console.log(fileContent);
	console.log("--- body end ---");
	console.log("--- body start ---");
	console.log(insertStringInString(fileContent, "\n", getCharPositionFromLineNumber(fileContent, 2)));
	console.log("--- body end ---");

}
