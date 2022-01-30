"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUnwanted = exports.sortArt = exports.generateArtPreviews = exports.redditCatchup = exports.dungeonDownload = exports.otherDownload = exports.imaginaryDownload = exports.redditDownload = exports.forbiddenUsers = exports.validTimeValues = void 0;
const utils = require("./utils");
const path = require("path");
const fs = require("fs");
const imaginary_subs_1 = require("./assets/imaginary-subs");
const other_subs_1 = require("./assets/other-subs");
const dungeon_subs_1 = require("./assets/dungeon-subs");
const cleaner_1 = require("./cleaner");
const wallpapers_1 = require("./wallpapers");
exports.validTimeValues = {
    all: "all",
    year: "year",
    month: "month",
    week: "week",
    day: "day"
};
const NASPath = utils.NASPath;
const PicturesPath = `${NASPath}/pictures`;
const ImaginaryNetworkPath = `${PicturesPath}/imaginary-network/`;
const nhDownloadFolder = "K:/_SPECIAL_/zzzDrawings";
const nhUsedFolder = "K:/_SPECIAL_/Drawings";
const forbiddenDomains = ["instagram.fbna1-2.fna.fbcdn.net", "instagram.fbna1-1.fna.fbcdn.net", "youtube.com", "youtu.be", "jp.spankbang.com", "xhamster.com", "xhamster49.com"];
exports.forbiddenUsers = ["GaroShadowscale", "vodcato-ventrexian", "Tundra_Echo", "VedaDragon", "BeardyBennett", "CharmanterPanter", "Ikiera",
    "RedPersik", "TheGamedawg", "Meraugis", "NeoTheProtogen", "SnickerToodles", "UnpaidPigeon", "kazmatazzzz", "Jaybaybay2838",
    "Lovable-Peril", "MagmaHotsguy", "Marmasghetti", "jaco147", "geergutz", "ClayEnchanter", "castass", "ZENRAMANIAC", "KronalgalVas",
    "B0B_22", "Taguel16", "Cab0san", "RowzeiChan", "Hollz23", "TripleA2006", "championsgamer1", "Reykurinn", "AgentB90",
    "comics0026", "AimlessGrace", "axes_and_asses", "ImperatorZor", "HellsJuggernaut", "angelberries", "FoolishMacaroni",
    "nbolen13", "Space_Fox586", "EwokTheGreatPrp", "EmeraldScales", "ClassicFrancois18", "pweavd", "smolb0i", "improy",
    "redcomet0079", "BadSpellign", "Cromwell300", "Meadowlark", "Ambratolm", "Caliglo37", "veronicasylvaxxx", "EmmaStrawberrie", "Galind_Halithel", "adran23452", "CreatureCreator101", "Nyao", "EpicoSama", "infinitypilot", "Complete_Regret7372", "Northern_Hermit", "Person_Maybe", "Soliloquis", "TUG310000", "Philotics", "ArtsArukana", "Rockastorm", "TheLaVeyan", "long_soi", "BBMsReddit", "Multiverse_Queen", "Daily_Scrolls_516", "Darkcasfire", "DoomlightTheSuperior", "TyrannoNinja", "Signal-World-5009", "shuikan", "Ok-Abbreviations-117", "Dyno_Coder", "IvanDFakkov", "Jyto-Radam", "MrCatCZ", "DrSecksy", "Alden_Is_Happy", "Apollo037", "Luftwagen", "pewdiewolf", "RedHood866", "LordWeaselton", "Eden6", "Yepuge", "Spader113", "VorgBardo", "technickr", "TheGeneral1899", "shinarit", "Trigger-red_cannibl", "RobertLiuTrujillo", "okeamu", "MissingAI", "captain_Natjo", "Consistent-Fee3666", "SiarX", "BeepBoopRainbow", "RowzeiChan", "everyteendrama", "WolfGuardia", "BulletBudgie", "HypedGymBro", "Nanduihir", "LenKagamine12", "AnemicIronman", "SeaborderCoast", "SqueakSquawk4", "TheElepehantInDeRoom", "Tackyinbention", "Raptorwolf_AML", "Particular_Fix1211", "scr33ner", "xxxnobitaxxx", "MrZorg58", "jackhammerrrrr", "factory_reset_button", "Neffthecloud", "Careful_Strategy_711", "kaburgadolmasi", "SaltedSam", "Physical-Pizza-5738", "LeviTexmo", "Atrarus", "Modstin", "Foreign-Swan4271", "lightyearshead", "Fair951", "Slbrownfella", "IdeLuis", "Wolfj13", "AthonianTunnelRat", "LyubomirIko", "Freddy994", "swordofsithlord", "ouiouiouiouiouiyes", "Carsteroni", "fufu_ya_scared", "Plupsnup", "droneswarms", "Absent_Alan", "_cerbus_", "Drakeblood2002", "Expert_Moose4467", "Wilsonnera", "TheElephantInDeRoom"];
