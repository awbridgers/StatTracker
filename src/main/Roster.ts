import { rosterData } from '../types';

export class Roster {
  men: rosterData;
  women: rosterData;
  constructor() {
    this.men = {roster: [], liveStatsRoster: [], sideArmRoster: []}
    this.women = {roster: [], liveStatsRoster: [], sideArmRoster: []}
  }
  updateRoster(gender: 'men' | 'women', data: rosterData){
    if(gender === 'men') this.men = data;
    else this.women = data;
  }
}