import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';
import clear from 'rollup-plugin-clear';
import scss from 'rollup-plugin-scss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import eslint from '@rollup/plugin-eslint';
const pkg = require('./package.json');

export default async function config() {
  return {
    input: 'src/index.ts',
    output: [
      {
        file: `dist/${pkg.name}.esm.js`,
        format: 'esm',
        sourcemap: true,
        globals: {
          vue: 'Vue',
        },
      },
      {
        file: `dist/${pkg.name}.js`,
        format: 'cjs',
        sourcemap: true,
        globals: {
          vue: 'Vue',
        },
      },
    ],
    plugins: [
      scss({
        output: `dist/${pkg.name}.css`
      }),
      eslint({
        throwOnError: true,
      }),
      vue(),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
          include: null,
        },
      }),
      peerDepsExternal(),
      clear({
        targets: ['./dist'],
      }),
    ],
  };
}




