import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, FileText, Clock, Users, PawPrint, ClipboardList, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { ConsultationModal } from '../components/ConsultationModal';
import { NewPatientModal } from '../components/NewPatientModal';
import { GeneratingModal } from '../components/GeneratingModal';
import { RecordResultModal } from '../components/RecordResultModal';
import { mockPatients } from '../data/patients';

// Mock data for recent patients
const recentPatients = [
  {
    id: 1,
    petName: 'Rex',
    species: 'Cão',
    breed: 'Labrador',
    ownerName: 'Maria Silva',
    lastVisit: '2026-03-17',
    time: '14:30'
  },
  {
    id: 2,
    petName: 'Mimi',
    species: 'Gato',
    breed: 'Siamês',
    ownerName: 'João Santos',
    lastVisit: '2026-03-17',
    time: '11:15'
  },
  {
    id: 3,
    petName: 'Bob',
    species: 'Cão',
    breed: 'Bulldog',
    ownerName: 'Ana Costa',
    lastVisit: '2026-03-16',
    time: '16:45'
  },
  {
    id: 4,
    petName: 'Luna',
    species: 'Gato',
    breed: 'Persa',
    ownerName: 'Pedro Oliveira',
    lastVisit: '2026-03-16',
    time: '10:20'
  },
  {
    id: 5,
    petName: 'Thor',
    species: 'Cão',
    breed: 'Pastor Alemão',
    ownerName: 'Carlos Mendes',
    lastVisit: '2026-03-15',
    time: '15:00'
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [isRecordResultModalOpen, setIsRecordResultModalOpen] = useState(false);
  const countdownRef = useRef(null);

  const handleNewPatient = () => {
    setIsNewPatientModalOpen(true);
  };

  const handleEmergency = () => {
    setIsNewRecordOpen(true);
    setPatientSearchQuery('');
    setSelectedPatient(null);
  };

  const handlePatientClick = (patient) => {
    navigate(`/dashboard/pacientes/${patient.id}`);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleStartConsultation = () => {
    setCountdown(3);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setIsConsultationOpen(true);
        setIsNewRecordOpen(false);
        setCountdown(null);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Filter patients based on search query
  const filteredPatients = recentPatients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.petName.toLowerCase().includes(query) ||
      patient.ownerName.toLowerCase().includes(query) ||
      patient.breed.toLowerCase().includes(query) ||
      patient.species.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6 lg:pl-8 pl-20">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Bem-vindo ao AnimalTalk</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie seus atendimentos de forma rápida e eficiente</p>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Prontuários */}
            <div className="bg-gradient-to-br from-[#7DD87D]/10 to-[#7DD87D]/20 rounded-xl shadow-md border border-[#7DD87D]/25 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1A2332]/70 font-medium">Total de Prontuários</p>
                  <p className="text-3xl font-bold text-[#1A2332] mt-2">18</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#38A169]/12 flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-[#38A169]" />
                </div>
              </div>
            </div>

            {/* Total Pacientes */}
            <div className="bg-gradient-to-br from-[#EF6C50]/8 to-[#EF6C50]/16 rounded-xl shadow-md border border-[#EF6C50]/15 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1A2332]/70 font-medium">Pacientes Cadastrados</p>
                  <p className="text-3xl font-bold text-[#1A2332] mt-2">6</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#EF6C50]/12 flex items-center justify-center">
                  <PawPrint className="w-7 h-7 text-[#EF6C50]" />
                </div>
              </div>
            </div>

            {/* Total Tutores */}
            <div className="bg-gradient-to-br from-[#1c5ca6]/6 to-[#1c5ca6]/12 rounded-xl shadow-md border border-[#1c5ca6]/10 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1A2332]/70 font-medium">Tutores Cadastrados</p>
                  <p className="text-3xl font-bold text-[#1A2332] mt-2">6</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#1c5ca6]/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-[#1c5ca6]" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar nos últimos atendimentos (Nome, Tutor ou Raça)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-4 h-14 text-base border-2 border-gray-200 focus-visible:border-[#EF6C50] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                <Button
                  onClick={handleEmergency}
                  variant="outline"
                  className="h-14 bg-white border-2 border-[#EF6C50] text-[#EF6C50] hover:bg-[#EF6C50] hover:text-white text-sm font-medium whitespace-nowrap px-6 transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Novo Prontuário
                </Button>

                <Button
                  onClick={handleNewPatient}
                  variant="outline"
                  className="h-14 bg-white border-2 border-[#38A169] text-[#38A169] hover:bg-[#38A169] hover:text-white text-sm font-medium whitespace-nowrap px-6 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Paciente
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#38A169]" />
                Últimos Atendimentos
              </h2>
              <p className="text-sm text-gray-500 mt-1">Acesso rápido aos pacientes recentes</p>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientClick(patient)}
                  className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{patient.petName}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {patient.species}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {patient.breed} • Tutor: {patient.ownerName}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{formatDate(patient.lastVisit)}</div>
                      <div className="text-xs">{patient.time}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Record Dialog */}
      <Dialog open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[98vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-[#EF6C50]" />
              Novo Prontuário
            </DialogTitle>
            <DialogDescription className="text-base">
              Selecione o paciente para iniciar o atendimento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Countdown Screen */}
            {countdown !== null && countdown > 0 ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="animate-in zoom-in duration-300">
                    <span className="text-[120px] font-bold text-[#F5A623] leading-none">{countdown}</span>
                  </div>
                  <p className="mt-6 text-xl font-semibold text-gray-700">
                    Iniciando gravação...
                  </p>
                  <p className="mt-2 text-base text-gray-500">
                    Prepare-se para começar o atendimento
                  </p>
                </div>
              </div>
            ) : selectedPatient && countdown === null ? (
              /* Confirmation Screen */
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-[#EF6C50]/10 flex items-center justify-center mx-auto">
                    <PawPrint className="w-10 h-10 text-[#EF6C50]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedPatient.petName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPatient.species} • {selectedPatient.breed}
                    </p>
                    <p className="text-sm text-gray-500">
                      Tutor: {selectedPatient.ownerName}
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPatient(null)}
                      className="h-12 px-6"
                    >
                      Voltar
                    </Button>
                    <Button
                      onClick={handleStartConsultation}
                      className="h-12 px-8 bg-[#EF6C50] hover:bg-[#E05C40] text-white text-base font-semibold"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Iniciar Atendimento
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome do pet, tutor ou raça..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base border-2 border-gray-200 focus-visible:border-[#EF6C50] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                {/* Patient List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {patientSearchQuery
                        ? `${mockPatients.filter((p) => {
                            const query = patientSearchQuery.toLowerCase();
                            return (
                              p.petName.toLowerCase().includes(query) ||
                              p.ownerName.toLowerCase().includes(query) ||
                              p.breed.toLowerCase().includes(query) ||
                              p.species.toLowerCase().includes(query)
                            );
                          }).length} paciente(s) encontrado(s)`
                        : 'Todos os Pacientes'}
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {mockPatients
                      .filter((patient) => {
                        const query = patientSearchQuery.toLowerCase();
                        return (
                          patient.petName.toLowerCase().includes(query) ||
                          patient.ownerName.toLowerCase().includes(query) ||
                          patient.breed.toLowerCase().includes(query) ||
                          patient.species.toLowerCase().includes(query) ||
                          patient.ownerCPF.includes(query)
                        );
                      })
                      .map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full px-4 py-3 hover:bg-gray-50 transition-all text-left"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-sm">{patient.petName}</h4>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {patient.species}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {patient.breed} • {patient.age}
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span>{patient.ownerName}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Modal */}
      <ConsultationModal
        key={isConsultationOpen ? 'open' : 'closed'}
        isOpen={isConsultationOpen} 
        onClose={() => setIsConsultationOpen(false)}
        patient={selectedPatient}
        onFinalize={() => {
          setIsConsultationOpen(false);
          setIsGeneratingModalOpen(true);
          
          // Simulate AI processing time
          setTimeout(() => {
            setIsGeneratingModalOpen(false);
            setIsRecordResultModalOpen(true);
          }, 3000);
        }}
      />

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSubmit={() => {
          // Refresh patient list if needed
          console.log('Patient registered successfully');
        }}
      />

      {/* Generating Modal */}
      <GeneratingModal isOpen={isGeneratingModalOpen} />

      {/* Record Result Modal */}
      <RecordResultModal
        key={isRecordResultModalOpen ? 'open' : 'closed'}
        isOpen={isRecordResultModalOpen}
        onClose={() => {
          setIsRecordResultModalOpen(false);
          setSelectedPatient(null);
        }}
        onSave={(content) => {
          console.log('Saving record:', content);
          alert('Prontuário salvo com sucesso!');
          setIsRecordResultModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
      />
    </div>
  );
}