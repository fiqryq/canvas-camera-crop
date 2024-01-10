import Camera from './components/Camera'

function App() {
  const onCapture = (image: string) => {
    console.log(image)
  }
  return (
    <div className='w-full max-w-[480px] relativeh-screen inset-x-0 mx-auto'>
      <Camera onCapture={(image) => onCapture(image)} userFacing='environment' />
    </div>
  )
}

export default App
