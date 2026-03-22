

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ConfirmEmail from './pages/ConfirmEmail';
  <Route path="/profile" element={<Profile />} />

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;