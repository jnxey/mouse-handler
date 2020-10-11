import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import alias from '@rollup/plugin-alias';
import { eslint } from 'rollup-plugin-eslint';
import path from 'path';

const rootPath = path.resolve(__dirname);

export default {
  // 入口
  input: 'src/index.js',
  // 出口
  output: {
    // 出口目录
    file:
      process.env.NODE_ENV === 'development' ? 'dist/UseDragSort.dev.js' : 'dist/UseDragSort.js',
    // 全局变量名字
    name: 'useMouse',
    // 模块规范
    format: 'umd',
    // es6 -> es5-
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    process.env.NODE_ENV === 'development'
      ? serve({
          open: true,
          openPage: '/public/index.html',
          port: 3000,
          contentBase: ''
        })
      : null,
    alias({
      entries: [{ find: '@', replacement: path.resolve(rootPath, 'src') }]
    }),
    eslint()
  ]
};
