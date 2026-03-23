import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, FileText, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { mockPatients } from '../data/patients';

export function NewRecord() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.ownerCPF.includes(searchQuery) ||
      patient.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleStartRecording = () => {
    if (selectedPatient) {
      navigate('/consulta', { state: { patient: selectedPatient } });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#2C5EAD]" />
                Novo Prontuário
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Selecione o paciente para iniciar o atendimento</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome do pet, tutor ou CPF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 text-base border-2 border-gray-200 focus-visible:border-[#2C5EAD] focus-visible:ring-[#2C5EAD]"
              />
            </div>
          </div>

          {/* Selected Patient */}
          {selectedPatient && (
            <div className="bg-gradient-to-r from-[#2C5EAD] to-[#4A90E2] rounded-xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="mb-3">
                <h3 className="text-2xl font-bold">{selectedPatient.petName}</h3>
                <p className="text-sm opacity-90 mt-1">
                  {selectedPatient.species} • {selectedPatient.breed} • {selectedPatient.age}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  Tutor: {selectedPatient.ownerName} • CPF: {selectedPatient.ownerCPF}
                </p>
              </div>
              
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <div className="bg-red-500 bg-opacity-30 border border-white border-opacity-40 rounded-lg px-4 py-3 mt-3">
                  <p className="text-xs font-semibold mb-2">⚠️ ALERGIAS:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white bg-opacity-30 rounded-full text-sm font-medium"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Patient List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900">
                {searchQuery ? `${filteredPatients.length} paciente(s) encontrado(s)` : 'Todos os Pacientes'}
              </h2>
            </div>

            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500">Nenhum paciente encontrado</p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Cadastrar Novo Pet/Tutor
                  </Button>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className={`w-full px-6 py-4 hover:bg-gray-50 transition-all text-left ${
                      selectedPatient?.id === patient.id
                        ? 'bg-blue-50 border-l-4 border-[#2C5EAD]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{patient.petName}</h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {patient.species}
                          </span>
                          {patient.allergies && patient.allergies.length > 0 && (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">
                              ⚠️ Alergias
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {patient.breed} • {patient.age}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{patient.ownerName} • {patient.ownerCPF}</span>
                        </div>
                      </div>
                      
                      {selectedPatient?.id === patient.id && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2C5EAD] text-white flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      {selectedPatient && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={handleStartRecording}
              className="w-full h-14 bg-[#4ECDC4] hover:bg-[#3db8af] text-white text-base font-semibold"
            >
              <FileText className="w-5 h-5 mr-2" />
              Iniciar Gravação do Atendimento
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}