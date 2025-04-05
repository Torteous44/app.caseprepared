import React, { useEffect, useRef } from "react";
import styles from "../../styles/RealtimeConnect.module.css";

interface Transcript {
  text: string;
  speaker: string;
  timestamp: string;
}

interface TranscriptionProps {
  transcripts: Transcript[];
  remoteMediaStream: MediaStream;
  localStream: MediaStream | null;
  isCallActive: boolean;
  onTranscriptReceived: (transcript: Transcript) => void;
}

const Transcription: React.FC<TranscriptionProps> = ({
  transcripts,
  remoteMediaStream,
  localStream,
  isCallActive,
  onTranscriptReceived,
}) => {
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever transcripts update
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  // For now, we're just displaying transcripts without speech-to-text functionality
  // A real implementation would use Web Speech API or another speech recognition service

  return (
    <div className={styles.transcriptContainer} ref={transcriptContainerRef}>
      {transcripts.length === 0 ? (
        <div className={styles.emptyTranscript}>
          Conversation transcript will appear here...
        </div>
      ) : (
        transcripts.map((transcript, index) => (
          <div key={index} className={styles.transcript}>
            <div className={styles.transcriptSpeaker}>
              {transcript.speaker === "user" ? "You" : "Interviewer"}:
            </div>
            <div className={styles.transcriptText}>{transcript.text}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default Transcription;
