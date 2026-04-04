import ResetPassword from './pages/ResetPassword';
import NewPassword from './pages/NewPassword';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ConfirmEmail from './pages/ConfirmEmail';
import AllEventTypes from './pages/AllEventTypes';
import HowItWorks from './pages/HowItWorks';
import AboutUs from './pages/AboutUs';
import RegisterCompany from './pages/RegisterCompany';
import CompanyProfile from './pages/CompanyProfile';
import EventPage from './pages/EventPage';
import CreateEventPage from './pages/CreateEventPage';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password_reset" element={<NewPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/all-event-types" element={<AllEventTypes />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/register-company" element={<RegisterCompany />} />
        <Route path="/company/:id" element={<CompanyProfileWrapper />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isAllowed={(() => {
                try {
                  const profileStr = localStorage.getItem('profile');
                  if (!profileStr) return false;
                  const user = JSON.parse(profileStr);
                  return user.role === 'admin';
                } catch {
                  return false;
                }
              })()}
              redirectPath="/login"
            >
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

import { useParams } from 'react-router-dom';
const CompanyProfileWrapper = () => {
  const { id } = useParams();
  const companyId = id ? Number(id) : undefined;
  if (!companyId) return <div>Invalid company id</div>;
  return <CompanyProfile id={companyId} />;
};

export default App;