function redditDownload(folderPath, subreddits, options) {
    const { time, limit, skipExisting, additionalArguments, openFolder, nameFormat } = options;
    const usedTime = time && exports.validTimeValues[time] ? exports.validTimeValues[time] : exports.validTimeValues.all;
    utils.logYellow(`Downloading files from top of ${usedTime}`);
    const usedLimit = limit ? limit : 1000;
    const additional = additionalArguments ? ` ${additionalArguments}` : "";
    const skippedDomains = forbiddenDomains.map(domain => `--skip-domain "${domain}"`).join(" ");
    const skippedUsers = exports.forbiddenUsers.map(user => `--ignore-user "${user}"`).join(" ");
    const skipExistingParam = skipExisting ? "--search-existing" : "";
    const format = nameFormat ? nameFormat : "{SUBREDDIT}_{REDDITOR}_{TITLE}_{POSTID}";
    const logPath = path.join(path.dirname(folderPath), "bdfr_logs");
    if (openFolder) {
        utils.openImageFolder(folderPath);
    }
    utils.execShell(`py -m bdfr download "${folderPath}" \
									--subreddit "${subreddits}" --sort top --no-dupes ${skipExistingParam} \
									--folder-scheme "./" --file-scheme "${format}" \
									${skippedDomains}	${skippedUsers} \
									--log "${logPath}" \
									--max-wait-time 30 --time "${usedTime}" --limit ${usedLimit} --skip "txt" \
									${additional} --verbose`);
}
exports.redditDownload = redditDownload;
function sectionDownload(section, options) {
    const { limit } = options;
    const categories = Object.keys(section);
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const { folderPath, subreddits, limit: categoryLimit } = section[category];
        utils.logLine();
        utils.logBlue(`Downloading ${category}, folder ${i + 1}/${categories.length}`);
        utils.logLine();
        redditDownload(folderPath ? folderPath : path.join(ImaginaryNetworkPath, category), subreddits, { ...options, time: exports.validTimeValues.month, limit: categoryLimit ? categoryLimit : limit, skipExisting: false });
    }
}
function imaginaryDownload() {
    sectionDownload(imaginary_subs_1.subs, { limit: 200, openFolder: true });
}
exports.imaginaryDownload = imaginaryDownload;
;
function otherDownload() {
    sectionDownload(other_subs_1.subs, { limit: 800, openFolder: false, nameFormat: "{SUBREDDIT}_{REDDITOR}_{TITLE}" });
}
exports.otherDownload = otherDownload;
function dungeonDownload() {
    sectionDownload(dungeon_subs_1.subs, { limit: 80, openFolder: true, nameFormat: "{TITLE}" });
}
exports.dungeonDownload = dungeonDownload;
function redditCatchup(folderPath, subredditName, openFolder) {
    redditDownload(folderPath, subredditName, { time: exports.validTimeValues.all, openFolder });
    redditDownload(folderPath, subredditName, { time: exports.validTimeValues.year, openFolder });
    redditDownload(folderPath, subredditName, { time: exports.validTimeValues.month, openFolder });
}
exports.redditCatchup = redditCatchup;
function generateArtPreviews() {
    const folders = fs.readdirSync(nhUsedFolder);
    folders.forEach((folder) => {
        const files = fs.readdirSync(`${nhUsedFolder}/${folder}`);
        if (files.findIndex(file => file.startsWith("folder.jpg")) > -1) {
            console.log("=> folder pic exists already");
            return;
        }
        console.log(utils.separator(18));
        console.log(`${folder}:`);
        console.log(utils.separator(18));
        const originalPictureName = files.find(file => file.startsWith("001"));
        const originalPicture = fs.readFileSync(`${nhUsedFolder}/${folder}/${originalPictureName}`);
        if (!originalPicture) {
            console.error("no picture");
            return;
        }
        fs.writeFileSync(`${nhUsedFolder}/${folder}/folder.jpg`, originalPicture);
        console.log("=> done");
    });
}
exports.generateArtPreviews = generateArtPreviews;
function sortArt() {
    const folders = fs.readdirSync(nhDownloadFolder);
    folders.forEach(async (folder) => {
        const downloadedFolder = path.join(nhDownloadFolder, folder);
        const metadata = await JSON.parse(fs.readFileSync(`${downloadedFolder}/metadata.json`, "utf-8"));
        console.log(folder);
        if (!metadata) {
            console.error(`Missing metadata for ${folder}`);
            return;
        }
        console.log(metadata.title);
        let shortTitle = metadata.title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*]/g, '').replace(/{([^}]+)}/g, '').replace(/\s\s+/g, ' ');
        if (shortTitle.indexOf("|") > -1) {
            shortTitle = shortTitle.split("|")[1];
        }
        let parody = metadata.parody ? `${metadata.parody.join(",")}` : "original";
        if (parody.indexOf("|") > -1) {
            parody = parody.split("|")[0].trim();
        }
        const authors = !metadata.artist ? metadata.group ? metadata.group : ["Unknown"] : metadata.artist.length > 3 ? [metadata.artist[0], metadata.artist[1], metadata.artist[2], "etc"] : metadata.artist;
        let authorsFlat = authors.map(author => author.split("|")[0]).join(",");
        authorsFlat = authorsFlat.charAt(0).toUpperCase() + authors.slice(1);
        const id = metadata.URL.split("/").pop();
        let newTitle = `${authors} - ${shortTitle} (${parody}) [${id}]`;
        newTitle = newTitle.replace(/[/\\?%*:|~"<>]/g, '-').replace(/\s\s+/g, ' ').trim();
        const newPath = path.join(nhUsedFolder, newTitle);
        if (fs.existsSync(newPath)) {
            console.log("=> exists already");
            return;
        }
        console.log("=>" + newTitle);
        console.log(utils.separator(18));
        fs.mkdirSync(newPath);
        const files = fs.readdirSync(downloadedFolder);
        files.forEach((file) => {
            console.log(`${file}...`);
            fs.writeFileSync(path.join(newPath, file), fs.readFileSync(path.join(downloadedFolder, file)));
        });
        utils.logGreen(`Finished migrating ${newTitle}`);
    });
}
exports.sortArt = sortArt;
async function cleanUnwanted() {
    let found = 0;
    let index = 0;
    let folders = (0, wallpapers_1.getImaginaryFolders)();
    folders = folders.concat(Object.keys(other_subs_1.subs).map(key => other_subs_1.subs[key].folderPath));
    folders = folders.concat(Object.keys(dungeon_subs_1.subs).map(key => dungeon_subs_1.subs[key].folderPath));
    folders = folders.concat((0, wallpapers_1.getUpscaleFolders)());
    folders = folders.concat((0, wallpapers_1.getFinalFolders)());
    folders.forEach(async (folderRaw) => {
        index++;
        const folder = folderRaw.replace(/\\/g, "/");
        let folderFound = 0;
        if (!fs.existsSync(folder)) {
            utils.logYellow(`${folder} has not been created yet`);
            return;
        }
        const files = fs.readdirSync(folder);
        files.forEach((file) => {
            let shouldDelete = false;
            if ((folder.indexOf("desk") !== -1)
                && (file.toLowerCase().startsWith("vertical"))) {
                shouldDelete = true;
            }
            else if (file.split("_").length > 1) {
                const begin = file.split("_")[0];
                const shortName = file.replace(begin + "_", "");
                shouldDelete = !!exports.forbiddenUsers.find((user) => { return shortName.startsWith(user); });
            }
            if (!shouldDelete) {
                return;
            }
            utils.deleteFolder(path.join(folder, file));
            found++;
            folderFound++;
        });
        if (folderFound > 0) {
            utils.logGreen(`${index}/${folders.length}: Deleted ${folderFound} from ${path.basename(folder)}`);
        }
        else {
            utils.logYellow(`${index}/${folders.length}: Nothing in ${path.basename(folder)}`);
        }
    });
    utils.logBlue(`Deleted ${found} not so pretty pictures`);
}
exports.cleanUnwanted = cleanUnwanted;
function test() {
    const testFolder = "E:/Pictures/temp";
    const dupes = (0, cleaner_1.deleteDuplicates)(testFolder);
    utils.logYellow("Found this:");
    console.log(dupes);
    return;
}