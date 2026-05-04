import { useState, useEffect, useRef } from 'react';
import { Pause, Square, Play } from 'lucide-react';
import { Button } from './ui/button';
import { AudioWaveform } from './AudioWaveform';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { formatTime } from '../utils/time';

export function ConsultationModal({ isOpen, onClose, patient, onFinalize }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMicReady, setIsMicReady] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    let interval = null;

    if (isOpen && isRecording && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isRecording, isPaused]);

  useEffect(() => {
    if (isOpen) {
      setIsRecording(false);
      setIsPaused(false);
      setSeconds(0);
      setAudioLevel(0);
      setIsMicReady(false);
      setIsRequestingMic(false);
      setErrorMessage('');
      audioChunksRef.current = [];
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const iniciarGravacao = async () => {
    if (isRequestingMic || isMicReady) return;
    setIsRequestingMic(true);
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Navegador nao suporta microfone');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i += 1) {
          const value = (dataArray[i] - 128) / 128;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setAudioLevel(Math.min(100, Math.round(rms * 200)));
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      setIsMicReady(true);
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      setErrorMessage('Nao foi possivel acessar o microfone.');
      setIsRecording(false);
    } finally {
      setIsRequestingMic(false);
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current || !isMicReady) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || !isMicReady) {
        reject(new Error('Gravador nao iniciado'));
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        resolve(audioBlob);
      };

      recorder.stop();
    });
  };

  const handleFinalize = async () => {
    if (!isMicReady) {
      setErrorMessage('Ative o microfone antes de finalizar.');
      return;
    }

    setIsRecording(false);

    try {
      const audioBlob = await stopRecording();
      onFinalize({ audioBlob, durationSeconds: seconds });
    } catch (error) {
      console.error(error);
      setErrorMessage('Erro ao finalizar a gravacao.');
    }
  };

  const handleClose = () => {
    if (window.confirm('Deseja realmente sair? A gravação será perdida.')) {
      onClose();
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[98vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Consulta em Andamento</DialogTitle>
          <DialogDescription className="text-base">
            Gravando informações para prontuário automático
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#7DD87D]/15 text-[#38A169]">
                <span className="text-base font-semibold">
                  {(patient.petName || patient.nome || 'P').charAt(0)}
                </span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>

              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">
                  {patient.petName || patient.nome}
                </h2>
                <p className="text-xs text-gray-500">
                  {patient.breed || patient.raca || 'Raça não informada'} • {patient.ownerName || `Tutor ID ${patient.cliente_id}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full mb-2 border border-gray-200">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-600">
                  {!isMicReady ? 'Microfone inativo' : isPaused ? 'Pausado' : 'Gravando'}
                </span>
              </div>

              <div className="text-3xl font-semibold text-gray-900 tabular-nums">
                {formatTime(seconds)}
              </div>
            </div>

            <AudioWaveform isActive={isRecording && !isPaused} />

            <p className="text-center text-xs text-gray-500 mt-2">
              A IA está transcrevendo e organizando informações em tempo real
            </p>
          </div>

          {!isMicReady ? (
            <Button
              onClick={iniciarGravacao}
              className="h-11 bg-[#1c5ca6] hover:bg-[#184d8b] text-white text-sm font-medium rounded-lg"
              disabled={isRequestingMic}
            >
              {isRequestingMic ? 'Solicitando microfone...' : 'Habilitar microfone'}
            </Button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handlePauseResume}
                variant="outline"
                className="h-11 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Retomar
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                )}
              </Button>

              <Button
                onClick={handleFinalize}
                className="h-11 bg-[#EF6C50] hover:bg-[#E05C40] text-white text-sm font-medium rounded-lg"
              >
                <Square className="w-4 h-4 mr-2" />
                Finalizar
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-gray-400 pb-1">
            <p>
              {isMicReady
                ? 'Fale naturalmente sobre os sintomas, diagnostico e tratamento. O prontuario sera gerado ao finalizar.'
                : 'Clique em habilitar microfone para iniciar a gravacao.'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Nivel do microfone: {audioLevel}%</p>
            {errorMessage && (
              <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}