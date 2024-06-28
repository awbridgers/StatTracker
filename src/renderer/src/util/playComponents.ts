//a function to break each line into its components

export const getPlayComponents = (play: string, liveStats: boolean) => {
  //special cases, needed for timing
  if (play === 'END OF PERIOD') {
    return {time: '00:00', player: null, details: 'END OF PERIOD'};
  } else if (play === 'END OF GAME') {
    return {time: '00:00', player: null, details: 'END OF GAME'};
  }
  //elsewise, just split the play into time, player, and details
  if (liveStats) {
    const [time, ...rest] = play.split(' ');
    const [player] = rest.join(' ').match(/\d+(\s[A-Z]+)+/) || [null];
    const details = player ? play.split(player).pop() : play.split(time).pop();
    if (!details) {
      throw Error(`Play details not found at: ${time}`);
    }
    return {time, player, details};
  } else {
    //sideArm version has time in the middle for whatever reason
    //and uses '--' for if the time is the same, thankfully it always adds a real time
    //if a player is subbed in or out, which is the only time we actually need.
    const [time] = play.match(/\d+:\d+/) || ['00:00'];
    const [player] = play.match(/[A-Z][A-Z. -]+,[A-Z.-]+/) || [null];
    const details = play
      .replace(time ? time : '', '')
      .replace(player ? player : '', '');
      if (!details) {
        throw Error(`Play details not found at: ${time}`);
      }
    return {time, player, details};
  }
};
