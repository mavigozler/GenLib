
export { FSysPath, FSysItem, FileItem, DirItem, SrcDestCopy, NodeFsMulticopyElem, DirectoryTree };


import { FSysItemType } from "./fsystem";

type FSysPath = string;

interface FileItem {
   name: string;
   path: string;
   resolvedPath: string;
   extension: string;
   size: number;
   itemType: FSysItemType.FILE;
   dirParent: DirItem;
}

interface DirItem {
   resolvedPath: FSysPath;
   path: FSysPath;
   name: string;
   size: number;
   items: FSysItem[] | null;
   itemType: FSysItemType.DIRECTORY;
   dirParent: DirItem;
}

type FSysItem = DirItem | FileItem;

type SrcDestCopy = { // array of {src: string;dest: string}
	src: string; // where file currently is
	dest: string;  // where copy should be: Node requires full path, not just directory
   destIsDir?: boolean;
};
type NodeFsMulticopyElem = SrcDestCopy | string ;

interface DirectoryTree {
   name: string;
   path: string;
   type: "file" | "directory";
   size?: number; // File size in bytes (optional)
   extension?: string; // File extension (optional)
   createdAt?: Date; // Creation date
   modifiedAt?: Date; // Last modification date
   children?: DirectoryTree[]; // Nested structure
   symlinkTarget?: string; // If the entry is a symbolic link
   permissions?: {
     owner: string;
     group: string;
     mode: string; // Unix-style mode string (e.g., "755")
   };
 }
 
