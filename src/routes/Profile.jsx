import supabase from "../supabase";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan, faCircleUser, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import DeletePopup from "../components/DeletePopup";
import { Link } from "react-router-dom";

export default function Profile({navigate, checkValidSession, isSessionValid, setIsSessionValid, toast, Bounce}) {
    const [isLoading, setIsLoading] = useState(false);
    const [userInfoError, setUserInfoError] = useState('');
    const [userObject, setUserObject] = useState();
    const [profileObject, setProfileObject] = useState();
    const [userEvents, setUserEvents] = useState([]);
    const [linkedWithGoogle, setLinkedWithGoogle] = useState(null);
    const [buttonErrorMessage, setButtonErrorMessage] = useState('');
    const [buttonMessage, setButtonMessage] = useState('');
    const [deleteClicked, setDeleteClicked] = useState(false);

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

            // get the bookings of the user
            const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select()
            .eq('user_id', user.id)

            if (bookingsError) {
                console.log(bookingsError)
                return
            }

            const eventIDs = bookings.map(booking => booking.event_id);

            const { data: events, error: eventsError } = await supabase
            .from('events')
            .select()
            .in('id', eventIDs)

            if (eventsError) {
                console.log(eventsError)
                return
            }

            setUserEvents(events);
        };
        appointUserInfo();
        assignSessionBool();
    }, []);

    if (isSessionValid === null || !userObject || !profileObject || !userEvents) {
        return <p>Loading...</p>
    }

    else if (userInfoError) {
        return <p>{userInfoError}</p>
    };

    return (
        <div className="profileOuterContainer">
            <Navigation toast={toast} Bounce={Bounce} />

            <div className="profileInnerContainer">
                <div className="profileContainer">
                    <div className="profileHeader">
                        <FontAwesomeIcon icon={faCircleUser} />
                    </div>
                    <div className="profileBody">
                        <h2 className="profileHeading">Hi, {profileObject.first_name}!</h2>
                        <h3 className="profileSubHeading">Here you can view and make changes to your account.</h3>
                    </div>
                    <div className="profileUserInfoContainer">
                        <h4 className="profileUserInfoHeading">Name:</h4>
                        <p className="profileUserInfoContent">{`${profileObject.first_name} ${profileObject.last_name}`}</p>
                    </div>
                    <div className="profileUserInfoContainer">
                        <h4 className="profileUserInfoHeading">Email:</h4>
                        <p className="profileUserInfoContent">{userObject.email}</p>
                    </div>
                    <div className="profileUserInfoContainer">
                        <h4 className="profileUserInfoHeading">Access:</h4>
                        <p className="profileUserInfoContent">{profileObject.role[0].toUpperCase() + profileObject.role.slice(1)}</p>
                    </div>
                    <div className="profileButtons">
                        {
                            !linkedWithGoogle &&
                            <button
                                className="profileButton"
                                onClick={handleGoogleClick}
                                onMouseEnter={() => setButtonMessage('Link Account with Google')}
                                onMouseLeave={() => setButtonMessage('')}
                            >
                                <FontAwesomeIcon className="profileButtonIcon" icon={faGoogle} />
                            </button>
                        }

                        <button
                            className="profileButton"
                            onMouseEnter={() => setButtonMessage('Edit Account')}
                            onMouseLeave={() => setButtonMessage('')}
                        >
                            <FontAwesomeIcon className="profileButtonIcon" icon={faPenToSquare} />
                        </button>

                        <button
                            className="profileButtonSignOut"
                            onClick={handleSignOut}
                            onMouseEnter={() => setButtonMessage('Sign Out')}
                            onMouseLeave={() => setButtonMessage('')}
                        >
                            <FontAwesomeIcon className="profileButtonIconSignOut" icon={faArrowRightFromBracket} />
                        </button>

                        <button
                            className="profileButtonDelete"
                            onMouseEnter={() => setButtonMessage('Delete Account')}
                            onMouseLeave={() => setButtonMessage('')}
                            onClick={() => setDeleteClicked(true)}
                        >
                            <FontAwesomeIcon className="profileButtonIconDelete" icon={faTrashCan}/>
                        </button>
                    </div>
                    <div className="profileButtonMessageContainer">
                        <p className="profileButtonMessage">{buttonMessage}</p>
                    </div>
                </div>
            </div>

            <div className="myEvents">
                {
                    !userEvents.length && profileObject.role !== 'user' &&
                    <p>You haven't created any events yet!</p>
                }
                {
                    !userEvents.length && profileObject.role === 'user' &&
                    <p>You haven't signed up to any events yet, sign up <Link to={'/'}>here!</Link></p>
                }
            </div>
            <DeletePopup type={'user'} title={'Warning!'} message={'You are about to delete your account, are you sure?'} userID={userObject.id} setDeleteClicked={setDeleteClicked} deleteClicked={deleteClicked}/>
        </div>
    )
};