import { useCallback, useEffect, useMemo, useState } from 'react'
import './assets/App.css'
import { Lineup } from './Lineup'
import { calcTotal } from './util/calculateTotal'
import Switch from 'react-switch'
import Roster from './components/Roster'
import { player, rosterData } from 'src/types'
import Alert from './components/Alert'
import Select from 'react-select'
import { parse } from './util/parse'
import Results from './components/Results'

const initRoster = {
  men: { roster: [], liveStatsRoster: [], sideArmRoster: [] },
  women: { roster: [], liveStatsRoster: [], sideArmRoster: [] }
}

type Options = {
  value: player
  label: string
}

function App() {
  const [plays, setPlays] = useState<string>('')
  const [results, setResults] = useState<Lineup[]>([])
  const [show, setShow] = useState<boolean>(false)
  const [gender, setGender] = useState<'men' | 'women'>('men')
  const [editRoster, setEditRoster] = useState<boolean>(false)
  const [liveStats, setLiveStats] = useState<boolean>(true)
  const [roster, setRoster] = useState<{ men: rosterData; women: rosterData }>(
    initRoster
  )
  const [alertText, setAlertText] = useState<string>('')
  const [starters, setStarters] = useState<{
    men: (player | null)[]
    women: (player | null)[]
  }>({
    men: Array.from({ length: 5 }, (_) => null),
    women: Array.from({ length: 5 }, (_) => null)
  })
  const [alertResult, setAlertResult] = useState<boolean>(true)
  const fetchRoster = useCallback(async () => {
    const data = await window.api.fetchRoster()
    if (data) {
      setRoster(data)
    }
  }, [])
  const rosterPicker = useMemo(() => {
    const men = roster.men.roster.map((x) => ({
      value: x,
      label: `${x.number} ${x.name}`
    }))
    const women = roster.women.roster.map((x) => ({
      value: x,
      label: `${x.number} ${x.name}`
    }))
    return { men, women }
  }, [roster])
  const saveRoster = async (text: string) => {
    try {
      const roster: player[] = text
        .split('\n')
        .map((line) => {
          //make sure all the lines meet the format
          if (!/^\d+ [a-zA-z -'.]+$/.test(line)) {
            throw new Error('Cannot save roster due to invalid format.')
          }
          const [number, firstName, ...lastName] = line.split(' ')
          return { number: +number, name: `${firstName} ${lastName.join(' ')}` }
        })
        .sort((a, b) => a.number - b.number)
      const liveStatsRoster = roster.map((player) => {
        const [first, ...last] = player.name.split(' ')
        return `${player.number} ${last.join(' ')} ${first}`
      })
      const sideArmRoster = roster.map((player) => {
        const [first, ...last] = player.name.split(' ')
        return `${last.join(' ')},${first}`
      })
      const completeRoster = { roster, liveStatsRoster, sideArmRoster }
      const success = await window.api.saveRoster(completeRoster, gender)
      if (success) {
        fetchRoster()
        setAlertResult(true)
        setAlertText('Roster has been updated!')
        setEditRoster(false)
      } else {
        throw new Error('There was a problem saving the roster.')
      }
    } catch (e) {
      if (e instanceof Error) {
        setAlertResult(false)
        setAlertText(e.message)
      } else {
        setAlertText('There was a problem saving the roster.')
        setAlertResult(false)
      }
    }
  }
  const saveStarters = async () => {
    try {
      const starterData = await window.api.saveStarters(
        starters[gender],
        gender
      )
      if (starterData) {
        setAlertResult(true)
        setAlertText('Starters have been saved.')
      } else {
        throw new Error('There was a problem saving the starters.')
      }
    } catch (e) {
      if (e instanceof Error) {
        setAlertResult(false)
        setAlertText(e.message)
      } else {
        setAlertText('There was a problem saving the roster.')
        setAlertResult(false)
      }
    }
  }
  const handleSubmit = async () => {
    try {
      const startingPlayers = starters[gender].filter(
        (x) => x !== null
      ) as player[]
      if (startingPlayers.length !== 5) {
        throw new Error('Please select 5 starters.')
      }
      const results = parse(
        plays,
        gender === 'men',
        liveStats,
        startingPlayers,
        roster[gender]
      )
      setResults(results)
      setShow(true)
    } catch (e) {
      setAlertResult(false)
      setAlertText(
        e instanceof Error ? e.message : 'There was an error parsing the data.'
      )
    }
  }
  const handleCopy = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text)
    }
  }
  useEffect(() => {
    fetchRoster()
  }, [fetchRoster])
  useEffect(() => {
    const fetchStarters = async () => {
      const results: {
        men: (player | null)[]
        women: (player | null)[]
      } | null = await window.api.fetchStarters()
      if (results) {
        setStarters(results)
      }
    }
    fetchStarters()
  }, [])
  useEffect(() => {
    //when the roster changes, we need to check if any of the 
    //starters got removed.
    const rosterMen = new Set([...roster.men.roster.map(x=>x.name)]);
    const rosterWomen = new Set([...roster.women.roster.map(x=>x.name)])
    setStarters((prev)=>({
      men: prev.men.map((player)=> player ? rosterMen.has(player.name) ? player : null : null),
      women: prev.women.map((player)=>player ? rosterWomen.has(player.name) ? player: null : null)
    }))
  }, [roster])
  return (
    <div className="App">
      {show ? (
        <Results
          back={() => setShow(false)}
          total={calcTotal(results)}
          handleCopy={handleCopy}
          data={results}
        />
      ) : (
        <div className="tracker">
          <div className="title">StatTracker</div>
          {editRoster && (
            <Roster
              currentRoster={roster ? roster[gender].roster : []}
              saveRoster={saveRoster}
              cancel={() => setEditRoster(false)}
            />
          )}
          {alertText && (
            <div className="alertContainer">
              <Alert
                text={alertText}
                success={alertResult}
                onClick={() => setAlertText('')}
              />
            </div>
          )}
          <div className="appBody">
            <div className="selectContainer">
              {starters[gender].map((player, index) => (
                <Select<Options>
                  key={index}
                  value={player ? { value: player, label: player.name } : null}
                  onChange={(picked) =>
                    setStarters((prev) => ({
                      ...prev,
                      [gender]: prev[gender].map((x, i) => {
                        if (i !== index) return x
                        return picked ? picked.value : null
                      })
                    }))
                  }
                  options={rosterPicker[gender]}
                  isSearchable={false}
                  isClearable={true}
                  isOptionDisabled={(option) =>
                    starters[gender].some(
                      (x) => x !== null && x.name === option.value.name
                    )
                  }
                  placeholder={`Starter ${index + 1}`}
                  className="select"
                />
              ))}
              <button className="submit" onClick={saveStarters}>
                Save Starters
              </button>
            </div>
            <div className="playContainer">
              <textarea
                value={plays}
                onChange={(e) => setPlays(e.target.value)}
                className="textBox"
                placeholder="Enter the play by play data here. If you are using SideArm, add 'END OF PERIOD' or 'END OF GAME' at the end of each period's data."
              ></textarea>
              <div className="buttonWrapper">
                <button className="submit" type="button" onClick={handleSubmit}>
                  Submit
                </button>
                <button className="submit" onClick={() => setEditRoster(true)}>
                  Edit Roster
                </button>
              </div>
            </div>
          </div>
          <div style={{ color: 'white' }}></div>
          <div className="sliderDiv">
            <div
              style={{
                color: gender === 'men' ? '#242525' : 'white',
                fontSize: '24px'
              }}
            >
              Women
            </div>
            <Switch
              checked={gender === 'men'}
              onChange={() =>
                setGender((prev) => (prev === 'men' ? 'women' : 'men'))
              }
              checkedIcon={false}
              uncheckedIcon={false}
              borderRadius={6}
              onColor={'#CFB53B'}
              offColor={'#CFB53B'}
              className="slider"
            />
            <div
              style={{
                color: gender === 'men' ? 'white' : '#242525',
                fontSize: '24px'
              }}
            >
              Men
            </div>
          </div>
          <div className="sliderDiv">
            <div
              style={{
                color: liveStats ? '#242525' : 'white',
                fontSize: '24px'
              }}
            >
              SideArm
            </div>
            <Switch
              checked={liveStats}
              onChange={(checked) => setLiveStats(checked)}
              checkedIcon={false}
              uncheckedIcon={false}
              borderRadius={6}
              onColor={'#CFB53B'}
              offColor={'#CFB53B'}
              className="slider"
            />
            <div
              style={{
                color: liveStats ? 'white' : '#242525',
                fontSize: '24px'
              }}
            >
              LiveStats
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
