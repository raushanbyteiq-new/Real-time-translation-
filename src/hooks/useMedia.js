import { useCallback, useEffect, useRef, useState } from "react";

export function useMedia() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const videoTrackRef = useRef(null);
  const audioTrackRef = useRef(null);
  const screenTrackRef = useRef(null);

  // Get user media
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isCameraOn,
        audio: isMicOn,
      });
      setLocalStream(stream);

      // Store tracks for toggling
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      videoTrackRef.current = videoTrack;
      audioTrackRef.current = audioTrack;
      return stream;
    } catch (err) {
      console.error("getUserMedia error:", err);
      throw err;
    }
  }, [isCameraOn, isMicOn]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (audioTrackRef.current) {
      const newMicState = !isMicOn;
      audioTrackRef.current.enabled = newMicState;
      setIsMicOn(newMicState);
    }
  }, [isMicOn]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (isScreenSharing) {
      // If screen sharing, stop it first
      await toggleScreenShare();
    }

    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);

    if (videoTrackRef.current) {
      videoTrackRef.current.enabled = newCameraState;
    } else if (newCameraState) {
      // If turning on camera and no track exists, get media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isMicOn,
        });
        const videoTrack = stream.getVideoTracks()[0];
        videoTrackRef.current = videoTrack;

        // Add to existing stream or create new one
        if (localStream) {
          localStream.addTrack(videoTrack);
        } else {
          setLocalStream(stream);
        }
      } catch (err) {
        console.error("toggleCamera error:", err);
      }
    }
  }, [isCameraOn, isScreenSharing, isMicOn, localStream]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      setIsScreenSharing(false);

      // Restore camera if it was on
      if (isCameraOn && videoTrackRef.current) {
        videoTrackRef.current.enabled = true;
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        // Replace video track in local stream
        if (localStream && videoTrackRef.current) {
          localStream.removeTrack(videoTrackRef.current);
          localStream.addTrack(screenTrack);
        }

        screenTrack.onended = () => {
          setIsScreenSharing(false);
          // Restore camera track
          if (isCameraOn && videoTrackRef.current) {
            if (localStream) {
              localStream.removeTrack(screenTrack);
              localStream.addTrack(videoTrackRef.current);
            }
          }
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("toggleScreenShare error:", err);
      }
    }
  }, [isScreenSharing, isCameraOn, localStream]);

  // Initialize media on mount
  useEffect(() => {
    getUserMedia();
  }, [getUserMedia]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }
    };
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    setRemoteStream,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
