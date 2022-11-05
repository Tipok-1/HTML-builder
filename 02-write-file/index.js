const path = require('path');
const fs = require('fs/promises');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

fs.access(path.resolve(__dirname,'text.txt'), fs.F_OK)
.then(() => {
    let str = 'Дозаписать данные в файл ';
    input(str);
})
.catch(() => {
    fs.open(path.resolve(__dirname,'text.txt'), 'w')
    .then(()=>{
        let str = 'Введите данные для записи в файл ';
        input(str);
    })
    .catch(err=>console.log(err))
});
function input(str){
    rl.question(str, (data) => { 
        check_exit(data);
    });
}
function check_exit(data){
    if(data == 'exit')
    {
        rl.close();
    }
    else{
        fs.appendFile(path.resolve(__dirname,'text.txt'), data,{encoding: 'utf-8'});
    }
}
rl.on('line',(data)=>{
    check_exit(data);
})
rl.on('close',()=>{
    console.log('Ввод завершён');
})