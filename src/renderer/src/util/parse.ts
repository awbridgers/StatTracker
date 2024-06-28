
import { player, rosterData } from '../../../types'
import { getPlayComponents } from './playComponents'
import { fixData } from './fixData'
import { findPlayer } from './formatName'
import { equals } from './lineupEqual'
import {Lineup} from '../Lineup'


export const parse = (
  data: string,
  men: boolean,
  liveStats: boolean,
  startingLineup: player[],
  roster: rosterData
): Lineup[] => {
  //get starter data and pbp data
  const playData = fixData(data, liveStats)
  const starters = new Lineup(startingLineup)
  const startTime = men ? '20:00' : '10:00' //women play 10 minutes quarters
  starters.addTime(startTime)
  //keep track of results, current lineup and index
  let currentLineup: player[] = [...starters.players]
  const playByPlayRoster = liveStats ? roster.liveStatsRoster: roster.sideArmRoster
  let results: Lineup[] = [starters]
  let currentIndex = 0
  let half = 1
  let quarter = 1
  //parse through each line and extract the data.
  playData.forEach((play, playIndex) => {
    const { time, player, details } = getPlayComponents(play, liveStats)
    const myTeamPlay =
      player &&
      playByPlayRoster.find((person) => person.toUpperCase().includes(player))
        ? true
        : false
    //BIG LIST OF TERMS FOR BOTH SIDE ARM AND LIVESTATS HERE
    const made = liveStats ? details.includes('made') : details.includes('GOOD')
    const paint = details.includes('in the paint')
    //SideArm doesn't include 2nd chance is playXplay, so check if last play was an off rebound
    const secondChance = liveStats
      ? details.includes('second chance')
      : playIndex > 0
        ? playData[playIndex - 1].includes('REBOUND OFF')
        : false
    const fromTO = details.includes('from turnover')
    //START PLAY BY PLAY LINE EVALUATION HERE
    if (player) {
      if (details.includes('substitution') || details.includes('SUB')) {
        if (myTeamPlay) {
          //we only care about our team's substituions
          if (
            details.includes('substitution out') ||
            details.includes('SUB OUT')
          ) {
            const rmIndex = currentLineup.findIndex((x) =>
              x.name === findPlayer(player, liveStats, roster.roster,time).name
            )
            if (rmIndex !== -1) {
              //remove the player
              currentLineup.splice(rmIndex, 1)
            } else {
              throw Error(`Error with substitution at ${time}.`)
            }
          } else if (
            details.includes('substitution in') ||
            details.includes('SUB IN')
          ) {
            const addPlayer = findPlayer(player, liveStats, roster.roster, time)
            currentLineup.push(addPlayer)
          }
          //after subbing players in and out, make the lineup
          if (currentLineup.length === 5) {
            const lineupIndex = results.findIndex((x) =>
              equals(x.players, currentLineup)
            )
            if (lineupIndex === -1) {
              //new lineup
              const newLineup = new Lineup(currentLineup)
              newLineup.addTime(time) //sub in time
              results.push(newLineup)
              results[currentIndex].addTime(time) //subOut TIme
              currentIndex = results.length - 1
            } else {
              //the lineup already exists
              results[currentIndex].addTime(time) //subOut Time
              currentIndex = lineupIndex
              results[lineupIndex].addTime(time) //sub in time
            }
          }
        }
      } else if (
        details.includes('2pt FG') ||
        details.includes('JUMPER') ||
        details.includes('DUNK') ||
        details.includes('LAYUP')
      ) {
        results[currentIndex].addBasket(
          myTeamPlay,
          made,
          paint,
          secondChance,
          fromTO,
          '2'
        )
      } else if (details.includes('3pt FG') || details.includes('3PTR')) {
        results[currentIndex].addBasket(
          myTeamPlay,
          made,
          false,
          secondChance,
          fromTO,
          '3'
        )
      } else if (details.includes('free throw') || details.includes('FT')) {
        results[currentIndex].addBasket(
          myTeamPlay,
          made,
          false,
          secondChance,
          fromTO,
          'ft'
        )
      } else if (details.includes('assist') || details.includes('ASSIST')) {
        results[currentIndex].addAssist(myTeamPlay)
      } else if (details.includes('turnover') || details.includes('TURNOVER')) {
        //special case for livestats b/c steal and turnover can appear on the same line
        if (details.includes('steal') && liveStats) {
          //determine the first word of the play (filter in case 1st char is a space)
          const [first] = details.split(' ').filter((x) => x !== '')
          //if its a steal, give a TO to opposite of myTeamPlay
          if (first === 'steal') {
            results[currentIndex].addTurnover(!myTeamPlay)
          }
          //if its TO, give TO to myTeamPlay
          else {
            results[currentIndex].addTurnover(myTeamPlay)
          }
        } else {
          //no steal involved
          results[currentIndex].addTurnover(myTeamPlay)
        }
      } else if (details.includes('rebound') || details.includes('REBOUND')) {
        const type = liveStats
          ? details.includes('defensive')
            ? 'd'
            : 'o'
          : details.includes('DEF')
            ? 'd'
            : 'o'
        results[currentIndex].addRebound(myTeamPlay, type)
      }
    } else {
      //cases where player is null
      if (details === 'END OF PERIOD') {
        if ((men && half === 1) || (!men && quarter <= 4)) {
          results[currentIndex].addTime('00:00')
          results[currentIndex].addTime(startTime)
          half = 2
          quarter++
        } else {
          //end of the second or OT
          results[currentIndex].addTime('00:00')
          results[currentIndex].addTime('05:00')
        }
      } else if (details === 'END OF GAME') {
        results[currentIndex].addTime('00:00')
      }
    }
  })
  return results
}
