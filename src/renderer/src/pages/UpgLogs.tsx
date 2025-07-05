import Versions from '../components/Versions'
import Form from '../components/Form'

const UpgLogs = () => {
  return (
    <div className="flex flex-col w-full max-w-full h-full overflow-y-auto p-4">
      <div className="text text-white">
        Analyze <span className="react">EAGLE</span>
        &nbsp;terminal <span className="ts">Logs</span>
      </div>

      <div className="max-w-full break-words">
        <Form />
      </div>

      <div className="flex items-center justify-center w-full mt-10">
        <Versions />
      </div>
    </div>
  );
}

export default UpgLogs;
