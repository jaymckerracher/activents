import supabase from "../supabase";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import EventCard from "../components/EventCard";

export default function Home({navigate, checkValidSession, isSessionValid, setIsSessionValid}) {
  const [currentUser, setCurrentUser] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [eventData, setEventData] = useState();
  const [filterTopic, setFilterTopic] = useState('');
  const [filterTopicLabel, setFilterTopicLabel] = useState('');
  const [filterArg, setFilterArg] = useState([]);
  const [sortQuery, setSortQuery] = useState('created_at');
  const [sortAscending, setSortAscending] = useState(false);
  const [loading, setLoading] = useState(false);

  // filter arg arrays
  const [sportsArr, setSportsArr] = useState();
  const [locationArr, setLocationArr] = useState();

  // check the session exists and get the user info
  useEffect(() => {
    async function assignSessionBool () {
      await setIsSessionValid(await checkValidSession());
      if (!isSessionValid) navigate('/welcome', { replace: true } );
    };

    async function getUser() {
      // get the user first
      const {data: { user }, error} = await supabase.auth.getUser();

      if (error) {
        setErrorMessage('There was an error loading your user details, please try again.');
        return;
      }

      setErrorMessage('');
      setCurrentUser(user);
    }

    assignSessionBool();
    getUser();
  }, []);

  // get the events and set the filter options
  useEffect(() => {
      async function getAllEvents() {
        const {data, error} = await supabase
        .from('events')
        .select()
        .order(sortQuery, { ascending: sortAscending })

        if (error) {
          setErrorMessage('There was an error recieving the events, please try again.');
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

    getAllEvents();
  }, []);

  // handle update for num arguments (arg is array)
  async function handleUpdateResultsNum(topic, arg) {
    setLoading(true);
    if (arg.length > 1) {
      const {data, error} = await supabase
      .from('events')
      .select()
      .gte(topic, arg[1])
      .lte(topic, arg[0])
      .order(sortQuery, { ascending: sortAscending })
  
      if (error) {
        setErrorMessage(`There was an issue updating the results, please try again: ${error}`);
        setLoading(false);
        console.log(error)
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
      .order(sortQuery, { ascending: sortAscending })
  
      if (error) {
        setErrorMessage(`There was an issue updating the results, please try again: ${error}`);
        setLoading(false);
        console.log(error)
        return;
      }
  
      setErrorMessage('');
      setEventData(data);
    }
    setLoading(false);
  }
  
  // handle update for word arguments
  async function handleUpdateResults(topic, arg) {
      const {data, error} = await supabase
      .from('events')
      .select()
      .eq(topic, arg)
      .order(sortQuery, { ascending: sortAscending })

      if (error) {
        setErrorMessage(`There was an issue updating the results, please try again: ${error}`);
        return;
      }

      setErrorMessage('');
      setEventData(data);
  }

  if (isSessionValid === null || !currentUser || !eventData) {
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
    <div>
      <Navigation />
      <h1>Home</h1>
      {/* filter */}
      <div>
        <h2>Filter</h2>

        {/* sport */}
        <input type="radio" id="sportRadio" name="filterRadios" onClick={() => {
          setFilterTopic('sport');
          setFilterTopicLabel('sport')
          setFilterArg(sportsArr[0]);
        }}/>
        <label htmlFor="sportRadio">Sport</label>

        {/* price */}
        <input type="radio" id="priceRadio" name="filterRadios" onClick={() => {
          setFilterTopic('price');
          setFilterTopicLabel('price');
          setFilterArg(['0.00', '0.00']);
        }}/>
        <label htmlFor="priceRadio">Price</label>

        {/* location */}
        <input type="radio" id="locationRadio" name="filterRadios" onClick={() => {
          setFilterTopic('location');
          setFilterTopicLabel('location');
          setFilterArg(locationArr[0]);
        }}/>
        <label htmlFor="locationRadio">Location</label>

        {/* available spaces */}
        <input type="radio" id="availableSpacesRadio" name="filterRadios" onClick={() => {
          setFilterTopic('available_spaces');
          setFilterTopicLabel('available spaces');
          setFilterArg([0, 9]);
        }} />
        <label htmlFor="availableSpacesRadio">Available Spaces</label>

        {/* duration */}
        <input type="radio" id="durationRadio" name="filterRadios" onClick={() => {
          setFilterTopic('duration::text');
          setFilterTopicLabel('duration');
          setFilterArg(['00:00:00', '00:29:59']);
        }} />
        <label htmlFor="durationRadio">Duration</label>

        {filterTopic && <div>
          <label htmlFor="filterArgs">Filter by {filterTopicLabel}</label>

          {/* sport filter arguments */}
          {filterTopic === 'sport' &&
            <select id="filterArgs" onChange={(e) => setFilterArg(e.target.value)}>
              {sportsArr.map((sport, index) => {
                return(
                  <option value={sport} key={index}>{sport}</option>
                )
              })}
            </select>
          }

          {/* location filter arguments */}
          {filterTopic === 'location' &&
            <select id="filterArgs">
              {locationArr.map((location, index) => {
                return(
                  <option onClick={() => setFilterArg(location)} key={index}>{location}</option>
                )
              })}
            </select>
          }

          {/* price filter arguments */}
          {filterTopic === 'price' &&
            <select id="filterArgs"
              onChange={(e) => {
                const arrConversion = e.target.value.split(',');
                setFilterArg(arrConversion);
              }}>
              <option value={'0.00, 0.00'}>FREE</option>
              <option value={'0.01, 9.99'}>Less than £10</option>
              <option value={'10.00, 19.99'}>£10 - £20</option>
              <option value={'20.00, 49.99'}>£20 - £50</option>
              <option value={'50.00'}>£50 or more</option>
            </select>
          }

          {/* available spaces filter arguments */}
          {filterTopic === 'available_spaces' &&
            <select id="filterArgs" onChange={(e) => {
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
            <select id="filterArgs" onChange={(e) => {
              const arrConversion = e.target.value.split(',');
              setFilterArg(arrConversion);
            }}>
              <option value={'00:00:00, 00:29:59'}>Less than 30 mins</option>
              <option value={'00:30:00, 00:59:59'}>30 mins - 1 hour</option>
              <option value={'01:00:00, 01:59:59'}>1 hour - 2 hour</option>
              <option value={'02:00:00'}>2 hours or longer</option>
            </select>
          }
        </div>}
      </div>

      {/* sort by */}
      <div>
        <h2>Sort</h2>
        <input type="radio" />
      </div>

      <button onClick={() => {
        if (Array.isArray(filterArg)) handleUpdateResultsNum(filterTopic, filterArg);
        else handleUpdateResults(filterTopic, filterArg);
      }}>Update Results</button>

      {/* {loading && <p>Loading events...</p>} */}
      {/* {!loading && */}
      <div>
        {loading && <p>Loading events...</p>}
        {
          !loading && 
          eventData.length > 0 &&
          <div>
            {eventData.map(event => {
              return <EventCard key={event.id} event={event} />
            })}
          </div>
        }
        {
          !loading &&
          !eventData.length > 0 &&
          <p>Sorry, there are no matching results</p>
        }
      </div>
      {/* } */}
    </div>
  );
}