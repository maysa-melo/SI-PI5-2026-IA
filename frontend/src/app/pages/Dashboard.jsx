import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
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
import api from '../utils/api';

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [isRecordResultModalOpen, setIsRecordResultModalOpen] = useState(false);
  const [resultContent, setResultContent] = useState('');
  const [setProntuarioData] = useState(null);

  const [pets, setPets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const countdownRef = useRef(null);

  useEffect(() => {
    carregarDados();

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (location.state?.startConsultation && location.state?.patient) {
      setSelectedPatient(location.state.patient);
      setIsConsultationOpen(true);
      navigate('/dashboard', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [petsResponse, clientesResponse, prontuariosResponse] = await Promise.all([
        api.get('/pets'),
        api.get('/clientes'),
        api.get('/prontuarios')
      ]);

      setPets(petsResponse.data || []);
      setClientes(clientesResponse.data || []);
      setProntuarios(prontuariosResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPatient = () => {
    setIsNewPatientModalOpen(true);
  };

  const handleEmergency = () => {
    setIsNewRecordOpen(true);
    setPatientSearchQuery('');
    setSelectedPatient(null);
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
    if (!dateStr) return '--/--';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '--/--';

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '--:--';

    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOwnerName = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente?.nome || `Tutor ID: ${clienteId}`;
  };

  const getPatientDisplayData = (pet) => {
    return {
      id: pet.id,
      petName: pet.nome || 'Sem nome',
      species: pet.especie || 'Não informada',
      breed: pet.raca || 'Raça não informada',
      ownerName: getOwnerName(pet.cliente_id),
      ownerCPF: clientes.find((c) => c.id === pet.cliente_id)?.cpf || '',
      age: pet.data_nascimento ? `Nasc.: ${formatDate(pet.data_nascimento)}` : 'Idade não informada',
      lastVisit: pet.criado_em || pet.data_nascimento || null,
      time: pet.criado_em || null,
      raw: pet
    };
  };

  const getPetById = (petId) => {
    return pets.find((pet) => pet.id === petId);
  };

  const getClienteById = (clienteId) => {
    return clientes.find((cliente) => cliente.id === clienteId);
  };

  const allPatients = pets.map(getPatientDisplayData);

  const modalFilteredPatients = allPatients.filter((patient) => {
    const query = patientSearchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      patient.petName.toLowerCase().includes(query) ||
      patient.ownerName.toLowerCase().includes(query) ||
      patient.breed.toLowerCase().includes(query) ||
      patient.species.toLowerCase().includes(query) ||
      patient.ownerCPF.toLowerCase().includes(query)
    );
  });

  const recentAppointments = prontuarios
    .slice()
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
    .map((prontuario) => {
      const pet = getPetById(prontuario.pet_id);
      const tutor = pet ? getClienteById(pet.cliente_id) : null;

      return {
        id: prontuario.id,
        petId: pet?.id,
        petName: pet?.nome || 'Pet não encontrado',
        species: pet?.especie || 'Não informada',
        breed: pet?.raca || 'Raça não informada',
        ownerName: tutor?.nome || 'Tutor não encontrado',
        type: prontuario.tipo || 'Consulta',
        createdAt: prontuario.criado_em,
      };
    })
    .filter((item) => {
      const query = searchQuery.toLowerCase().trim();

      if (!query) return true;

      return (
        item.petName.toLowerCase().includes(query) ||
        item.ownerName.toLowerCase().includes(query) ||
        item.breed.toLowerCase().includes(query) ||
        item.species.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    })
    .slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6 lg:pl-8 pl-20">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Bem-vindo ao AnimalTalk</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie seus atendimentos de forma rápida e eficiente</p>
      </header>

      <div className="flex-1 overflow-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#7DD87D]/10 to-[#7DD87D]/20 rounded-xl shadow-md border border-[#7DD87D]/25 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1A2332]/70 font-medium">Total de Prontuários</p>
                  <p className="text-3xl font-bold text-[#1A2332] mt-2">{prontuarios.length}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#38A169]/12 flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-[#38A169]" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#EF6C50]/8 to-[#EF6C50]/16 rounded-xl shadow-md border border-[#EF6C50]/15 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1A2332]/70 font-medium">Pacientes Cadastrados</p>
                  <p className="text-3xl font-bold text-[#1A2332] mt-2">{pets.length}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#EF6C50]/12 flex items-center justify-center">
                  <PawPrint className="w-7 h-7 text-[#EF6C50]" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1c5ca6]/6 to-[#1c5ca6]/12 rounded-xl shadow-md border border-[#1c5ca6]/10 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1A2332]/70 font-medium">Tutores Cadastrados</p>
                  <p className="text-3xl font-bold text-[#1A2332] mt-2">{clientes.length}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#1c5ca6]/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-[#1c5ca6]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar nos últimos atendimentos (Nome, Tutor, Raça ou Tipo)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-4 h-14 text-base border-2 border-gray-200 focus-visible:border-[#EF6C50] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

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

          <div className="bg-white rounded-xl shadow border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#38A169]" />
                Últimos Atendimentos
              </h2>
              <p className="text-sm text-gray-500 mt-1">Acesso rápido aos atendimentos mais recentes</p>
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Carregando atendimentos...
                </div>
              ) : recentAppointments.length > 0 ? (
                recentAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    onClick={() => appointment.petId && navigate(`/dashboard/pacientes/${appointment.petId}`)}
                    className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{appointment.petName}</h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {appointment.species}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.breed} • Tutor: {appointment.ownerName}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.type}
                        </p>
                      </div>

                      <div className="text-right text-sm text-gray-500">
                        <div>{formatDate(appointment.createdAt)}</div>
                        <div className="text-xs">{formatTime(appointment.createdAt)}</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhum atendimento encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {patientSearchQuery
                        ? `${modalFilteredPatients.length} paciente(s) encontrado(s)`
                        : 'Todos os Pacientes'}
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {modalFilteredPatients.length > 0 ? (
                      modalFilteredPatients.map((patient) => (
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
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        Nenhum paciente encontrado.
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConsultationModal
        key={isConsultationOpen ? 'consultation-open' : 'consultation-closed'}
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        patient={selectedPatient}
        onFinalize={async ({ audioBlob }) => {
          try {
            if (!selectedPatient?.id) {
              throw new Error('Paciente sem identificacao');
            }

            setIsConsultationOpen(false);
            setIsGeneratingModalOpen(true);

            const formData = new FormData();
            formData.append('audio', audioBlob, `consulta-${Date.now()}.webm`);
            formData.append('tipo', 'Consulta');

            const response = await api.post(`/pets/${selectedPatient.id}/prontuarios/audio`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            await carregarDados();

            const prontuario = response.data;
            const textoFormatado = [
              'RESUMO',
              prontuario.resumo || '',
              '',
              'DIAGNOSTICO',
              prontuario.diagnostico || '',
              '',
              'TRATAMENTO',
              prontuario.tratamento || ''
            ].join('\n');

            setProntuarioData(prontuario);
            setResultContent(textoFormatado.trim());
            setIsGeneratingModalOpen(false);
            setIsRecordResultModalOpen(true);
          } catch (error) {
            console.error('Erro ao salvar prontuário:', error);
            const msgErro = error.response?.data?.detail || 'Erro desconhecido';
            alert(`Erro ao salvar prontuário: ${msgErro}`);
            setIsGeneratingModalOpen(false);
          }
        }}
      />

      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSubmit={async () => {
          await carregarDados();
          setIsNewPatientModalOpen(false);
        }}
      />

      <GeneratingModal isOpen={isGeneratingModalOpen} />

      <RecordResultModal
        key={isRecordResultModalOpen ? 'record-open' : 'record-closed'}
        isOpen={isRecordResultModalOpen}
        onClose={() => {
          setIsRecordResultModalOpen(false);
          setSelectedPatient(null);
        }}
        initialContent={resultContent}
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