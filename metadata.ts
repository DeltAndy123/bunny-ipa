import * as Plist from "plist";
import { readFileSync } from "fs";

const infoPlist = Plist.parse(readFileSync("discord/Payload/Discord.app/Info.plist", "utf8")) as {[key: string]: any};

console.log(JSON.stringify({
  name: infoPlist.CFBundleName,
  version: infoPlist.CFBundleVersion
}));