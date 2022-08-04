import React, { useEffect } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux';
// import {actionCreators} from '.././State'
import { bindActionCreators } from 'redux'
import { login, selectUser } from '../../features/userSlice';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const INITIAL_STATE = useSelector (state => state.signed);
    // console.log(INITIAL_STATE)
    // const password = useSelector(state => state.password);
    // const { handleLogin} = bindActionCreators(actionCreators,dispatch);

    const user = useSelector(selectUser);

    // var token = localStorage.getItem('admintoken');
    // console.log(token);
    // useEffect(() => {
    //     if (token !== null) {
    //         navigate('/pagelist');
    //     }
    // })

    const handleLogins = async function () {
        const data = {
            user_name: username,
            password: password
        }

        console.log(data);
        try {
            const result = await axios.post('http://83.136.219.147:4000/v1/api/admin/login', data
            )
            if (result && result.status === 200) {
                localStorage.setItem("admintoken", result.data.token);
                dispatch(login(result.data.data));
                navigate("/admin/pagelist");
            }
            else {
                alert("username or password is incorrect")
            }
        } catch (err) {
            console.log(err);
            alert("please enter correct username or password");
        }
    }

    const handleForgotPassword = () => {

        console.log('handleForgotPassword clicked');
    }

    return (
        <div className='main_login'>
            <div className='login_box'>
                <h3>Login Portal</h3>
                <hr />
                <div className='input_field'>
                    <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} label='Login' placeholder='username' />
                    <br />
                    <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} label='Password' placeholder='Password' />
                    <br />
                    <button type='button' onClick={handleLogins}  >Login</button>
                </div>

                <hr />
                <div className='forgot'>
                    <p onClick={handleForgotPassword}>forgot password</p>
                </div>
            </div>
        </div>
    )
}
export default Login;