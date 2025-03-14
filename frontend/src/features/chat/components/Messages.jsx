import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useGetAllMessage from "../hooks/useGetAllMessage";
import useGetRTM from "../hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  const messagesEndRef = useRef(null);
  const { user } = useSelector((store) => store.auth);
  const { messages } = useSelector((store) => store.chat);

  useGetAllMessage();
  useGetRTM();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessageContent = (message) => {
    if (message.fileUrl) {
      const fileExtension = message.fileUrl.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
      const isAudio = ['webm', 'mp3', 'wav', 'ogg'].includes(fileExtension);

      if (isImage) {
        return (
          <img 
            src={message.fileUrl} 
            alt="shared image" 
            className="max-w-[200px] rounded-lg"
          />
        );
      } else if (isAudio) {
        return (
          <audio 
            controls 
            className="max-w-[200px]"
            preload="metadata"
          >
            <source src={message.fileUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        );
      } else {
        return (
          <a 
            href={message.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            📎 {message.fileName || 'Shared file'}
          </a>
        );
      }
    }
    return <span>{message.text}</span>;
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const isSender = message.sender === user?._id;
          return (
            <div
              key={message._id}
              className={`flex items-start gap-2 ${isSender ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={isSender ? user?.profilePicture : selectedUser?.profilePicture}
                  alt="profile"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[75%] break-words p-3 rounded-lg ${isSender
                  ? "bg-[#0095F6] text-white"
                  : "bg-gray-100"}`}
              >
                {renderMessageContent(message)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;