fs = require("fs");
sharp = require("sharp");
path = require("path");
const { execSync } = require('child_process');

const separatorBase = "--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";

function getFileNameWithoutExtension(fileName) {
	const nameSplit = fileName.split(".");
	nameSplit.pop();
	return nameSplit.join(".");
}

function getListOfFilesWithoutExtension(folderPath) {
	return fs.readdirSync(folderPath).map(getFileNameWithoutExtension);
}

function fileExistsAnyExtension(file, folderPath) {
	const files = getListOfFilesWithoutExtension(folderPath);
	const fileName = getFileNameWithoutExtension(file);

	return files.indexOf(fileName) > -1;
}

function createFolder(folderPath) {
	if (!fs.existsSync(folderPath)){
		logYellow(`=> creating ${folderPath}`);
    	fs.mkdirSync(folderPath);
    }
}

function deleteFolder(folderPath) {
	if (fs.existsSync(folderPath)){
		logYellow(`=> deleting ${folderPath}`);
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}

function isFolder(path) {
	return path.split(".").length === 1;
}

function logBlue(string) {
	console.log('\x1b[96m%s\x1b[0m', string);
}

function logGreen(string) {
	console.log('\x1b[92m%s\x1b[0m', string);
}

function logYellow(string) {
	console.log('\x1b[93m%s\x1b[0m', string);
}

function logRed(string) {
	console.log('\x1b[91m%s\x1b[0m', string);
}

function logLine() {
	console.log(" ");
}

function redString(string) {
	return `\x1b[91m${string}\x1b[0m`
}

function blueString(string) {
	return `\x1b[96m${string}\x1b[0m`
}

function greenString(string) {
	return `\x1b[92m${string}\x1b[0m`
}

function yellowString(string) {
	return `\x1b[93m${string}\x1b[0m`
}

function execShell(command) {
	logLine();
	logYellow(" " + separator(30));
	logLine();
	logYellow(" executing following command:")
	logLine();
	logBlue(" " + command);
	logLine();
	logYellow(" " + separator(30));
	logLine();

	execSync(command, {stdio:[0,1,2]});
}

function separator(length) {
	return separatorBase.substr(0, length);
}

exports.fileExistsAnyExtension = fileExistsAnyExtension;
exports.getFileNameWithoutExtension = getFileNameWithoutExtension;
exports.getListOfFilesWithoutExtension = getListOfFilesWithoutExtension;
exports.isFolder = isFolder;

exports.createFolder = createFolder;
exports.deleteFolder = deleteFolder;

exports.logBlue = logBlue;
exports.logGreen = logGreen;
exports.logYellow = logYellow;
exports.logRed = logRed;
exports.logLine = logLine;

exports.execShell = execShell;
exports.separator = separator;

exports.redString = redString;
exports.yellowString = yellowString;
exports.blueString = blueString;
exports.greenString = greenString;