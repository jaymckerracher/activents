import supabase from "../supabase";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";

export default function Profile({navigate, checkValidSession, isSessionValid, setIsSessionValid}) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSignOut () {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.log(`There was an error signing out: ${error}`);
            return;
        }
        setIsSessionValid(false);
        setIsLoading(false);
        navigate('/', { replace: true });
    }

    useEffect(() => {
        async function assignSessionBool () {
            setIsSessionValid(await checkValidSession());
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

            {/* sign out button */}
            <button onClick={handleSignOut}>Sign Out</button>
            { isLoading && <p>Loading...</p> }
        </div>
    )
};