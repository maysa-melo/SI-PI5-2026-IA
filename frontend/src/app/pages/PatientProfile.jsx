import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, FileText, Calendar, Clock, User, PawPrint,
  Edit, Save, Download, AlertTriangle, Plus, Trash2, X,
  ClipboardList, History, Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { PetFields, ObservationFields, OwnerFields } from '../components/PatientFormFields';
import { NewPatientModal } from '../components/NewPatientModal';

// Mock data - pacientes
const allPatients = {
  '1': {
    id: '1', petName: 'Rex', species: 'Cão', breed: 'Labrador', age: '5 anos',
    birthDate: '2019-03-15', ownerName: 'Maria Silva', ownerPhone: '(11) 98765-4321',
    ownerCPF: '123.456.789-00', ownerEmail: 'maria.silva@email.com',
    allergies: 'Dipirona', importantNotes: 'Histórico de convulsões'
  },
  '2': {
    id: '2', petName: 'Mimi', species: 'Gato', breed: 'Siamês', age: '3 anos',
    birthDate: '2021-07-22', ownerName: 'João Santos', ownerPhone: '(11) 91234-5678',
    ownerCPF: '987.654.321-00', ownerEmail: 'joao.santos@email.com',
    allergies: '', importantNotes: ''
  },
  '3': {
    id: '3', petName: 'Bob', species: 'Cão', breed: 'Bulldog', age: '4 anos',
    birthDate: '2020-01-25', ownerName: 'Ana Costa', ownerPhone: '(11) 99876-5432',
    ownerCPF: '456.789.123-00', ownerEmail: 'ana.costa@email.com',
    allergies: '', importantNotes: ''
  },
  '4': {
    id: '4', petName: 'Luna', species: 'Gato', breed: 'Persa', age: '2 anos',
    birthDate: '2022-04-10', ownerName: 'Pedro Oliveira', ownerPhone: '(11) 93456-7890',
    ownerCPF: '321.654.987-00', ownerEmail: 'pedro.oliveira@email.com',
    allergies: '', importantNotes: ''
  },
  '5': {
    id: '5', petName: 'Thor', species: 'Cão', breed: 'Pastor Alemão', age: '6 anos',
    birthDate: '2017-11-08', ownerName: 'Carlos Mendes', ownerPhone: '(11) 92345-6789',
    ownerCPF: '789.123.456-00', ownerEmail: 'carlos.mendes@email.com',
    allergies: 'Proteína de Frango', importantNotes: ''
  },
  '6': {
    id: '6', petName: 'Mel', species: 'Cão', breed: 'Shih Tzu', age: '6 anos',
    birthDate: '2018-09-14', ownerName: 'Ricardo Alves', ownerPhone: '(11) 98123-4567',
    ownerCPF: '654.321.987-00', ownerEmail: 'ricardo.alves@email.com',
    allergies: '', importantNotes: ''
  },
  '7': {
    id: '7', petName: 'Nina', species: 'Gato', breed: 'Maine Coon', age: '1 ano',
    birthDate: '2023-02-28', ownerName: 'Fernanda Lima', ownerPhone: '(11) 97654-3210',
    ownerCPF: '147.258.369-00', ownerEmail: 'fernanda.lima@email.com',
    allergies: '', importantNotes: ''
  },
  '8': {
    id: '8', petName: 'Max', species: 'Cão', breed: 'Pastor Alemão', age: '8 anos',
    birthDate: '2016-05-19', ownerName: 'Bruno Rocha', ownerPhone: '(11) 96543-2109',
    ownerCPF: '258.369.147-00', ownerEmail: 'bruno.rocha@email.com',
    allergies: '', importantNotes: ''
  },
};

