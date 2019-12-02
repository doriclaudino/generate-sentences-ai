var Sentencer = require('sentencer');
var faker = require('faker');
var request = require("request");
const mock = require('./ma-principals-cities')

const WIT_API_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
const cities = mock.cities

faker.locale = "en_US";

//0 or 1 
const maybe = () => Math.round(Math.random())
const getItem = (array) => array[Math.floor(Math.random() * array.length)];

Sentencer.configure({
    nounList: [`quarto`, `studio`, `casa`, `basement`],
    adjectiveList: [`Primeiro e ultimo mes`, `Pessoa solteira sem vicios`, `Para solteiro`, `somente mulher`, `vaga para 1 carro na garagem`, `Para 1 ou 2 pessoas sem vicios`, `Reformado e muito limpo`, `otima casa`, `nao aceita criancas`, `Todas as Conta da casa inclusas`, `otima localização`, `despesas incluidas`, `tem laundry`, `com parking`],
    actions: {
        city: function () {
            return getItem(cities)
        },
        initialSentence: function () {
            let options1 = [`quarto`, `studio`, `casa`, `basement`]
            let options2 = [`Estou alugando ${getItem(options1)}`, `Alugo ${getItem(options1)}`, `Disponivel ${getItem(options1)} para aluguel`, `Tenho um ${getItem(options1)} disponivel`]
            let choose = getItem(options2)
            return choose
        },
        maybePrice: function (min = 500, max = 1500) {
            if (!maybe())
                return ''
            let options = ['valor para casal', 'valor']
            let price = Math.floor(Math.random() * (max - min)) + min;
            let choose = getItem(options)
            return `${choose} $${price}.`
        },
        maybePhoneNumber: function () {
            if (!maybe())
                return ''
            let options = ['falar com', 'entrar em contato com', 'msg para', 'ligar para', 'meu contato']
            let choose = getItem(options)
            let phone = faker.phone.phoneNumberFormat()
            return `${choose} ${phone}.`
        }
    }
});

var phrase = Sentencer.make("{{ initialSentence }} em {{ city }}. {{maybePrice}}{{ adjective }}, {{ adjective }} {{maybePhoneNumber}}")
let extractCity = / em (.{3,23})\. .*$/gmi
let extractNumber = / (\d{3,}.*)\.$/gmi

let resultCity = extractCity.exec(phrase)
let resultNumber = extractNumber.exec(phrase)

let entities = [{
    "entity": "intent",
    "value": "OFFERING_RENT"
}]

if (resultCity && resultCity[1]) {
    let value = resultCity[1]
    let start = resultCity.input.indexOf(value)
    let end = resultCity.input.indexOf(value) + value.length
    let proof = resultCity.input.slice(start, end)
    let entry = {
        entity: "wit$location",
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
 *  for i in {1..5}; do node index.js ; sleep 2; done
 */

// console.log(`curl -XPOST 'https://api.wit.ai/samples?v=20170307' -H "Authorization: Bearer ${WIT_API_KEY}" -H "Content-Type: application/json" -d '${JSON.stringify(request_body)}'`)