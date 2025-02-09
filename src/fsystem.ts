"use strict";

enum FSysItemType {
   FILE,
   DIRECTORY
}
import type { DirItem, FSysPath, FSysItem, NodeFsMulticopyElem, DirectoryTree, SrcDestCopy} from "./fsystemTypes.d.ts";
import * as fs from "fs"; // install 'fs' Node module
import path from "path";
import { glob } from "glob";
import { deleteAsync } from "del";
import { rimraf } from "rimraf";

export { NodeFsMulticopy };

export class FileSystemItem {   // starting point for any file system item whether File or Directory
	path: string;
	stats: fs.Stats

	private constructor (
		path: string,
		stats: fs.Stats
	) {
		this.path = path;
		this.stats = stats;
	}

	static create(path: string): Promise<FileSystemItem> {
		return new Promise<FileSystemItem>((resolve, reject) => {
			fs.stat(path, (err, stats) => {
				if (err)
					reject(err);
				else
					resolve(new FileSystemItem(path, stats));
			});
		});
	}

	getItemType(): "file" | "folder" {
		if (this.stats.isDirectory() == true)
			return "folder";
		return "file";
	}
}

export class Directory {
	dirData: DirItem = {} as DirItem;
	logger: (...data: unknown[]) => void;
	parent?: Directory;

	// Constructor for basic instantiation
	constructor(
		fpath: FSysPath,
		logger?: (...data: unknown[]) => void
	) {
		let dirItems: fs.Dirent[],
			fInfo: fs.Stats;

		this.dirData.path = fpath;
		this.dirData.resolvedPath = path.resolve(this.dirData.path).replace(/\\/g, "/");
		this.dirData.name = path.basename(this.dirData.resolvedPath);
		if ((dirItems = fs.readdirSync(this.dirData.resolvedPath, { withFileTypes: true })) != null) {
			this.dirData.items = [];
			for (const item of dirItems) {
				if ((fInfo = fs.statSync(`${item.path}/${item.name}`)) != null)
					if (fInfo.isFile() == true)
						this.dirData.items.push({
							name: item.name,
							path: `${this.dirData.path}/${item.name}`,
							resolvedPath: path.resolve(`${this.dirData.path}/${item.name}`).replace(/\\/g, "/"),
							extension: path.extname(path.resolve(`${this.dirData.path}/${item.name}`)),
							size: fInfo.size,
							dirParent: this.dirData,
							itemType: FSysItemType.FILE
						});
					else if (fInfo.isDirectory() == true)
						this.dirData.items.push({
							name: item.name,
							path: `${item.path}/${item.name}`,
							resolvedPath: path.resolve(`${item.path}/${item.name}`).replace(/\\/g, "/"),
							size: -1,
							dirParent: this.dirData,
							itemType: FSysItemType.DIRECTORY,
							items: null,
						});
			}
		} else
			this.dirData.items = null;
		// this.items.push();
		this.dirData.size = -1;
		this.logger = logger || console.log;
	}

	setLogger(loggerFunc: (...data: unknown[]) => void) {
		this.logger = loggerFunc;
	}
	// Method for alternative instantiation
	static createFromNodeDirTreeModule(
		dirTree: DirectoryTree
	): Directory {
		const rootDir: Directory = new Directory(dirTree.path);

		rootDir._populateFromNodeDirectoryTree(rootDir, dirTree);
		return rootDir;
	}