// Mock prontuários
const mockMedicalRecords = {
  '1': [
    {
      id: 1, date: '2026-03-17', time: '14:30',
      veterinarian: 'Dr. Carlos Mendes',
      type: 'Consulta de Emergência',
      summary: 'Vômitos e perda de apetite. Prescrição de ranitidina e metoclopramida.',
      diagnosis: 'Gastroenterite aguda',
      treatment: 'Ranitidina 50mg 12/12h + Metoclopramida 10mg 8/8h por 5 dias'
    },
    {
      id: 2, date: '2026-02-15', time: '10:00',
      veterinarian: 'Dra. Ana Paula Silva',
      type: 'Consulta de Rotina',
      summary: 'Vacinação antirrábica aplicada. Check-up preventivo sem alterações.',
      diagnosis: 'Animal saudável',
      treatment: 'Vacina antirrábica aplicada'
    },
    {
      id: 3, date: '2025-11-22', time: '16:45',
      veterinarian: 'Dr. Carlos Mendes',
      type: 'Retorno',
      summary: 'Acompanhamento pós-cirúrgico. Cicatrização adequada.',
      diagnosis: 'Recuperação pós-operatória',
      treatment: 'Manter repouso por mais 7 dias'
    },
  ],
  '2': [
    {
      id: 4, date: '2026-03-10', time: '11:15',
      veterinarian: 'Dra. Ana Paula Silva',
      type: 'Consulta de Rotina',
      summary: 'Vacinação antirrábica aplicada. Check-up preventivo sem alterações.',
      diagnosis: 'Animal saudável',
      treatment: 'Vacina antirrábica aplicada'
    },
  ],
  '3': [
    {
      id: 5, date: '2026-03-16', time: '16:45',
      veterinarian: 'Dr. Carlos Mendes',
      type: 'Retorno',
      summary: 'Reavaliação de dermatite. Melhora significativa com o tratamento prescrito.',
      diagnosis: 'Dermatite atópica em remissão',
      treatment: 'Manter tratamento atual por mais 7 dias'
    },
  ],
  '4': [
    {
      id: 6, date: '2026-03-16', time: '10:20',
      veterinarian: 'Dra. Ana Paula Silva',
      type: 'Consulta de Rotina',
      summary: 'Check-up geral. Sem alterações significativas.',
      diagnosis: 'Animal saudável',
      treatment: 'Nenhum tratamento necessário'
    },
  ],
  '5': [
    {
      id: 7, date: '2026-03-15', time: '15:00',
      veterinarian: 'Dr. Carlos Mendes',
      type: 'Consulta de Rotina',
      summary: 'Vacinação V10 aplicada. Desparasitação realizada.',
      diagnosis: 'Animal saudável',
      treatment: 'Vacina V10 + Vermífugo'
    },
  ],
};

