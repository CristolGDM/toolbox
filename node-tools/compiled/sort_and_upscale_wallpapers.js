"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.downscale = exports.sortAll = exports.upscale = exports.checkDuplicates = void 0;
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const utils = require("./utils");
const upscaler = require("./upscaler");
const wallpaperFolder = "E:/Pictures/Wallpapers";
const mobileFolder = "E:/Pictures/Wallpapers mobile";
const imaginaryFolder = "E:/Pictures/Imaginary Network";
const wallpaperTemp = "E:/Pictures/zzzWallpapers temp";
const mobileTemp = "E:/Pictures/zzzWallpapers mobile temp";
const outputFinal = "E:/Pictures/Wallpapers final";
const outputMobile = "E:/Pictures/Wallpapers mobile final";
const wallpaperToUpscale = "E:/Pictures/zzzWallpapers temp-toscale";
const wallpaperToUpscaleMobile = "E:/Pictures/zzzWallpapers mobile temp-toscale";
const wallpaperToConvert = "E:/Pictures/zzzWallpapers temp-upscaled";
const wallpaperToConvertMobile = "E:/Pictures/zzzWallpapers mobile temp-upscaled";
const outputDownscale = "E:/Pictures/zzzWallpapers to downscale";
const outputMobileDownscale = "E:/Pictures/zzzWallpapers mobile to downscale";
const forbiddenExtensions = ["mp4", "gif", "mkv", "m4u", "txt", "avi"];
const knownDupesPath = "E:/Pictures/knownDupes.json";
function fileAlreadyExists(fileName, files) {
    const fileNameCleaned = utils.getFileNameWithoutExtension(fileName);
    return files.indexOf(fileNameCleaned) > -1;
}
function checkDuplicates() {
    let duplicates = 0;
    const finalFiles = utils.getListOfFilesWithoutExtension(outputFinal).concat(utils.getListOfFilesWithoutExtension(outputMobile));
    const tempFiles = utils.getListOfFilesWithoutExtension(wallpaperTemp).concat(utils.getListOfFilesWithoutExtension(mobileTemp));
    for (let i = 0; i < tempFiles.length; i++) {
        const element = tempFiles[i];
        if (finalFiles.indexOf(element) > -1) {
            duplicates++;
        }
    }
    console.log(`Found ${duplicates} dupes`);
}
exports.checkDuplicates = checkDuplicates;
;
async function upscale() {
    await upscaler.upscaleFolder(wallpaperTemp, upscaler.models.uniscaleRestore, outputDownscale, 3840);
    await upscaler.upscaleFolder(mobileTemp, upscaler.models.lollypop, outputMobileDownscale, null, 2400);
    utils.logGreen("________");
    utils.logGreen("Finished upscaling");
}
exports.upscale = upscale;
;
async function sortAll() {
    const knownDupesRaw = fs.readFileSync(knownDupesPath, "utf8");
    const knownDupes = await JSON.parse(knownDupesRaw);
    let foundDupes = 0;
    utils.createFolder(wallpaperTemp);
    utils.createFolder(mobileTemp);
    const imaginaryFolders = fs.readdirSync(imaginaryFolder).filter((folder) => {
        return folder.indexOf(".") === -1 && folder.indexOf("_logs") === -1;
    });
    imaginaryFolders.push(wallpaperFolder, mobileFolder);
    let files = utils.getListOfFilesWithoutExtension(outputFinal)
        .concat(utils.getListOfFilesWithoutExtension(outputMobile))
        .concat(utils.getListOfFilesWithoutExtension(wallpaperTemp))
        .concat(utils.getListOfFilesWithoutExtension(mobileTemp));
    for (let f = 0; f < imaginaryFolders.length; f++) {
        const folder = imaginaryFolders[f];
        const folderLog = `[${f + 1}/${imaginaryFolders.length}] ${folder}`;
        if (folder.indexOf(".") > -1 || folder.indexOf("bdfr_logs") > -1 || folder.indexOf("test_logs") > -1) {
            continue;
        }
        utils.logLine();
        utils.logBlue("------------------------------------------------------");
        utils.logBlue(`Sorting ${folder} folder...`);
        utils.logBlue("------------------------------------------------------");
        utils.logLine();
        const folderPath = path.join(imaginaryFolder, folder);
        const images = fs.readdirSync(folderPath);
        await Promise.all(images.map(async (image, index) => {
            if (image.startsWith("ImaginaryHorrors_")) {
                console.log("don't want those, skipping");
                return;
            }
            if (image.split(".").length === 1) {
                console.log(`=> is a folder, skipping`);
                return;
            }
            if (forbiddenExtensions.some((extension) => { return image.endsWith(extension); })) {
                utils.logYellow("=> wrong file extension, skipping");
                return;
            }
            let imageName = path.join(imaginaryFolder, folder, image);
            if (image.endsWith("unknown_video") || image.endsWith("UNKNOWN_VIDEO")) {
                utils.logRed(`=> cleaning unknown video format`);
                const imageNameWithRealExtension = utils.getFileNameWithoutExtension(image) + ".png";
                fs.renameSync(imageName, path.join(imaginaryFolder, folder, imageNameWithRealExtension));
                image = imageNameWithRealExtension;
                imageName = path.join(imaginaryFolder, folder, imageNameWithRealExtension);
            }
            if (image.length > 200) {
                utils.logRed(`=> shortening long name`);
                const shortenedImageName = image.substring(0, 100) + image.substring(image.length - 100);
                fs.renameSync(imageName, path.join(imaginaryFolder, folder, shortenedImageName));
                image = shortenedImageName;
                imageName = path.join(imaginaryFolder, folder, shortenedImageName);
            }
            if (fileAlreadyExists(image, files)) {
                console.log("=> Already exists, skipping");
                return;
            }
            if (knownDupes[utils.getFileNameWithoutExtension(image)]) {
                utils.logRed(`=> is known duplicate`);
                foundDupes++;
                return;
            }
            await sharp(imageName)
                .metadata()
                .then(({ width, height }) => {
                console.log(`${folderLog} - ${index} out of ${images.length}: ${image}`);
                if (width / 4 >= height / 3) {
                    if (width < 1300 || height < 500) {
                        console.log("=> too small, skipping");
                        return;
                    }
                    utils.logGreen("=> moving to desktop");
                    fs.writeFileSync(path.join(wallpaperTemp, image), fs.readFileSync(path.join(folderPath, image)));
                }
                else if (height / 4 >= width / 3) {
                    if (height < 800 || width < 300) {
                        console.log("=> too small, skipping");
                        return;
                    }
                    utils.logGreen("=> moving to mobile");
                    fs.writeFileSync(path.join(mobileTemp, image), fs.readFileSync(path.join(folderPath, image)));
                }
                else {
                    console.log("=> wrong ratio, skipping");
                }
            })
                .catch((error) => {
                utils.logRed(utils.separator(12));
                utils.logRed("Error happened");
                if (error) {
                    utils.logRed(error);
                }
                utils.logRed(utils.separator(12));
                return;
            });
            ;
        }));
    }
    utils.logBlue("------------------------------");
    utils.logBlue(`Ignored ${foundDupes} duplicates`);
    utils.logBlue("------------------------------");
    return;
}
exports.sortAll = sortAll;
async function downscaleDesktop() {
    await upscaler.downscaleFolder(outputDownscale, outputFinal, 3840, 2160);
}
async function downscaleMobile() {
    await upscaler.downscaleFolder(outputMobileDownscale, outputMobile, 1080, 2400);
}
async function downscale() {
    utils.createFolder(outputFinal);
    utils.createFolder(outputMobile);
    downscaleDesktop().then(async () => {
        utils.logLine();
        utils.logGreen(utils.separator(30));
        utils.logGreen("Finished downscaling desktop folder");
        utils.logGreen(utils.separator(30));
        utils.logLine();
        downscaleMobile().then(() => {
            utils.logLine();
            utils.logGreen(utils.separator(30));
            utils.logGreen("Finished downscaling mobile folder");
            utils.logGreen(utils.separator(30));
            utils.logLine();
        });
    });
}
exports.downscale = downscale;
async function convert() {
    upscaler.convertFolderToJpg(wallpaperToConvert, outputDownscale).then(() => {
        upscaler.convertFolderToJpg(wallpaperToConvertMobile, outputMobileDownscale);
    });
}
exports.convert = convert;
