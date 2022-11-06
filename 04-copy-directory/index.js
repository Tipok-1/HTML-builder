const path = require('path');
const fs = require('fs/promises');

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

fs.mkdir(path.join(__dirname, "files-copy"),{recursive:true})
.then((ph)=>{
    let files_copy_path = ph !=undefined ? ph : path.join(__dirname, "files-copy");
    return copyFiles_from_dir(path.join(__dirname, "files"), files_copy_path);
})
.then(()=>{
    return check_remove_files(path.join(__dirname, "files"), path.join(__dirname, "files-copy"));
})
.then(()=>{
    console.log('Сopying was successful')
})
.catch((err)=>{
    console.log(err);
})
