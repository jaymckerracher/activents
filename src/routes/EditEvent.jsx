import { useParams } from 'react-router-dom';
import supabase from '../supabase';
import { useEffect, useState } from 'react';
import { toast, Bounce } from 'react-toastify';
import Navigation from '../components/Navigation';

export default function EditEvent () {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [sport, setSport] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [spaces, setSpaces] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [submitButtonActive, setSubmitButtonActive] = useState(false);

    // defining the current date
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    useEffect(() => {
        async function getEventInfo () {
            setLoading(true);

            const { data, error } = await supabase
            .from('events')
            .select()
            .eq('id', id)

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
                return;
            }

            const formattedStartDate = data[0].event_start.split('T')[0];
            const formattedStartTime = data[0].event_start.split('T')[1].split('+')[0];
            const formattedEndDate = data[0].event_end.split('T')[0];
            const formattedEndTime = data[0].event_end.split('T')[1].split('+')[0];

            setTitle(data[0].title);
            setSport(data[0].sport);
            setDescription(data[0].description);
            setStartDate(formattedStartDate);
            setStartTime(formattedStartTime);
            setEndDate(formattedEndDate);
            setEndTime(formattedEndTime);
            setLocation(data[0].location);
            setSpaces(data[0].available_spaces);
            setImageURL(data[0].image_url);

            setLoading(false);
        }

        getEventInfo();
    }, []);

    // check to see if form valid
    useEffect(() => {
        if (sport && title && description && location) setSubmitButtonActive(true);
        else setSubmitButtonActive(false);
    }, [sport, description, location, title])

    async function handleSubmit(e) {
        e.preventDefault();
        setButtonLoading(true);

        const formatTitle = title.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
        const formatSport = sport[0].toUpperCase() + sport.slice(1);
        const formatEventStart = `${startDate} ${startTime}`;
        const formatEventEnd = `${endDate} ${endTime}`;
        const formatLocation = location.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
        // const formatPrice = Number(`${pricePounds}.${pricePennies}`);

        const { data, error } = await supabase
        .from('events')
        .update({
            title: formatTitle,
            sport: formatSport,
            description: description,
            event_start: formatEventStart,
            event_end: formatEventEnd,
            location: formatLocation,
            available_spaces: spaces,
            image_url: imageURL,
        })
        .eq('id', id)
        .select()

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
            return
        }

        setButtonLoading(false);
    }

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div className="addEventOuterContainer">
            <Navigation toast={toast} Bounce={Bounce} />
            <div className="addEventInnerContainer">
                <div className="addEventContainer">
                    <h2 className="addEventSubHeading">Update {title}</h2>
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
                                'Update Event'
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}