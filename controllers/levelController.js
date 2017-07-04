function toScale(value, min1, max1, min2, max2){
    let result = (((max2-min2) * (value - min1))/(max1-min1)) + min2
  }

exports.getLevelInfo = function(levelSensor, maintainLevelValue){    
  let level = toScale(hexToDec(levelSensor.value), 0, 1000, 0, 100);
  return {up: 'on', dowm: 'off', maintain: maintainLevelValue, level: 70}
}

exports.manageLevel = function(data, levelUp, levelDown, maintainLevelValue, levelSensor){
  if(data.up){
    if(data.up === 'on') levelUp.high();
    if(data.up === 'off') levelUp.low();
    maintainLevelValue = -1;
  };
  if(data.down){
    if(data.down === 'on') levelDown.high();
    if(data.down === 'off') levelDown.low();
    maintainLevelValue = -1;
  }
  if(data.maintain){
    if(data.maintain !== maintainLevelValue){
      maintainLevelValue = data.maintain;
      maintainLevel(maintainLevelValue);
    }
  } 
}

function hexToDec(value){
  return parseInt(value.toString(), 16)
}

function maintainLevel(value, levelSensor, levelUp, levelDown){
  let level = levelSensor.value;
  if(level !== value && value != -1){
    if(level > value) {
      levelDown.high();
      levelUp.low();
      return setTimeout(maintainLevel(value, levelSensor, levelUp, down), 1000);
    }
    else{
      levelUp.high();
      levelDown.low();
      return setTimeout(maintainLevel(value, levelSensor, levelUp, down), 1000);
    }
  }
  else{
    levelDown.low();
    levelUp.low();
  }  
  console.log('maitaining')    
}  
