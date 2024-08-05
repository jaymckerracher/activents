export default function DeletePopup ({type, title, message, userID, setDeleteClicked, deleteClicked}) {
    async function handleDelete() {

    }

    return (
        <div className={`deletePopBackground ${deleteClicked ? 'profileDeleteClicked' : 'profileDeleteNotClicked'}`}>
            <div className="deletePopup">
                <h1 className="deleteTitle">{title}</h1>
                <p className="deleteMessage">{message}</p>
                <div className="deletePopupButtons">
                    <button className="deleteButton deleteButtonContinue" onClick={handleDelete}>OK</button>
                    <button className="deleteButton deleteButtonCancel" onClick={() => {
                        setDeleteClicked(false);
                    }}>Cancel</button>
                </div>
            </div>
        </div>
    )
}