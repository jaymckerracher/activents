import supabase from "../supabase";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import EventCard from "../components/EventCard";

export default function Home({navigate, checkValidSession, isSessionValid, setIsSessionValid}) {
  const [currentUser, setCurrentUser] = useState();
  const [errorMessage, setErrorMessage] = useState('');
  const [eventData, setEventData] = useState();
  const [loading, setLoading] = useState(false);

  // filter states
  const [filterTopic, setFilterTopic] = useState('');
  const [filterArg, setFilterArg] = useState([]);

  // sort states
  const [sortTopic, setSortTopic] = useState('created_at');
  const [sortDirectionLabelOptions, setSortDirectionLabelOptions] = useState(['Newest post', 'Oldest post']);
  const [sortAscending, setSortAscending] = useState(false);

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
      .order(sortTopic, { ascending: sortAscending })

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
        setErrorMessage(`There was an issue updating the results, please try again: ${error}`);
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
        setErrorMessage(`There was an issue updating the results, please try again: ${error}`);
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
      const {data, error} = await supabase
      .from('events')
      .select()
      .eq(topic, arg)
      .order(sortTopic , { ascending: ascendingBool })

      if (error) {
        setErrorMessage(`There was an issue updating the results, please try again: ${error}`);
        return;
      }

      setErrorMessage('');
      setEventData(data);
  }

  // handle update when no filter desired
  async function handleUpdateForNoFilter(sortTopic, ascendingBool) {
    const {data, error} = await supabase
    .from('events')
    .select()
    .order(sortTopic, { ascending: ascendingBool })

    if (error) {
      setErrorMessage('There was an error recieving the events, please try again.');
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

        {/* filter topics drop */}
        <label htmlFor="fitlerTopicDrop">Filter By:</label>
        <select id="filterTopicDrop" onChange={(e) => {
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
        {filterTopic && <div>
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
            <select id="filterArgs" onChange={(e) => setFilterArg(e.target.value)}>
              {locationArr.map((location, index) => {
                return(
                  <option value={location} key={index}>{location}</option>
                )
              })}
            </select>
          }

          {/* price filter arguments */}
          {filterTopic === 'price' &&
            <select id="filterArgs"
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
              <option value={'00:30:00, 00:59:59'}>Between 30 mins & 1 hour</option>
              <option value={'01:00:00, 01:59:59'}>Between 1 & 2 hours</option>
              <option value={'02:00:00'}>2 hours or longer</option>
            </select>
          }
        </div>}
      </div>

      {/* sort by */}
      <div>
        <h2>Sort</h2>

        {/* sort by topic drop */}
        <label htmlFor="sortTopicDrop">Sort By: </label>
        <select id="sortTopicDrop" onChange={(e) => {
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

        <select id="sortDirectionDrop" onChange={(e) => {
          const formatValue = e.target.value === 'true' ? true : false;
          setSortAscending(formatValue);
        }}>
          <option value={false}>{sortDirectionLabelOptions[0]} first</option>
          <option value={true}>{sortDirectionLabelOptions[1]} first</option>
        </select>
      </div>

      {/* update results button */}
      <button onClick={() => {
        if (!filterTopic) handleUpdateForNoFilter(sortTopic, sortAscending);
        else if (Array.isArray(filterArg)) handleUpdateResultsNum(filterTopic, filterArg);
        else handleUpdateResults(filterTopic, filterArg);
      }}>Update Results</button>

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