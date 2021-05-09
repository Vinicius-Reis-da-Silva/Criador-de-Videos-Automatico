const fs = require('fs');
const contentFilePath = './content.json';

// Função p/ salva em um arquivo JSON a estrutura de dados da variavel content
function save(content){
    const contentString = JSON.stringify(content); 
    return fs.writeFileSync(contentFilePath, contentString);
}

// Função para ler os dados  arquivo salvo
function load(){
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8');
    const contentJson = JSON.parse(fileBuffer);
    return contentJson;
}

module.exports = {
    save,
    load
}