	// all the child
	private _populateFromNodeDirectoryTree(
		fsysTreeNode: Directory,
		treeNode: DirectoryTree
	): void {
		const fsysDirData: DirItem = fsysTreeNode.dirData;
		let compared: boolean =
				fsysDirData.name == treeNode.name &&
				fsysDirData.path == treeNode.path &&
				//	fsysDirData.size == treeNode.size &&
				fsysDirData.itemType ==
					(treeNode.type == "directory" ? FSysItemType.DIRECTORY :
						treeNode.type == "file" ? FSysItemType.FILE : false);

		if (compared == false)
			this.logger("Entry for logging: set this");
		compared = fsysDirData.items != null && treeNode.children != null &&
						fsysDirData.items.length == treeNode.children.length;
		if (compared == false)
			this.logger("Entry for logging: set this");
		if (treeNode.children)
			for (const node of treeNode.children) {
				if (node.type === "directory") {
					if (fsysDirData.items!.find((item) => {
						return (item.name == node.name && item.size == node.size &&
							item.itemType == FSysItemType.DIRECTORY) ? item : null;
					}) == null)
						this.logger(`Directory type node with name '${node.name}' did not have corresponding fsys item`);
					else
						this.logger(`Directory type node with name '${node.name}' had matching fsys item`);
					fsysTreeNode._populateFromNodeDirectoryTree(new Directory(node.path, this.logger), node);
				} else if (node.type === "file") {
					if (fsysDirData.items!.find((item) => {
						return (item.name == node.name && item.size == node.size &&
							item.itemType == FSysItemType.FILE) ? item : null;
					}) == null)
						this.logger(`File type node with name '${node.name}' did not have corresponding fsys item`);
					else
						this.logger(`File type node with name '${node.name}' had matching fsys item`);
				}
			}
	}

	/**
	 * @method listing -- provides recursive one-item-per-directory-entry string of a folder/directory contents
	 * @param {fromTop, indent, indentchar} options
	 *   fromTop: starts the listing from top of the directory tree, to ancestor of current directory
	 *   indent: number to cause ident for each subfolder/subdir level
	 *   indentchar: the single character to use in indenting process
	 */
	listing(options?: {
		fromTop: boolean;
		indent: number;
		indentchar: string;
	}): void {
		const fromTop = (options && options.fromTop) || false;
		const indent = (options && options.indent) || 2;
		const indentchar = (options && options.indentchar) || " ";
		let pad: string = "",
			gparent: Directory | undefined = this.parent || undefined;

		for (let i = 0; i < indent; i++)
			pad += indentchar;
		if (fromTop == true)
			while (gparent)
				gparent = gparent.parent;
		if (gparent) {
			const rootDir: DirItem = gparent.dirData;
			this.logger(`**** ROOT ****\npath: '${rootDir.path}'\nresolved path: '${rootDir.resolvedPath}'`);
			this._listDirectory(rootDir, pad);
		}
	}

	private _listDirectory(
		dir: DirItem,
		pad: string
	) {
		if (dir.items == null)
			return;
		for (const item of dir.items)
			if (item.itemType == FSysItemType.DIRECTORY) {
				this.logger(`${pad} ${item.name} [D]`);
				this._listDirectory(item as DirItem, pad + pad);
			} else {
				this.logger(`${pad} ${item.name} (${item.size})`);
			}
	}

