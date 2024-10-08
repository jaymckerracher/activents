import { useEffect, useState } from "react";
import supabase from "../supabase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Navigation from "../components/Navigation";
import { toast, Bounce } from 'react-toastify';

export default function AddEvent({navigate, checkValidSession, isSessionValid, setIsSessionValid}) {
    const [currentUser, setCurrentUser] = useState();
    const [currentProfile, setCurrentProfile] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [submitButtonActive, setSubmitButtonActive] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // defining the current date
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

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

    // input form states
    const [title, setTitle] = useState('');
    const [sport, setSport] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(formattedDate);
    const [startTime, setStartTime] = useState('00:00');
    const [endDate, setEndDate] = useState(formattedDate);
    const [endTime, setEndTime] = useState('00:00');
    const [location, setLocation] = useState('');
    const [spaces, setSpaces] = useState(20);
    const [pricePounds, setPricePounds] = useState(0);
    const [pricePennies, setPricePennies] = useState(0);
    const [imageURL, setImageURL] = useState('');

    async function handleSubmit(e) {
        setLoading(true);
        e.preventDefault();

        const formatTitle = title.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
        const formatSport = sport[0].toUpperCase() + sport.slice(1);
        const formatEventStart = `${startDate} ${startTime}`;
        const formatEventEnd = `${endDate} ${endTime}`;
        const formatLocation = location.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
        const formatPrice = Number(`${pricePounds}.${pricePennies}`);

        const { error } = await supabase
        .from('events')
        .insert({
            created_at: getCurrentTimestamp(),
            title: formatTitle,
            sport: formatSport,
            event_start: formatEventStart,
            event_end: formatEventEnd,
            location: formatLocation,
            description: description,
            price: formatPrice,
            available_spaces: spaces,
            host_id: currentUser.id,
            image_url: imageURL ? imageURL : null
        })

        if (error) {
            toast.error(`${error}`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
            setSubmitMessage(`There was an error creating the event, please try again: ${error}`);
            setLoading(false);
            return;
        }

        setSport('');
        setTitle('');
        setDescription('');
        setStartDate(formattedDate);
        setStartTime('00:00');
        setEndDate(formattedDate);
        setEndTime('00:00');
        setLocation('');
        setSpaces(20);
        setPricePounds(0);
        setPricePennies(0);
        setImageURL('');

        setSubmitMessage('The event has been created successfully!');
        setLoading(false);
    }

    // get the session and the user information
    useEffect(() => {
        async function assignSessionBool () {
            await setIsSessionValid(await checkValidSession());
            if (!isSessionValid) navigate('/welcome', { replace: true } );
        };

        async function getUserProfile() {
            // get the user first
            const {data: { user }, error: authError} = await supabase.auth.getUser();

            if (authError) {
                toast.error(`${authError}`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                return;
            }

            setErrorMessage('');
            setCurrentUser(user);

            const {data, error: profileError} = await supabase
            .from('profiles')
            .select()
            .eq('id', user.id)

            if (profileError) {
                toast.error(`${profileError}`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                return;
            }

            setErrorMessage('');
            setCurrentProfile(data[0]);
        };

        assignSessionBool();
        getUserProfile();
    }, []);

    // check to see if form valid
    useEffect(() => {
        if (sport && title && description && location) setSubmitButtonActive(true);
        else setSubmitButtonActive(false);
    }, [sport, description, location, title])

    if (isSessionValid === null || !currentUser || !currentProfile) {
        return (
            <p>Loading...</p>
        )
    }

    else if (errorMessage) {
        return (
            <p>{errorMessage}</p>
        )
    }

    return (
        <div className="addEventOuterContainer">
            <Navigation toast={toast} Bounce={Bounce} />
            <div className="addEventInnerContainer">
                <div className="addEventContainer">
                    <h2 className="addEventSubHeading">Add A New Event</h2>
                    <form className="addEventForm" onSubmit={handleSubmit}>
                        <div className="addEventInputContainer">
                            <input className="addEventFormInput" placeholder="Title" type="text" id="titleInput" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div className="addEventInputContainer">
                            <input className="addEventFormInput" placeholder="Sport" type="text" id="sportInput" value={sport} onChange={e => setSport(e.target.value)}/>
                        </div>

                        <div className="addEventInputContainer">
                            <textarea className="addEventFormInput" placeholder="Description" id="descriptionInput" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                        </div>

                        <div className="addEventInputContainer">
                            <label htmlFor="eventStartInput">Event Start</label>
                            <input className="addEventFormInput" type="date" id="eventStartInput" min={formattedDate} value={startDate} onChange={(e) => {
                                setStartDate(e.target.value);
                                endDate < e.target.value ? setEndDate(e.target.value) : null;
                            }}/>
                            <input className="addEventFormInput" type="time" id="eventStartInput" value={startTime} onChange={e => setStartTime(e.target.value)}/>
                        </div>

                        <div className="addEventInputContainer">
                            <label htmlFor="eventEndInput">Event End</label>
                            <input className="addEventFormInput" type="date" id="eventEndInput" min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)}/>
                            <input className="addEventFormInput" type="time" id="eventEndInput" value={endTime} onChange={e => setEndTime(e.target.value)}/>
                        </div>

                        <div className="addEventInputContainer">
                            <input className="addEventFormInput" placeholder="Location" type="text" id="locationInput" value={location} onChange={e => setLocation(e.target.value)}/>
                        </div>

                        <div className="addEventInputContainer">
                            <label htmlFor="spacesInput">Available Spaces</label>
                            <input className="addEventFormInput" type="number" id="spacesInput" min={1} value={spaces} onChange={e => setSpaces(e.target.value)}/>
                        </div>

                        {/* <div className="addEventInputContainer">
                            <label htmlFor="priceInput">Price</label>
                            <input className="addEventFormInput" type="number" id="priceInput" min={0} value={pricePounds} onChange={e => setPricePounds(e.target.value)}/>
                            <input className="addEventFormInput" type="number" id="priceInput" min={0} max={99} value={pricePennies} onChange={e => setPricePennies(e.target.value)}/>
                        </div> */}

                        <div className="addEventInputContainer">
                            <input className="addEventFormInput" placeholder="Image URL" type="text" id="imageURLInput" value={imageURL} onChange={e => setImageURL(e.target.value)}/>
                        </div>

                        <button className={`addEventButton ${submitButtonActive && !loading ? 'addEventButtonAbled' : 'addEventButtonDisabled'}`} disabled={!submitButtonActive}>
                            {
                                loading
                                ?
                                <FontAwesomeIcon icon={faSpinner} className="signUpSpinner spinner" />
                                :
                                'Add Event'
                            }
                        </button>
                    </form>
                    {loading && <p>Loading...</p>}
                    {submitMessage && <p>{submitMessage}</p>}
                </div>
            </div>

        </div>
    )
}