const fs = require("fs");
const path = require("path");
const JavaScriptObfuscator = require("javascript-obfuscator");

const SOURCE = path.join(__dirname, "js");
const OUTPUT = path.join(__dirname, "dist", "js");

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function obfuscateFolder(src, dst) {

    ensureDir(dst);

    const files = fs.readdirSync(src);

    for (const file of files) {

        const srcPath = path.join(src, file);
        const dstPath = path.join(dst, file);

        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {

            obfuscateFolder(srcPath, dstPath);

        } else if (file.endsWith(".js")) {

            console.log("Obfuscating:", srcPath);

            const code = fs.readFileSync(srcPath, "utf8");

            const result =
                JavaScriptObfuscator.obfuscate(code, {

                    compact: true,

                    controlFlowFlattening: true,

                    controlFlowFlatteningThreshold: 0.75,

                    deadCodeInjection: true,

                    deadCodeInjectionThreshold: 0.4,

                    stringArray: true,

                    stringArrayEncoding: ["base64"],

                    stringArrayShuffle: true,

                    stringArrayThreshold: 1,

                    renameGlobals: false,

                    selfDefending: true,

                    simplify: true,

                    splitStrings: true,

                    splitStringsChunkLength: 8,

                    transformObjectKeys: true,

                    unicodeEscapeSequence: false

                });

            fs.writeFileSync(
                dstPath,
                result.getObfuscatedCode()
            );

        } else {

            fs.copyFileSync(srcPath, dstPath);

        }
    }
}

ensureDir(path.join(__dirname, "dist"));

obfuscateFolder(SOURCE, OUTPUT);

console.log("");
console.log("==================================");
console.log(" Finished!");
console.log(" Output:");
console.log(" dist/js/");
console.log("==================================");