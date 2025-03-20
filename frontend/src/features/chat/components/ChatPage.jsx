import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircleCode, Smile, Paperclip, Mic, Square } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getSocket } from "@/socket";
import { toast } from "sonner";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const fileInputRef = useRef(null);
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  const handleEmojiSelect = (emoji) => {
    setTextMessage(prev => prev + emoji.native);
    handleTyping();
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      const socket = getSocket();
      if (socket) {
        socket.emit('typing', { receiverId: selectedUser?._id });
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const socket = getSocket();
      if (socket) {
        socket.emit('stopTyping', { receiverId: selectedUser?._id });
      }
    }, 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('textMessage', textMessage);

    try {
      const res = await axios.post(
        `https://bridgr.onrender.com/api/message/send/${selectedUser?._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const newMessage = res.data.newMessage;
        dispatch(setMessages([...messages, newMessage]));
        setTextMessage("");

        const currentSocket = getSocket();
        if (currentSocket) {
          currentSocket.emit('sendNotification', {
            receiverId: selectedUser._id,
            type: 'message',
            messageId: newMessage._id
          });
        }
      }
    } catch (error) {
      toast.error('Failed to send file');
      console.error(error);
    }
  };

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;

    try {
      const res = await axios.post(
        `https://bridgr.onrender.com/api/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const newMessage = res.data.newMessage;
        dispatch(setMessages([...messages, newMessage]));
        setTextMessage("");

        const currentSocket = getSocket();
        if (currentSocket) {
          currentSocket.emit('sendNotification', {
            receiverId: selectedUser._id,
            type: 'message',
            messageId: newMessage._id
          });
        }
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      // Check for browser MIME type support
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunks, { type: mimeType });

          if (audioBlob.size === 0) {
            toast.error('Empty audio message');
            return;
          }

          // Create a file from the blob with proper extension based on MIME type
          const fileExtension = mimeType.includes('webm') ? 'webm'
            : mimeType.includes('mp4') ? 'mp4'
            : 'wav';

          const audioFile = new File([audioBlob], `audio-message.${fileExtension}`, { 
            type: mimeType,
            lastModified: Date.now()
          });

          const formData = new FormData();
          formData.append('file', audioFile);
          formData.append('textMessage', '');

          const res = await axios.post(
            `https://bridgr.onrender.com/api/message/send/${selectedUser?._id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              withCredentials: true,
            }
          );

          if (res.data.success) {
            dispatch(setMessages([...messages, res.data.newMessage]));
            toast.success('Audio message sent successfully');

            const currentSocket = getSocket();
            if (currentSocket) {
              currentSocket.emit('messageDelivered', {
                messageId: res.data.newMessage._id,
                senderId: selectedUser._id,
              });
            }
          }
        } catch (error) {
          console.error('Error sending audio message:', error);
          if (error.response?.status === 400) {
            toast.error(error.response.data.message || 'Invalid audio format');
          } else {
            toast.error('Failed to send audio message');
          }
        }
      };

      recorder.start(100); // Capture data more frequently
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording && audioStream) {
      mediaRecorder.stop();
      audioStream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setAudioStream(null);
      setMediaRecorder(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <section className="w-full md:w-1/4 bg-white shadow-sm p-4">
        <h1 className="font-bold mb-6 text-xl text-gray-800">{user?.username}</h1>
        <hr className="mb-4 border-gray-200" />
        <div className="overflow-y-auto h-[calc(100vh-120px)] custom-scrollbar">
          {suggestedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                key={suggestedUser._id}
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className={`flex gap-3 items-center p-3 rounded-lg transition-colors ${selectedUser?._id === suggestedUser._id ? 'bg-gray-100' : 'hover:bg-gray-50'} cursor-pointer mb-2`}>
                <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-gray-100">
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-gray-900">{suggestedUser?.username}</span>
                  <span className={`text-xs font-semibold ${isOnline ? "text-green-600" : "text-gray-400"}`}>
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {selectedUser ? (
        <section className="flex-1 bg-white shadow-sm flex flex-col h-full ml-4">
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center gap-2 p-4 border-t border-gray-200 bg-white">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-gray-100 transition-colors"
            >
              <Paperclip className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={`hover:bg-gray-100 transition-colors ${isRecording ? 'text-red-500' : 'text-gray-600'}`}
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 transition-colors">
                  <Smile className="h-5 w-5 text-gray-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-none shadow-lg">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                />
              </PopoverContent>
            </Popover>
            <Input
              value={textMessage}
              onChange={(e) => {
                setTextMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && sendMessageHandler(selectedUser?._id)}
              type="text"
              className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:ring-offset-0"
              placeholder="Type a message..."
            />
            <Button 
              onClick={() => sendMessageHandler(selectedUser?._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white ml-4 shadow-sm">
          <MessageCircleCode className="w-32 h-32 text-gray-400 mb-4" />
          <h1 className="font-medium text-xl text-gray-800 mb-2">Your messages</h1>
          <span className="text-gray-500">Select a chat to start messaging</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
