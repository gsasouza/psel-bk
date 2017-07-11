const app = require('express')(),
  five = require('johnny-five'),
  http = require('http').Server(app), 
  io = require('socket.io')(http);

const levelController = require('./controllers/levelController.js');
const temperatureController = require('./controllers/temperatureController.js');
const env =  process.env.NODE_ENV;
const port = process.env.PORT || 3000;
const serialPort = {port: process.env.SERIALPORT};
let board = {}; 
if(process.env.SERIALPORT !== "null") board = new five.Board(serialPort);
else board = new five.Board();

let maintainLevelValue = -1;

function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}

board.on('ready', ()=>{ 

  /** INICIALIZAÇÃO DOS SENSORES */
  const [levelUp, levelDown, levelSensor] = [
    new five.Relay({pin: 13, type: 'NC'}),
    new five.Relay({pin: 12, type: 'NC'}),
    new five.Sensor({pin: 'A0', freq: 1000})];
  const [tempInt, tempExt, tempPeltier, relayPeltier, currentPeltier] = [
    new five.Thermometer({controller: "LM35",pin: "A1"}),
    new five.Thermometer({controller: "LM35",pin: "A2"}),
    new five.Thermometer({controller: "LM35",pin: "A3"}),
    new five.Relay({pin: 11, type: 'NC'}),
    new five.Sensor({pin: 'A4', freq: 1000})];


  /** WEBSOCKET PARA COMUNICAÇÃO COM A PÁGINA EM TEMPO REAL*/
  io.on('connection', function(socket){
    /** FAZ O CONTROLE DO NIVEL */
    socket.on('level', (data)=>{
      if(data.maintain && data.maintain !== maintainLevelValue) maintainLevelValue = data.maintain;
      if(data.up || data.down) maintainLevelValue = -1;
      levelController.manageLevel(data, levelUp, levelDown, levelSensor, maintainLevelValue, socket);
    });

    /** ENVIA O ESTADO DOS SENSORES ASSIM QUE A PÁGINA É ABERTA */
    levelController.getLevelInfo(levelSensor, levelDown, levelUp, maintainLevelValue, socket);    
    temperatureController.getTempValue(tempExt, tempInt, tempPeltier, currentPeltier, socket);
    
    /** ATUALIZA O VALOR DO NÍVEL DO TANQUE */
    levelSensor.on('change', function(){
      const value = env === 'development' ? randomIntFromInterval(0, 1000) : levelController.hexToDec(this.raw);
      if(maintainLevelValue !== -1) levelController.maintainLevel(levelUp, levelDown, value, maintainLevelValue);
      socket.emit('level', {level: value, maintain: maintainLevelValue});
    });
    /** ATUALIZA OS VALORES DE TEMPERATURA*/    
    tempExt.on('change', function(){
      const value = env === 'development' ? randomIntFromInterval(15, 30) : this.value.toFixed();
      socket.emit('temperature', {tempExt: value});
    });
    tempInt.on('change', function(){
      const value = env === 'development' ? randomIntFromInterval(5, 15) : this.value.toFixed();
      socket.emit('temperature', {tempInt: value});
    });
    tempPeltier.on('change', function(){
      const value = env === 'development' ? randomIntFromInterval(-7, -5) : this.value.toFixed();
      temperatureController.maintainTempPeltier(tempPeltier, currentPeltier, relayPeltier, this);
      socket.emit('temperature', {tempPeltier: value});
    }); 
    currentPeltier.on('change', function(){
      const value = env === 'development' ? randomIntFromInterval(1, 6) : this.value;
      socket.emit('temperature', {currentPeltier: value});      
    })
       
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
  app.get('/help', (req,res)=>{
    res.sendFile(__dirname + '/views/help.html');
  })
  app.get('/styles.css', (req, res)=>{
    res.sendFile(__dirname + '/public/css/styles.css');
  });
  app.use(function(req, res, next) {
    res.status = 404;
    res.send("Not Found!");
  });

  /**SERVER LISTENER */
  http.listen(port, function(){
    console.log('listening on : ' + port);
  });
});
