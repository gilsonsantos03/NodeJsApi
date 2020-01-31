const express = require('express');
const bodyParser = require('body-parser'); 

const app = express(); 

app.use(bodyParser.json()); //para que entenda qdo for enviada uma requisição
app.use(bodyParser.urlencoded({extended: false})); //para que entenda for for passado parâmetros via url para que seja decodados

/*
request - dados da requisição
response - o objeto utilizado para enviar alguma resposta pro usuário quando ele acessar essa rota
app.get('/',(request, response) => {
    response.send("OKaaaa!");
});
*/

require('./app/controllers/index')(app);

app.listen(3000);