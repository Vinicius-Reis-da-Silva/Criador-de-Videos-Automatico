 const algorithmia = require('algorithmia');
 const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
 const sentenceBoundaryDetection = require('sbd');

// FUNÇÃO PRINCIPAL DO ROBO DE TEXTO
async function robot(content) {
    // pesquisa o conteudo 
    await fetchContentFromWikipedia(content); 
    // Limpa o conteudo a se pesquisado
    sanitizeContent(content); 
    // separa o texto em sentenças
    breakContentIntoSenteces(content);
    
}

// Função que pesquisa e retira o conteudo do Wikipedia
async function fetchContentFromWikipedia(content){
    // Autentificação no algorithmia com a chave da API
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);

    // Busca o algoritmo no sistema do algorithmia
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');

    // Parsa o conteudo para tentar se pesquisado pelo algoritmio
    const wikipedeiaResponde = await wikipediaAlgorithm.pipe(content.searchTerm);

    // Retorna a conteudo pesquisado
    const wikipediaContent = wikipedeiaResponde.get();

    content.sourceContentOriginal = wikipediaContent.content;

    // console.log(content.wikipediaContentOriginal);
}

// Função para limpa do dados do texto pesquisado
function sanitizeContent(content){
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal);
    const withoutDatesInPatentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);

    content.sourceContentSanitized = withoutDatesInPatentheses;

    // Função remove a linhas em blanco
    function removeBlankLinesAndMarkdown(text){
        // retira os caracteres '\n' (quebra de linha) 
        // e separa em seu lugar a string em substring 
        // dentro de uma array
        const allLines = text.split('\n'); 

        // filtra em todas as linhas e identifica quais então em branco ou estão com marcação MarkDown
        const withoutBlankLinesAndMarkdown = allLines.filter( (line) => {
            if(line.trim().length === 0 || line.trim().startsWith('=')){ // caso se esteja em blanco ou com markdown então filtra
                return false;
            }{ // caso contrario mantei a linha original
                return true
            }
        });

        // junta todos o elemento em uma unica string com espaco em blanco entre elas
        return withoutBlankLinesAndMarkdown.join(" ");  
    }

    // Função de retirar data com parentens
    function removeDatesInParentheses(text){
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }
}

// Função para quebra o texto em sentencas
function breakContentIntoSenteces(content) {
    content.sentences = [];
    
    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);

    // Faz iterração para cada sentenca
    sentences.forEach( (sentence) => {
        // adiciona na estrutura de dados do conteudo
        content.sentences.push({
            text: sentence, // inicializa o objeto e atribui o texto da sentenca
            keywords: [], // inicializa o objeto de palavras chaves 
            images: [] // inicializa o objeto de imgens de referencia
        });
    });
    
}

// exportação da função robot p/ usar em arquivos externos
module.exports = robot;