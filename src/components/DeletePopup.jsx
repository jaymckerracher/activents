import supabase from "../supabase";

export default function DeletePopup ({type, title, message, ids, setDeleteClicked, deleteClicked, additionalData}) {
    async function handleDeleteBooking () {
        const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('user_id', ids.userID)
        .eq('event_id', ids.eventID)

        if (error) {
            console.log(error)
            return;
        }

        await additionalData.setUserEvents(additionalData.userEvents.filter(event => event.id !== ids.eventID))
        setDeleteClicked(false)

        return
    };

    async function handleDeleteEvent () {
        const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', ids.eventID)

        if (error) {
            console.log(error)
            return
        }

        await additionalData.setUserEvents(additionalData.userEvents.filter(event => event.host_id === ids.userID))
        setDeleteClicked(false)
    }

    return (
        <div className={`deletePopBackground ${deleteClicked ? 'profileDeleteClicked' : 'profileDeleteNotClicked'}`}>
            <div className="deletePopup">
                <h1 className="deleteTitle">{title}</h1>
                <p className="deleteMessage">{message}</p>
                <div className="deletePopupButtons">
                    <button className="deleteButton deleteButtonContinue" onClick={() => {
                        if (type === 'event') handleDeleteEvent();
                        if (type === 'booking') handleDeleteBooking();
                    }}>OK</button>

                    <button className="deleteButton deleteButtonCancel" onClick={() => {
                        setDeleteClicked(false);
                    }}>Cancel</button>
                </div>
            </div>
        </div>
    )
}