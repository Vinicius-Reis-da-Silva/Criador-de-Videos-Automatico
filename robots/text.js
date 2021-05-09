 const algorithmia = require('algorithmia');
 const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
 const sentenceBoundaryDetection = require('sbd');

// Criado uma instancia do Watson IBM
// Objeto para autentificação da API do Watson IBM
const { IamAuthenticator } = require('ibm-watson/auth'); 
// importa chave da API
const watsonApiKey = require('../credentials/watson-nlu.json').apikey; 
 // importa o modulo do Natural Language Understanding
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
// Chaamada de CallBack do Natural Language Understanding
const nlu = new NaturalLanguageUnderstandingV1({
    authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
    version: '2018-04-05',
    serviceUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com'
});


const state = require('./state.js'); 

// FUNÇÃO PRINCIPAL DO ROBO DE TEXTO
async function robot() {
    const content = state.load(); // carrega os dados
    
    // pesquisa o conteudo 
    await fetchContentFromWikipedia(content); 
    // Limpa o conteudo a se pesquisado
    sanitizeContent(content); 
    // separa o texto em sentenças
    breakContentIntoSenteces(content);
    // limita o número maximo de sentenças
    limitMaximumSentences(content);
    // pegar as palavras chaves de todas a sentençãs
    await fetchKeywordsOfAllSentences(content);

    state.save(content); // salva o dados
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

// Função que pegar as sentencas do array de sentencas da posição 0 até a posição do valor de maximumSentences
function limitMaximumSentences(content){
    content.sentences = content.sentences.slice(0, content.maximumSentences);
}

// Função busca as palavras chaves de cada sentencas do array de sentencas
async function fetchKeywordsOfAllSentences(content){
    let mat =  content.sentences;
    
    for(const sentence of mat){
        sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }

    content.sentences = mat;
    //console.log(JSON.stringify(mat, null,2));
}

// Função para encontrar as palavras chaves das sentencas
async function fetchWatsonAndReturnKeywords(sentence){
    
    return new Promise( (resolve, reject) => {
        nlu.analyze({
                text: sentence, // Buffer or String
                features: {
                    keywords: {}
                }
            })
            .then(response => {
                // Faz a busca na estrutura e retira somente o texto da palavra chave e passa p/ um array todas as palavras chaves
                const keywords = response.result.keywords.map((keyword) => {
                    return keyword.text;
                });
                
                // retorna o array de palavras chaves
                resolve(keywords); 
                
            })
            .catch(err => {
                reject(err);
                console.log('error: ', err);
            });
            
    });
}


// exportação da função robot p/ usar em arquivos externos
module.exports = robot;