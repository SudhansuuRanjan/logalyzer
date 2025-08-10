import Markdown from 'react-markdown'

const Sflog = () => {
    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">IPSG Card</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Generate IPSG card commands by specifying the card location.
            </p>

            <Markdown>
{`
## SFL

The SFL (Service Function Chaining) feature allows you to create a chain...

### Configuration

To configure SFL, you need to define the service functions...

### Example

Here is an example:

\`\`\`js
let x = 3;
function y() {
  return x + 1;
}
\`\`\`

In this example, we are creating a chain...
- base
- headless

`}
</Markdown>



        </div>
    )
}

export default Sflog