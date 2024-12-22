import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface CallScreenProps {
  isOpen: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
}

export function CallScreen({
  isOpen,
  localStream,
  remoteStream,
  onEndCall,
}: CallScreenProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Cuộc gọi video</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className="relative h-full flex flex-col">
          {/* Main video (remote) */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Local video (picture-in-picture) */}
          <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button
              variant={isAudioEnabled ? "outline" : "destructive"}
              size="icon"
              className="rounded-full w-12 h-12 bg-background/80 hover:bg-background/90"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? (
                <Mic className="h-6 w-6" />
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={onEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              variant={isVideoEnabled ? "outline" : "destructive"}
              size="icon"
              className="rounded-full w-12 h-12 bg-background/80 hover:bg-background/90"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
