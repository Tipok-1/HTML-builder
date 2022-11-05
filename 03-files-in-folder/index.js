const path = require('path');
const fs = require('fs/promises');

async function getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));

    return Array.prototype.concat(...files);
}
getFiles(path.resolve(__dirname,"secret-folder"))
.then((files)=>{
    files.forEach(async element => {
        let stat = await fs.stat(element);
        let name = path.basename(element).replace(/\.[^/.]+$/, "");
        let ext = path.basename(element).match(/\.([^.]+)$|$/)[1];
        console.log(`${name} - ${ext} - ${stat.size} байт`);
    });
})