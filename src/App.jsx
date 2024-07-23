// general imports
import { useEffect, useState } from 'react';
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import supabase from './supabase';

// importing the pages
import Home from './routes/Home';
import Welcome from './routes/Welcome';
import Login from './routes/Login';
import SignUp from './routes/SignUp';
import VerifyEmail from './routes/VerifyEmail';

export default function App() {
  const navigate = useNavigate();
  const [isSessionValid, setIsSessionValid] = useState(null);

  // check valid session (returns bool)
  async function checkValidSession () {
    const { data: {session}, error } = await supabase.auth.getSession();

    if (session) {
      console.log(session);
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
        <Route
          path='/'
          element={isSessionValid ? <Home navigate={navigate} checkValidSession={checkValidSession} isSessionValid={isSessionValid} setIsSessionValid={setIsSessionValid}/> : <Navigate to="/welcome" />}
        >
        </Route>
        <Route path='/welcome' element={<Welcome navigate={navigate}/>}/>
        <Route path='/login' element={isSessionValid ? <Navigate to="/" /> : <Login navigate={navigate} setIsSessionValid={setIsSessionValid}/>} />
        <Route path='/signup' element={<SignUp navigate={navigate}/>}/>
        <Route path='/signup/verify' element={<VerifyEmail />}/>
      </Routes>
    </>
  )
}