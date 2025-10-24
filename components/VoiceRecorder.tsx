'use client';

import { useState, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Detener todos los tracks del stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error transcribing audio');
      }

      const data = await response.json();
      onTranscript(data.text);
    } catch (error) {
      console.error('Error transcribing:', error);
      alert('Error al transcribir el audio. Por favor intenta de nuevo.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isTranscribing}
      className={`
        p-3 rounded-full transition-all shadow-lg
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : isTranscribing
          ? 'bg-yellow-500'
          : 'bg-gray-700 hover:bg-gray-800'
        }
        text-white disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-110
      `}
      title={isRecording ? 'Detener grabación' : isTranscribing ? 'Transcribiendo...' : 'Grabar audio'}
    >
      {isTranscribing ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isRecording ? (
        <FaStop className="text-lg" />
      ) : (
        <FaMicrophone className="text-lg" />
      )}
    </button>
  );
}
