const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

fs.readdirSync(path.resolve('./modules')).filter(async function (file) {
    if (fs.statSync(path.resolve('./modules', file)).isDirectory()) {
        const dir = path.resolve('./modules', file);
        console.log('Initialize module ' + file);
        exec(`cd ${dir} && npm i && npm run build`, (err, stdout, stderr) => {
            if (err) {
                console.error('Node could not exec ', `cd ${dir} && npm i && npm run build`)
                return;
            }

            console.log('Initialize of ' + file + ' successed');
        });
    }
});