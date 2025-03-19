import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Smile, Paperclip } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || attachment) {
      onSendMessage({ text: message, file: attachment });
      setMessage('');
      setAttachment(null);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setAttachment(file);
    } else {
      alert('File size should be less than 5MB');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4 relative bg-white dark:bg-gray-900 sticky bottom-0 w-full">
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <div className="flex-1 flex items-center space-x-2 rounded-full border dark:border-gray-700 px-4 py-2 dark:bg-gray-800">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent focus:outline-none dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Smile size={20} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Paperclip size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>
        <Button
          type="submit"
          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6"
          disabled={!message.trim()}
        >
          Send
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;