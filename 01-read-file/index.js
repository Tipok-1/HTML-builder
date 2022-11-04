const path = require('path');
const fs = require('fs');

let filename = path.resolve(__dirname, 'text.txt');
//console.log(filename);
let readStream = fs.createReadStream(filename,{encoding: 'utf-8'});
readStream.on('readable', function(){
    let data = readStream.read();
    if(data != null){console.log(data);}
});
readStream.on('error', function(err) {
    console.log(`Возникла ошибка\n ${err}`);
  });
