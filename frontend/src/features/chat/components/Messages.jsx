import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { setMessages } from "@/redux/chatSlice";
import useGetAllMessage from "../hooks/useGetAllMessage";
import useGetRTM from "../hooks/useGetRTM";
import { Heart, MoreHorizontal, Reply, Trash2, Phone, Video, Check, CheckCheck, Forward, Smile } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import { getSocket } from "@/socket";
import CallHandler from "./CallHandler";

const Messages = ({ selectedUser }) => {
  const dispatch = useDispatch();
  const [showCallControls, setShowCallControls] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useSelector((store) => store.auth);
  const { messages } = useSelector((store) => store.chat);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const typingTimeoutRef = useRef(null);

  useGetAllMessage();
  useGetRTM();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const currentSocket = getSocket();
    if (!currentSocket) return;

    currentSocket.on("userTyping", ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    currentSocket.on("userStoppedTyping", ({ senderId }) => {
      if (senderId === selectedUser?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      if (currentSocket) {
        currentSocket.off("userTyping");
        currentSocket.off("userStoppedTyping");
      }
    };
  }, [selectedUser]);

  const handleReaction = async (messageId, emoji) => {
    try {
      const reactionType = emoji || "❤️";  // Default to heart emoji if none provided
      const res = await axios.post(
        `https://bridgr.onrender.com/api/message/react/${messageId}`,
        { reactionType },
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedMessages = messages.map(msg =>
          msg._id === messageId
            ? { ...msg, reactions: res.data.reactions }
            : msg
        );
        dispatch(setMessages(updatedMessages));

        const currentSocket = getSocket();
        if (currentSocket) {
          currentSocket.emit('messageReaction', {
            messageId,
            reactions: res.data.reactions,
            receiverId: selectedUser._id
          });
        }

        toast.success('Reaction added');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error(error?.response?.data?.message || 'Failed to react to message');
    }
  };

  const handleForward = async (message) => {
    try {
      await axios.post(
        `https://bridgr.onrender.com/api/message/forward/${message._id}`,
        { receiverId: selectedUser._id },
        { withCredentials: true }
      );
      toast.success("Message forwarded");
    } catch (error) {
      toast.error("Failed to forward message");
    }
  };

  const handleUnsend = async (messageId) => {
    try {
      await axios.delete(
        `https://bridgr.onrender.com/api/message/delete/${messageId}`,
        { withCredentials: true }
      );
      toast.success("Message unsent");
    } catch (error) {
      toast.error("Failed to unsend message");
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages?.forEach(message => {
      const messageDate = message?.createdAt ? new Date(message.createdAt) : null;
      if (!messageDate || isNaN(messageDate.getTime())) {
        if (!groups['Invalid Date']) {
          groups['Invalid Date'] = [];
        }
        groups['Invalid Date'].push(message);
      } else {
        const dateKey = messageDate.toISOString().split('T')[0];
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      }
    });
    return groups;
  };

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
          <div className="flex flex-col gap-2 w-full max-w-[240px]">
            <audio 
              controls 
              className="w-full"
              preload="metadata"
              controlsList="nodownload noplaybackrate"
            >
              <source 
                src={message.fileUrl} 
                type={fileExtension === 'webm' ? 'audio/webm;codecs=opus' : `audio/${fileExtension}`} 
              />
              Your browser does not support the audio element.
            </audio>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Audio Message</span>
              <a 
                href={message.fileUrl} 
                download={message.fileName || 'audio-message'}
                className="hover:text-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Download
              </a>
            </div>
          </div>
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

  const [showCallDialog, setShowCallDialog] = useState(false);
  const [activeCallType, setActiveCallType] = useState(null);

  const initiateCall = (type) => {
    setActiveCallType(type);
    setShowCallDialog(true);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-x-hidden">
      <div className="flex gap-3 items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <Avatar className="w-10 h-10">
          <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{selectedUser?.username}</span>
          {isTyping ? (
            <p className="text-sm text-green-500 animate-pulse">typing...</p>
          ) : (
            <span className="text-xs text-gray-500">Active now</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => initiateCall('audio')}
          >
            <Phone className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => initiateCall('video')}
          >
            <Video className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="text-center my-4">
                <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs shadow-sm">
                  {(() => {
                    const formatMessageDate = (date) => {
                      if (date === 'Invalid Date') return 'Unknown Date';
                      try {
                        return format(new Date(date), 'MMMM d, yyyy');
                      } catch {
                        return 'Unknown Date';
                      }
                    };
                    return formatMessageDate(date);
                  })()} 
                </span>
              </div>
              {dateMessages.map((message) => {
                if (!message) return null;

                const isSender = message.sender === user?._id;
                const messageTime = (() => {
                  try {
                    const messageDate = message.createdAt ? new Date(message.createdAt) : null;
                    return messageDate && !isNaN(messageDate.getTime())
                      ? format(messageDate, 'HH:mm')
                      : 'Unknown time';
                  } catch {
                    return 'Unknown time';
                  }
                })();

                return (
                  <div
                    key={message._id}
                    className={`flex flex-col ${isSender ? "items-end" : "items-start"} mb-6 relative group`}
                  >
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {!isSender && (
                        <Avatar className="w-8 h-8 mb-1">
                          <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {isSender ? user?.username : selectedUser?.username}
                          </span>
                          <time className="text-xs text-gray-500">{messageTime}</time>
                        </div>
                        <div className="relative">
                          {message.replyTo && (
                            <div className={`text-sm mb-1 px-3 py-2 rounded-lg ${isSender ? "bg-blue-50" : "bg-gray-50"}`}>
                              <span className="text-gray-500">Replying to:</span> {message.replyTo.text}
                            </div>
                          )}
                          <div
                            className={`px-4 py-2.5 rounded-2xl shadow-sm ${isSender ? "bg-blue-500 text-white" : "bg-white border border-gray-200"}`}
                          >
                            {renderMessageContent(message)}
                          </div>
                          {message.reactions?.length > 0 && (
                            <div className="absolute -bottom-4 right-0 bg-white rounded-full shadow-sm px-2 py-1 flex gap-1">
                              {message.reactions.map((reaction, index) => (
                                <span key={index} className="text-sm">{reaction.emoji}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {isSender && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            {message.seen ? (
                              <>
                                <CheckCheck className="h-4 w-4" />
                                <span>Seen</span>
                              </>
                            ) : message.delivered ? (
                              <>
                                <Check className="h-4 w-4" />
                                <span>Delivered</span>
                              </>
                            ) : (
                              <span>Sent</span>
                            )}
                          </div>
                        )}
                      </div>
                      {isSender && (
                        <Avatar className="w-8 h-8 mb-1">
                          <AvatarImage src={user?.profilePicture} alt="profile" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div className="relative -right-24 -top-3 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0">
                          <EmojiPicker
                            onEmojiClick={(emojiData) => handleReaction(message._id, emojiData.emoji)}
                            width={320}
                            height={400}
                            previewConfig={{ showPreview: false }}
                            searchPlaceholder="Search emoji..."
                            lazyLoadEmojis={true}
                          />
                        </PopoverContent>
                      </Popover>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-gray-100"
                        onClick={() => setReplyingTo(message)}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-gray-100"
                        onClick={() => handleForward(message)}
                      >
                        <Forward className="h-4 w-4" />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-gray-100"
                        onClick={() => handleUnsend(message._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <CallHandler showCallDialog={showCallDialog} activeCallType={activeCallType} setShowCallDialog={setShowCallDialog} />
    </div>
  );
};

export default Messages;
