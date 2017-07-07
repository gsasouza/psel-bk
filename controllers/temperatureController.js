const env = process.env.NODE_ENV;

function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}

exports.getTempValue = function(tempExt, tempInt, tempPeltier, currentPeltier, socket){
  const result = {};
  const mock = { // MOCK
    tempExt: randomIntFromInterval(15, 30),
    tempInt: randomIntFromInterval(5, 15),
    tempPeltier: randomIntFromInterval(-7, -5), 
    currentPeltier: randomIntFromInterval(1, 6)
  };
  if(env === 'development') return socket.emit('temperature', mock);

  tempExt.on('change', function(){
    result.tempExt = this.value.toFixed();
    tempInt.on('change', function(){
      result.tempInt = this.value.toFixed();
      tempPeltier.on('change', function(){
        result.tempPeltier = this.value.toFixed();
        currentPeltier.on('change', function(){
          result.currentPeltier = this.analog();
          return socket.emmit('temperature', result); // VALOR MEDIDO PELO ARDUINO EM TODOS OS SENSORES
        });
      });
    });
  });
  
}
exports.maintainTempPeltier = function(tempPeltier, currentPeltier, relayPeltier, temperature){
  if(temperature.celsius !== -6){
    if(this.celsius > -6) relayPeltier.on();
    else relayPeltier.off();
  }
}

