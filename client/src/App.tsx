import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ConfirmEmail from './pages/ConfirmEmail';
import AllEventTypes from './pages/AllEventTypes';
import Faqs from './pages/Faqs';
import HowItWorks from './pages/HowItWorks';
import AboutUs from './pages/AboutUs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/all-event-types" element={<AllEventTypes />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;