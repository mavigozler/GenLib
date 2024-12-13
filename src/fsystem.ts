"use strict";

type NodeFsMulticopy = ({ // array of {src: string;dest: string}
	src: string; // where file currently is
	dest: string;  // where copy should be: Node requires full path, not just directory
} | string)[];

import * as fs from "fs"; // install 'fs' Node module
import path from "path";

export { NodeFsMulticopy };

/**
 * @function NodeFsMulticopy --
 * @param copyList this argument can be one of two types
 * @param destPath
 * @returns
 */
function NodeFsMulticopy(
	copyList: NodeFsMulticopy,
	destPath?: string
): Promise<string[]> {
	return new Promise<string[]>((resolve) => {
		if (Array.isArray(copyList) == false)
			resolve(["argument 'copyList' is not an array"]);
		else if (copyList.length == 0)
			resolve(["argument 'copyList' must be an array of greater than zero length"]);
		else if (typeof copyList[0] == "string" && !destPath)
			resolve(["argument 'copyList' of type `string[]` requires 2nd argument `destPath` of type `string`"]);
		else {
			let errResponses: string[] = [],
				src: string,
				dest: string,
				errored: boolean;
			const copyQueue: Promise<void>[] = [];
			for (const item of copyList)
				copyQueue.push(new Promise<void>((resolve) => {
					errored = false;
					if (typeof item == "string") {
						if (!destPath) {
							errResponses.push(`'${item}' copy failed: no dest path specified`);
							errored = true;
							resolve();
						} else {
							src = item;
							dest = path.join(destPath, path.basename(item));
						}
					} else {
						src = item.src;
						dest = item.dest;
					}
					if (errored == false)
						fs.copyFile(src, dest, (err: Error) => {
							if (err)
								errResponses.push(`'${src}' copy failed`);
							resolve();
						});
				}));
			Promise.all(copyQueue).then(() => {
				if (!errResponses || errResponses.length == 0)
					errResponses = [ "all copy operations were successful" ]
				resolve(errResponses);
			});
		}
	});
}