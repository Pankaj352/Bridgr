import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';

const Login = () => {
    const [input, setInput] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://bridgr.onrender.com/api/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate('/');
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className='h-screen flex items-center justify-center'>
            <div className='w-full max-w-md'>
                <h1 className='text-2xl font-bold mb-4 text-center'>Login</h1>
                <form onSubmit={loginHandler} className='space-y-4'>
                    <Input
                        type='email'
                        name='email'
                        value={input.email}
                        onChange={changeEventHandler}
                        placeholder='Email'
                        required
                    />
                    <Input
                        type='password'
                        name='password'
                        value={input.password}
                        onChange={changeEventHandler}
                        placeholder='Password'
                        required
                    />
                    <Button type='submit' className='w-full'>Login</Button>
                </form>
                <p className='text-center mt-4'>
                    Don't have an account?
                    <Link to='/signup' className='text-blue-500 ml-1'>Sign up</Link>
                </p>
            </div>
        </div>
    )
}

export default Login;