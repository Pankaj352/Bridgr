import React, { useState } from 'react'
import { Input } from './ui/input'
import { Search as SearchIcon } from 'lucide-react'
import axios from 'axios'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            try {
                const res = await axios.get(
                    `https://bridgr.onrender.com/api/user/search?query=${query}`,
                    { withCredentials: true }
                );
                if (res.data.success) {
                    setSearchResults(res.data.users);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setSearchResults([]);
        }
    };

    return (
        <div className='flex-1 my-8 flex flex-col items-center pl-[20%]'>
            <div className='w-full max-w-2xl px-4'>
                <div className='relative'>
                    <SearchIcon className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
                    <Input
                        placeholder='Search users...'
                        value={searchQuery}
                        onChange={handleSearch}
                        className='pl-10'
                    />
                </div>
                <div className='mt-6 space-y-4'>
                    {searchResults.map((user) => (
                        <Link to={`/profile/${user._id}`} key={user._id}>
                            <div className='flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer'>
                                <Avatar>
                                    <AvatarImage src={user.profilePicture} alt={user.username} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className='font-semibold'>{user.username}</h3>
                                    <p className='text-sm text-gray-500'>{user.bio || 'No bio'}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Search