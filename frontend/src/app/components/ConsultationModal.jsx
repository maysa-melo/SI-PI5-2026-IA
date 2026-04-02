import { useState, useEffect } from 'react';
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
  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Timer effect
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

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleFinalize = () => {
    setIsRecording(false);
    onFinalize();
  };

  const handleClose = () => {
    if (confirm('Deseja realmente sair? A gravação será perdida.')) {
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
          {/* Patient Profile - Minimal */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#7DD87D]/15 text-[#38A169]">
                <span className="text-base font-semibold">{patient.petName.charAt(0)}</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">{patient.petName}</h2>
                <p className="text-xs text-gray-500">{patient.breed} • {patient.ownerName}</p>
                {patient.allergies && patient.allergies.length > 0 && (
                  <p className="text-xs text-red-600 mt-0.5 font-medium">⚠️ Alergias: {patient.allergies.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recording Visualization */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {/* Timer */}
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full mb-2 border border-gray-200">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-600">
                  {isPaused ? 'Pausado' : 'Gravando'}
                </span>
              </div>
              <div className="text-3xl font-semibold text-gray-900 tabular-nums">
                {formatTime(seconds)}
              </div>
            </div>

            {/* Waveform Visualizer */}
            <AudioWaveform isActive={isRecording && !isPaused} />

            <p className="text-center text-xs text-gray-500 mt-2">
              A IA está transcrevendo e organizandoções em tempo real
            </p>
          </div>

          {/* Control Buttons */}
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

          {/* Info */}
          <div className="text-center text-xs text-gray-400 pb-1">
            <p>
              Fale naturalmente sobre os sintomas, diagnóstico e tratamento.
              O prontuário será gerado automaticamente ao finalizar.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}