"use strict";
import fs from "fs";
import * as globPkg from "glob";
const { glob } = globPkg;
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const startingExecutionDirectory = process.cwd();
console.log("\n\n\n=======================================" +
    `\nSCRIPT START\n${process.argv[1]}` +
    "\n=======================================" +
    `\ncwd:\n   ${startingExecutionDirectory}` +
    `\nsetting working directory to:\n    ${__dirname}`);
process.chdir(__dirname);
const dirname = __dirname.replace(/\\/g, "/");
const projectRoot = dirname.substring(0, dirname.search(/\/test/));
const excludePattern = [`${__dirname}/importJsQuickFix.js`, './eslint.config.js'];
console.log(`Project root: ${projectRoot}`);
// files to modify
const JSchanges = [
    { from: /^import (.*) from "((\/?\.\.?\/)+)([^\n]+)(\.js)?";?/mg,
        to: "import $1 from \"$2$4.js\"" },
    { from: /\.json\.js/, to: ".json" },
    { from: /\.js\.js/, to: ".js" }
];
function checkPaths(paths, otherPaths) {
    let testPath;
    const confirmedPaths = [];
    for (const path of paths)
        if (fs.existsSync(path) == true)
            confirmedPaths.push(path);
    if (confirmedPaths.length == 0 && otherPaths)
        for (const otherPath of otherPaths)
            if (fs.existsSync(otherPath) == true)
                for (const innerPath of paths) {
                    testPath = path.join(otherPath, innerPath);
                    if (fs.existsSync(testPath) == true)
                        confirmedPaths.push(testPath);
                    else {
                        testPath = path.join(otherPath, path.basename(innerPath));
                        if (fs.existsSync(testPath) == true)
                            confirmedPaths.push(testPath);
                    }
                }
    const idx = confirmedPaths.findIndex(elem => elem == __filename);
    if (idx >= 0)
        confirmedPaths.splice(idx, 1);
    return confirmedPaths;
}
function contentChange(changeInfo) {
    return new Promise((resolve) => {
        let report = `\n==========\nContent Change: pattern='${changeInfo.filePattern}', ${changeInfo.edits.length} edits specified`;
        glob(changeInfo.filePattern, { ignore: excludePattern })
            .then((files) => {
            report += `\n\n  glob("${changeInfo.filePattern}")`;
            report += `\n     glob() => count: ${files.length}`;
            files = checkPaths(files, [__dirname]);
            for (let i = 0; i < files.length; i++)
                report += `\n  [${(i + 1)}] ${files[i]}`;
            const contentChangeRead = [];
            for (let i = 0; i < files.length; i++) {
                contentChangeRead.push(new Promise((resolve) => {
                    fs.readFile(files[i], "utf8", (err, content) => {
                        report += `\n======\nFile #${i + 1}:  fs.readFile('${files[i]}')`;
                        if (err) {
                            report += `\nERROR: ${err.message}`;
                            resolve(report);
                        }
                        else {
                            let changeCount = 0;
                            report += `\n\n File #${i + 1}: '${files[i]}' opened for reading`;
                            for (const edit of changeInfo.edits) {
                                const matches = content.match(edit.from);
                                if (matches == null) {
                                    report += `\n   Not found in content:\n  change '${edit.from}' ->\n  '${edit.to}'`;
                                    continue;
                                }
                                report += `\n   Change pattern found:\n  ${edit.from} ->\n      \`${edit.to}\`` +
                                    `\n           match count = ${matches.length}`;
                                for (let i = 0; i < matches.length; i++)
                                    report += `  [${(i + 1)}] ${matches[i]}`;
                                content = content.replace(edit.from, edit.to);
                                changeCount++;
                            }
                            //		report (header);
                            if (changeCount > 0) {
                                fs.writeFile(files[i], content, "utf8", (err) => {
                                    report += `\nFile #${i + 1}: writeFile(${files[i]}`;
                                    if (err)
                                        report += `\n  ERROR: writing file '${files[i]}'\n    ${err.message}\n`;
                                    else
                                        report += `\n  File #${i + 1}: '${files[i]}' successfully modified`;
                                    resolve(report);
                                });
                            }
                            else
                                resolve(report += `\n  File #${i + 1}: '${files[i]}' no need to modify`);
                        }
                    });
                }));
            }
            Promise.all(contentChangeRead).then(() => {
                resolve(report);
            }).catch((err: unknown) => {
                resolve(err);
            });
        }).catch((err: unknown) => {
            report += `\nERROR: ${err.message}`;
            resolve(report);
        });
    });
}
contentChange({ filePattern: "*.js", edits: JSchanges }).then((response) => {
    console.log(response);
}).catch((err: unknown) => {
    console.log(err);
});
process.chdir(startingExecutionDirectory);
//# sourceMappingURL=importJsQuickFix.js.map