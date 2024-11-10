//the following are headers found on the livestats header
//at the top of each page, they will be removed from the
//text so that 1 seamless copy/paste can be used

const gameDetails = /(Official Basketball Play by Play)(.|\n)*?(Officials:.*)/gi
const header = /(Game Time)(.+)(Score Diff)(.+)/gi
const gameTime = /\d+:\d+/
const hasPlayer = /[A-Z][A-Z. -]+,[A-Z.-]+/

// const keepThese = ['OVERTIME', 'END OF PERIOD']

//a function to fix the data into an easier format to manipulate
export const fixData = (data: string, liveStats: boolean) => {
  //remove the header data
  const playArray = data
    .replace(gameDetails, '')
    .replace(header, '')
    .split(/\n/)
  //console.log(playArray);
  const results: string[] = []
  let previous = ''
  playArray
    .filter((x) => x !== '')
    .forEach((line, index) => {
      //if the line has a time, 'end of' or  --, push it to the array
      if (
        gameTime.test(line) ||
        line.includes('END OF') ||
        (!liveStats && line.includes('--'))
      ) {
        results.push(previous ? `${previous} ${line}`.trim() : line.trim())
        previous = ''
      } else {
        //if the line does not have the time, add it to the last line that was pushed to the array
        if (liveStats) {
          //just concat it to the end of the last thing in the array
          results[results.length - 1] += ` ${line}`
        } else {
          /* 
          sideArm has time in the middle so multiline details can be on either side of the time
          so we'll check if the current line has a player and if the previous line has a player
          since each line can only contain 1 player. 
          */
          if (hasPlayer.test(line) && hasPlayer.test(playArray[index - 1])) {
            previous = line
          } else {
            results[results.length - 1] += ` ${line}`
          }
        }
      }
    })
  return results
}
