import { useState } from 'react';
import './loginpage.css'


function Loginpage(props) {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const BaseApi = 'http://localhost:3000'
    const userChange = (event) => {
        setUser(event.target.value)
    }
    const passwordChange = (event) => {
        setPassword(event.target.value)
    }

    async function login() {
        let logindata = {
            username: user,
            password: password
        }
        if (user === '' || password === '') {
            setMessage("empty value")
        } else {

            try {
                const response = await fetch(`${BaseApi}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(logindata)
                })
                if (!response.ok) {
                    setMessage('login failed')
                    throw new Error(response.status)
                }
                const data = await response.json()
                setMessage(data.message)
                if (data.token) {
                    localStorage.setItem('access_token', data.token)
                    if(props.onLogin){
                        props.onLogin(data.token)
                    }
                }
            } catch (err) {
                console.error(err)
                setMessage("network error")
            }
        }
    }

    return (
        <>
            <div className='cont'>
                <h2>LOGIN</h2>
                <label>
                    Username
                    <input type="text" className='inputStrips' required autoComplete='on' value={user} onChange={userChange} />
                </label>
                <label>
                    Password
                    <input type="password" className='inputStrips' required autoComplete='on' value={password} onChange={passwordChange} />
                </label>
                <h4 className="message">{message}</h4>
                <button className='SubmitBtn' onClick={login}>LogIn</button>
            </div>
        </>

    )

}

export default Loginpage;