const fs = require('fs-extra');
const path = require('path');

const aliases = ['library', 'transformer', 'interfaces', 'compiler', 'types'];

aliases
    .map((alias) => path.resolve(__dirname, `../${alias}`))
    .forEach((alias) => {
        if (fs.existsSync(alias)) {
            fs.removeSync(alias);
        }
        fs.ensureDirSync(alias);
    });

aliases.forEach((alias) => {
    const pkgManifest = {
        name: `semble-ts/${alias}`,
        types: `../dist/types/${alias}/index.d.ts`,
        main: `../dist/cjs/${alias}/index.js`,
        module: `../dist/esm5/${alias}/index.js`,
        es2015: `../dist/esm/${alias}/index.js`,
        sideEffects: false
    };

    fs.writeJSON(path.resolve(__dirname, `../${alias}/package.json`), pkgManifest, { spaces: 2 });
});
