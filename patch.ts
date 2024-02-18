import * as plist from "plist";
import AdmZip from "adm-zip";
import { readFileSync, copyFileSync, writeFileSync, readdirSync } from "fs";
import consts from "./constants";

// File Tree:
// ├── patch.ts
// ├── icons
// │   └── ...
// └── discord.ipa

// Step 1: Extract discord.ipa
// Step 2: Add icons to Payload/Discord.app
// Step 3: Modify Info.plist
//  - Modify icons ([CFBundleIcons, CFBundleIcons~ipad].CFBundlePrimaryIcon.[CFBundleIconName, CFBundleIconFiles])
//  - Modify CFBundleName and CFBundleDisplayName
//  - Enable viewing Documents folder in Files app (UISupportsDocumentBrowser and UIFileSharingEnabled)

console.log("Extracting discord.ipa");
const zip = new AdmZip("discord.ipa");
zip.extractAllTo("discord");
console.log("Extracted discord.ipa");

console.log("Adding icons to Payload/Discord.app");
readdirSync("icons").forEach((icon) => {
  copyFileSync(`icons/${icon}`, `discord/Payload/Discord.app/${icon}`);
});
console.log("Added icons to Payload/Discord.app");

console.log("Modifying Info.plist");
const infoPlist = plist.parse(readFileSync("discord/Payload/Discord.app/Info.plist", "utf8")) as {[key: string]: any};
console.log(`Renaming app to '${consts.MOD_NAME}'`)
infoPlist.CFBundleName = consts.MOD_NAME;
infoPlist.CFBundleDisplayName = consts.MOD_NAME;
console.log("Replacing icons");
infoPlist.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconName = consts.ICON_NAME;
infoPlist.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles = consts.ICON_FILES;
infoPlist["CFBundleIcons~ipad"].CFBundlePrimaryIcon.CFBundleIconName = consts.ICON_NAME;
infoPlist["CFBundleIcons~ipad"].CFBundlePrimaryIcon.CFBundleIconFiles = consts.ICON_FILES_IPAD;
console.log("Enabling viewing Documents folder in Files app");
infoPlist.UISupportsDocumentBrowser = true;
infoPlist.UIFileSharingEnabled = true;

const modifiedInfoPlist = plist.build(infoPlist);
writeFileSync("discord/Payload/Discord.app/Info.plist", modifiedInfoPlist);
console.log("Modified Info.plist");


console.log("Packaging modified discord.ipa");
const newZip = new AdmZip();
newZip.addLocalFolder("discord/Payload", "Payload");
newZip.writeZip("Patched.ipa");
console.log("Modified discord.ipa packaged as Patched.ipa");
console.log("Done!");