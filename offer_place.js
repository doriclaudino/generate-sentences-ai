var Sentencer = require('sentencer');
var faker = require('faker');
var request = require("request");
const mock = require('./ma-principals-cities')

const WIT_API_KEY = 'xxxxxxxxxxxxxxxxxxxxx'
const cities = mock.cities

faker.locale = "en_US";

//0 or 1 
const maybe = () => Math.round(Math.random())
const getItem = (array) => array[Math.floor(Math.random() * array.length)];
const getPrice = (min = 500, max = 1500) => Math.floor(Math.random() * (max - min)) + min

Sentencer.configure({
    actions: {
        city_prefix: function () {
            let local = ['em', 'localizado em']
            return getItem(local)
        },
        initialSentence: function () {
            let options1 = [`quarto`, `studio`, `basement`]
            let options2 = [`quarto`, `studio`, `basement`, `casa`]
            let initial = [`${getItem(options2)} para alugar`, `alugo um  ${getItem(options1)}`, `alugo ${getItem(options2)}`, `${getItem(options2)} disponível`, `estou alugando uma casa`, `estou alugando um ${getItem(options1)}`, `Estamos com um ${getItem(options1)}`, `Aluga-se ${getItem(options2)}`, `Aluga-se um ${getItem(options1)}`, `Aluga se um ${getItem(options1)}`, `Aluga se ${getItem(options2)}`]
            let choose = getItem(initial)
            return choose
        },
        maybeMoreDescription: function () {
            if (!maybe())
                return ''
            let options = [`Primeiro e ultimo mes`, `Pessoa solteira sem vicios`, `Para solteiro`, `somente mulher`, `vaga para 1 carro na garagem`, `Para 1 ou 2 pessoas sem vicios`, `Reformado e muito limpo`, `otima casa`, `nao aceita criancas`, `Todas as Conta da casa inclusas`, `otima localização`, `despesas incluidas`, `tem laundry`, `com parking`, 'próximo dá estação', 'proximo a estacao de trem', 'tudo incluído', 'água', 'luz', 'internet', 'Quarto já tem cama', 'máquina de lavar e secar', 'vaga para carro', 'ambiente familiar', 'Tudo incluso', 'Quarto já tem cama', 'só p mulher', 'Casal ou duas pessoas', 'com laundry', 'SEM DEPÓSITO', 'pra solteiro ou casal', 'Ja disponivel', 'ja esta disponivel']
            let arrOpcionais = [getItem(options), getItem(options), getItem(options)]
            let str = arrOpcionais.join(', ')
            return ` ${str}.`
        },
        maybePrice: function (min = 500, max = 1500) {
            if (!maybe())
                return ''
            let options = [`para casal $${getPrice()} solteiro $${getPrice()}`, `valor $${getPrice()}`]
            let choose = getItem(options)
            return ` ${choose}.`
        },
        maybePhoneNumber: function () {
            if (!maybe())
                return ''
            let options = [`falar com ${faker.name.firstName()}`, `entrar em contato com ${faker.name.firstName()}`, 'msg para', `ligar para ${faker.name.firstName()}`, 'meu contato', 'Ligar para detalhes', 'Somente text please', 'telefone', 'Contato', 'Mais detalhes', 'Contato:']
            let choose = getItem(options)
            let phone = faker.phone.phoneNumberFormat()
            return ` ${choose} ${phone}.`
        }
    }
});


let city = getItem(cities)
var phrase = Sentencer.make(`{{ initialSentence }} {{ city_prefix }} ${city}.{{ maybeMoreDescription }}{{maybePrice}}{{maybePhoneNumber}}`)
let extractNumber = / (\d{3,}.*)\.$/gmi

console.log(phrase)

let resultNumber = extractNumber.exec(phrase)

let entities = [{
    "entity": "intent",
    "value": "offer_place"
}]

if (city) {
    let value = city
    let start = phrase.indexOf(value)
    let end = start + value.length
    let proof = phrase.slice(start, end)
    let entry = {
        entity: "local",
        start,
        end,
        value: proof
    }
    entities.push(entry)
}

if (resultNumber && resultNumber[1]) {
    let value = resultNumber[1]
    let start = resultNumber.input.indexOf(value)
    let end = resultNumber.input.indexOf(value) + value.length
    let proof = resultNumber.input.slice(start, end)
    let entry = {
        entity: "wit$phone_number",
        start,
        end,
        value: proof
    }
    entities.push(entry)
}

const request_body = [{
    "text": phrase,
    entities
}]

var options = {
    method: 'POST',
    url: 'https://api.wit.ai/samples',
    qs: {
        v: '20170307'
    },
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + WIT_API_KEY
    },
    body: request_body,
    json: true
};

console.log(JSON.stringify(request_body))
request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body)
});

/**
 * loop
 *  for i in {1..30}; do node index.js ; sleep 2; done
 */


/**
 * add more options
 * 
 * curl -XPOST 'https://api.wit.ai/entities/local?v=20170307' -H 'Authorization: Bearer TSFAYRGK34S5QGCVKGP3PP3W5PU6F7Y6' -H 'Content-Type: application/json'  -d '{"value":"Agawam"}'
 * 
 **/