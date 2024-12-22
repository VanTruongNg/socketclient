import { useEffect, useRef, useState } from 'react';
import { useSocket } from './use-socket';
import { toast } from './use-toast';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export function useCall({ roomId }: { roomId: string }) {
  const socket = useSocket();
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const currentCallId = useRef<string | null>(null);
  const remoteUserId = useRef<string | null>(null);

  const cleanup = () => {
    console.log('Cleaning up call...', {
      currentCallId: currentCallId.current,
      remoteUserId: remoteUserId.current,
      isCallActive,
      isIncomingCall
    });

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    setIsCallActive(false);
    setIsIncomingCall(false);
    currentCallId.current = null;
    remoteUserId.current = null;
  };

  const getLocalStream = async () => {
    try {
      console.log('Getting local stream...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('Got local stream:', stream);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      
      let errorMessage = 'Không thể truy cập camera hoặc microphone';
      if (error instanceof Error) {
        if (error.name === 'NotReadableError') {
          errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Không tìm thấy camera hoặc microphone';
        } else if (error.name === 'NotAllowedError') {
          errorMessage = 'Vui lòng cho phép truy cập camera và microphone';
        }
      }

      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: errorMessage
      });
      return null;
    }
  };

  const createPeerConnection = () => {
    try {
      console.log('Creating peer connection...');
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      
      pc.onicecandidate = (event) => {
        if (event.candidate && remoteUserId.current) {
          console.log('Sending ICE candidate:', event.candidate);
          socket?.emit('webrtc:ice-candidate', {
            callId: currentCallId.current,
            candidate: event.candidate,
            target: remoteUserId.current
          });
        }
      };

      pc.ontrack = (event) => {
        console.log('Received remote track:', event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', pc.iceGatheringState);
      };

      pc.onsignalingstatechange = () => {
        console.log('Signaling state:', pc.signalingState);
      };

      peerConnection.current = pc;
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  };

  const initiateCall = async () => {
    try {
      console.log('Initiating call...', { roomId, socket: !!socket });

      if (!socket?.connected) {
        console.log('Socket not connected');
        return;
      }

      const stream = await getLocalStream();
      if (!stream) {
        console.log('Failed to get local stream');
        return;
      }

      const pc = createPeerConnection();
      if (!pc) {
        console.log('Failed to create peer connection');
        return;
      }

      console.log('Adding local tracks to peer connection');
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      console.log('Emitting call:request event...');
      socket.emit('call:request', { roomId });
      setIsCallActive(true);
    } catch (error) {
      console.error('Error initiating call:', error);
      cleanup();
    }
  };

  const acceptCall = async () => {
    try {
      console.log('Accepting call...', { callId: currentCallId.current });

      const stream = await getLocalStream();
      if (!stream) {
        console.log('Failed to get local stream');
        return;
      }

      const pc = createPeerConnection();
      if (!pc) {
        console.log('Failed to create peer connection');
        return;
      }

      console.log('Adding local tracks to peer connection');
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      console.log('Emitting call:accept event');
      socket?.emit('call:accept', { callId: currentCallId.current });
      setIsCallActive(true);
      setIsIncomingCall(false);
    } catch (error) {
      console.error('Error accepting call:', error);
      cleanup();
    }
  };

  const rejectCall = () => {
    socket?.emit('call:reject', { callId: currentCallId.current });
    cleanup();
  };

  const endCall = () => {
    console.log('Ending call...', {
      currentCallId: currentCallId.current,
      remoteUserId: remoteUserId.current,
      roomId
    });

    if (currentCallId.current && remoteUserId.current) {
      socket?.emit('call:end', { 
        callId: currentCallId.current,
        roomId,
        target: remoteUserId.current
      });
      
      setTimeout(() => {
        cleanup();
      }, 100);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('call:incoming', async (data: { callId: string, caller: { id: string } }) => {
      console.log('Received incoming call:', data);
      currentCallId.current = data.callId;
      remoteUserId.current = data.caller.id;
      setIsIncomingCall(true);
    });

    socket.on('call:accepted', async (data: { callId: string, target: string }) => {
      console.log('Call accepted:', data);
      currentCallId.current = data.callId;
      remoteUserId.current = data.target;
      
      try {
        const pc = peerConnection.current;
        if (!pc) {
          console.log('No peer connection available');
          return;
        }

        console.log('Creating offer...');
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        console.log('Setting local description (offer)');
        await pc.setLocalDescription(offer);

        console.log('Emitting webrtc:offer');
        socket.emit('webrtc:offer', {
          callId: data.callId,
          offer,
          target: data.target
        });
      } catch (error) {
        console.error('Error creating offer:', error);
        cleanup();
      }
    });

    socket.on('call:rejected', () => {
      toast({
        title: 'Cuộc gọi bị từ chối',
        description: 'Người dùng đã từ chối cuộc gọi của bạn'
      });
      cleanup();
    });

    socket.on('call:ended', (data: { callId: string }) => {
      console.log('Call ended by remote user', {
        receivedCallId: data.callId,
        currentCallId: currentCallId.current,
        isIncomingCall,
        isCallActive
      });

      toast({
        title: 'Cuộc gọi đã kết thúc',
      });
      
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
      
      setLocalStream(null);
      setRemoteStream(null);
      setIsCallActive(false);
      setIsIncomingCall(false);
      currentCallId.current = null;
      remoteUserId.current = null;
    });

    socket.on('webrtc:offer', async (data: { callId: string, offer: RTCSessionDescriptionInit, from: string }) => {
      try {
        console.log('Received WebRTC offer:', data);
        remoteUserId.current = data.from;
        
        const pc = peerConnection.current;
        if (!pc) {
          console.log('No peer connection available');
          return;
        }

        console.log('Setting remote description (offer)');
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        console.log('Creating answer...');
        const answer = await pc.createAnswer();
        
        console.log('Setting local description (answer)');
        await pc.setLocalDescription(answer);

        console.log('Emitting webrtc:answer');
        socket.emit('webrtc:answer', {
          callId: data.callId,
          answer,
          target: data.from
        });
      } catch (error) {
        console.error('Error handling offer:', error);
        cleanup();
      }
    });

    socket.on('webrtc:answer', async (data: { answer: RTCSessionDescriptionInit }) => {
      try {
        console.log('Received WebRTC answer:', data);
        
        const pc = peerConnection.current;
        if (!pc) {
          console.log('No peer connection available');
          return;
        }

        console.log('Setting remote description from answer');
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Error handling answer:', error);
        cleanup();
      }
    });

    socket.on('webrtc:ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        console.log('Received ICE candidate:', data);
        
        const pc = peerConnection.current;
        if (!pc) {
          console.log('No peer connection available');
          return;
        }

        console.log('Adding ICE candidate');
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:accepted');
      socket.off('call:rejected');
      socket.off('call:ended');
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:ice-candidate');
      cleanup();
    };
  }, [socket]);

  return {
    isIncomingCall,
    isCallActive,
    remoteStream,
    localStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall
  };
} 