var Sentencer = require('sentencer');
var faker = require('faker');
var request = require("request");
const mock = require('./ma-principals-cities')

const WIT_API_KEY = 'xxxxxxxxxxxxxxxxx'
const cities = mock.cities

faker.locale = "en_US";

//0 or 1 
const maybe = () => Math.round(Math.random())
const getItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandom = (min = 500, max = 1500) => Math.floor(Math.random() * (max - min)) + min

Sentencer.configure({
    actions: {
        city_prefix: function () {
            let local = ['moro em', `sou de`]
            return getItem(local)
        },
        maybeGreetings: function () {
            if (!maybe())
                return ''
            let options1 = [`boa noite`, `bom dia`, `ola`]
            let choose = getItem(options1)
            return choose
        },
        mainAction: function () {
            let option1 = [`help fixo`, `help`, `fixo`, `help amanha`, `help ou fixo`]
            let option2 = [`de limpeza`, `em restaurante`, `na carpintaria`, `na pintura`, `em mecanica`, `full time`, `na area da pintura`, `na area da carpintaria`, `em qualquer area`]
            let action = [`estou disponivel ${getItem(option1)}`, `Disponível para ${getItem(option1)}`, `Disponível pra ${getItem(option1)}`, `procuro trabalho ${getItem(option2)}`, `Estou precisando trabalhar`, `Caso alguém precise de HELPER`, `To precisando de trabalho`, `procuro partime`]
            return getItem(action)
        },
        maybeMoreDescription: function (min = 2, max = 8) {
            if (!maybe())
                return ''
            let options = [`sou muito dedicado`, `aprendo rapido`, `tenho experiencia`, `Várias referências`, `caprichosa`, `ágil`,
                `Tenho minhas ferramentas`,
                `siding`, `framing`, `finish`, `pintura`, `plaster`, `drywall`, `labor`, `demolição`,
                `tenho carro`,
                `possuo carro`,
                `precisando muito trabalhar`,
                `referencia`,
                `Desde já agradeço`,
                `se alguem souber mim avisa`,
                `falo inglês fluênte`
            ]
            let counts = getRandom(2, 8)
            let arrOpcionais = []
            for (let index = 0; index < counts; index++) {
                arrOpcionais.push(getItem(options))
            }
            let str = arrOpcionais.join(', ')
            return ` ${str}.`
        },
        maybePhoneNumber: function () {
            if (!maybe())
                return ''
            let lastLocale = faker.locale
            faker.locale = "pt_BR";
            let name = faker.name.firstName()
            faker.locale = lastLocale;
            let options = [`meu nome é ${name} Tel:`, `${name} contato`, 'Contato:', `${name}`]
            let choose = getItem(options)
            let phone = faker.phone.phoneNumberFormat()
            return `${choose} ${phone}.`
        }
    }
});


let city = getItem(cities)
var phrase = Sentencer.make(`{{ maybeGreetings }} {{ mainAction }}{{ maybeMoreDescription }} {{ city_prefix }} ${city} {{maybePhoneNumber}}`)
let extractNumber = / (\d{3,}.*)\.$/gmi

console.log(phrase)

let resultNumber = extractNumber.exec(phrase)

let entities = [{
    "entity": "intent",
    "value": "ask_job"
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
 *  for i in {1..30}; do node ask_job.js ; sleep 2; done
 */


/**
 * add more options
 * 
 * curl -XPOST 'https://api.wit.ai/entities/local?v=20170307' -H 'Authorization: Bearer TSFAYRGK34S5QGCVKGP3PP3W5PU6F7Y6' -H 'Content-Type: application/json'  -d '{"value":"Agawam"}'
 * 
 **/