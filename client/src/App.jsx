import {Routes, Route} from "react-router-dom"
import Nickname from "./pages/Nickname"
import Roomoptions from "./pages/Roomoptions"
import ChatRoom from "./pages/ChatRoom"
import NotFound from "./Components/NotFound"
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  return (
    <main className="bg-white text-brand-dark dark:bg-brand-dark dark:text-txt">
      <Routes>
        <Route path="/" element={<Nickname/>} />
        <Route path="/room" element={
          <ProtectedRoute>
            <Roomoptions/>
          </ProtectedRoute>
          } />
        <Route path="/room/chat" element={
          <ProtectedRoute>
            <ChatRoom/>
          </ProtectedRoute>
          } />
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </main>
  )
}

export default App
