import React from 'react'
import './signup.css'
import { useState } from 'react'

function Signup(props) {
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [Cpassword, setCPassword] = useState('')
    const [message, setMessage] = useState('')
    const BaseApi = 'https://drawgame-backend.onrender.com'
    const userChange = (event) => {
        setUser(event.target.value)
    }
    const passwordChange = (event) => {
        setPassword(event.target.value)
    }
    const cpasswordChange = (event) => {
        setCPassword(event.target.value)
    }
    async function sign() {
        const signupData = {
            username: user,
            password: password
        }
        if (user === '' || password === '' || Cpassword === '' || Cpassword !== password) {
            setMessage('invalid credentials')
        } else {
            try {
                const response = await fetch(`${BaseApi}/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(signupData)
                })

                if (!response.ok) {
                    setMessage('signup failed')
                    throw new Error(`response status: ${response.status}`)
                }

                const response_data = await response.json()
                setMessage(response_data.message)
                if(response_data.token){
                    localStorage.setItem('access_token', response_data.token)
                    if(props.onLogin){
                        props.onLogin(response_data.token)
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
            <div className="container">
                <h2>SignUp</h2>
                <label className='lables' value={user} onChange={userChange}>
                    Username
                    <input type="text" value={user} onChange={userChange}/>
                </label>
                <label className='lables'>
                    Password
                    <input type="password" value={password} onChange={passwordChange} />
                </label>
                <label className='lables'>
                    Confirm password
                    <input type="password" value={Cpassword} onChange={cpasswordChange}/>
                </label>
                <div className="last">
                    <h4>{message}</h4>
                    <button className="submit" onClick={sign}>Signup</button>
                </div>
            </div>
        </>
    )
}

export default Signup
