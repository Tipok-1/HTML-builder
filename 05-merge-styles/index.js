const path = require('path');
const fs = require('fs/promises');

async function getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        if(!dirent.isDirectory())
        {
            return res;
        }
        //return dirent.isDirectory() ? getFiles(res) : res;
    }));

    return Array.prototype.concat(...files);
}

fs.open(path.resolve(__dirname,"project-dist","bundle.css"),'w')
.then((hundle)=>{
    return Promise.all([
        hundle,
        getFiles(path.resolve(__dirname,'styles'))
    ])
})
.then((arr)=>{
    let [hundle,files] = arr;
    files.forEach(async(element) => {
        if(path.extname(element) == '.css')
        {
            let info = await fs.readFile(element,{encoding:'utf-8'});
            hundle.appendFile(info, {encoding:'utf-8'});
        }
    });
})
.catch(err=>console.log(err))
