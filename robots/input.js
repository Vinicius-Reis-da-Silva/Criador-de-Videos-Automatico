const readline = require('readline-sync');
const state = require('./state');

function robot(){
    // Conteúdo p/ pesquisar
    const content = {
        maximumSentences: 7
    }; 
    
    // Cria as probriedade com o resultado do conteúdo para se pesquisa 
    content.searchTerm = askAndReturnSearchTerm(); // Termo p/ pesquisa
    content.prefix = askAndReturnPrefix(); // Prefixo do termo p/ se pequisado
    state.save(content); // Salva o unput do usuário

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
}

module.exports = robot;