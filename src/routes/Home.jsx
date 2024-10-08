import supabase from "../supabase";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import EventCard from "../components/EventCard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import DeletePopup from "../components/DeletePopup";

export default function Home({navigate, checkValidSession, isSessionValid, setIsSessionValid, toast, Bounce}) {
  const [checkBeenComplete, setCheckBeenComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState();
  const [currentProfile, setCurrentProfile] = useState();
  const [currentSession, setCurrentSession] = useState();
  const [linkedWithGoogle, setLinkedWithGoogle] = useState();
  const [userBookings, setUserBookings] = useState();
  const [userBookingsEvents, setUserBookingsEvents] = useState();

  const [errorMessage, setErrorMessage] = useState('');
  const [eventData, setEventData] = useState();
  const [loading, setLoading] = useState(false);

  // filter states
  const [filterTopic, setFilterTopic] = useState('');
  const [filterArg, setFilterArg] = useState([]);
  
  // filter arg arrays
  const [sportsArr, setSportsArr] = useState();
  const [locationArr, setLocationArr] = useState();
  
  // sort states
  const [sortTopic, setSortTopic] = useState('created_at');
  const [sortDirectionLabelOptions, setSortDirectionLabelOptions] = useState(['Newest post', 'Oldest post']);
  const [sortAscending, setSortAscending] = useState(false);

  // delete states
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [deleteType, setDeleteType] = useState('');
  const [deleteTitle, setDeleteTitle] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteIDs, setDeleteIDs] = useState({});
  const [additionalData, setAdditionalData] = useState({});
  
  // check session, get user info and all events
  useEffect(() => {
    async function assignSessionBool () {
      await setIsSessionValid(await checkValidSession());
      setCheckBeenComplete(true);
      if (!isSessionValid) {
        await supabase.auth.signOut();
        navigate('/welcome', { replace: true } );
      };
    };

    async function getUserProfileBookings() {
      // get the user first
      const {data: { user }, error: authError} = await supabase.auth.getUser();

      if (authError) {
        console.log(authError)
        return;
      }

      setErrorMessage('');
      setLinkedWithGoogle(user.identities.some(identity => identity.provider === 'google'));
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
      };

      setErrorMessage('');
      setCurrentProfile(data[0]);

      const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select()
      .eq('user_id', user.id);

      if (bookingsError) {
        toast.error(`${bookingsError}`, {
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
      };

      // set the booking events array
      const bookingsArr = [];
      bookings.forEach(booking => {
        bookingsArr.push(booking.event_id)
      });
      setUserBookingsEvents(bookingsArr);

      setErrorMessage('');
      setUserBookings(bookings);
    };

    async function getSession() {
      const session = await supabase.auth.getSession();
      setCurrentSession(session.data.session);
    }

    async function getAllEvents() {
      const {data, error} = await supabase
      .from('events')
      .select()
      .gt('available_spaces', 0)
      .order(sortTopic, { ascending: sortAscending })

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

      // logic to create filter arg arrays
      // sports
      const tempSportsArr = [];
      data.map(row => {
        if (!tempSportsArr.includes(row.sport)) tempSportsArr.push(row.sport); 
      });
      tempSportsArr.sort();
      setSportsArr(tempSportsArr);

      // location
      const tempLocationArr = [];
      data.map(row => {
        if (!tempLocationArr.includes(row.location)) tempLocationArr.push(row.location);
      });
      tempLocationArr.sort();
      setLocationArr(tempLocationArr);

      setErrorMessage('');
      setEventData(data);
    }


    assignSessionBool();
    getUserProfileBookings();
    getSession();
    getAllEvents();
  }, [eventData]);

  // handle update for array filter arguments
  async function handleUpdateResultsNum(topic, arg, sortTopic, ascendingBool) {
    setLoading(true);
    if (arg.length > 1) {
      const {data, error} = await supabase
      .from('events')
      .select()
      .gte(topic, arg[0])
      .lte(topic, arg[1])
      .order(sortTopic, { ascending: ascendingBool })
  
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
        setLoading(false);
        return;
      }
  
      setErrorMessage('');
      setEventData(data);
    }
    else {
      const {data, error} = await supabase
      .from('events')
      .select()
      .gte(topic, arg[0])
      .order(sortTopic, { ascending: ascendingBool })
  
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
        setLoading(false);
        return;
      }
  
      setErrorMessage('');
      setEventData(data);
    }
    setLoading(false);
  }
  
  // handle update for string filter arguments
  async function handleUpdateResults(topic, arg, sortTopic, ascendingBool) {
    setLoading(true);
    const {data, error} = await supabase
    .from('events')
    .select()
    .eq(topic, arg)
    .order(sortTopic , { ascending: ascendingBool })

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
      setLoading(false);
      return;
    }

    setErrorMessage('');
    setEventData(data);
    setLoading(false);
  }

  // handle update when no filter desired
  async function handleUpdateForNoFilter(sortTopic, ascendingBool) {
    setLoading(true);
    const {data, error} = await supabase
    .from('events')
    .select()
    .order(sortTopic, { ascending: ascendingBool })

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
      setLoading(false);
      return;
    }

    setErrorMessage('');
    setEventData(data);
    setLoading(false);
  }

  if (isSessionValid === null || !checkBeenComplete || !currentUser || !currentProfile || !currentSession || !userBookings || !userBookingsEvents || !eventData) {
    return <p>Loading...</p>
  }

  else if (errorMessage) {
    return (
      <p>{errorMessage}</p>
    )
  }

  return (
    <div className="homeOuterContainer">
      <Navigation toast={toast} Bounce={Bounce} />

      <div className="homeInnerContainer">

        {/* welcome message */}
        <div className="homeWelcome">
          <h2 className="homeWelcomeMessage">Hi {currentProfile.first_name}! Let's find you some...</h2>
          <h1 className="homeTitle titleFont">Activents</h1>
        </div>

        {/* event controls */}
        <div className="homeEventControls">
          {/* if staff or admin: add event button */}
          {
            (currentProfile.role === 'staff' || currentProfile.role === 'admin') &&
            <button className="homeAddEventButton" onClick={() => navigate('/addevent')}>
              <FontAwesomeIcon icon={faCirclePlus} />
              Add Event
            </button>
          }
          
          {/* filter */}
          <div className="homeControlContainer">
            <h2 className="homeControlsHeading">Filter By</h2>

            {/* filter topics drop */}
            <select className={`homeControlsSelectA ${filterArg.length ? 'homeControlsSelectAChosen' : ''}`} id="filterTopicDrop" onChange={(e) => {
              setFilterTopic(e.target.value);
              switch(e.target.value) {
                case '':
                  setFilterArg('');
                  break;
                case 'sport':
                  setFilterArg(sportsArr[0]);
                  break;
                case 'location':
                  setFilterArg(locationArr[0]);
                  break;
                case 'price':
                  setFilterArg(['0.00', '0.00']);
                  break;
                case 'available_spaces':
                  setFilterArg([0, 9]);
                  break;
                case 'duration::text':
                  setFilterArg(['00:00:00', '00:29:59']);
                  break;
              }
            }}>
              <option value="">None</option>
              <option value="sport">Sport</option>
              <option value="location">Location</option>
              <option value="price">Price</option>
              <option value="available_spaces">Available Spaces</option>
              <option value="duration::text">Duration</option>
            </select>

            {/* filter arguments drop options (depending on filter topic) */}
            <div className={`homeControlsSubA ${filterTopic ? 'homeControlsSubShowA' : ''}`}>
              {/* empty filter arguments for styling */}
              { !filterTopic &&
                <select id="filterArgs" className="homeControlsSubOption"></select>
              }

              {/* sport filter arguments */}
              {filterTopic === 'sport' &&
                <select id="filterArgs" className="homeControlsSubOption" onChange={(e) => setFilterArg(e.target.value)}>
                  {sportsArr.map((sport, index) => {
                    return(
                      <option value={sport} key={index}>{sport}</option>
                    )
                  })}
                </select>
              }

              {/* location filter arguments */}
              {filterTopic === 'location' &&
                <select id="filterArgs" className="homeControlsSubOption" onChange={(e) => setFilterArg(e.target.value)}>
                  {locationArr.map((location, index) => {
                    return(
                      <option value={location} key={index}>{location}</option>
                    )
                  })}
                </select>
              }

              {/* price filter arguments */}
              {filterTopic === 'price' &&
                <select id="filterArgs" className="homeControlsSubOption"
                  onChange={(e) => {
                    const arrConversion = JSON.parse("[" + e.target.value + "]");
                    setFilterArg(arrConversion);
                  }}>
                  <option value={[0, 0]}>FREE</option>
                  <option value={[0.01, 9.99]}>Less than £10</option>
                  <option value={[10, 19.99]}>£10 - £20</option>
                  <option value={[20, 49.99]}>£20 - £50</option>
                  <option value={[50]}>£50 or more</option>
                </select>
              }

              {/* available spaces filter arguments */}
              {filterTopic === 'available_spaces' &&
                <select id="filterArgs" className="homeControlsSubOption" onChange={(e) => {
                  const arrConversion = JSON.parse("[" + e.target.value + "]");
                  setFilterArg(arrConversion);
                }}>
                  <option value={[0, 9]}>Less than 10</option>
                  <option value={[10, 19]}>10 - 20</option>
                  <option value={[20, 49]}>20 - 50</option>
                  <option value={[50]}>50 spaces or more</option>
                </select>
              }

              {/* duration filter arguments */}
              {filterTopic === 'duration::text' &&
                <select id="filterArgs" className="homeControlsSubOption" onChange={(e) => {
                  const arrConversion = e.target.value.split(',');
                  setFilterArg(arrConversion);
                }}>
                  <option value={'00:00:00, 00:29:59'}>Less than 30 mins</option>
                  <option value={'00:30:00, 00:59:59'}>Between 30 mins & 1 hour</option>
                  <option value={'01:00:00, 01:59:59'}>Between 1 & 2 hours</option>
                  <option value={'02:00:00'}>2 hours or longer</option>
                </select>
              }
            </div>
          </div>

          {/* sort by */}
          <div className="homeControlContainer">
            <h2 className="homeControlsHeading">Sort By</h2>

            {/* sort by topic drop */}
            <select id="sortTopicDrop" className='homeControlsSelectB' onChange={(e) => {
              setSortTopic(e.target.value);
              switch(e.target.value) {
                case 'created_at':
                  setSortDirectionLabelOptions(['Newest post', 'Oldest post']);
                  break;
                case 'event_start':
                  setSortDirectionLabelOptions(['Latest event', 'Earliest event']);
                  break;
                case 'price':
                  setSortDirectionLabelOptions(['Most Expensive event', 'Cheapest event']);
                  break;
                case 'available_spaces':
                  setSortDirectionLabelOptions(['Most spaces', 'Least spaces']);
                  break;
                case 'duration':
                  setSortDirectionLabelOptions(['Longest event', 'Shortest event']);
                  break;
              }
            }}>
              <option value="created_at">Date Posted</option>
              <option value="event_start">Event Time</option>
              <option value="price">Price</option>
              <option value="available_spaces">Available Spaces</option>
              <option value="duration">Event Duration</option>
            </select>

            <select id="sortDirectionDrop" className="homeControlsSubOption" onChange={(e) => {
              const formatValue = e.target.value === 'true' ? true : false;
              setSortAscending(formatValue);
            }}>
              <option value={false}>{sortDirectionLabelOptions[0]} first</option>
              <option value={true}>{sortDirectionLabelOptions[1]} first</option>
            </select>
          </div>

          {/* update results button */}
          <button className="homeControlsSubmit" onClick={() => {
            if (!filterTopic) handleUpdateForNoFilter(sortTopic, sortAscending);
            else if (Array.isArray(filterArg)) handleUpdateResultsNum(filterTopic, filterArg, sortTopic, sortAscending);
            else handleUpdateResults(filterTopic, filterArg, sortTopic, sortAscending);
          }}>Update Results</button>
        </div>

        {/* events */}
        <div className="eventsContainer">
          {loading && <p>Loading events...</p>}
          {
            !loading && 
            eventData.length > 0 &&
            eventData.map(event => {
              return <EventCard
                key={event.id}
                event={event}
                currentUser={currentUser}
                currentProfile={currentProfile}
                userBookings={userBookings}
                userBookingsEvents={userBookingsEvents}
                currentSession={currentSession}
                linkedWithGoogle={linkedWithGoogle}
                setDeleteClicked={setDeleteClicked}
                deleteClicked={deleteClicked}
                setDeleteType={setDeleteType}
                setDeleteTitle={setDeleteTitle}
                setDeleteMessage={setDeleteMessage}
                setDeleteIDs={setDeleteIDs}
                setAdditionalData={setAdditionalData}
                eventData={eventData}
                setEventData={setEventData}
                navigate={navigate}
              />
            })
          }
          {
            !loading &&
            !eventData.length > 0 &&
            <p>Sorry, there are no matching results</p>
          }
        </div>
      </div>
      <DeletePopup type={deleteType} title={deleteTitle} message={deleteMessage} ids={deleteIDs} setDeleteClicked={setDeleteClicked} deleteClicked={deleteClicked} additionalData={additionalData} />
    </div>
  );
}