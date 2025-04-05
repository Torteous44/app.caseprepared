import React, { useEffect, useRef } from "react";
import styles from "../../styles/AudioVisualizer.module.css";

interface AudioVisualizerProps {
  mediaStream: MediaStream;
  isLoading: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  mediaStream,
  isLoading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isCleanedUpRef = useRef<boolean>(false);

  // Effect for handling just the animation frame cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  // Separate effect for audio context cleanup on unmount only
  useEffect(() => {
    return () => {
      cleanupAudio();
      isCleanedUpRef.current = true;
    };
  }, []);

  // Cleanup audio resources safely
  const cleanupAudio = () => {
    if (isCleanedUpRef.current) return;

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (err) {
        console.log("Error disconnecting source:", err);
      }
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (err) {
        console.log("Error closing audio context:", err);
      }
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setupVisualization = () => {
      if (isLoading || !mediaStream) {
        renderLoadingAnimation(ctx, canvas);
        return;
      }

      try {
        // Cleanup previous audio resources without using close()
        if (sourceRef.current) {
          try {
            sourceRef.current.disconnect();
          } catch (err) {
            // Ignore disconnection errors
          }
          sourceRef.current = null;
        }

        // Only create a new AudioContext if we don't have one or it's closed
        if (
          !audioContextRef.current ||
          audioContextRef.current.state === "closed"
        ) {
          const AudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContext();
        }

        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source =
          audioContextRef.current.createMediaStreamSource(mediaStream);
        source.connect(analyser);
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const renderFrame = () => {
          if (!canvas || !ctx || !analyser) return;

          animationRef.current = requestAnimationFrame(renderFrame);

          analyser.getByteFrequencyData(dataArray);

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Background
          ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate bar width
          const barCount = bufferLength / 2;
          const barWidth = canvas.width / barCount;
          let x = 0;

          // Draw bars
          for (let i = 0; i < barCount; i++) {
            // Use frequencies for visualization
            const barHeight = (dataArray[i] / 255) * canvas.height;

            // Use a gentle gradient color for the bars
            const hue = (i / barCount) * 120 + 200; // Blue to purple range
            ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;

            // Draw rounded bars
            const barY = canvas.height - barHeight;
            const barX = x + barWidth * 0.1; // Add some padding between bars
            const barW = barWidth * 0.8; // Make bars slightly narrower than the space

            // Draw rounded rectangle
            ctx.beginPath();
            ctx.moveTo(barX + barW / 2, barY);
            ctx.lineTo(barX + barW / 2, barY + barHeight);
            ctx.lineWidth = barW;
            ctx.lineCap = "round";
            ctx.stroke();

            x += barWidth;
          }
        };

        renderFrame();
      } catch (err) {
        console.error("Error setting up audio visualization:", err);
      }
    };

    setupVisualization();

    // Clean up when mediaStream changes - just cancel animation frame
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [mediaStream, isLoading]);

  const renderLoadingAnimation = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    let angle = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw loading indicator
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(100, 100, 255, 0.2)";
      ctx.stroke();

      // Draw loading arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, angle + Math.PI / 2, false);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(100, 200, 255, 0.8)";
      ctx.stroke();

      angle += 0.05;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <canvas
      ref={canvasRef}
      className={styles.visualizer}
      width={800}
      height={300}
    />
  );
};

export default AudioVisualizer;
