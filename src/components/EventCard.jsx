import { useEffect, useState } from 'react'
import defaultEventImg from '../assets/defaultEventImg.jpg'
import supabase from '../supabase'

const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const googleClientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleRedirectURL = import.meta.env.VITE_GOOGLE_REDIRECT_URL
const redirectURL = import.meta.env.VITE_REDIRECT_URL;

export default function EventCard({event, currentUser, currentProfile, userBookings, userBookingsEvents, currentSession, linkedWithGoogle}) {
    const [host, setHost] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [buttonSignUp, setButtonSignUp] = useState(!userBookingsEvents.includes(event.id));
    const [loading, setLoading] = useState(false);

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

        getHostInformation();
    }, []);

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
                setLoading(true);
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
                setLoading(false);
            }

            // handle paid sign up
        }

        // handle cancel booking
        else if (!buttonSignUp) {
            // delete the booking from the table
            setLoading(true);

            const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('event_id', event.id)
            .eq('user_id', currentUser.id)

            if (error) {
                return;
            }

            // make sure the event is removed from their calendar
            // make sure any money is returned
            setButtonSignUp(true);
            setLoading(false);
        }
    }

    async function handleAddToCalendar() {
        // add the event to the calendar
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: googleApiKey,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                scope: 'https://www.googleapis.com/auth/calendar',
            });

            gapi.auth.setToken({ access_token: currentSession.provider_token });

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

            const response = await gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': newEvent
            })

            console.log(response, 'this is the response');
        })
    };

    if (errorMessage) {
        return <p>{errorMessage}</p>
    }

    else if (!host) {
        return <p>Loading event...</p>
    }

    return (
        <div style={{border: 'solid black 2px'}}>
            {/* event information */}
            <img src={event.image_url ? event.image_url : defaultEventImg} alt="Default event image" style={{width: '200px'}}/>
            <h2>{event.title}</h2>
            <h3>{event.sport}</h3>
            <p>Event posted {formatDate(event.created_at)} by {host.first_name} {host.last_name}</p>
            <p>{event.description}</p>
            <p>Hosted at: {event.location}</p>
            <p>Event begins: {formatDate(event.event_start)}</p>
            <p>Event ends: {formatDate(event.event_end)}</p>
            <p>{event.available_spaces} spaces remaining</p>

            {/* calls to action */}
            {currentProfile.role === 'user' && <button onClick={handleSignUpButton}>
                {
                    loading
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
            {!buttonSignUp && currentProfile.role === 'user' && linkedWithGoogle && <button onClick={handleAddToCalendar}>Add to google calendar</button>}
            {((currentProfile.role === 'staff' && currentProfile.id === event.host_id) || currentProfile.role === 'admin') && <button>Edit event</button>}
            {((currentProfile.role === 'staff' && currentProfile.id === event.host_id) || currentProfile.role === 'admin') && <button>Delete event</button>}
        </div>
    )
}