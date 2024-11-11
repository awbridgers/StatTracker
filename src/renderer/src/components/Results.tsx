import { useEffect, useRef, useState } from 'react'
import { cols } from '@renderer/util/tableSetup'
import { Lineup } from '@renderer/Lineup'

type Props = {
  data: Lineup[]
  handleCopy: (text: string | undefined) => void
  total: Lineup
  back: () => void
}

const Results = ({ data, handleCopy, total, back }: Props) => {
  const [copied, setCopied] = useState<boolean>(false)
  const headRef = useRef<HTMLTableSectionElement | null>(null)
  const bodyRef = useRef<HTMLTableSectionElement | null>(null)
  const onCopy = () => {
    const text = `${headRef.current?.innerText}${bodyRef.current?.innerText}`
    handleCopy(text)
    setCopied(true)
  }
  useEffect(()=>{
    let timeoutId: NodeJS.Timeout;
    if(copied){
       timeoutId = setTimeout(()=>{
        setCopied(false)
      },2000)
      
    }
    return ()=>clearTimeout(timeoutId)
  },[copied])
  return (
    <>
      <div className="copyAlert">
        <div
          className={`${copied ? 'alert-visible' : 'alert-hidden'} copyText`}
        >
          Copied to Clipboard!
        </div>
      </div>
      <div className="resultsButtons">
        <button
          type="button"
          onClick={back}
          className="submit copy"
        >
          Back
        </button>
        <button onClick={onCopy} className="submit copy">
          Copy
        </button>
      </div>
      <table className="resultsTable">
        <thead ref={headRef}>
          <tr>
            {cols.map((x, i) => (
              <th key={i}>{x.title}</th>
            ))}
          </tr>
        </thead>
        <tbody ref={bodyRef}>
          {data.map((x, i) => (
            <tr key={i}>
              {cols.map((y, j) => (
                <td key={j}>{x[y.dataIndex]}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {cols.map((stat, i) => (
              <th key={i}>{total[stat.dataIndex]}</th>
            ))}
          </tr>
        </tfoot>
      </table>
    </>
  )
}

export default Results
