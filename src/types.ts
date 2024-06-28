

export type rosterData = {
  roster: {name: string, number: number}[];
  sideArmRoster: string[];
  liveStatsRoster: string[];
}

export interface player{
  name: string;
  number: number;
}