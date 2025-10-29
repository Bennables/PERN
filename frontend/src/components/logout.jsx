






const logout = () =>
{
    const logoutClicked = () => {
        //send a request to the backend to log out.
        //have to clear redis and redirect to login page


    }
    return (
        <button onClick={logoutClicked}> LOG OUT </button>
    )
}