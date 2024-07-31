import { useEffect, useState } from "react";
import supabase from "../supabase";

export default function SignUp ({navigate}) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            setIsLoading(false);
            setFormError(`There has been an error: ${signUpAuthError}`);
            return;
        };

        setFormError('');

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
            setFormError(`There was an error: ${error}`);
        };

        setFormError('');
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
        <div>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" placeholder="First Name" value={firstName}
                    onChange={handleNameChange}
                />
                {!firstNameOnlyLetters && <p>First name should only contain letters</p>}

                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" placeholder="Last Name" value={lastName}
                    onChange={handleNameChange}
                />
                {!lastNameOnlyLetters && <p>Last name should only contain letters</p>}

                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Email" value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Password" value={password}
                    onChange={e => handlePasswordChange(e)}
                />
                <input type="checkbox" onClick={() => {
                    const pass = document.getElementById('password');
                    if (pass.type === 'password') pass.type = 'text';
                    else if (pass.type == 'text') pass.type = 'password';
                }} />Show Password
                <div>
                    <h2>Password Must:</h2>
                    <ul>
                        <li className={`passwordReq ${meetsRequiredLength ? 'validReq' : 'invalidReq'}`}>Be at least 8 characters long</li>
                        <li className={`passwordReq ${containsNumber ? 'validReq' : 'invalidReq'}`}>Contain a number</li>
                        <li className={`passwordReq ${containsLowerCase ? 'validReq' : 'invalidReq'}`}>Contain a lower case character</li>
                        <li className={`passwordReq ${containsUpperCase ? 'validReq' : 'invalidReq'}`}>Contain an upper case character</li>
                        <li className={`passwordReq ${containsSpecialCharacter ? 'validReq' : 'invalidReq'}`}>Contain a special character</li>
                    </ul>
                </div>

                <button disabled={!isSubmitActive}>Sign Up</button>
            </form>

            <div>OR</div>
            <button onClick={handleGoogleClick}>Sign in with Google</button>

            {formError && <p>{formError}</p>}
            {isLoading && <p>Loading...</p>}
        </div>
    )
}