readline = require('readline-sync');

function start(){
    const searchComplete = {}; // Conteúdo p/ pesquisar

    // Cria as probriedade com o resultado do conteúdo para se pesquisa 
    searchComplete.searchTerm = askAndReturnSearchTerm(); // Termo p/ pesquisa
    searchComplete.prefix = askAndReturnPrefix(); // Prefixo do termo p/ se pequisado


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

    console.log(searchComplete);
}

start();