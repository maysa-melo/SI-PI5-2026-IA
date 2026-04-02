import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Pause, Square, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { AudioWaveform } from '../components/AudioWaveform';
import { formatTime } from '../utils/time';

export function Consultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Get patient data from location state or use mock data
  const patient = location.state?.patient || {
    petName: 'Rex',
    breed: 'Golden Retriever',
    ownerName: 'Maria Silva',
    allergies: ['Dipirona']
  };

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleFinalize = () => {
    setIsRecording(false);
    alert('Finalizando consulta e gerando prontuário com IA...');
    // Navigate to medical record review page
    setTimeout(() => {
      navigate('/prontuario');
    }, 1500);
  };

  const handleBack = () => {
    if (confirm('Deseja realmente sair? A gravação será perdida.')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-medium text-gray-900">Consulta em Andamento</h1>
            <p className="text-xs text-gray-500">Gravando informações para prontuário automático</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl space-y-6">
          {/* Patient Profile - Minimal */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#7DD87D]/15 text-[#38A169]">
                <span className="text-lg font-semibold">{patient.petName.charAt(0)}</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{patient.petName}</h2>
                <p className="text-sm text-gray-500">{patient.breed} • {patient.ownerName}</p>
                {patient.allergies && patient.allergies.length > 0 && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ Alergias: {patient.allergies.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recording Visualization */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            {/* Timer */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-600">
                  {isPaused ? 'Pausado' : 'Gravando'}
                </span>
              </div>
              <div className="text-4xl font-semibold text-gray-900 tabular-nums">
                {formatTime(seconds)}
              </div>
            </div>

            {/* Waveform Visualizer */}
            <AudioWaveform isActive={isRecording && !isPaused} />

            <p className="text-center text-xs text-gray-500 mt-5">
              A IA está transcrevendo e organizandoções em tempo real
            </p>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handlePauseResume}
              variant="outline"
              className="h-12 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg"
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
              className="h-12 bg-[#EF6C50] hover:bg-[#E05C40] text-white text-sm font-medium rounded-lg"
            >
              <Square className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-gray-400 px-4">
            <p>
              Fale naturalmente sobre os sintomas, diagnóstico e tratamento.
              O prontuário será gerado automaticamente ao finalizar.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}