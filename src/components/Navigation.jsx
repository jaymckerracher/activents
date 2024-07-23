import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default function Navigation() {
    const navigate = useNavigate();

    return (
        <nav>
            <h1 onClick={() => {
                navigate('/');
            }}>Activents</h1>

            <Link to={'/profile'}>
                <FontAwesomeIcon icon={faUser} />
                <p>Profile</p>
            </Link>

            <hr />
        </nav>
    )
}