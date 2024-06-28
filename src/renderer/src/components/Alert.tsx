
type Props = {
  text: string,
  success: boolean,
  onClick: ()=>void
}

const Alert = ({text, success, onClick}: Props) => {
  return (
    <div className = 'alert' style = {{backgroundColor: success ? 'green': 'red'}}>
      <div className = 'alertTitle'>{success? 'Success' : 'Error'}</div>
      <div className='alertText'>{text}</div>
      <div><button className='submit' onClick = {onClick}>OK</button></div>
    </div>
  )
}

export default Alert