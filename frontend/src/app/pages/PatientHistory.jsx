import { useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle, FileText, Download, Share2, Calendar, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

const consultations = [
  {
    id: 1,
    date: '2026-03-17',
    time: '14:30',
    type: 'Consulta de Emergência',
    veterinarian: 'Dr. Carlos Mendes',
    summary: 'Vômitos e perda de apetite. Prescrição de ranitidina e metoclopramida. Solicitados exames.',
    status: 'completed'
  },
  {
    id: 2,
    date: '2026-02-10',
    time: '10:15',
    type: 'Consulta de Rotina',
    veterinarian: 'Dra. Ana Paula Silva',
    summary: 'Check-up anual. Vacinação V10 aplicada. Animal saudável, peso ideal (28kg).',
    status: 'completed'
  },
  {
    id: 3,
    date: '2025-11-22',
    time: '16:45',
    type: 'Retorno',
    veterinarian: 'Dr. Carlos Mendes',
    summary: 'Acompanhamento pós-cirúrgico de retirada de tumor benigno. Cicatrização adequada.',
    status: 'completed'
  },
  {
    id: 4,
    date: '2025-11-08',
    time: '09:00',
    type: 'Cirurgia',
    veterinarian: 'Dr. Ricardo Santos',
    summary: 'Remoção cirúrgica de tumor benigno em membro anterior direito. Procedimento sem intercorrências.',
    status: 'completed'
  },
  {
    id: 5,
    date: '2025-08-15',
    time: '11:30',
    type: 'Consulta de Rotina',
    veterinarian: 'Dra. Ana Paula Silva',
    summary: 'Consulta preventiva. Aplicação de antiparasitário. Orientações sobre alimentação balanceada.',
    status: 'completed'
  },
];

export function PatientHistory() {
  const navigate = useNavigate();

  // Mock patient data
  const patient = {
    name: 'Rex',
    breed: 'Golden Retriever',
    age: '5 anos',
    weight: '28 kg',
    owner: 'Maria Silva',
    ownerPhone: '(11) 98765-4321',
    registrationDate: '15/03/2021',
    allergies: ['Dipirona', 'Proteína de Frango']
  };

  const handleViewDetails = (consultation) => {
    alert(`Ver detalhes da consulta de ${new Date(consultation.date).toLocaleDateString('pt-BR')}`);
  };

  const handleExportPDF = (consultation) => {
    alert(`Exportando prontuário em PDF da consulta de ${new Date(consultation.date).toLocaleDateString('pt-BR')}`);
  };

  const handleSendWhatsApp = (consultation) => {
    alert(`Enviando prontuário via WhatsApp para ${patient.ownerPhone}`);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Group consultations by month/year
  const groupedConsultations = {};
  consultations.forEach((consultation) => {
    const monthYear = getMonthYear(consultation.date);
    if (!groupedConsultations[monthYear]) {
      groupedConsultations[monthYear] = [];
    }
    groupedConsultations[monthYear].push(consultation);
  });

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Histórico Clínico</h1>
              <p className="text-xs sm:text-sm text-gray-500">Todos os atendimentos e informações do paciente</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Patient Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1c5ca6] to-[#38A169] px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white text-[#1c5ca6] border-4 border-white shadow-lg">
                  <span className="text-4xl sm:text-6xl font-bold">{patient.name.charAt(0)}</span>
                </div>
                <div className="flex-1 text-center sm:text-left text-white">
                  <h2 className="text-3xl font-bold mb-2">{patient.name}</h2>
                  <div className="space-y-1 text-sm opacity-90">
                    <p className="text-base">{patient.breed} • {patient.age} • {patient.weight}</p>
                    <p>Tutor: {patient.owner} • {patient.ownerPhone}</p>
                    <p>Cadastrado desde: {patient.registrationDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies and Important Info */}
            <div className="p-6 space-y-4">
              {patient.allergies.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 mb-2">⚠️ ALERGIAS</h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#EF6C50]">{consultations.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Consultas</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-2xl font-bold text-[#EF6C50]">5</div>
                  <div className="text-xs text-gray-500 mt-1">Anos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Ativo</div>
                  <div className="text-xs text-gray-500 mt-1">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation History */}
          <div className="bg-white rounded-xl shadow border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#EF6C50]" />
                Histórico de Atendimentos
              </h2>
              <p className="text-sm text-gray-500 mt-1">Cronologia completa de consultas e procedimentos</p>
            </div>

            <div className="p-6">
              {Object.entries(groupedConsultations).map(([monthYear, monthConsultations]) => (
                <div key={monthYear} className="mb-8 last:mb-0">
                  {/* Month/Year Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      {monthYear}
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Consultations */}
                  <div className="space-y-4">
                    {monthConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 hover:border-[#EF6C50] hover:shadow-md transition-all"
                      >
                        {/* Consultation Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-[#EF6C50] text-white rounded-full text-xs font-semibold">
                                {consultation.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {consultation.veterinarian}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {consultation.summary}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-semibold text-gray-900">
                              {formatDate(consultation.date)}
                            </div>
                            <div className="text-gray-500 flex items-center justify-end gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {consultation.time}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                          <Button
                            onClick={() => handleViewDetails(consultation)}
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1 sm:flex-none"
                          >
                            <FileText className="w-4 h-4" />
                            Ver Detalhes
                          </Button>
                          <Button
                            onClick={() => handleExportPDF(consultation)}
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1 sm:flex-none"
                          >
                            <Download className="w-4 h-4" />
                            Exportar PDF
                          </Button>
                          <Button
                            onClick={() => handleSendWhatsApp(consultation)}
                            variant="outline"
                            size="sm"
                            className="gap-2 flex-1 sm:flex-none border-green-500 text-green-600 hover:bg-green-50"
                          >
                            <Share2 className="w-4 h-4" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}