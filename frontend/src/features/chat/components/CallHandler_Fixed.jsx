import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/socket';
import { cn } from 'lib/utils';

// @ts-ignore
const CallHandler = ({ isOpen, setIsOpen, selectedUser, callType }) => {
  // Prevent dialog from closing when clicking outside
  // @ts-ignore
  const handleOpenChange = (open) => {
    if (!open) {
      endCall();
    }
    setIsOpen(open);
  };
  // @ts-ignore
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  // @ts-ignore
  const [peerConnection, setPeerConnection] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState('initiating');
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();

  const configuration = useMemo(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }), []);

  // @ts-ignore
  const handleMediaError = (error) => {
    if (error.name === 'NotAllowedError') {
      toast.error('Camera and microphone access is required for calls');
    } else if (error.name === 'NotFoundError') {
      toast.error('No camera or microphone found on your device');
    } else if (error.name === 'NotReadableError') {
      toast.error('Your camera or microphone is already in use');
    }
    cleanup();
  };

  const initializeCall = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video',
        });
        
        // @ts-ignore
        localStreamRef.current = stream;
        // @ts-ignore
        setLocalStream(stream);
        if (localVideoRef.current) {
          // @ts-ignore
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        handleMediaError(error);
        return;
      }

      const pc = new RTCPeerConnection(configuration);
      // @ts-ignore
      peerConnectionRef.current = pc;
      // @ts-ignore
      setPeerConnection(pc);

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        // @ts-ignore
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          // @ts-ignore
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
              const socket = getSocket();
          if (!socket) {
            throw new Error('Socket connection not available');
          }
          socket.emit('iceCandidate', {
            candidate: event.candidate,
            receiverId: selectedUser._id,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('callUser', {
        receiverId: selectedUser._id,
        signalData: offer,
        callType,
      });
      setCallStatus('ringing');
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize call. Please check your device settings.');
      cleanup();
    }
  };

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      // @ts-ignore
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      // @ts-ignore
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      // @ts-ignore
      peerConnectionRef.current.close();
      // @ts-ignore
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setCallStatus('ended');
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);

    setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (isOpen && mounted) {
        await initializeCall();
      }
    };

    initialize();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [isOpen, cleanup]);

  const handleCallDeclined = useCallback(() => {
    toast.error('Call was declined');
    cleanup();
  }, [cleanup]);

  const handleCallEnded = useCallback(() => {
    toast.info('Call ended');
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    // @ts-ignore
    const handleOffer = async (data) => {
      try {
        const pc = new RTCPeerConnection(configuration);
        // @ts-ignore
        peerConnectionRef.current = pc;
        // @ts-ignore
        setPeerConnection(pc);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: data.callType === 'video',
        });
        // @ts-ignore
        localStreamRef.current = stream;
        // @ts-ignore
        setLocalStream(stream);

        if (localVideoRef.current) {
          // @ts-ignore
          localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          // @ts-ignore
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            // @ts-ignore
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const socket = getSocket();
            if (!socket) {
              throw new Error('Socket connection not available');
            }
            socket.emit('iceCandidate', {
              candidate: event.candidate,
              receiverId: data.callerId,
            });
          }
        };

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const socket = getSocket();
        if (!socket) {
          throw new Error('Socket connection not available');
        }
        socket.emit('answerCall', {
          receiverId: data.callerId,
          answer,
        });

        setCallStatus('connected');
      } catch (error) {
        console.error('Error handling offer:', error);
        toast.error('Failed to handle incoming call');
        cleanup();
      }
    };

    // @ts-ignore
    const handleCallAccepted = async (data) => {
      try {
        if (peerConnectionRef.current) {
          // @ts-ignore
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallStatus('connected');
        }
      } catch (error) {
        console.error('Error handling call accepted:', error);
        toast.error('Failed to establish connection');
        cleanup();
      }
    };

    // @ts-ignore
    const handleIceCandidate = async (data) => {
      try {
        if (peerConnectionRef.current) {
          // @ts-ignore
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    const socket = getSocket();
    if (socket) {
      socket.on('incomingCall', handleOffer);
      socket.on('callAccepted', handleCallAccepted);
      socket.on('callDeclined', handleCallDeclined);
      socket.on('callEnded', handleCallEnded);
      socket.on('iceCandidate', handleIceCandidate);

      return () => {
        socket.off('incomingCall');
        socket.off('callAccepted');
        socket.off('callDeclined');
        socket.off('callEnded');
        socket.off('iceCandidate');
      };
    }

    return () => {
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('callDeclined');
      socket.off('callEnded');
      socket.off('iceCandidate');
    };
  }, [configuration]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      // @ts-ignore
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      // @ts-ignore
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        await replaceVideoTrack(stream);
        setIsScreenSharing(false);
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        await replaceVideoTrack(stream);
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  }, [isScreenSharing]);

  // @ts-ignore
  const replaceVideoTrack = async (newStream) => {
    const videoTrack = newStream.getVideoTracks()[0];
    if (peerConnectionRef.current) {
      const sender = peerConnectionRef.current
        // @ts-ignore
        .getSenders()
        // @ts-ignore
        .find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
    }
    if (localVideoRef.current) {
      // @ts-ignore
      localVideoRef.current.srcObject = newStream;
    }
    localStreamRef.current = newStream;
    setLocalStream(newStream);
  };

  const endCall = useCallback(() => {
    const socket = getSocket();
    if (!socket) {
      toast.error('Unable to end call. Connection not available.');
      cleanup();
      return;
    }
    socket.emit('endCall', { receiverId: selectedUser._id });
    cleanup();
  }, [selectedUser._id]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (isOpen && mounted && selectedUser) {
        await initializeCall();
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (!isOpen) {
        cleanup();
      }
    };
  }, [isOpen, selectedUser, cleanup]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogTitle className="sr-only">
          {callType === 'video' ? 'Video Call' : 'Audio Call'} with {selectedUser?.username}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {callStatus === 'initiating' && 'Initializing call...'}
          {callStatus === 'ringing' && 'Ringing...'}
          {callStatus === 'connected' && 'Connected'}
          {callStatus === 'ended' && 'Call ended'}
        </DialogDescription>
        <div className="relative h-[600px] bg-gray-900 rounded-lg overflow-hidden">
          {callType === 'video' && (
            <div className="absolute inset-0 bg-black">
              <video
                // @ts-ignore
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className={cn(
            "absolute inset-0 flex flex-col items-center justify-center",
            callType === 'video' && remoteStream ? 'bg-transparent' : 'bg-gradient-to-b from-gray-800 to-gray-900'
          )}>
            <Avatar className={cn(
              "h-32 w-32 ring-4 transition-all duration-500",
              callStatus === 'ringing' && "animate-pulse ring-white/50",
              callStatus === 'connected' && "ring-green-500/50"
            )}>
              <AvatarImage 
              src={selectedUser?.profilePicture} />
              <AvatarFallback>{selectedUser?.username?.[0]}</AvatarFallback>
            </Avatar>

            <h3 className="mt-4 text-2xl font-semibold text-white">
              {selectedUser?.username}
            </h3>
            <p className="mt-2 text-lg text-white/80 animate-fade-in">
              {callStatus === 'initiating' && 'Initializing call...'}
              {callStatus === 'ringing' && 'Ringing...'}
              {callStatus === 'connected' && 'Connected'}
              {callStatus === 'ended' && 'Call ended'}
            </p>
          </div>

          {callType === 'video' && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-xl transition-transform hover:scale-105">
              <video
                // @ts-ignore
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full transition-all duration-300 shadow-lg",
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800/80 hover:bg-gray-700/80'
              )}
              onClick={toggleMute}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>

            {callType === 'video' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-14 w-14 rounded-full transition-all duration-300 shadow-lg",
                    isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800/80 hover:bg-gray-700/80'
                  )}
                  onClick={toggleVideo}
                >
                  {isVideoOff ? (
                    <VideoOff className="h-6 w-6 text-white" />
                  ) : (
                    <Video className="h-6 w-6 text-white" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-14 w-14 rounded-full transition-all duration-300 shadow-lg",
                    isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-800/80 hover:bg-gray-700/80'
                  )}
                  onClick={toggleScreenShare}
                >
                  <MonitorUp className="h-6 w-6 text-white" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg"
              onClick={endCall}
            >
              <PhoneOff className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

CallHandler.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.object.isRequired,
  callType: PropTypes.string.isRequired,
};

export default CallHandler;
