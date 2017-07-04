const app = require('express')(),
  five = require('johnny-five'),
  http = require('http').Server(app),
  board = new five.Board(),
  io = require('socket.io')(http);

const levelController = require('./controllers/levelController.js');
const temperatureController = require('./controllers/temperatureController.js');

board.on('ready', ()=>{ 

  /** INICIALIZAÇÃO DOS SENSORES */
  const [levelUp, levelDown, levelSensor] = [new five.Pin(13), new five.Pin(12), new five.Sensor('A0')];
  const [tempInt, tempExt, tempPeltier] = [
    new five.Thermometer({controller: "LM35",pin: "A1"}),
    new five.Thermometer({controller: "LM35",pin: "A2"}),
    new five.Thermometer({controller: "LM35",pin: "A3"})]
  const currentPeltier = new five.Pin(11); 
  let maintainLevelValue = -1;


  /* CONTROLE DE TEMPERATURA NO PELTIER */
  temperatureController.maintainTemp(tempPeltier, currentPeltier);

  /** WEBSOCKET PARA COMUNICAÇÃO COM A PÁGINA EM TEMPO REAL*/
  io.on('connection', function(socket){
    /** FAZ O CONTROLE DO NIVEL */
    socket.on('level', (data)=>{
      levelController.manageLevel(data, levelUp, levelDown, maintainLevelValue, levelSensor);
    });

    /** ENVIA O ESTADO DOS SENSORES ASSIM QUE A PÁGINA É ABERTA */
    socket.emit('level', levelController.getLevelInfo(levelSensor, maintainLevelValue));
    socket.emit('temperature', temperatureController.getTempValue(tempExt, tempInt, tempPeltier, currentPeltier));
    
    /** VERIFICA SE HOUVE MUDANÇA DE TEMPERATURA */
    tempExt.on('change', ()=> {
      socket.emit('temperature', temperatureController.getTempValue(tempExt, tempInt, tempPeltier, currentPeltier));
    });
    tempInt.on('change', ()=> {
      socket.emit('temperature', temperatureController.getTempValue(tempExt, tempInt, tempPeltier, currentPeltier));
    });
    tempPeltier.on('change', ()=> {
      socket.emit('temperature', temperatureController.getTempValue(tempExt, tempInt, tempPeltier, currentPeltier));
    });    
  });

  /** ROUTES */
  app.get('/', (req, res)=>{
    res.redirect('/home');
  });
  app.get('/home', (req, res)=>{
    res.sendFile(__dirname + '/views/home.html');
  });    
  app.get('/temperature', (req, res)=>{
    res.sendFile(__dirname + '/views/temperature.html');
  });
  app.get('/informations', (req, res)=>{
    res.sendFile(__dirname + '/views/informations.html');
  });      
  app.get('/level', function(req, res){
    res.sendFile(__dirname + '/views/level.html');
  });
  app.get('/styles.css', (req, res)=>{
    res.sendFile(__dirname + '/public/css/styles.css');
  });
  app.use(function(req, res, next) {
    res.status = 404;
    res.send("Not Found!");
  });

  /**SERVER LISTENER */
  http.listen(3000, function(){
    console.log('listening on *:3000');
  });
});
