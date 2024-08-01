export default function Welcome ({navigate}) {
    return (
        <div className="welcomeOuterContainer">
            <div className="welcomeInnerContainer">
                <h1 className="welcomeTitle">Activents</h1>
                <h2 className="welcomeSubHeading">Welcome</h2>
                <button className="welcomeButton" onClick={() => navigate('/login')}>Login</button>
                <button className="welcomeButton" onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
        </div>
    )
}