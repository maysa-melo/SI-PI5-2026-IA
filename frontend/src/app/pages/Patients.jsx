import { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { Input } from '../components/ui/input';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { NewPatientModal } from '../components/NewPatientModal';

// Mock data
const initialPatients = [
  {
    id: '1',
    petName: 'Rex',
    species: 'Cão',
    breed: 'Labrador',
    age: '5 anos',
    birthDate: '2019-03-15',
    ownerName: 'Maria Silva',
    ownerPhone: '(11) 98765-4321',
    ownerCPF: '123.456.789-00',
    ownerEmail: 'maria.silva@email.com'
  },
  {
    id: '2',
    petName: 'Luna',
    species: 'Gato',
    breed: 'Persa',
    age: '3 anos',
    birthDate: '2021-07-22',
    ownerName: 'João Santos',
    ownerPhone: '(11) 91234-5678',
    ownerCPF: '987.654.321-00',
    ownerEmail: 'joao.santos@email.com'
  },
  {
    id: '3',
    petName: 'Thor',
    species: 'Cão',
    breed: 'Golden Retriever',
    age: '7 anos',
    birthDate: '2017-11-08',
    ownerName: 'Ana Oliveira',
    ownerPhone: '(11) 99876-5432',
    ownerCPF: '456.789.123-00',
    ownerEmail: 'ana.oliveira@email.com'
  },
  {
    id: '4',
    petName: 'Mia',
    species: 'Gato',
    breed: 'Siamês',
    age: '2 anos',
    birthDate: '2022-04-10',
    ownerName: 'Pedro Costa',
    ownerPhone: '(11) 93456-7890',
    ownerCPF: '321.654.987-00',
    ownerEmail: 'pedro.costa@email.com'
  },
  {
    id: '5',
    petName: 'Bob',
    species: 'Cão',
    breed: 'Bulldog',
    age: '4 anos',
    birthDate: '2020-01-25',
    ownerName: 'Carla Mendes',
    ownerPhone: '(11) 92345-6789',
    ownerCPF: '789.123.456-00',
    ownerEmail: 'carla.mendes@email.com'
  },
  {
    id: '6',
    petName: 'Mel',
    species: 'Cão',
    breed: 'Shih Tzu',
    age: '6 anos',
    birthDate: '2018-09-14',
    ownerName: 'Ricardo Alves',
    ownerPhone: '(11) 98123-4567',
    ownerCPF: '654.321.987-00',
    ownerEmail: 'ricardo.alves@email.com'
  },
  {
    id: '7',
    petName: 'Nina',
    species: 'Gato',
    breed: 'Maine Coon',
    age: '1 ano',
    birthDate: '2023-02-28',
    ownerName: 'Fernanda Lima',
    ownerPhone: '(11) 97654-3210',
    ownerCPF: '147.258.369-00',
    ownerEmail: 'fernanda.lima@email.com'
  },
  {
    id: '8',
    petName: 'Max',
    species: 'Cão',
    breed: 'Pastor Alemão',
    age: '8 anos',
    birthDate: '2016-05-19',
    ownerName: 'Bruno Rocha',
    ownerPhone: '(11) 96543-2109',
    ownerCPF: '258.369.147-00',
    ownerEmail: 'bruno.rocha@email.com'
  },
];

export function Patients() {
  const [patients, setPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [existingOwner, setExistingOwner] = useState(null);

  const handleAddPetForOwner = (ownerData) => {
    setExistingOwner(ownerData);
    setIsAddingPatient(true);
  };

  const handleDeleteOwner = (ownerCPF) => {
    setPatients((prev) => prev.filter((p) => p.ownerCPF !== ownerCPF));
    setSelectedPatient(null);
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
      patient.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 lg:pl-8 pl-20">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Pacientes</h1>
        <p className="text-gray-500 mt-1">Gerenciamento de pacientes cadastrados</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por nome do pet, tutor ou raça..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base border-2 border-gray-200 focus-visible:border-[#2C5EAD] focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Add Patient Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsAddingPatient(true)}
          className="bg-[#2C5EAD] text-white px-4 py-2 rounded-lg font-semibold"
        >
          Adicionar Paciente
        </button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => setSelectedPatient(patient)}
            className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-[#2C5EAD] hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className={`${getAvatarColor(patient.petName)} w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
              >
                {getInitials(patient.petName)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {patient.petName}
                </h3>
                <p className="text-sm text-gray-600">
                  {patient.breed} • {patient.age}
                </p>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  Tutor: {patient.ownerName}
                </p>
                <p className="text-xs text-gray-400 mt-1">{patient.ownerPhone}</p>
              </div>

              {/* Icon */}
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum paciente encontrado</p>
        </div>
      )}

      {/* Patient Detail Modal */}
      <PatientDetailModal
        key={selectedPatient?.id}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        patient={selectedPatient}
        onAddPetForOwner={handleAddPetForOwner}
        onDeleteOwner={handleDeleteOwner}
      />

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isAddingPatient}
        onClose={handleCloseNewPatientModal}
        onSubmit={handleCloseNewPatientModal}
        existingOwner={existingOwner}
      />
    </div>
  );
}