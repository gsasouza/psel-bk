exports.getTempValue = function(tempExt, tempInt, tempPeltier, currentPeltier){
  return {tempExt: tempExt.value, tempInt: tempInt.value, tempPeltier: tempPeltier.value, currentPeltier: currentPeltier.value}
}
exports.maintainTemp = function(tempPeltier, currentPeltier){
  tempPeltier.on('change', ()=>{
    if(this.celsius !== -6){
      if(this.celsius > -6) currentPeltier.high();
      else currentPeltier.low();
    }
  })
}

