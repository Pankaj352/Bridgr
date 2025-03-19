import React, { useState } from 'react';
import { cn } from 'lib/utils';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import CallHandler from './CallHandler_Fixed';

const ChatUI = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callType, setCallType] = useState('video');

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      timestamp: Date.now(),
      sender: {
        uid: 'currentUser', // Replace with actual user ID
        username: 'Current User' // Replace with actual username
      }
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const initiateCall = (type) => {
    setCallType(type);
    setIsCallModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <ChatHeader selectedUser={selectedUser} onCallInitiate={initiateCall} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isCurrentUser={message.sender.uid === 'currentUser'}
          />
        ))}
      </div>

      <ChatInput onSendMessage={handleSendMessage} />

      <CallHandler
        isOpen={isCallModalOpen}
        setIsOpen={setIsCallModalOpen}
        selectedUser={selectedUser}
        callType={callType}
      />
    </div>
  );
};

export default ChatUI;