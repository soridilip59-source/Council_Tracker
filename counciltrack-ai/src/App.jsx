import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CouncilProvider } from "./context/CouncilContext";
import { SocketProvider } from "./context/SocketContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Councils from "./pages/Councils";
import Goals from "./pages/Goals";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Feedback from "./pages/Feedback";
import Reflections from "./pages/Reflections";
import Meetings from "./pages/Meetings";
import Reports from "./pages/Reports";

function ComingSoon({ title }) {
  return (
    <div className="p-20 text-center">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-sm text-gray-500 mt-2">This module is under development.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CouncilProvider>
          <SocketProvider>
            <div className="min-h-screen bg-white flex flex-col text-gray-900">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/councils" element={<Councils />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/gallery" element={<ComingSoon title="Gallery" />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/contact" element={<ComingSoon title="Contact Us" />} />
                  
                  {/* Full Login Feature added to project */}
                  <Route path="/login" element={<Login />} />

                  {/* Supporting System Routes */}
                  <Route path="/reflections" element={<Reflections />} />
                  <Route path="/meetings" element={<Meetings />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </div>
            </div>
          </SocketProvider>
        </CouncilProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
