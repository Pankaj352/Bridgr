import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';
import { API_ENDPOINTS } from '@/config/api';

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
            // Basic validation
            if (!input.email.trim() || !input.password.trim()) {
                toast.error('Please fill in all fields');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.email)) {
                toast.error('Please enter a valid email address');
                return;
            }

            const res = await axios.post(API_ENDPOINTS.LOGIN, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                // Redirect admin users to admin dashboard, others to home
                if (res.data.user.isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred during login. Please try again.';
            toast.error(errorMessage);
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