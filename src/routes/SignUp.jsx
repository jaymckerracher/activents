import { useEffect, useState } from "react";
import supabase from "../supabase";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Bounce } from "react-toastify";

export default function SignUp ({navigate, toast, Bounce}) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordInputType, setPasswordInputType] = useState('password');
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [formError, setFormError] = useState('');
    const [isSubmitActive, setIsSubmitActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // verification states
    const [meetsRequiredLength, setMeetsRequiredLength] = useState(false);
    const [containsNumber, setContainsNumber] = useState(false);
    const [containsUpperCase, setContainsUpperCase] = useState(false);
    const [containsLowerCase, setContainsLowerCase] = useState(false);
    const [containsSpecialCharacter, setContainsSpecialCharacter] = useState(false);

    const [firstNameOnlyLetters, setFirstNameOnlyLetters] = useState(true);
    const [lastNameOnlyLetters, setLastNameOnlyLetters] = useState(true);

    async function handleSubmit (e) {
        e.preventDefault();

        setIsLoading(true)

        // sign up the user to the auth table
        const { error: signUpAuthError } = await supabase.auth.signUp(
            {
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        role: 'user',
                    },
                },
            }
        )

        if (signUpAuthError) {
            toast.error(`${signUpAuthError}`, {
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
            setIsLoading(false);
            return;
        };

        // navigate to the home page after the user has been signed in
        navigate('/signup/verify', { replace: true });
    };

    // handle google button click
    async function handleGoogleClick() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/calendar',
                queryParams: {
                    prompt: 'login',
                }
            },
        });

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

    function handleNameChange (e) {
        const name = e.target.value;

        const lettersOnlyRegex = /[^A-Za-z]/;

        if (e.target.id === 'firstName') {
            setFirstName(name);
            lettersOnlyRegex.test(name) ? setFirstNameOnlyLetters(false) : setFirstNameOnlyLetters(true);
        }

        else if (e.target.id === 'lastName') {
            setLastName(name);
            lettersOnlyRegex.test(name) ? setLastNameOnlyLetters(false) : setLastNameOnlyLetters(true);
        }
    }

    function handlePasswordChange (e) {
        const password = e.target.value;

        // update the state value
        setPassword(password);

        // verify the length
        password.length >= 8 ? setMeetsRequiredLength(true) : setMeetsRequiredLength(false);

        // verify whether password contains number
        const numRegex = /\d/;
        numRegex.test(password) ? setContainsNumber(true) : setContainsNumber(false);

        // verify whether password contains upper case
        const upperRegex = /[A-Z]/;
        upperRegex.test(password) ? setContainsUpperCase(true) : setContainsUpperCase(false);

        // verify whether password contains lower case
        const lowerRegex = /[a-z]/;
        lowerRegex.test(password) ? setContainsLowerCase(true) : setContainsLowerCase(false);

        // verify whether password contains special character
        const specRegex = /[^a-zA-Z0-9]/;
        specRegex.test(password) ? setContainsSpecialCharacter(true) : setContainsSpecialCharacter(false);
    };

    useEffect(() => {
        const currentEmail = document.getElementById('email');
        const isEmailValid = currentEmail.checkValidity();
        if (
            !firstName || 
            !firstNameOnlyLetters || 
            !lastName || 
            !lastNameOnlyLetters || 
            !email || 
            !isEmailValid || 
            !meetsRequiredLength || 
            !containsLowerCase || 
            !containsUpperCase || 
            !containsNumber || 
            !containsSpecialCharacter
        ) setIsSubmitActive(false);
        else setIsSubmitActive(true);
    }, [firstName, lastName, email, password]);

    return (
        <div className="signUpOuterContainer">
            <div className="signUpInnerContainer">
                <h1 className="signUpTitle titleFont">Activents</h1>
                <h2 className="signUpSubHeading">Sign Up</h2>
                <form className="signUpForm" onSubmit={handleSubmit}>
                    <div className="signUpFormInputContainer">
                        <input
                            className="signUpFormInput"
                            type="text"
                            id="firstName"
                            placeholder="First Name"
                            value={firstName}
                            onChange={handleNameChange}
                        />
                        <div className={`nameReqContainer ${firstNameOnlyLetters ? '' : 'nameReqContainerInvalid'}`}>
                            <p className="nameReq">First name should only contain letters!</p>
                        </div>
                    </div>

                    <div className="signUpFormInputContainer">
                        <input
                            className="signUpFormInput"
                            type="text"
                            id="lastName"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={handleNameChange}
                        />
                        <div className={`nameReqContainer ${lastNameOnlyLetters ? '' : 'nameReqContainerInvalid'}`}>
                            <p className='nameReq'>Last name should only contain letters!</p>
                        </div>
                    </div>

                    <div className="signUpFormInputContainer">
                        <input
                            className="signUpFormInput"
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="signUpFormInputContainer">
                        <input
                            className="signUpFormInput"
                            type={passwordInputType}
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => handlePasswordChange(e)}
                            onFocus={() => setPasswordFocus(true)}
                            onBlur={() => setPasswordFocus(false)}
                        />
                        <FontAwesomeIcon
                            className="loginPasswordEye"
                            icon={
                                passwordInputType === 'password' ? faEyeSlash : faEye
                            }
                            onClick={() => {
                                if (passwordInputType === 'password') setPasswordInputType('text')
                                else setPasswordInputType('password');
                            }}
                        />
                    </div>

                    <div className={`signUpPasswordReqsContainer ${passwordFocus ? 'signUpPasswordReqsContainerFocus' : ''}`}>
                        <h3 className="signUpReqsHeading">Password Must:</h3>
                        <ul className="signUpReqsList">
                            <li className={`passwordReq ${meetsRequiredLength ? 'validReq' : 'invalidReq'}`}>Be at least 8 characters long</li>
                            <li className={`passwordReq ${containsNumber ? 'validReq' : 'invalidReq'}`}>Contain a number</li>
                            <li className={`passwordReq ${containsLowerCase ? 'validReq' : 'invalidReq'}`}>Contain a lower case character</li>
                            <li className={`passwordReq ${containsUpperCase ? 'validReq' : 'invalidReq'}`}>Contain an upper case character</li>
                            <li className={`passwordReq ${containsSpecialCharacter ? 'validReq' : 'invalidReq'}`}>Contain a special character</li>
                        </ul>
                    </div>

                    <button
                        className={`signUpButton ${isSubmitActive && !isLoading ? 'signUpButtonAbled' : 'signUpButtonDisabled'}`}
                        disabled={!isSubmitActive || isLoading}
                    >
                        {
                            isLoading
                            ?
                            <FontAwesomeIcon icon={faSpinner} className="signUpSpinner spinner" />
                            :
                            'Sign Up'
                        }
                    </button>
                </form>

                <div className="loginDivider">
                    <div className="loginDividerLine" />
                    <h3 className="loginDividerText">Or</h3>
                    <div className="loginDividerLine" />
                </div>

                <button onClick={handleGoogleClick} className="loginGoogleButton">
                    Sign up with Google
                </button>

                <p className="loginRedirectText">Already have an account? Sign in <Link to={'/login'}>here</Link></p>
            </div>
        </div>
    )
}