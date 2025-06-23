import React, { useState, useEffect, useRef } from "react";
import AudioVisualizer from "../components/call/AudioVisualizer";

const AudioVisualizerDemo: React.FC = () => {
  const [speakingState, setSpeakingState] = useState<"none" | "ai" | "user">("none");
  const [volume, setVolume] = useState(0.5);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "pending">("pending");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Simulate volume changes for AI speaking
  useEffect(() => {
    if (speakingState === "ai") {
      const simulateAudio = () => {
        setVolume(Math.random() * 0.7 + 0.3);
      };
      const interval = setInterval(simulateAudio, 200);
      return () => clearInterval(interval);
    } else if (speakingState === "none") {
      setVolume(0.1);
    }
    // For "user" state, volume will be set by microphone analysis
  }, [speakingState]);

  // Initialize microphone when user speaking mode is activated
  useEffect(() => {
    if (speakingState === "user") {
      initializeMicrophone();
    } else {
      cleanupMicrophone();
    }

    return () => cleanupMicrophone();
  }, [speakingState]);

  const initializeMicrophone = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      micStreamRef.current = stream;
      setMicPermission("granted");

      // Create audio context and analyzer
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Start analyzing audio levels
      const analyzeAudio = () => {
        if (analyserRef.current && speakingState === "user") {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // Normalize to 0-1 range and apply some scaling
          const normalizedVolume = Math.min(average / 128, 1);
          const scaledVolume = Math.max(normalizedVolume * 2, 0.1); // Amplify and set minimum
          
          setVolume(scaledVolume);
          
          animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        }
      };

      analyzeAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMicPermission("denied");
      setSpeakingState("none");
    }
  };

  const cleanupMicrophone = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop microphone stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  };

  const handleAiSpeak = () => {
    setSpeakingState(speakingState === "ai" ? "none" : "ai");
  };

  const handleUserSpeak = () => {
    if (speakingState === "user") {
      setSpeakingState("none");
    } else {
      setSpeakingState("user");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        marginBottom: "40px"
      }}>
        <h1 style={{
          color: "white",
          fontSize: "32px",
          fontWeight: "700",
          margin: "0 0 10px 0",
          textShadow: "0 2px 10px rgba(0,0,0,0.3)"
        }}>
          AudioVisualizer Demo
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "16px",
          margin: "0"
        }}>
          Test the AI conversation interface components
        </p>
      </div>

      {/* Main AudioVisualizer */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "600px"
      }}>
        <AudioVisualizer
          isConnected={true}
          isSpeaking={speakingState === "ai"}
          volume={volume}
          status={speakingState === "ai" ? "ai_speaking" : speakingState === "user" ? "listening" : "connected"}
        />
      </div>

      {/* Control Panel */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "20px",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        minWidth: "400px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
        <h3 style={{
          color: "white",
          margin: "0 0 10px 0",
          fontSize: "18px",
          fontWeight: "600",
          textAlign: "center"
        }}>
          Demo Controls
        </h3>

        {/* Two Speaking States */}
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <button
            onClick={handleAiSpeak}
            style={{
              padding: "15px 30px",
              borderRadius: "15px",
              border: "none",
              background: speakingState === "ai" ? "#3b82f6" : "#6b7280",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "16px",
              boxShadow: speakingState === "ai" ? "0 0 20px rgba(59, 130, 246, 0.4)" : "none"
            }}
          >
            {speakingState === "ai" ? "🔊 AI Speaking" : "🤖 AI Speak"}
          </button>

          <button
            onClick={handleUserSpeak}
            disabled={micPermission === "denied"}
            style={{
              padding: "15px 30px",
              borderRadius: "15px",
              border: "none",
              background: speakingState === "user" ? "#10b981" : (micPermission === "denied" ? "#ef4444" : "#6b7280"),
              color: "white",
              fontWeight: "600",
              cursor: micPermission === "denied" ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              fontSize: "16px",
              boxShadow: speakingState === "user" ? "0 0 20px rgba(16, 185, 129, 0.4)" : "none",
              opacity: micPermission === "denied" ? 0.7 : 1
            }}
          >
            {micPermission === "denied" 
              ? "❌ Mic Denied" 
              : speakingState === "user" 
                ? "🎤 Live Microphone" 
                : "🎤 Mic Speak"
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AudioVisualizerDemo; 