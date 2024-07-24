import supabase from "../supabase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Login ({navigate, setIsSessionValid}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // handle on submit
    async function handleOnSubmit (e) {
        e.preventDefault();

        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            setIsLoading(false);
            setFormError(error);
            return;
        }

        setIsSessionValid(true);
        setFormError('');
        setIsLoading(false);

        navigate('/', { replace: true });
    };

    // handle google button click
    async function handleGoogleClick() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });

        if (error) {
            setFormError(`There was an error: ${error}`);
        };

        setFormError('');
    };

    useEffect(() => {
        const currentEmail = document.getElementById('email');
        const isEmailValid = currentEmail.checkValidity();
        if (password.length < 8) setIsSubmitActive(false);
        else if (!isEmailValid) setIsSubmitActive(false);
        else setIsSubmitActive(true); 
    }, [email, password])

    return (
        <div onSubmit={handleOnSubmit}>
            <h1>Login</h1>
            <form>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>

                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>

                <input type="checkbox" onClick={() => {
                    const pass = document.getElementById('password');
                    if (pass.type === 'password') pass.type = 'text';
                    else if (pass.type == 'text') pass.type = 'password';
                }} />Show Password

                <button disabled={!isSubmitActive}>Log in</button>
            </form>
            
            <div>OR</div>
            <button onClick={handleGoogleClick}>Sign in with Google</button>
            {isLoading && <p>Loading...</p>}
            {formError && <p>{`There was an error logging in: ${formError}`}</p>}
            <p>Don't have an account? Sign up <Link to={'/signup'}>here</Link></p>
        </div>
    )
}