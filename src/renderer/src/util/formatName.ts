import {player} from '../../../types';

//Take the names found in the roster and convert them
//to the form found in the play by play data, which is
// e.g. 5 Smith J

export const formatName = (person: player): string => {
  const array = person.name.split(' ');
  const firstName = array.shift();
  const lastName = array.join(' ');
  return `${person.number} ${lastName} ${firstName}`;
};

//Take the names found in the play by play data and
//convert them back into the player objects found in the roster
//!NOTE: The names in the Play by Play are in the ALL CAPS


export const findPlayer = (shortHand: string, liveStats, roster: player[], time: string): player => {
  if(liveStats){
    //shortHand will be: 5 Smith J
    const [number, ...name] = shortHand.split(' ');
    const firstName = name.pop();
    const lastName = name.join(' ');
    const player = roster.find(
      (person) =>
        person.name.toLowerCase().includes(lastName.toLowerCase()) &&
        person.number === +number
    );
    if (!player) {
      throw Error(`${firstName?.toLocaleUpperCase()} ${lastName.toLocaleUpperCase()} is not in the active lineup at ${time}.  Check starters and substitution lines.` );
    }
    return player;
  }
  else{
    //shortHand will be LAST,FIRST
    const [lastName, firstName] = shortHand.toLowerCase().split(',');
    const player = roster.find((person)=>{
      return person.name.toLowerCase() === `${firstName} ${lastName}`
    })
    if(!player)
      throw Error (`${firstName?.toLocaleUpperCase()} ${lastName.toLocaleUpperCase()} is not in the active lineup at ${time}. Check starters and substitution lines.`);
    return player
  }

  
  
 
};

//find Player for sideArm play by play data
//this goes from LAST,FIRST => player object
// export const findSideArmPlayer = (name: string, men : boolean):player =>{
//   const rosterList = men ? roster: womenRoster;
//   const [lastName, firstName] = name.split(',');
//   const fixedName = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`
//   const player = rosterList.find((x)=>fixedName === x.name.toLowerCase());
//   if(!player){
//     throw Error (`No player ${fixedName} found`)
//   }
//   return player
// }