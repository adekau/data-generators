import * as esbuild from 'esbuild';

async function build(esbuild, project, additionalOpts) {
    try {
        await esbuild.build({
            entryPoints: ['index.ts'],
            outdir: 'lib',
            bundle: true,
            minify: true,
            platform: 'neutral',
            splitting: true,
            packages: 'external',
            target: 'node16',
            treeShaking: true,
            tsconfig: '../../tsconfig.json',
            ...additionalOpts
        });

        console.log(`Built ${project} successfully.`);
    } catch {
        console.error('Failed to build.');
        process.exit(1);
    }
}

build(esbuild, 'core');
