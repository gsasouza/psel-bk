const env = process.env.NODE_ENV;

function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}

const getLevelInfo = function(levelSensor, levelDown, levelUp, maintainLevelValue, socket){  
  const result = {};
  const mock = { // MOCK
    level: randomIntFromInterval(0, 1000),
    levelDown: 'off',
    levelUp: 'off',
    maintain: maintainLevelValue
  };
  if(env === 'development') return socket.emit('level', mock);
  
  levelSensor.on('change', function(){
    result.level = this.value;
    levelDown.query((downState)=>{
      result.down = downState.value == 1 ? 'on' : 'off';
      levelUp.query((upState)=>{
        result.up = upState.value == 1 ? 'on': 'off';
        result.maintain = maintainLevelValue;
        return socket.emit('level', result);
      });    
    });
  })    
};

exports.getLevelInfo = getLevelInfo;

exports.manageLevel = function(data, levelUp, levelDown, levelSensor, maintainLevelValue, socket){
  if(data.up){
    if(data.up === 'on') levelUp.on();
    if(data.up === 'off') levelUp.off();
    maintainLevelValue = -1;
  };
  if(data.down){
    if(data.down === 'on') levelDown.on();
    if(data.down === 'off') levelDown.off();
    maintainLevelValue = -1;
  }
  if(data.maintain){
    levelDown.off();
    levelUp.off();
  } 
}

function hexToDec(value){
  value = value.toString().slice(2, value.length);
  return parseInt(value, 16);
}

exports.maintainLevel = function(levelUp, levelDown, level, maintainLevelValue){  
  if(maintainLevelValue === -1) return;
  if(level !== maintainLevelValue){
     if(level > maintainLevelValue){
      levelDown.on();
      levelUp.off();
    }
    else{
      levelUp.on();
      levelDown.off();
    }
  }
  else{
    levelUp.off();
    levelDown.off();
  }
}  
