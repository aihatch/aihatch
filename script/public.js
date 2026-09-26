const fs = require('fs');
const { deleteDisk } = require("oipage/nodejs/disk/index.js");

fs.copyFileSync('./public/logo.png', './dist/logo.png');

// 删除release
console.log("\n >>> 打包前环境重置 release <<< \n");

try {
    deleteDisk("./release");
} catch (e) { }

console.log("\n\n");