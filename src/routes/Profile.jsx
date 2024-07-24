import supabase from "../supabase";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";

export default function Profile({navigate, checkValidSession, isSessionValid, setIsSessionValid}) {
    const [isLoading, setIsLoading] = useState(false);
    const [userInfoReceived, setUserInfoReceived] = useState(null);
    const [userInfoError, setUserInfoError] = useState('');
    const [userObject, setUserObject] = useState();
    const [linkedWithGoogle, setLinkedWithGoogle] = useState(null);
    const [buttonErrorMessage, setButtonErrorMessage] = useState('');

    async function handleSignOut () {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            setButtonErrorMessage(`There was an error logging out: ${error}`);
            return;
        };
        setButtonErrorMessage('');
        setIsSessionValid(false);
        setIsLoading(false);
        navigate('/', { replace: true });
    };

    async function appointUserInfo() {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
            setIsUserInfoReceived(false);
            setUserInfoError(`There was an error loading your information, please refresh your page: ${error}`);
            return;
        };

        setUserInfoError('');
        setLinkedWithGoogle(user.identities.some(identity => identity.provider === 'google'));
        setUserObject(user);
        setUserInfoReceived(true);
    };

    async function handleGoogleClick() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });

        if (error) {
            setButtonErrorMessage(`There was an error: ${error}`);
        };

        setButtonErrorMessage('');
    };

    useEffect(() => {
        async function assignSessionBool () {
            await setIsSessionValid(await checkValidSession());
            if (!isSessionValid) navigate('/welcome', { replace: true } );
        };
        assignSessionBool();
        appointUserInfo();
    }, []);

    if (isSessionValid === null || userInfoReceived === null) {
        return <p>Loading...</p>
    }

    else if (userInfoError) {
        return <p>{userInfoError}</p>
    };

    return (
        <div>
            <Navigation />

            <h2>Profile Information</h2>
            <p>Forename: {userObject.user_metadata.first_name}</p>
            <p>Surname: {userObject.user_metadata.last_name}</p>
            <p>Email: {userObject.email}</p>
            
            <h2>Account Actions</h2>
            {!linkedWithGoogle && <button onClick={handleGoogleClick}>Link with Google</button>}

            {/* sign out button */}
            <button onClick={handleSignOut}>Sign Out</button>
            { isLoading && <p>Loading...</p> }
        </div>
    )
};