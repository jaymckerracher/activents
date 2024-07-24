import supabase from "../supabase";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";

export default function Home({navigate, checkValidSession, isSessionValid, setIsSessionValid}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function assignSessionBool () {
      await setIsSessionValid(await checkValidSession());
      if (!isSessionValid) navigate('/welcome', { replace: true } );
    };
    assignSessionBool();
  }, []);

  if (isSessionValid === null) {
    return (
      <p>Loading...</p>
    )
  }

  return (
    <div>
      <Navigation />
      <h1>Home</h1>
      { isLoading && <p>Loading...</p> }
    </div>
  );
}