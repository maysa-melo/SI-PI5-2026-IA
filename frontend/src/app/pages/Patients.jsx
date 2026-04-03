import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, FileText, Plus } from 'lucide-react';
import { Input } from '../components/ui/input';
import { NewPatientModal } from '../components/NewPatientModal';
import api from '../utils/api';

export function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [existingOwner, setExistingOwner] = useState(null);

  useEffect(() => {
    async function carregarPacientes() {
      try {
        const response = await api.get('/pets');
        console.log('Resposta /pets:', response.data);
        setPatients(response.data);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
      }
    }

    carregarPacientes();
  }, []);

  const handlePatientClick = (patient) => {
    navigate(`/dashboard/pacientes/${patient.id}`);
  };

  const handleCloseNewPatientModal = () => {
    setIsAddingPatient(false);
    setExistingOwner(null);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.raca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.especie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(patient.cliente_id).includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-8 lg:pl-8 pl-20">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Pacientes</h1>
        <p className="text-gray-500 mt-1">Gerenciamento de pacientes cadastrados</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por nome do pet, raça, espécie ou ID do tutor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base border-2 border-gray-200 focus-visible:border-[#EF6C50] focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setIsAddingPatient(true)}
          className="h-14 bg-white border-2 border-[#38A169] text-[#38A169] hover:bg-[#38A169] hover:text-white text-sm font-medium whitespace-nowrap px-6 transition-colors rounded-md inline-flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Paciente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => handlePatientClick(patient)}
            className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-[#EF6C50] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div
                className={`${getAvatarColor(patient.nome || 'Pet')} w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
              >
                {getInitials(patient.nome || 'Pet')}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {patient.nome}
                </h3>
                <p className="text-sm text-gray-600">
                  {patient.raca || 'Raça não informada'} • {patient.especie}
                </p>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  Tutor ID: {patient.cliente_id}
                </p>
              </div>

              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum paciente encontrado</p>
        </div>
      )}

      <NewPatientModal
        isOpen={isAddingPatient}
        onClose={handleCloseNewPatientModal}
        onSubmit={handleCloseNewPatientModal}
        existingOwner={existingOwner}
      />
    </div>
  );
}