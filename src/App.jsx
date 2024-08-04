// general imports
import { useEffect, useState } from 'react';
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import supabase from './supabase';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// importing the pages
import Home from './routes/Home';
import Welcome from './routes/Welcome';
import Login from './routes/Login';
import SignUp from './routes/SignUp';
import VerifyEmail from './routes/VerifyEmail';
import Profile from './routes/Profile';
import AddEvent from './routes/AddEvent';

export default function App() {
  const navigate = useNavigate();
  const [isSessionValid, setIsSessionValid] = useState(null);

  // check valid session (returns bool)
  async function checkValidSession () {
    const { data: {session}, error } = await supabase.auth.getSession();

    if (session) {
      const expiresAt = session.expires_at * 1000;
      if (expiresAt > Date.now()) return true;
    }

    else if (error) {
      console.log(error);
    }

    return false;
  }

  useEffect(() => {
    async function assignSessionBool () {
      setIsSessionValid(await checkValidSession())
    };
    assignSessionBool();
  }, []);

  if (isSessionValid === null) {
    return (
      <p>Loading...</p>
    )
  }

  return (
    <>
      <Routes>
        {/* Routes that require an active session */}
        <Route
          path='/'
          element={isSessionValid ? <Home navigate={navigate} checkValidSession={checkValidSession} isSessionValid={isSessionValid} setIsSessionValid={setIsSessionValid} toast={toast} Bounce={Bounce}/> : <Navigate to="/welcome" />}
        >
        </Route>

        <Route
          path='/profile'
          element={isSessionValid ? <Profile navigate={navigate} checkValidSession={checkValidSession} isSessionValid={isSessionValid} setIsSessionValid={setIsSessionValid} toast={toast} Bounce={Bounce} /> : <Navigate to="/welcome" />}
        >
        </Route>

        <Route
          path='/addevent'
          element={isSessionValid ? <AddEvent navigate={navigate} checkValidSession={checkValidSession} isSessionValid={isSessionValid} setIsSessionValid={setIsSessionValid}/> : <Navigate to="/welcome" />}
        >
        </Route>

        {/* Routes that dont require active session */}
        <Route path='/welcome' element={isSessionValid ? <Navigate to="/" /> :  <Welcome navigate={navigate}/>}/>
        <Route path='/login' element={isSessionValid ? <Navigate to="/" /> : <Login navigate={navigate} setIsSessionValid={setIsSessionValid} toast={toast} Bounce={Bounce}/>} />
        <Route path='/signup' element={isSessionValid ? <Navigate to="/" /> :  <SignUp navigate={navigate} toast={toast} Bounce={Bounce}/>}/>
        <Route path='/signup/verify' element={isSessionValid ? <Navigate to="/" /> :  <VerifyEmail />}/>
      </Routes>
      <ToastContainer />
    </>
  )
}