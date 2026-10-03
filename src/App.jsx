import AppRoutes from '@/routes/AppRoutes'
import CommandPalette from '@/components/commandPalette/CommandPalette'
import HashScroll from '@/components/common/HashScroll'

function App() {
  return (
    <>
      <AppRoutes />
      <CommandPalette />
      <HashScroll />
    </>
  )
}

export default App