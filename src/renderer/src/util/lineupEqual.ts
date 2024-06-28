//a function to determine if the 5 players in the lineup array
//match the 5 players in the lineup in the result array

import { player } from '../../../types';

export const equals = (array1: player[], array2:player[]):boolean =>{
  let results = true;
  array1.forEach((player)=>{
    if(!array2.find(x=>x.name === player.name)){
      results = false
    }
  })
  return results
}