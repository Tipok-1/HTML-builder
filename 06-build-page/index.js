const path = require('path');
const fs = require('fs/promises');

/*COPY THE FILE template.html AND REPLACE THE TAGS */
async function copy_index_file(file,dest_dir){
    let file_data = await fs.readFile(file,{encoding:'utf-8'});
    let arr = file_data.split('\n');
    for(let i =0; i < arr.length; i++)
    {
        if(arr[i].indexOf('{{') != -1)
        {
            let name = (arr[i].slice(arr[i].indexOf('{{')+2, arr[i].indexOf('}}')));
            let fl_data = await fs.readFile(path.resolve(__dirname, 'components', `${name}.html`),{encoding:'utf-8'});
            arr[i] = arr[i].split("")
            let indent = arr[i].slice(0,arr[i].indexOf('{'));
            fl_data = fl_data.split('\n');
            fl_data =  fl_data.map((el)=>{
                return el = indent.join('') + el;
            })
            fl_data = fl_data.join('\n');
            arr[i].splice(0,arr[i].length, fl_data + '\n');
            arr[i] = arr[i].join("");
        }
    }
    await fs.open(path.resolve(dest_dir, 'index.html'),'w')
    .then((hund)=>{
        hund.appendFile(arr);
    })
}
/*========================================*/
/*COLECT STYLES*/
async function getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        if(!dirent.isDirectory())
        {
            return res;
        }
    }));

    return Array.prototype.concat(...files);
}

async function collect_styles(arr){
    let [hundle,files] = arr;
    files.forEach(async(element) => {
        if(path.extname(element) == '.css')
        {
            let info = await fs.readFile(element,{encoding:'utf-8'});
            hundle.appendFile(info +'\n', {encoding:'utf-8'});
        }
    });
}
/*=========================================*/
/*COPY DIR assets*/
async function copyFiles_from_dir(src,dest){
    const dirents = await fs.readdir(src, { withFileTypes: true });

    await Promise.all(dirents.map((dirent) => {
        if(dirent.isDirectory())
        {
            fs.mkdir(path.join(dest, dirent.name),{recursive:true})
            .then(()=>{
                return copyFiles_from_dir(path.resolve(src, dirent.name),path.resolve(dest, dirent.name));
            })
        }
        else{
            fs.copyFile(path.resolve(src, dirent.name),path.resolve(dest, dirent.name));
        }
    }));
}

async function delete_dir(dir){
    const files = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(files.map((el)=>{
        if(el.isDirectory())
        {
            return delete_dir(path.resolve(dir,el.name));
        }
        else{
            fs.unlink(path.resolve(dir,el.name));
        }
    }))
    await fs.rmdir(dir);
}
async function check_remove_files(src,dest){
    const dest_dirents = await fs.readdir(dest, { withFileTypes: true });
    await Promise.all(dest_dirents.map((el)=>{
        fs.stat(path.resolve(src, el.name))
        .then(()=>{
            if(el.isDirectory())
            {
                return check_remove_files(path.resolve(src, el.name),path.resolve(dest, el.name));
            }
        })
        .catch(()=>{
            if(!el.isDirectory())
            {
                fs.unlink(path.resolve(dest,el.name));
            }
            else{
                delete_dir(path.resolve(dest,el.name));
            }
        })
    }))
}
/*======================================= */

fs.mkdir(path.resolve(__dirname, "project-dist"),{recursive:true})
.then(()=>{
    return copy_index_file(path.resolve(__dirname, "template.html"),path.resolve(__dirname, "project-dist"))
})
.then(()=>{
/*CREATE STYLE DIR*/
    return fs.open(path.resolve(__dirname,"project-dist","style.css"),'w')
})
.then((hundle)=>{
    return Promise.all([
        hundle,
        getFiles(path.resolve(__dirname,'styles'))
    ])
})
.then((arr)=>{
    return collect_styles(arr);
})
.then(()=>{
/*COPY DIR*/
    return fs.mkdir(path.join(__dirname, "project-dist","assets"),{recursive:true})
})
.then((ph)=>{
    let files_copy_path = ph !=undefined ? ph : path.join(__dirname, "project-dist","assets");
    return copyFiles_from_dir(path.join(__dirname, "assets"), files_copy_path);
})
.then(()=>{
    return check_remove_files(path.join(__dirname, "assets"), path.join(__dirname, "project-dist","assets"));
})
.then(()=>{
    console.log('Project successfully built');
})
.catch((err)=>{
    console.log("Error: ");
    console.log(err);
})