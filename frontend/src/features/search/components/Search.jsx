import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { API_ENDPOINTS } from '@/config/api'

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
                `${API_ENDPOINTS.SEARCH_USERS}?query=${query}`,
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
        <div className='max-w-2xl mx-auto py-8'>
            <h1 className='text-2xl font-bold mb-6'>Search Users</h1>
            <div className='space-y-6'>
                <Input
                    type='text'
                    placeholder='Search users...'
                    value={searchQuery}
                    onChange={handleSearch}
                />
                {loading ? (
                    <div className='flex justify-center'>
                        <Loader2 className='animate-spin' />
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {searchResults.map((user) => (
                            <Link
                                key={user._id}
                                to={`/profile/${user._id}`}
                                className='flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-100 transition-colors'
                            >
                                <Avatar>
                                    <AvatarImage src={user.profilePicture} />
                                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className='font-semibold'>{user.username}</h3>
                                    {user.bio && <p className='text-sm text-gray-500'>{user.bio}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Search