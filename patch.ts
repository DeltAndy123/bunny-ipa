import * as plist from "plist";
import AdmZip from "adm-zip";
import { readFileSync, copyFileSync, writeFileSync } from "fs";

// File Tree:
// ├── patch.ts
// ├── icons
// │   ├── SunsetIcon60x60@2x.png
// │   └── SunsetIcon76x76@2x~ipad.png
// └── discord.ipa

// Step 1: Extract discord.ipa
// Step 2: Add icons to Payload/Discord.app
// Step 3: Modify Info.plist
//  - Modify icons ([CFBundleIcons, CFBundleIcons~ipad].CFBundlePrimaryIcon.[CFBundleIconName, CFBundleIconFiles])
//  - Modify CFBundleName and CFBundleDisplayName to "Sunset"
//  - Enable viewing Documents folder in Files app (UISupportsDocumentBrowser and UIFileSharingEnabled)

console.log("Extracting discord.ipa");
const zip = new AdmZip("discord.ipa");
zip.extractAllTo("discord");
console.log("Extracted discord.ipa");

console.log("Adding icons to Payload/Discord.app");
copyFileSync("icons/SunsetIcon60x60@2x.png", "discord/Payload/Discord.app/SunsetIcon60x60@2x.png");
copyFileSync("icons/SunsetIcon76x76@2x~ipad.png", "discord/Payload/Discord.app/SunsetIcon76x76@2x~ipad.png");
console.log("Added icons to Payload/Discord.app");

console.log("Modifying Info.plist");
const infoPlist = plist.parse(readFileSync("discord/Payload/Discord.app/Info.plist", "utf8")) as {[key: string]: any};
console.log("Renaming app to 'Sunset'")
infoPlist.CFBundleName = "Sunset";
infoPlist.CFBundleDisplayName = "Sunset";
console.log("Replacing icons");
infoPlist.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconName = "SunsetIcon";
infoPlist.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles = ["SunsetIcon60x60"];
infoPlist["CFBundleIcons~ipad"].CFBundlePrimaryIcon.CFBundleIconName = "SunsetIcon";
infoPlist["CFBundleIcons~ipad"].CFBundlePrimaryIcon.CFBundleIconFiles = ["SunsetIcon60x60", "SunsetIcon76x76"];
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