//this function takes the time in string mm:ss format
//from the play by play data and returns it in seconds.
//(in order to calculate total time on court)




export const timeToSeconds = (time:string):number =>{
  const [minutes, seconds] = time.split(':')
  const min = +minutes * 60
  const sec = +seconds
  if(isNaN(min) || isNaN(sec)){
    throw Error('There was an error reading the time')
  }
  return min + sec
}

