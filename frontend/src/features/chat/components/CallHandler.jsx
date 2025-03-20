import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/socket';
import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

const CallHandler = ({ isOpen, setIsOpen, selectedUser, user, callType }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

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

  const handleMediaError = (error) => {
    let errorMessage = '';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera and microphone access is required for calls';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera or microphone found on your device';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Your camera or microphone is already in use';
    } else {
      errorMessage = 'An error occurred while accessing media devices';
    }
    setError(errorMessage);
    toast.error(errorMessage);
    setCallStatus('failed');
    cleanup();
  };

  const initializeCall = async () => {
    if (!socketConnected) {
      setError('Please wait for connection to be established...');
      setCallStatus('failed');
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video',
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        handleMediaError(error);
        return;
      }

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;
      setPeerConnection(pc);

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
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

      pc.onconnectionstatechange = () => {
        switch(pc.connectionState) {
          case 'connected':
            setCallStatus('connected');
            break;
          case 'disconnected':
          case 'failed':
            toast.error('Call connection lost');
            cleanup();
            break;
          case 'closed':
            cleanup();
            break;
        }
      };

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          setCallStatus('connecting');
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const socket = getSocket();
      if (!socket) {
        throw new Error('Socket connection not available');
      }
      socket.emit('callUser', {
        receiverId: selectedUser._id,
        signalData: offer,
        callType,
      });
      setCallStatus('ringing');
    } catch (error) {
      console.error('Error initializing call:', error);
      const errorMessage = error.message === 'Socket connection not available' ?
        'Unable to establish connection. Please try again.' :
        'Failed to initialize call. Please check your device settings.';
      toast.error(errorMessage);
      setError(errorMessage);
      setCallStatus('failed');
      cleanup();
    }
  };

  const cleanup = useCallback(() => {
    setCallStatus('ending');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setCallStatus('ended');
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setError(null);

    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  }, [setIsOpen]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      setError('Socket connection not available. Please try again.');
      setCallStatus('failed');
      return;
    }

    setSocketConnected(socket.connected);

    socket.on('connect', () => {
      setSocketConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      setError('Connection lost. Please check your internet connection.');
      setCallStatus('failed');
    });

    socket.on('connect_error', () => {
      setSocketConnected(false);
      setError('Unable to connect to server. Please try again later.');
      setCallStatus('failed');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      initializeCall();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, cleanup]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) cleanup(); setIsOpen(open); }}>
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
        {/* Your Video/Audio Call UI here */}
      </DialogContent>
    </Dialog>
  );
};

CallHandler.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  selectedUser: PropTypes.object.isRequired,
  callType: PropTypes.oneOf(['audio', 'video']).isRequired,
};

export default CallHandler;
