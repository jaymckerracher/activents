import { useParams } from 'react-router-dom';
import supabase from '../supabase';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/Navigation';

export default function EditProfile ({navigate, toast, Bounce}) {
    const { id } = useParams();

    const [firstName, setFirstName] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [submitButtonActive, setSubmitButtonActive] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    async function getProfile () {
        const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', id)

        if (error) {
            console.log(error)
            return
        }

        setFirstName(data[0].first_name);
        setLastName(data[0].last_name);
    }

    async function handleSubmit (e) {
        setSubmitLoading(true)
        e.preventDefault();
        const { data, error } = await supabase.auth.updateUser({
            data: {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
            }
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
            return
        }

        const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
            first_name: firstName,
            last_name: lastName,
        })
        .eq('id', id)

        if (profileError) {
            toast.error(`${profileError}`, {
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
            return
        }

        setSubmitLoading(false)
        toast.success('You successfully updated your account!', {
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
        navigate('/')
    }

    useEffect(() => {
        getProfile();
    }, []);

    useEffect(() => {
        firstName && lastName ? setSubmitButtonActive(true) : setSubmitButtonActive(false);
    }, [firstName, lastName])

    if (firstName === null || lastName === null) return (
        <p>Loading...</p>
    )

    return (
        <div className='editProfileOuterContainer'>
            <Navigation toast={toast} Bounce={Bounce} />
            <div className='editProfileInnerContainer'>
                <div className='editProfileContainer'>
                    <h2 className='editProfileTitle'>Edit Profile</h2>
                    <p className='editProfileTagLine'>{`Hi ${firstName}! Here you can make changes to your profile.`}</p>
                    <form onSubmit={handleSubmit} className='editProfileForm'>
                        <div className="editProfileInputContainer">
                            <input className='editProfileInput' type="text" value={firstName} placeholder='First Name' onChange={e => setFirstName(e.target.value)} />
                        </div>

                        <div className="editProfileInputContainer">
                            <input className='editProfileInput' type="text" value={lastName} placeholder='Last Name' onChange={e => setLastName(e.target.value)} />
                        </div>

                        <button className={`editProfileButton ${submitButtonActive && !submitLoading ? 'editProfileButtonAbled' : 'editProfileButtonDisabled'}`} disabled={!submitButtonActive || submitLoading}>
                            {
                                submitLoading
                                ?
                                <FontAwesomeIcon icon={faSpinner} className="loginSpinner spinner" />
                                :
                                'Update Profile'
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}