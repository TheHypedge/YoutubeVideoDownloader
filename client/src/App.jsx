import { useState } from 'react'
import './App.css'
import './index.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
    <h1 className='text-5xl'>Youtube Video Downloader</h1>
    <form>
      <label>
        <input type="text" name="url" id="url" />
      </label>
    </form>
    </>
  )
}

export default App
