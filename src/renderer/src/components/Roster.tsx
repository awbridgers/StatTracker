import { useState } from 'react'

type Props = {
  cancel: () => void
  currentRoster: { name: string; number: number }[]
  saveRoster: (text: string) => void
}

const Roster = ({ cancel, currentRoster, saveRoster }: Props) => {
  const [text, setText] = useState<string>(
    currentRoster.map((x) => `${x.number} ${x.name}`).join('\n')
  )
  const handleSave = () => {
    
    saveRoster(text)
  }
  return (
    <div className="editRoster">
      <div>Edit Roster</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="textBox rosterText"
        placeholder="Enter roster in format # FirstName LastName"
      ></textarea>
      <button className="submit" onClick={handleSave}>
        Save
      </button>
      <button className="submit" onClick={cancel}>
        Cancel
      </button>
    </div>
  )
}

export default Roster
