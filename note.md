# 初始化构建项目

```
npm i --save-dev rollup @babel/core @babel/preset-env rollup-plugin-babel rollup-plugin-serve @rollup/plugin-alias rollup-plugin-eslint eslint babel-eslint cross-env
```

- rollup javascript 打包工具，只打包 javascript，打包的结果相对简单

- @babel/core Babel 是一个工具链，主要用于将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。

- @babel/preset-env 这个 Babel 插件可以将高版本 Javascript 打包成低版本的 javascript

- rollup-plugin-babel 将 rollup 与 Babel 结合

- rollup-plugin-serve 利用 rollup 开启一个静态服务

- @rollup/plugin-alias 设置路径别名

- rollup-plugin-eslint 打包时进行 eslint 检查

- eslint 代码质量检查 `npm run lint`

- babel-eslint eslint 解析器

- cross-env 设置环境变量

---

注：vscode 需要安装 prettier 与 eslint 插件，vscode 插件配置在.vscode/settings.json 文件中

## prettier 配置示例

[prettier 官网](https://prettier.io/)

## eslint 配置示例

[eslint 官网](https://eslint.org/)
