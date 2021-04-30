const readline = require('readline-sync');
const robots = {
    text: require('./robots/text.js'), 
}


async function start(){
    const content = {}; // Conteúdo p/ pesquisar

    // Cria as probriedade com o resultado do conteúdo para se pesquisa 
    content.searchTerm = askAndReturnSearchTerm(); // Termo p/ pesquisa
    content.prefix = askAndReturnPrefix(); // Prefixo do termo p/ se pequisado

    await robots.text(content);

    // Função de termo para à se pesquisado
    function askAndReturnSearchTerm(){
        return readline.question('Type a wikipedeia search term: ');
    }

    // Função de prefixo p/ se pesquisado
    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Chose one option: ');
        const selectedPrefixText = prefixes[selectedPrefixIndex];

        return selectedPrefixText;
    }

    console.log(content);
}

start();