	/**
	 * @method deleteItems
	 * @param options
	 * 	optional object with optional properties
	 * 		- filter: regular expression pattern to specify items to include/exclude
	 * 		- recursive: boolean with default = false that identified subdirs will be deleted
	 *            and will be forced to delete if non empty (rimraf used)
	 * 		- preview: boolean with default = true: shows what items would be deleted under
	 * 				specified conditions
	 * @returns {Promise}
	 */
	deleteItems(options?: {
		filter?: string;
		recursive?: boolean,
		preview?: boolean
	}): Promise<boolean[]> {
		return new Promise((resolve, reject) => {
			options = options || { recursive: false, preview: true };
			const preview = options.preview || true;
			//const recursive = options.recursive ? options.recursive : false;
			const delOptions: {dryRun: boolean} = preview == true ? { dryRun: true } : { dryRun: false };
			// if there are no files/subdirs, log and return
			if (!this.dirData.items || this.dirData.items.length == 0) {
				const message = "deleteItems()--there are no items at all in the directory to delete";
				this.logger(message);
				reject(message);
			} else {
				const deleteItem: Promise<boolean>[] = [];
				let itemSet: FSysItem[] = [];

				// specify the items to be deleted in directory
				// can be full/partial/relative paths, just names, default = '*' (all)
				// non-empty subdirs will return an error and refuse to delete unless 'recursive' specified
				if (options.filter) {
					const items: FSysItem[] = this.dirData.items;
					const filter: RegExp = new RegExp(options.filter);

					for (const item of items)
						if (item.name.search(filter) >= 0)
							itemSet.push(item);
				} else
					itemSet = this.dirData.items;

				for (const item of itemSet)
					deleteItem.push(new Promise((resolve, reject) => {
						const itemFullPath = item.resolvedPath.replace(/\\/g, "/");
						deleteAsync(itemFullPath, delOptions).then((response: string[]) => {
							this.logger(`deleteItems()::del.deleteAsync('${itemFullPath}')` +
								`\n${JSON.stringify(response, null, "  ")}`);
							resolve(true);
						}).catch((err: {code: string}) => {
							if (err.code == "ENOTEMPTY")
								rimraf(itemFullPath).then((response: boolean) => {
									this.logger(`deleteItems()::rimraf('${itemFullPath}')` +
										`\n${JSON.stringify(response, null, "  ")}`);
									resolve(true);
								}).catch((err: unknown) => {
									this.logger(`CAUGHT ERROR deleteItems()::rimraf('${itemFullPath}')` +
										`\n${JSON.stringify(err, null, "  ")}`);
									reject(`CAUGHT ERROR deleteItems()::rimraf('${itemFullPath}')` +
										`\n${JSON.stringify(err, null, "  ")}`);
								});
							else {
								this.logger(`CAUGHT ERROR deleteItems()::del.deleteAsync('${itemFullPath}')` +
										`\n${JSON.stringify(err, null, "  ")}`);
								reject(`CAUGHT ERROR deleteItems()::del.deleteAsync('${itemFullPath}')` +
									`\n${JSON.stringify(err, null, "  ")}`);
							}
						});
					}));
				Promise.all(deleteItem).then((response) => {
					resolve(response);
				}).catch((err) => {
					reject(err);
				});
			}
		});
	}
}

/**
 * @function NodeFsMulticopy --
 * @param copyList this argument can be one of two types
 * @param destPath
 * @returns
 */
function NodeFsMulticopy(
	copyList: NodeFsMulticopyElem[],
	destPath?: string
): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
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
			const globOps: Promise<NodeFsMulticopyElem[]>[] = [];
			// expand copylist if there are any globbed characters
			for (const item of copyList) {
				const currentItem = item;
				globOps.push(new Promise<NodeFsMulticopyElem[]>((resolve, reject) => {
					const pattern = typeof currentItem !== "string" ? currentItem.src : currentItem;
					glob(pattern).then((results: NodeFsMulticopyElem[]) => {
						let modItem: NodeFsMulticopyElem[] = [];
						for (const result of results)
							if (typeof currentItem != "string")
								modItem.push({ src: result, dest: currentItem.dest, destIsDir: currentItem.destIsDir } as SrcDestCopy);
						else
							modItem.push(result);
						resolve(modItem);
					}).catch((err: unknown) => {
						reject(err);
					});
				}));
			}
			Promise.all(globOps).then((allResults: NodeFsMulticopyElem[][]) => {
				const copyQueue: Promise<void>[] = [];
				const flattenedResults = allResults.flat();
//				for (const item of flattenedResults)
//					if (typeof item != "string")
//						newCopyList.push({src: item.src, dest: item.dest} as SrcDestCopy);
//					else
//						newCopyList.push(item);
//				resolve(newCopyList);
				for (const item of flattenedResults)
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
							if (item.destIsDir == true)
								dest = `${item.dest}/${path.basename(src)}`;
							else
								dest = item.dest;
						}
						if (errored == false)
							fs.copyFile(src, dest, (err: unknown) => {
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
			}).catch((err: unknown) => {
				reject(err);
			});
		}
	});
}
