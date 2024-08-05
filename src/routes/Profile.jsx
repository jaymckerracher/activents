import supabase from "../supabase";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan, faCircleUser, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import DeletePopup from "../components/DeletePopup";
import { Link } from "react-router-dom";
import defaultEventImg from '../assets/defaultEventImg.jpg'

export default function Profile({navigate, checkValidSession, isSessionValid, setIsSessionValid, toast, Bounce}) {
    const [isLoading, setIsLoading] = useState(false);
    const [userSession, setUserSession] = useState();
    const [userInfoError, setUserInfoError] = useState('');
    const [userObject, setUserObject] = useState();
    const [profileObject, setProfileObject] = useState();
    const [userBookings, setUserBookings] = useState();
    const [userEvents, setUserEvents] = useState([]);
    const [linkedWithGoogle, setLinkedWithGoogle] = useState(null);
    const [buttonErrorMessage, setButtonErrorMessage] = useState('');
    const [buttonMessage, setButtonMessage] = useState('');
    const [deleteClicked, setDeleteClicked] = useState(false);

    function formatDate(date) {
        const shortenedDate = date.slice(0, 16);
        const splitDate = shortenedDate.split('T');
        const firstHalfArr = splitDate[0].split('-');
        const formattedFirstHalf = `${firstHalfArr[2]}/${firstHalfArr[1]}/${firstHalfArr[0]}`;
        return `${formattedFirstHalf} at ${splitDate[1]}`;
    };

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

        async function getUserSession () {
            const { data: { session }, error} = await supabase.auth.getSession();

            if (error) {
                console.log(error)
                return;
            }

            setUserSession(session)
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
            
            const {data: profile, error: profileError} = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id);
            
            if (profileError) {
                setUserInfoError(`There was an error loading your information, please refresh your page: ${profileError}`);
                return;
            }

            setProfileObject(profile[0]);
            setUserInfoError('');

            // get the bookings of the user
            if (profile[0].role === 'user') {
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
            } else {
                const { data: events, error: eventsError } = await supabase
                .from('events')
                .select()
                .eq('host_id', user.id)

                if (eventsError) {
                    console.log(eventsError);
                    return;
                }

                setUserEvents(events);
            }
        };

        appointUserInfo();
        getUserSession();
        assignSessionBool();
    }, [userEvents]);

    async function handleCancelBooking (id) {
        const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('user_id', userObject.id)
        .eq('event_id', id)

        if (error) {
            console.log(error)
            return;
        }

        setUserEvents(userEvents.filter(event => event_id !== id))
    };

    async function handleEditEvent () {
        
    }

    async function handleDeleteEvent () {

    }

    if (isSessionValid === null || !userSession || !userObject || !profileObject || !userEvents) {
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
                <h2>My Events:</h2>
                {
                    !userEvents.length && profileObject.role !== 'user' &&
                    <p>You haven't created any events yet!</p>
                }
                {
                    !userEvents.length && profileObject.role === 'user' &&
                    <p>You haven't signed up to any events yet, sign up <Link to={'/'}>here!</Link></p>
                }
                {
                    userEvents.length > 0 && userEvents.map(event => {
                        return (
                            <div key={event.id} className="profileEventCard">
                                <img className="profileEventImg" src={event.image_url ? event.image_url : defaultEventImg} alt="" />
                                <div className="profileEventDetails">
                                    <h1 className="profileEventDetail profileEventTitle">{event.title}</h1>
                                    <h2 className="profileEventDetail profileEventSport">{event.sport}</h2>
                                    <h3 className="profileEventDetail profileEventLocation">{event.location}</h3>
                                    <h3 className="profileEventDetail profileEventDate">{`${formatDate(event.event_start)} - ${formatDate(event.event_end)}`}</h3>
                                    {
                                        profileObject.role === 'user' &&
                                        <button className="profileCancelButton" onClick={() => handleCancelBooking(event.id)}>Cancel Booking</button>
                                    }
                                    {
                                        profileObject.role !== 'user' && 
                                        <button className="profileEditButton" onClick={handleEditEvent}>Edit Event</button>
                                    }
                                    {
                                        profileObject.role !== 'user' && 
                                        <button className="profileDeleteButton" onClick={handleDeleteEvent}>Delete Event</button>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <DeletePopup type={'user'} title={'Warning!'} message={'You are about to delete your account, are you sure?'} userID={userObject.id} setDeleteClicked={setDeleteClicked} deleteClicked={deleteClicked}/>
        </div>
    )
};