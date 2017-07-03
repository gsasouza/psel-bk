const express = require('express'),
  bodyParser = require('body-parser'),  
  path = require('path'),
  app = express(),
  port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');


app.get('/', (req, res)=>{
    res.send('Home');
});

app.get('/temperature', (req, res)=>{
    res.send('Temperatura');
});

app.get('/level', (req,res)=>{
    res.send('Nível');
});

app.get('/informations', (req, res)=>{
    res.send('Informações Técnicas');
});


app.use(function(req, res, next) {
  res.status = 404;
  res.send("Not Found!");
});

app.listen(port, function () {
  console.log('Server is running on PORT: ' + port);
});