const sections = [
  { key: 'last-record', label: 'Último Prontuário', icon: ClipboardList },
  { key: 'history', label: 'Histórico Completo', icon: History },
  { key: 'registration', label: 'Dados Cadastrais', icon: Info },
];

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('last-record');
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingRecordData, setEditingRecordData] = useState(null);

  const patient = allPatients[id];
  const records = mockMedicalRecords[id] || [];
  const latestRecord = records[0] || null;

  const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500',
  ];
  const avatarColor = patient ? avatarColors[patient.petName.charCodeAt(0) % avatarColors.length] : 'bg-gray-400';

  const [formData, setFormData] = useState({
    petName: patient?.petName || '',
    species: patient?.species || '',
    breed: patient?.breed || '',
    birthDate: patient?.birthDate || '',
    ownerName: patient?.ownerName || '',
    ownerPhone: patient?.ownerPhone || '',
    ownerCPF: patient?.ownerCPF || '',
    ownerEmail: patient?.ownerEmail || '',
    allergies: patient?.allergies || '',
    importantNotes: patient?.importantNotes || '',
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    alert('Dados atualizados com sucesso!');
    setIsEditing(false);
  };

  const handleExportPDF = (record) => {
    alert(`Exportando prontuário #${record.id} em PDF`);
  };

  const handleEditRecord = (record) => {
    setEditingRecordId(record.id);
    setEditingRecordData({ ...record });
  };

  const handleSaveRecord = () => {
    alert('Prontuário atualizado com sucesso!');
    setEditingRecordId(null);
    setEditingRecordData(null);
  };

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Paciente não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  // Group records by month
  const groupedRecords = {};
  records.forEach((r) => {
    const key = getMonthYear(r.date);
    if (!groupedRecords[key]) groupedRecords[key] = [];
    groupedRecords[key].push(r);
  });

  return (
    <div className="p-4 sm:p-8 lg:pl-8 pl-20">
      {/* Back + Patient Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#7DD87D]/20 px-6 py-6">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-2xl border-2 border-white shadow`}>
                {patient.petName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.petName}</h1>
                <p className="text-sm text-gray-600">
                  {patient.breed} • {patient.age} • Tutor: {patient.ownerName}
                </p>
              </div>
            </div>
          </div>

          {patient.allergies && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">Alergias:</span>
              <span className="text-sm text-red-700">{patient.allergies}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.key;
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#1c5ca6] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* ========== ÚLTIMO PRONTUÁRIO ========== */}
        {activeSection === 'last-record' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-[#EF6C50]" />
              Último Prontuário
            </h2>

            {!latestRecord ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum prontuário registrado</p>
              </div>
            ) : (
              <RecordCard
                record={latestRecord}
                isEditing={editingRecordId === latestRecord.id}
                editingData={editingRecordData}
                onEdit={() => handleEditRecord(latestRecord)}
                onCancelEdit={() => { setEditingRecordId(null); setEditingRecordData(null); }}
                onSave={handleSaveRecord}
                onExport={() => handleExportPDF(latestRecord)}
                onEditDataChange={setEditingRecordData}
                formatDate={formatDate}
              />
            )}
          </div>
        )}

        {/* ========== HISTÓRICO COMPLETO ========== */}
        {activeSection === 'history' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-[#EF6C50]" />
              Histórico Completo
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {records.length} registro{records.length !== 1 ? 's' : ''}
              </span>
            </h2>

            {records.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum prontuário registrado</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedRecords).map(([monthYear, monthRecords]) => (
                  <div key={monthYear}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        {monthYear}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="space-y-4">
                      {monthRecords.map((record) => (
                        <RecordCard
                          key={record.id}
                          record={record}
                          isEditing={editingRecordId === record.id}
                          editingData={editingRecordData}
                          onEdit={() => handleEditRecord(record)}
                          onCancelEdit={() => { setEditingRecordId(null); setEditingRecordData(null); }}
                          onSave={handleSaveRecord}
                          onExport={() => handleExportPDF(record)}
                          onEditDataChange={setEditingRecordData}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== DADOS CADASTRAIS ========== */}
        {activeSection === 'registration' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#38A169]" />
                Dados Cadastrais
              </h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
            </div>

            <form onSubmit={handleSaveForm} className="space-y-6">
              {/* Pet */}
              <PetFields formData={formData} onChange={setFormData} disabled={!isEditing} />
              <ObservationFields formData={formData} onChange={setFormData} disabled={!isEditing} />

              <div className="border-t border-gray-200 pt-6" />

              {/* Tutor */}
              <OwnerFields
                formData={formData}
                onChange={setFormData}
                disabled={!isEditing}
                headerExtra={!isEditing && (
                  <Button
                    type="button"
                    onClick={() => setIsAddingPet(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-[#38A169] border-[#38A169] hover:bg-[#38A169] hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar outro pet
                  </Button>
                )}
              />

              {/* Excluir Tutor */}
              {!isEditing && (
                <div className="pt-4 border-t border-gray-200">
                  {!isConfirmingDelete ? (
                    <Button
                      type="button"
                      onClick={() => setIsConfirmingDelete(true)}
                      variant="outline"
                      className="gap-2 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Tutor e Todos os Pets
                    </Button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Tem certeza que deseja excluir?</p>
                          <p className="text-sm text-red-700 mt-1">
                            Todos os pets e prontuários de <strong>{formData.ownerName}</strong> serão excluídos permanentemente.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => setIsConfirmingDelete(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            alert('Tutor excluído!');
                            navigate('/dashboard/pacientes');
                          }}
                          size="sm"
                          className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                          Confirmar Exclusão
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botões Salvar/Cancelar */}
              {isEditing && (
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="h-10 px-5 text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 px-5 text-sm bg-[#EF6C50] hover:bg-[#E05C40]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Modal Novo Pet */}
      <NewPatientModal
        isOpen={isAddingPet}
        onClose={() => setIsAddingPet(false)}
        onSubmit={() => setIsAddingPet(false)}
        existingOwner={{
          ownerName: formData.ownerName,
          ownerPhone: formData.ownerPhone,
          ownerCPF: formData.ownerCPF,
          ownerEmail: formData.ownerEmail,
        }}
      />
    </div>
  );
}

/* ========== Componente de Card do Prontuário ========== */
function RecordCard({ record, isEditing, editingData, onEdit, onCancelEdit, onSave, onExport, onEditDataChange, formatDate }) {
  const data = isEditing && editingData ? editingData : record;

  return (
    <div className="rounded-lg p-5 border-2 border-gray-200 hover:border-[#EF6C50] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {data.type && (
            <span className="px-3 py-1 bg-[#EF6C50] text-white rounded-full text-xs font-semibold">
              {data.type}
            </span>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {formatDate(data.date)}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {data.time}
          </div>
        </div>
        {!isEditing && (
          <Button onClick={onEdit} variant="ghost" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        )}
      </div>

      {isEditing && editingData ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Diagnóstico</Label>
            <Input
              value={editingData.diagnosis || ''}
              onChange={(e) => onEditDataChange({ ...editingData, diagnosis: e.target.value })}
              className="h-9 text-sm"
              placeholder="Digite o diagnóstico"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Resumo</Label>
            <Textarea
              value={editingData.summary}
              onChange={(e) => onEditDataChange({ ...editingData, summary: e.target.value })}
              className="text-sm min-h-20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Tratamento</Label>
            <Textarea
              value={editingData.treatment || ''}
              onChange={(e) => onEditDataChange({ ...editingData, treatment: e.target.value })}
              className="text-sm min-h-20"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Veterinário</Label>
            <Input
              value={editingData.veterinarian}
              onChange={(e) => onEditDataChange({ ...editingData, veterinarian: e.target.value })}
              className="h-9 text-sm"
            />
          </div>
        </div>
      ) : (
        <div>
          {data.diagnosis && (
            <div className="mb-2">
              <span className="text-xs font-semibold text-gray-700">Diagnóstico:</span>
              <p className="text-sm text-gray-900">{data.diagnosis}</p>
            </div>
          )}
          <div className="mb-2">
            <span className="text-xs font-semibold text-gray-700">Resumo:</span>
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
          {data.treatment && (
            <div className="mb-2">
              <span className="text-xs font-semibold text-gray-700">Tratamento:</span>
              <p className="text-sm text-gray-700">{data.treatment}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Veterinário: {data.veterinarian}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-gray-100">
        {isEditing ? (
          <>
            <Button onClick={onCancelEdit} variant="outline" size="sm" className="gap-2">
              <X className="w-4 h-4" /> Cancelar
            </Button>
            <Button onClick={onSave} size="sm" className="gap-2 bg-[#EF6C50] hover:bg-[#E05C40]">
              <Save className="w-4 h-4" /> Salvar Prontuário
            </Button>
          </>
        ) : (
          <Button onClick={onExport} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Exportar PDF
          </Button>
        )}
      </div>
    </div>
  );
}
