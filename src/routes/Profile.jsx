import supabase from "../supabase";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

export default function Profile({navigate, checkValidSession, isSessionValid, setIsSessionValid}) {
    const [isLoading, setIsLoading] = useState(false);
    const [userInfoError, setUserInfoError] = useState('');
    const [userObject, setUserObject] = useState();
    const [profileObject, setProfileObject] = useState();
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

    async function handleGoogleClick() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/calendar',
                queryParams: {
                    prompt: 'login',
                }
            },
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
        async function appointUserInfo() {
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error) {
                setUserInfoError(`There was an error loading your information, please refresh your page: ${error}`);
                return;
            };

            setUserInfoError('');
            setLinkedWithGoogle(user.identities.some(identity => identity.provider === 'google'));
            setUserObject(user);
            
            const {data, error: profileError} = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id);
            
            if (profileError) {
                setUserInfoError(`There was an error loading your information, please refresh your page: ${profileError}`);
                return;
            }

            setProfileObject(data[0]);
            setUserInfoError('');
        };
        appointUserInfo();
        assignSessionBool();
    }, []);

    if (isSessionValid === null || !userObject || !profileObject) {
        return <p>Loading...</p>
    }

    else if (userInfoError) {
        return <p>{userInfoError}</p>
    };

    return (
        <div>
            <Navigation />

            <h2>Profile Information</h2>
            <p>Forename: {profileObject.first_name}</p><FontAwesomeIcon icon={faPenToSquare} />
            <p>Surname: {profileObject.last_name}</p><FontAwesomeIcon icon={faPenToSquare} />
            <p>Email: {userObject.email}</p><FontAwesomeIcon icon={faPenToSquare} />
            <p>Role: {profileObject.role}</p>
            
            <h2>Account Actions</h2>
            {!linkedWithGoogle && <button onClick={handleGoogleClick}>Link with Google</button>}

            {/* sign out button */}
            <button onClick={handleSignOut}>Sign Out</button>

            {/* delete account button */}
            <button>Delete Account</button>

            { isLoading && <p>Loading...</p> }
        </div>
    )
};