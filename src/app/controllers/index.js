//esse arquivo eh pra precisar ficar importando cada controller no index principal

const fs = require('fs');
const path = require('path');

module.exports = app => {
    fs
        .readdirSync(__dirname)
        .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))//procurar por arquivos dentro da pasta que n começam com ponto e n são index
        .forEach(file => require(path.resolve(__dirname, file))(app));
};