import { useEffect, useState } from 'react'
import defaultEventImg from '../assets/defaultEventImg.jpg'
import supabase from '../supabase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

export default function EventCard({
    event,
    currentUser,
    currentProfile,
    userBookings,
    userBookingsEvents,
    currentSession,
    linkedWithGoogle,
    setDeleteClicked,
    setDeleteType,
    setDeleteTitle,
    setDeleteMessage,
    setDeleteIDs,
    setAdditionalData,
    eventData,
    setEventData,
    navigate
}) {
    const [host, setHost] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [buttonSignUp, setButtonSignUp] = useState(!userBookingsEvents.includes(event.id));
    const [signUpLoading, setSignUpLoading] = useState(false);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [eventInCalendar, setEventInCalendar] = useState();
    const [calendarID, setCalendarID] = useState();

    async function handleEditEvent (eventID) {
        navigate(`/edit/${eventID}`)
    };
    
    async function handleDeleteEvent (eventID) {
        await setDeleteType('event');
        await setDeleteTitle('Warning!')
        await setDeleteMessage('Are you sure you want to delete this event?')
        await setDeleteIDs({
            eventID: eventID,
            userID: currentUser.id
        })
        await setAdditionalData({
            userEvents: eventData,
            setUserEvents: setEventData,
        })
        setDeleteClicked(true)
    }

    useEffect(() => {
        async function getHostInformation() {
            const { data, error } = await supabase
            .from('profiles')
            .select()
            .eq('id', event.host_id)

            if (error) {
                setErrorMessage(`There was an error getting the host information, please try again: ${error}`);
                return;
            }

            setErrorMessage('');
            setHost(data[0]);
        };

        function initializeGapi() {
            if (linkedWithGoogle) {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        apiKey: googleApiKey,
                        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                    });

                    await gapi.auth.setToken({ access_token: currentSession.provider_token });
                    setGapiLoaded(true);

                    // if event in calendar, dont display the button
                    try {
                        const response = await gapi.client.calendar.events.list({
                            calendarId: 'primary',
                            q: event.title,
                            timeMin: event.event_start.slice(0, event.event_start.length - 3),
                            timeMax: event.event_end.slice(0, event.event_end.length - 3),
                            singleEvents: true
                        });
    
                        if (response.result.items.length) {
                            setCalendarID(response.result.items[0].id);
                            setEventInCalendar(true);
                        }
                    } catch (error) {
                        setEventInCalendar(false);
                    }
                });
            }
        }

        getHostInformation();
        initializeGapi();
    }, [eventInCalendar]);

    function getCurrentTimestamp() {
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const milliseconds = String(now.getUTCMilliseconds()).padStart(6, '0');

        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}+00`;
        return timestamp;
    }

    function formatDate(date) {
        const shortenedDate = date.slice(0, 16);
        const splitDate = shortenedDate.split('T');
        const firstHalfArr = splitDate[0].split('-');
        const formattedFirstHalf = `${firstHalfArr[2]}/${firstHalfArr[1]}/${firstHalfArr[0]}`;
        return `${formattedFirstHalf} at ${splitDate[1]}`;
    };

    async function handleSignUpButton() {
        // handle sign up
        if (buttonSignUp) {
            // handle free sign up
            if (event.price === 0) {
                // adds the booking to the bookings table
                setSignUpLoading(true);
                const { error } = await supabase
                .from('bookings')
                .insert({
                    created_at: getCurrentTimestamp(),
                    user_id: currentUser.id,
                    event_id: event.id
                });
                
                if (error) {
                    console.log('there was an error signing up to the event...');
                    return;
                }

                setButtonSignUp(false);
                setSignUpLoading(false);
            }

            // handle paid sign up
        }

        // handle cancel booking
        else if (!buttonSignUp) {
            // delete the booking from the table
            setSignUpLoading(true);

            const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('event_id', event.id)
            .eq('user_id', currentUser.id)

            if (error) {
                return;
            }

            // make sure the event is removed from their calendar
            if (eventInCalendar) {
                await gapi.client.calendar.events.delete({
                    calendarId: 'primary',
                    eventId: calendarID,
                });
                setEventInCalendar(false);
            }

            // make sure any money is returned
            setButtonSignUp(true);
            setSignUpLoading(false);
        }
    }

    async function handleAddToCalendar() {
        setCalendarLoading(true);

        const newEvent = {
            'summary': event.title,
            'description': event.description,
            'start': {
                'dateTime': event.event_start.slice(0, event.event_start.length - 3),
                'timeZone': 'Europe/London',
            },
            'end': {
                'dateTime': event.event_end.slice(0, event.event_end.length - 3),
                'timeZone': 'Europe/London',
            },
            'location': event.location,
            'reminders': {
                'useDefault': true,
            },
        }

        await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': newEvent
        })

        setEventInCalendar(true);
        setCalendarLoading(false);
    };

    if (errorMessage) {
        return <p>{errorMessage}</p>
    }

    else if (!host || eventInCalendar === null) {
        return <p>Loading event...</p>
    }

    return (
        <div className='eventCardOuterContainer'>
            <h2 className='eventCardTitle'>{event.title}</h2>
            <p className='eventCardCreatedAt'>Posted {formatDate(event.created_at)} by {host.first_name} {host.last_name}</p>
            <div className='eventCardContainer'>
                {/* event information */}
                <img className='eventCardImg' src={event.image_url ? event.image_url : defaultEventImg} alt="Default event image"/>
                <div className='eventCardInformation'>
                    <div className='eventCardInfoContainer'>
                        <h3 className='eventCardText eventCardHeading'>Sport</h3>
                        <p className='eventCardText eventCardBody'>{event.sport}</p>

                        <h3 className='eventCardText eventCardHeading'>Location</h3>
                        <p className='eventCardText eventCardBody'>{event.location}</p>

                        <h3 className='eventCardText eventCardHeading'>Starts</h3>
                        <p className='eventCardText eventCardBody'>{formatDate(event.event_start)}</p>

                        <h3 className='eventCardText eventCardHeading'>Ends</h3>
                        <p className='eventCardText eventCardBody'>Event ends: {formatDate(event.event_end)}</p>

                        <h3 className='eventCardText eventCardHeading'>Available Spaces</h3>
                        <p className='eventCardText eventCardBody'>{event.available_spaces} spaces remaining</p>
                    </div>
                    <div className='eventCardDescriptionContainer'>
                        <h3 className='eventCardText eventCardHeading'>Description</h3>
                        <p className='eventCardText eventCardBody'>{event.description}</p>
                    </div>
                </div>
                <div className="eventCardCallToActions">
                    {/* calls to action */}
                    {currentProfile.role === 'user' && <button className='eventButton' onClick={handleSignUpButton} disabled={calendarLoading || signUpLoading}>
                        {
                            signUpLoading
                            ?
                            'Loading...'
                            :
                            buttonSignUp
                            ?
                            `Sign up for ${event.price === 0 ? 'free' : `£${event.price}`}`
                            :
                            'Cancel booking'
                        }
                    </button>}
                    {
                        !buttonSignUp &&
                        currentProfile.role === 'user' &&
                        linkedWithGoogle && gapiLoaded &&
                        !eventInCalendar &&
                        <button className='eventButton' onClick={handleAddToCalendar} disabled={calendarLoading}>
                            {
                                calendarLoading
                                ?
                                'Loading...'
                                :
                                'Add to google calendar'
                            }
                        </button>
                    }
                    {((currentProfile.role === 'staff' && currentProfile.id === event.host_id) || currentProfile.role === 'admin') && <button className='eventEditButton' onClick={() => handleEditEvent(event.id)}><FontAwesomeIcon icon={faPenToSquare} /></button>}
                    {((currentProfile.role === 'staff' && currentProfile.id === event.host_id) || currentProfile.role === 'admin') && <button className='eventDeleteButton' onClick={() => handleDeleteEvent(event.id)}><FontAwesomeIcon icon={faTrashCan} /></button>}
                </div>
            </div>
        </div>
    )
}