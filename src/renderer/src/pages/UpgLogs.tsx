import Versions from '../components/Versions'
import Form from '../components/Form'

const UpgLogs = () => {
  return (
    <div className='overflow-y-auto flex flex-col p-4 w-full h-screen bg-gray-100'>
      <div className="text">
        Analyze <span className="react">EAGLE</span>
        &nbsp;terminal <span className="ts">Logs</span>
      </div>

      <Form />

      <div className='flex items-center justify-center w-full mt-10'>
        <Versions/>
      </div>
    </div>
  )
}

export default UpgLogs