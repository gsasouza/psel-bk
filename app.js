const express = require('express'),
  path = require('path'),
  app = express(),
  five = require('johnny-five'),
  board = new five.Board(),
  io = require('socket-io'),
  port = process.env.PORT || 8080;

/*
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
*/

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');

board.on('ready', ()=>{
  //config    
  let tempSensor = new five.Thermometer({
    controller: 'LM35',
    pin: 'A0'
  });
  let [valveUp, valveDown] = [new five.Led(13), new five.Led(12)];



/** WEBSOCKET */
io.on('connection', (socket)=>{
  socket.on('valveUp', (data)=>{
    valveUp.on();
    valveDown.off();
  });
  socket.on('valveDown', (data)=>{
    valveUp.off();
    valveDown.on();
  });
  socket.on('valveMaintain', (data)=>{
    valveUp.off();
    valveDown.off();
  });
})
/** ROUTES */
  app.get('/', (req, res)=>{
      res.redirect('/home');
  });
  app.get('/home', (req, res)=>{
      res.render('home.pug');
  });
  app.get('/temperature', (req, res)=>{
      res.render('temperature.pug');
  });
  app.get('/level', (req,res)=>{
      res.render('level.pug');
  });
  app.get('/informations', (req, res)=>{
      res.render('informations.pug');
  });
  app.use(function(req, res, next) {
    res.status = 404;
    res.send("Not Found!");
  });
  

  /** LISTEN */
  app.listen(port, function () {
    console.log('Server is running on PORT: ' + port);
  });

})




