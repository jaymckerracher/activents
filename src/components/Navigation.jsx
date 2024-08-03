import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faCalendarDays, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import supabase from "../supabase";

export default function Navigation({toast, Bounce}) {
    const navigate = useNavigate();

    return (
        <nav className="navOuterContainer">
            <div className="navInnerContainer">
                <h1
                    onClick={() => {
                        navigate('/');
                    }}
                    className="navTitle titleFont"
                >
                    Activents
                </h1>

                <div className="navOptionsContainer">
                    <button
                        style={{marginRight: '30px'}}
                        className="navButton"
                        onClick={() => navigate('/')}
                    >
                        <FontAwesomeIcon icon={faCalendarDays} />
                        Events
                    </button>

                    <button
                        style={{marginRight: '30px'}}
                        className="navButton"
                        onClick={() => navigate('/profile')}
                    >
                        <FontAwesomeIcon icon={faCircleUser} />
                        Profile
                    </button>

                    <button
                        className="navButton"
                        onClick={async () => {
                            const { error } = await supabase.auth.signOut();

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

                            navigate('/welcome', { replace: true });
                        }}
                    >
                        Sign Out
                        <FontAwesomeIcon icon={faArrowRightFromBracket} style={{marginRight: 0, marginLeft: '10px'}}/>
                    </button>
                </div>
            </div>
        </nav>
    )
}