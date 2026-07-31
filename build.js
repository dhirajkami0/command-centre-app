const fs = require("fs-extra");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { minify } = require("terser");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

const BUILD_VERSION = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .substring(0, 14);

console.log("");
console.log("======================================");
console.log("   GreenGuard Production Builder");
console.log("======================================");
console.log("Build Version :", BUILD_VERSION);
console.log("");
/*==================================================
  CLEAN DIST
==================================================*/

fs.removeSync(DIST);
fs.ensureDirSync(DIST);

/*==================================================
  FOLDERS TO SKIP
==================================================*/

const SKIP_FOLDERS = new Set([
    "dist",
    "node_modules",
    ".git",
    ".github",
    "functions"
]);

/*==================================================
  FILES TO SKIP
==================================================*/

const SKIP_FILES = new Set([

    "build.js",
    "obfuscate.js",

    "package.json",
    "package-lock.json",

    "firebase.json",
    ".firebaserc",

    ".gitignore",
    ".gitattributes",

    "README.md"

]);
/*==================================================
  THIRD PARTY LIBRARIES
  (These are copied but NOT obfuscated)
==================================================*/

const VENDOR_KEYWORDS = [

    "leaflet",
    "turf",
    "firebase",
    "jsts",

    "chart",
    "proj4",
    "proj4leaflet",

    "markercluster",
    "omnivore",
    "pip",

    "bootstrap",
    "jquery",
    "axios",
    "moment",

    "pdf",
    "pdfmake",
    "xlsx",
    "zip",

    "hammer",
    "anime",
    "sortable",
"polyline",
"leaflet.draw",
"leaflet.markercluster",
"leaflet-routing",
"leaflet-omnivore",
"leaflet-pip",

"esri",

"rbush",
"supercluster",
"pmtiles",
"maplibre",

"georaster",
"geoblaze",
"geotiff",
"openlayers",
    "lz-string"

];

/*==================================================
  CHECK IF JS FILE IS A THIRD-PARTY LIBRARY
==================================================*/

function isVendor(file) {

    const name = path.basename(file).toLowerCase();

    return VENDOR_KEYWORDS.some(keyword =>
        name.includes(keyword)
    );

}

/*==================================================
  COPY PROJECT TO DIST
==================================================*/

function copyRecursive(src, dst) {

    const stat = fs.statSync(src);

    if (stat.isDirectory()) {

        const folder = path.basename(src);

        if (SKIP_FOLDERS.has(folder))
            return;

        fs.ensureDirSync(dst);

        const files = fs.readdirSync(src);

        for (const file of files) {

            copyRecursive(
                path.join(src, file),
                path.join(dst, file)
            );

        }

        return;

    }

    const fileName = path.basename(src);

if (fileName.startsWith(".")) {
    return;
}

if (SKIP_FILES.has(fileName))
    return;

    fs.copyFileSync(src, dst);

}

/*==================================================
  OBFUSCATE + MINIFY JAVASCRIPT
==================================================*/

async function processJS(folder) {

    const items = fs.readdirSync(folder);

    for (const item of items) {

        const fullPath = path.join(folder, item);

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {

            await processJS(fullPath);
            continue;

        }

const lower = item.toLowerCase();
if (lower.endsWith(".map")) {
    fs.removeSync(fullPath);
    console.log("REMOVE     :", item);
    continue;
}
if (!lower.endsWith(".js"))
    continue;

if (lower.endsWith(".min.js")) {

    console.log("COPY       :", item);

    continue;

}
        if (isVendor(fullPath)) {

            console.log("COPY       :", item);
            continue;

        }

        console.log("OBFUSCATE  :", item);

        try {

            const source = fs.readFileSync(fullPath, "utf8");

const obfuscated = JavaScriptObfuscator.obfuscate(source, {

    compact: true,

    controlFlowFlattening: false,

      

    stringArray: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayEncoding: ["base64"],

    numbersToExpressions: true,

    simplify: true,

    

    renameGlobals: false,

    deadCodeInjection: false,

selfDefending: false,

disableConsoleOutput: false

});            const minified = await minify(
                obfuscated.getObfuscatedCode(),
                {
                    compress: true,
                    mangle: true,
                    format: {
                        comments: false
                    }
                }
            );

            fs.writeFileSync(
                fullPath,
                minified.code,
                "utf8"
            );

        }
        catch (err) {

            console.error("FAILED     :", item);
            console.error(err.message);

        }

    }

}
/*==================================================
  MAIN BUILD
==================================================*/

(async () => {

    const startTime = Date.now();

    try {

        console.log("Cleaning & Copying Project...\n");

        copyRecursive(ROOT, DIST);

        const jsFolder = path.join(DIST, "js");

        if (fs.existsSync(jsFolder)) {

            console.log("\nProcessing JavaScript...\n");

            await processJS(jsFolder);

        } else {

            console.log("WARNING : dist/js not found");

        }

        /*------------------------------------------
          Update Service Worker Version
        ------------------------------------------*/

        const swFile = path.join(DIST, "sw.js");

        if (fs.existsSync(swFile)) {

            let sw = fs.readFileSync(swFile, "utf8");

            sw = sw.replace(
                /(CACHE_VERSION\s*=\s*['"`]).*?(['"`])/,
                `$1${BUILD_VERSION}$2`
            );

            sw = sw.replace(
                /(CACHE_NAME\s*=\s*['"`]).*?(['"`])/,
                `$1GreenGuard-${BUILD_VERSION}$2`
            );

            fs.writeFileSync(swFile, sw, "utf8");

            console.log("UPDATED : sw.js");

        }

        /*------------------------------------------
          Build Report
        ------------------------------------------*/

        const report = {

            application: "GreenGuard",

            version: BUILD_VERSION,

            buildDate: new Date().toISOString(),

            nodeVersion: process.version,

            platform: process.platform,

            buildTimeSeconds:
                ((Date.now() - startTime) / 1000).toFixed(2)

        };

        fs.writeJsonSync(

            path.join(DIST, "build-info.json"),

            report,

            {
                spaces: 2
            }

        );

        console.log("");

        console.log("======================================");
        console.log("      BUILD SUCCESSFUL");
        console.log("======================================");

        console.log("Version :", BUILD_VERSION);

        console.log(
            "Time    :",
            ((Date.now() - startTime) / 1000).toFixed(2),
            "sec"
        );

        console.log("");

        console.log("Output :");

        console.log(DIST);

        console.log("");

    }
    catch (err) {

        console.log("");

        console.log("======================================");
        console.log(" BUILD FAILED");
        console.log("======================================");

        console.error(err);

    }

})();