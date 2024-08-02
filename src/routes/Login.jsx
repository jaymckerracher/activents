import supabase from "../supabase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function Login ({navigate, setIsSessionValid, toast, Bounce}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordInputType, setPasswordInputType] = useState('password');

    // handle on submit
    async function handleOnSubmit (e) {
        e.preventDefault();

        setIsLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            if (error.message === 'Invalid login credentials') {
                toast.info('Invalid Login Credentials', {
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
            }
            else {
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
            }
            setIsLoading(false);
            return;
        }

        console.log(data.user.app_metadata.providers, 'this the is the return data');

        if (data.user.app_metadata.providers.includes('google')) {
            console.log('we are getting here... 0')
            const { error: logOutError } = await supabase.auth.signOut();

            if (logOutError) {
                setButtonErrorMessage(`There was an error logging out: ${error}`);
                return;
            };

            const { error: secondaryLoginError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/calendar',
                },
            });

            if (secondaryLoginError) {
                toast.error(`${secondaryLoginError}`, {
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
            }

            setIsSessionValid(true);
            setIsLoading(false);
    
            navigate('/', { replace: true });
        }
        else {
            setIsSessionValid(true);
            setIsLoading(false);
    
            navigate('/', { replace: true });
        }

    };

    // handle google button click
    async function handleGoogleClick() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/calendar',
            },
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
        };
    };

    useEffect(() => {
        const currentEmail = document.getElementById('email');
        const isEmailValid = currentEmail.checkValidity();
        if (password.length < 8) setIsSubmitActive(false);
        else if (!isEmailValid) setIsSubmitActive(false);
        else setIsSubmitActive(true); 
    }, [email, password])

    return (
        <div className="loginOuterContainer">
            <div className="loginInnerContainer">
                <h1 className="loginTitle titleFont">Activents</h1>
                <h2 className="loginSubHeading">Login</h2>

                <form onSubmit={handleOnSubmit} className="loginForm">
                    <div className="loginFormInputContainer">
                        <input className="loginFormInput" type="email" id="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>

                    <div className="loginFormInputContainer">
                        <input className="loginFormInput" type={passwordInputType} id="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
                        <FontAwesomeIcon className="loginPasswordEye" icon={passwordInputType === 'password' ? faEyeSlash : faEye} onClick={() => {
                            if (passwordInputType === 'password') setPasswordInputType('text')
                            else setPasswordInputType('password');
                        }}/>
                    </div>

                    <button className={`loginButton ${isSubmitActive && !isLoading ? 'loginButtonAbled' : 'loginButtonDisabled'}`} disabled={!isSubmitActive || isLoading}>
                        {
                            isLoading
                            ?
                            <FontAwesomeIcon icon={faSpinner} className="loginSpinner spinner" />
                            :
                            'Log In'
                        }
                    </button>
                </form>

                <div className="loginDivider">
                    <div className="loginDividerLine" />
                    <h3 className="loginDividerText">Or</h3>
                    <div className="loginDividerLine" />
                </div>

                <button onClick={handleGoogleClick} className="loginGoogleButton">
                    Sign In With Google
                </button>

                <p className="loginRedirectText">Don't have an account? Sign up <Link to={'/signup'}>here</Link></p>
            </div>
        </div>
    )
}