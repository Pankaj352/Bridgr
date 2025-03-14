import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchUsers = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(
                `https://bridgr.onrender.com/api/user/search?query=${query}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                setSearchResults(res.data.users);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchUsers(query);
    };

    return (
        <div className='max-w-2xl mx-auto px-4 py-8'>
            <h1 className='text-2xl font-bold mb-6'>Search Users</h1>
            <div className='space-y-6'>
                <Input
                    type='text'
                    placeholder='Search users...'
                    value={searchQuery}
                    onChange={handleSearch}
                    className='w-full'
                />

                <div className='space-y-4'>
                    {loading ? (
                        <div className='flex justify-center items-center py-4'>
                            <Loader2 className='h-6 w-6 animate-spin' />
                        </div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((user) => (
                            <Link
                                to={`/profile/${user._id}`}
                                key={user._id}
                                className='flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors'
                            >
                                <Avatar>
                                    <AvatarImage src={user.profilePicture} />
                                    <AvatarFallback>UN</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className='font-semibold'>{user.username}</h3>
                                    <p className='text-sm text-gray-500'>{user.bio || 'No bio available'}</p>
                                </div>
                            </Link>
                        ))
                    ) : searchQuery && (
                        <p className='text-center text-gray-500 py-4'>
                            No users found matching '{searchQuery}'
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Search