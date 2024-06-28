//function to calculate the total time in seconds
//given the time array


export const calcTime = (time:number[]):number =>{
  let result = 0
  for (let i = 0; i < time.length; i+=2) {
    result += (time[i] - time[i+1])
  }
  return result
}
