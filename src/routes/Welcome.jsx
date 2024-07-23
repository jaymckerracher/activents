export default function Welcome ({navigate}) {
    return (
        <div>
            <h1>Welcome</h1>
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
    )
}