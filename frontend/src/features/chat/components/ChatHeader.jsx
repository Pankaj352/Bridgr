import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, Phone } from 'lucide-react';

const ChatHeader = ({ selectedUser, onCallInitiate }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={selectedUser?.profilePicture} />
          <AvatarFallback>{selectedUser?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {selectedUser?.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedUser?.status || 'Online'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={() => onCallInitiate('audio')}
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={() => onCallInitiate('video')}
        >
          <Video className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;