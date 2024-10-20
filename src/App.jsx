import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Adminpage from './pages/Admin/Adminpage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Homepage from './pages/Homepage/Homepage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import Staffpage from './pages/Staffpage/Staffpage';
import Headpage from './pages/Headpage/Headpage';

const App = () => {

  useEffect(() => {
    const createDefaultUsers = async () => {
      try {
        const adminEmail = "admin@cit.edu";
        const headEmail = "head@cit.edu";
        
        console.log(`https://backimps-production.up.railway.app/services/createDefaultUsers`);

        const response = await fetch(`https://backimps-production.up.railway.app/services/createDefaultUsers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminEmail: adminEmail,
            headEmail: headEmail
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(adminEmail);
        console.log(data);
      } catch (error) {
        console.error("Error creating default users", error);
      }
    };

    createDefaultUsers();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<LoginPage />} />
          <Route exact path="/register" element={<RegisterPage />} />
          <Route exact path="/admin" element={<Adminpage />} />
          <Route exact path="/home" element={<Homepage />} />
          <Route exact path="/head" element={<Headpage />} />
          <Route exact path="/staff" element={<Staffpage />} />
          <Route exact path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;
