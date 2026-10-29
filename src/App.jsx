import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/AppRoutes.jsx'
import DemoProvider from './state/DemoProvider.jsx'
import SubjectsProvider from './state/SubjectsProvider.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider><SubjectsProvider><AppRoutes /></SubjectsProvider></DemoProvider>
    </BrowserRouter>
  )
}
