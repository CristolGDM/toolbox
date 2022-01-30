"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downscaleFolder = exports.upscalePS2 = exports.upscalePSX = exports.convertFolderToJpg = exports.upscaleFolder = exports.getTempScaleFolderName = exports.upscaleFolderToOutput = exports.models = void 0;
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const utils = require("./utils");
exports.models = {
    nickelback: "4x_NickelbackFS_72000_G.pth",
    nmkd: "4x_NMKD-Superscale-SP_178000_G.pth",
    lady: "Lady0101_208000.pth",
    uniscaleRestore: "4x-UniScale_Restore.pth",
    lollypop: "lollypop.pth",
    remacri: "4x_foolhardy_Remacri.pth",
    ultrasharp: "4x-UltraSharp.pth",
    universal: "4x_UniversalUpscalerV2-Neutral_115000_swaG.pth",
    universalSharp: "4x_UniversalUpscalerV2-Sharp_101000_G.pth",
    universalSharper: "4x_UniversalUpscalerV2-Sharper_103000_G.pth"
};
function upscaleFolderToOutput(inputPath, outputPath, modelName, useTransparency) {
    const usedModel = modelName ? modelName.endsWith(".pth") ? modelName : `${modelName}.pth` : exports.models.universalSharp;
    const transparentParameters = useTransparency ? " --ternary-alpha --alpha-mode alpha_separately" : "";
    utils.execShell(`python L:\\Downloads\\esrgan\\upscale.py "L:\\Downloads\\esrgan\\models\\${usedModel}" --input "${inputPath}" --output "${outputPath}" --skip-existing --verbose ${transparentParameters} -fp16`);
}
exports.upscaleFolderToOutput = upscaleFolderToOutput;
function getTempScaleFolderName(originalFolderName) {
    return `${originalFolderName}-toscale`;
}
exports.getTempScaleFolderName = getTempScaleFolderName;
async function upscaleFolder(inputPath, modelName, outputPath, minWidth, minHeight) {
    if (inputPath.endsWith("-toscale") || inputPath.endsWith("-upscaled")) {
        return;
    }
    utils.logLine();
    const desiredWidth = minWidth ? minWidth : 3840;
    const toUpscalename = getTempScaleFolderName(inputPath);
    const upscaledFolderName = `${inputPath}-upscaled`;
    const actualOutput = outputPath ?? upscaledFolderName;
    utils.createFolder(toUpscalename);
    utils.createFolder(actualOutput);
    utils.logLine();
    const images = fs.readdirSync(inputPath);
    const toUpscaleImages = fs.readdirSync(toUpscalename).map(utils.getFileNameWithoutExtension);
    const upscaledImages = fs.readdirSync(actualOutput).map(utils.getFileNameWithoutExtension);
    const doneImages = fs.readdirSync(actualOutput).map(utils.getFileNameWithoutExtension);
    await Promise.all(images.map(async (imageName, index) => {
        if (imageName.endsWith(".txt")) {
            return;
        }
        const nameWithoutExtension = utils.getFileNameWithoutExtension(imageName);
        if (utils.isFolder(imageName)) {
            return;
        }
        if (toUpscaleImages.indexOf(nameWithoutExtension) > -1 || upscaledImages.indexOf(nameWithoutExtension) > -1 || doneImages.indexOf(nameWithoutExtension) > -1) {
            utils.logYellow(`${index + 1} out of ${images.length}: ${nameWithoutExtension} already exists, skipping`);
            return;
        }
        await sharp(path.join(inputPath, imageName))
            .metadata()
            .then(({ width, height }) => {
            console.log(`${index + 1} out of ${images.length}: ${imageName}`);
            const shouldUpscale = minHeight ? height < minHeight : width < desiredWidth;
            if (!shouldUpscale) {
                console.log(`=> moving to upscaled folder`);
                fs.writeFileSync(path.join(actualOutput, imageName), fs.readFileSync(path.join(inputPath, imageName)));
            }
            else {
                console.log(`=> moving to upscale folder`);
                fs.writeFileSync(path.join(toUpscalename, imageName), fs.readFileSync(path.join(inputPath, imageName)));
            }
        });
    }));
    utils.logLine();
    upscaleFolderToOutput(toUpscalename, actualOutput, modelName);
    utils.logLine();
    utils.logLine();
    utils.logGreen(`Finished upscaling ${inputPath}`);
    return;
}
exports.upscaleFolder = upscaleFolder;
async function convertFolderToJpg(inputFolder, outputFolder) {
    utils.logLine();
    utils.logGreen("________");
    utils.logGreen(`Converting ${inputFolder} to Jpg`);
    utils.logGreen("________");
    utils.logLine();
    if (!fs.existsSync(inputFolder)) {
        utils.logYellow(`${inputFolder} doesn't exist`);
        return;
    }
    utils.createFolder(outputFolder);
    const images = fs.readdirSync(inputFolder);
    const existingFiles = utils.getListOfFilesWithoutExtension(outputFolder);
    await Promise.all(images.map(async (image, index) => {
        const imageName = utils.getFileNameWithoutExtension(image);
        const indexText = `${index + 1}/${images.length}`;
        if (utils.isFolder(image)) {
            utils.logYellow(`=> ${indexText} is a folder, skipping`);
            return;
        }
        if (existingFiles.indexOf(imageName) > -1) {
            utils.logBlue(`=> ${indexText} already exists, skipping`);
            return;
        }
        if (!(image.endsWith(".png") || image.endsWith(".webp") || image.endsWith(".bmp"))) {
            utils.logBlue(`=> ${indexText} cannot be converted, moving as is`);
            fs.writeFileSync(path.join(outputFolder, image), fs.readFileSync(path.join(inputFolder, image)));
            return;
        }
        await sharp(path.join(inputFolder, image))
            .toFormat("jpeg")
            .jpeg({
            force: true,
        })
            .toFile(path.join(outputFolder, imageName + ".jpg"))
            .then(() => {
            console.log(`Converting image ${utils.yellowString(indexText)}: ${image}`);
            utils.logGreen("=> converted to jpg");
        });
    }));
    return;
}
exports.convertFolderToJpg = convertFolderToJpg;
async function upscalePSX(gameName) {
    const folderLocation = "R:/Emulation/PSX";
    const dumpFolder = `${folderLocation}/${gameName}-texture-dump`;
    const targetFolder = `${folderLocation}/${gameName}-texture-replacements`;
    const tempFolder = `${folderLocation}/${gameName}-texture-temp`;
    utils.createFolder(dumpFolder);
    utils.createFolder(targetFolder);
    utils.createFolder(tempFolder);
    const images = fs.readdirSync(dumpFolder);
    const existing = fs.readdirSync(targetFolder);
    for (let i = 0; i < images.length; i++) {
        const imageName = images[i];
        if (existing.indexOf(imageName) > -1) {
            continue;
        }
        console.log(`${i + 1} out of ${images.length}: ${imageName}`);
        console.log("=> Moving to upscale folder");
        fs.writeFileSync(path.join(tempFolder, imageName), fs.readFileSync(path.join(dumpFolder, imageName)));
    }
    upscaleFolderToOutput(tempFolder, targetFolder, exports.models.lady, true);
    utils.deleteFolder(tempFolder);
}
exports.upscalePSX = upscalePSX;
async function upscalePS2(gameName) {
    const folderLocation = "R:/PCSX2 1.7.0 dev";
    const dumpFolder = `${folderLocation}/textures/${gameName}/dumps`;
    const targetFolder = `${folderLocation}/textures/${gameName}/replacements`;
    const tempFolder = `${folderLocation}/textures/${gameName}/temp`;
    utils.createFolder(dumpFolder);
    utils.createFolder(targetFolder);
    utils.createFolder(tempFolder);
    const images = fs.readdirSync(dumpFolder);
    const existing = fs.readdirSync(targetFolder);
    for (let i = 0; i < images.length; i++) {
        const imageName = images[i];
        if (existing.indexOf(imageName) > -1) {
            continue;
        }
        console.log(`${i + 1} out of ${images.length}: ${imageName}`);
        console.log("=> Moving to upscale folder");
        fs.writeFileSync(path.join(tempFolder, imageName), fs.readFileSync(path.join(dumpFolder, imageName)));
    }
    upscaleFolderToOutput(tempFolder, targetFolder, exports.models.lady, true);
    utils.deleteFolder(tempFolder);
}
exports.upscalePS2 = upscalePS2;
async function downscaleFolder(inputPath, outputPath, width, height) {
    let x = 1;
    utils.createFolder(outputPath);
    const targetFiles = fs.readdirSync(inputPath);
    const doneFiles = fs.readdirSync(outputPath);
    await Promise.all(targetFiles.map(async (file) => {
        try {
            if (doneFiles.indexOf(file) > -1) {
                x++;
                return;
            }
            await sharp(path.join(inputPath, file))
                .on("error", (err) => {
                utils.logRed("on error");
                utils.logRed(err.message);
            })
                .resize(width, height, { fit: "outside" })
                .toFile(path.join(outputPath, file))
                .then(() => {
                utils.logYellow(`Downscaled ${x}/${targetFiles.length}: ${file}`);
                x++;
            });
        }
        catch (error) {
            utils.logRed("error catch");
            utils.logRed(`while downscaling ${x}/${targetFiles.length}: ${file}`);
            utils.logRed(error);
        }
    }));
}
exports.downscaleFolder = downscaleFolder;