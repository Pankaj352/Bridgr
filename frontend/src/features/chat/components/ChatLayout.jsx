import React from 'react';
import ChatInput from './ChatInput';

const ChatLayout = ({ children, conversations }) => {
  return (
    <div className="flex h-screen">
      {/* Conversations sidebar with independent scroll */}
      <div className="w-1/4 border-r dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Conversations</h2>
          {conversations?.map((conversation) => (
            <div
              key={conversation.id}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer mb-2"
            >
              {conversation.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area with independent scroll */}
      <div className="flex-1 flex flex-col h-full">
        {/* Messages container with flex-grow and overflow */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
        
        {/* Chat input fixed at bottom */}
        <ChatInput onSendMessage={(message) => console.log('Message sent:', message)} />
      </div>
    </div>
  );
};

export default ChatLayout;