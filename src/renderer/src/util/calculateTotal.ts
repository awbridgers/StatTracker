//a function to calculate the total of all the lineups
//return a lineup object with the totals 

import { Lineup } from '../Lineup';

export const calcTotal = (array:Lineup[]) =>{
  let temp = new Lineup([{name: 'Total', number: 0}]);
  const keys = Object.keys(temp) as Array<keyof typeof temp>
  keys.forEach((x)=>{
    if(typeof temp[x] === 'number'){
      (temp[x] as number) = array.reduce((prev,current)=>prev + (current[x] as number),0)
    }
  })
  //add all of the times to the temp to be calced later
  array.forEach((lineup)=>lineup.time.forEach((time)=>temp.time.push(time)))
  return temp
}