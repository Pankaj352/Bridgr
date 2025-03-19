import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config/api';

const Stories = () => {
    const [stories, setStories] = useState([]);
    const [selectedStory, setSelectedStory] = useState(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const { user } = useSelector(store => store.auth);
    const { socket } = useSelector(store => store.socketio);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await axios.get(API_ENDPOINTS.GET_STORY_FEED, {
                    withCredentials: true
                });
                if (res.data.success) {
                    const filteredStories = res.data.stories.filter(story => {
                        const storyDate = new Date(story.createdAt);
                        const now = new Date();
                        const diff = now - storyDate;
                        return diff < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                    });
                    setStories(filteredStories);
                }
            } catch (error) {
                console.error('Error fetching stories:', error);
            }
        };
        fetchStories();
        const interval = setInterval(fetchStories, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleStoryUpload(selectedFile);
        }
    };

    const handleStoryUpload = async (storyFile) => {
        const formData = new FormData();
        formData.append('story', storyFile);

        try {
            const res = await axios.post(API_ENDPOINTS.CREATE_STORY, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            if (res.data.success) {
                setStories(prev => [res.data.story, ...prev]);
                // Emit notification for new story
                socket.emit('sendNotification', {
                    type: 'story',
                    message: 'posted a new story'
                });
                toast.success('Story uploaded successfully!');
            }
        } catch (error) {
            console.error('Error uploading story:', error);
            toast.error('Failed to upload story');
        }
    };

    const getTimeRemaining = (createdAt) => {
        const storyDate = new Date(createdAt);
        const now = new Date();
        const diff = 24 * 60 * 60 * 1000 - (now - storyDate);
        const hoursRemaining = Math.floor(diff / (60 * 60 * 1000));

        if (hoursRemaining <= 1) {
            return 'Expires in less than an hour!';
        } else {
            return `${hoursRemaining} hours remaining`;
        }
    };

    const openStoryView = (story, index) => {
        setSelectedStory(story);
        setCurrentStoryIndex(index);
        setIsOpen(true);

        const timer = setTimeout(() => {
            if (currentStoryIndex < stories.length - 1) {
                setCurrentStoryIndex(prev => prev + 1);
                setSelectedStory(stories[currentStoryIndex + 1]);
            } else {
                setIsOpen(false);
            }
        }, 5000);

        return () => clearTimeout(timer);
    };

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
        // Add null check for story and story.author
        if (!story || !story.author) return acc;
        
        const authorId = story.author._id;
        if (!acc[authorId]) {
            acc[authorId] = [];
        }
        acc[authorId].push(story);
        return acc;
    }, {});

    return (
        <div className="mb-6 bg-white border-b border-gray-200">
            <div className="flex gap-3 overflow-x-auto p-4 px-6 scrollbar-hide">
                <div className="flex flex-col items-center min-w-[64px] sm:min-w-[80px]">
                    <div className="relative">
                        <label htmlFor="story-upload" className="cursor-pointer">
                            <div className="p-[2px] rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 hover:scale-105 transition-transform">
                                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-white">
                                    <AvatarImage src={user?.profilePicture} />
                                    <AvatarFallback>You</AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 border-2 border-white shadow-sm">
                                    <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                                </div>
                            </div>
                        </label>
                        <input
                            id="story-upload"
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    <span className="text-xs mt-2 truncate w-16 text-center font-medium">Your story</span>
                </div>

                {Object.entries(groupedStories).map(([authorId, authorStories]) => (
                    <div key={authorId} className="flex flex-col items-center min-w-[64px] sm:min-w-[80px]">
                        <button
                            onClick={() => openStoryView(authorStories[0], stories.indexOf(authorStories[0]))}
                            className="focus:outline-none relative"
                        >
                            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#FED373] via-[#F15245] to-[#D92E7F] hover:scale-105 transition-transform">
                                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-white">
                                    <AvatarImage src={authorStories[0].author.profilePicture} className="rounded-full" />
                                    <AvatarFallback>{authorStories[0].author.username[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            {authorStories.length > 1 && (
                                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-[#F58529] to-[#DD2A7B] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                                    {authorStories.length}
                                </div>
                            )}
                        </button>
                        <span className="text-xs mt-2 truncate w-16 text-center font-medium">
                            {authorStories[0].author.username}
                        </span>
                        <span className="text-[10px] text-gray-500">
                            {getTimeRemaining(authorStories[0].createdAt)}
                        </span>
                    </div>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[450px] p-0 overflow-hidden bg-black h-[90vh] mx-auto">
                    <div className="relative h-full">
                        {selectedStory && (
                            <>
                                <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8 ring-2 ring-white/20">
                                            <AvatarImage src={selectedStory.author.profilePicture} />
                                            <AvatarFallback>{selectedStory.author.username[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-white font-semibold text-sm">{selectedStory.author.username}</span>
                                            <span className="text-white/60 text-xs">
                                                {formatDistanceToNow(new Date(selectedStory.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="text-white hover:bg-white/20 rounded-full"
                                    >
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>
                                <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
                                    {stories.map((_, idx) => (
                                        <div key={idx} className="h-0.5 flex-1 overflow-hidden bg-gray-600/60">
                                            <div
                                                className={`h-full bg-white transition-all duration-5000 ease-linear ${idx === currentStoryIndex ? 'animate-progress' : idx < currentStoryIndex ? 'w-full' : 'w-0'}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <img
                                    src={selectedStory.media}
                                    alt="story"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute bottom-4 left-4 right-4 text-white text-sm">
                                    <span className="bg-black/50 px-3 py-1 rounded-full">
                                        {getTimeRemaining(selectedStory.createdAt)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                @keyframes progress {
                    from { width: 0; }
                    to { width: 100%; }
                }
                .animate-progress {
                    animation: progress 5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default Stories;