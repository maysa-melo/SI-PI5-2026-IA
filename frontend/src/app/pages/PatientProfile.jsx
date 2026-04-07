import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, FileText, Calendar, Clock,
  Edit, Save, Download, AlertTriangle, Plus, Trash2, X,
  ClipboardList, History, Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { PetFields, ObservationFields, OwnerFields } from '../components/PatientFormFields';
import { NewPatientModal } from '../components/NewPatientModal';
import api from '../utils/api';

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

  const [pet, setPet] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const [records, setRecords] = useState([]);
  const [latestRecord, setLatestRecord] = useState(null);

  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingRecordData, setEditingRecordData] = useState(null);

  const [formData, setFormData] = useState({
    petName: '',
    species: '',
    breed: '',
    petVivo: true,
    petPeso: '',
    birthDate: '',
    petSexo: '',
    petCastrado: '',
    petPorte: '',
    petCor: '',
    petPelagem: '',
    petPedigree: '',
    petChip: '',
    petMatriculaConvenio: '',
    petFotoUrl: '',

    ownerName: '',
    ownerSexo: '',
    ownerNacionalidade: '',
    ownerEstadoCivil: '',
    ownerCPF: '',
    ownerRG: '',
    ownerDataNascimento: '',
    ownerProfissao: '',
    ownerComoConheceu: '',
    ownerMatriculaConvenio: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerFacebook: '',
    ownerInstagram: '',
    ownerMarcacaoNeutra: '',
    ownerMarcacaoPositiva: '',
    ownerFotoUrl: '',

    allergies: '',
    importantNotes: ''
  });

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const petResponse = await api.get(`/pets/${id}`);
      const petData = petResponse.data;
      setPet(petData);

      const clienteResponse = await api.get(`/clientes/${petData.cliente_id}`);
      const clienteData = clienteResponse.data;
      setCliente(clienteData);

      const prontuariosRes = await api.get(`/pets/${id}/prontuarios`);
      setRecords(prontuariosRes.data || []);
      setLatestRecord(prontuariosRes.data?.[0] || null);

      setFormData({
        petName: petData.nome || '',
        species: petData.especie || '',
        breed: petData.raca || '',
        petVivo: petData.vivo ?? true,
        petPeso: petData.peso_kg ?? '',
        birthDate: petData.data_nascimento || '',
        petSexo: petData.sexo || '',
        petCastrado:
          petData.castrado === true
            ? 'true'
            : petData.castrado === false
              ? 'false'
              : '',
        petPorte: petData.porte || '',
        petCor: petData.cor || '',
        petPelagem: petData.pelagem || '',
        petPedigree: petData.pedigree || '',
        petChip: petData.chip || '',
        petMatriculaConvenio: petData.matricula_convenio || '',
        petFotoUrl: petData.foto_url || '',

        ownerName: clienteData.nome || '',
        ownerSexo: clienteData.sexo || '',
        ownerNacionalidade: clienteData.nacionalidade || '',
        ownerEstadoCivil: clienteData.estado_civil || '',
        ownerCPF: clienteData.cpf || '',
        ownerRG: clienteData.rg || '',
        ownerDataNascimento: clienteData.data_nascimento || '',
        ownerProfissao: clienteData.profissao || '',
        ownerComoConheceu: clienteData.como_conheceu || '',
        ownerMatriculaConvenio: clienteData.matricula_convenio || '',
        ownerEmail: clienteData.email || '',
        ownerPhone: '',
        ownerFacebook: clienteData.facebook || '',
        ownerInstagram: clienteData.instagram || '',
        ownerMarcacaoNeutra: clienteData.marcacao_neutra || '',
        ownerMarcacaoPositiva: clienteData.marcacao_positiva || '',
        ownerFotoUrl: clienteData.foto_url || '',

        allergies: '',
        importantNotes: ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil do paciente:', error);
      setPet(null);
      setCliente(null);
      setRecords([]);
      setLatestRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informado';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Não informado';

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Sem data';

    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Idade não informada';

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return 'Idade não informada';

    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }

    if (years < 1) return 'Menos de 1 ano';
    return `${years} ano${years > 1 ? 's' : ''}`;
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();

    if (!pet || !cliente) return;

    try {
      await api.put(`/clientes/${cliente.id}`, {
        nome: formData.ownerName,
        sexo: formData.ownerSexo || null,
        nacionalidade: formData.ownerNacionalidade || null,
        estado_civil: formData.ownerEstadoCivil || null,
        cpf: formData.ownerCPF || null,
        rg: formData.ownerRG || null,
        data_nascimento: formData.ownerDataNascimento || null,
        profissao: formData.ownerProfissao || null,
        como_conheceu: formData.ownerComoConheceu || null,
        matricula_convenio: formData.ownerMatriculaConvenio || null,
        email: formData.ownerEmail || null,
        facebook: formData.ownerFacebook || null,
        instagram: formData.ownerInstagram || null,
        marcacao_neutra: formData.ownerMarcacaoNeutra || null,
        marcacao_positiva: formData.ownerMarcacaoPositiva || null,
        foto_url: formData.ownerFotoUrl || null,
      });

      await api.put(`/pets/${pet.id}`, {
        cliente_id: cliente.id,
        nome: formData.petName,
        especie: formData.species || null,
        raca: formData.breed || null,
        vivo: formData.petVivo,
        peso_kg: formData.petPeso ? parseFloat(formData.petPeso) : null,
        data_nascimento: formData.birthDate || null,
        sexo: formData.petSexo || null,
        castrado:
          formData.petCastrado === 'true'
            ? true
            : formData.petCastrado === 'false'
              ? false
              : null,
        porte: formData.petPorte || null,
        cor: formData.petCor || null,
        pelagem: formData.petPelagem || null,
        pedigree: formData.petPedigree || null,
        chip: formData.petChip || null,
        matricula_convenio: formData.petMatriculaConvenio || null,
        foto_url: formData.petFotoUrl || null,
      });

      alert('Dados atualizados com sucesso!');
      setIsEditing(false);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      alert('Erro ao atualizar dados do paciente');
    }
  };

  const handleExportPDF = (record) => {
    alert(`Exportando prontuário #${record.id} em PDF`);
  };

  const handleEditRecord = (record) => {
    setEditingRecordId(record.id);
    setEditingRecordData({ ...record });
  };

  const handleSaveRecord = async () => {
    if (!editingRecordData) return;

    try {
      await api.put(`/prontuarios/${editingRecordData.id}`, {
        tipo: editingRecordData.type || null,
        veterinario: editingRecordData.veterinarian || null,
        resumo: editingRecordData.summary || null,
        diagnostico: editingRecordData.diagnosis || null,
        tratamento: editingRecordData.treatment || null,
      });

      alert('Prontuário atualizado com sucesso!');

      setEditingRecordId(null);
      setEditingRecordData(null);

      await carregarDados(); // 🔥 atualiza tela

    } catch (error) {
      console.error('Erro ao atualizar prontuário:', error);
      alert('Erro ao atualizar prontuário');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Tem certeza que deseja excluir este prontuário?')) return;

    try {
      await api.delete(`/prontuarios/${recordId}`);

      const updatedRecords = records.filter((r) => r.id !== recordId);
      setRecords(updatedRecords);
      setLatestRecord(updatedRecords[0] || null);

      setEditingRecordId(null);
      setEditingRecordData(null);
    } catch (error) {
      console.error('Erro ao deletar prontuário:', error);
      alert('Erro ao deletar prontuário');
    }
  };

  const handleDeleteTutor = async () => {
    if (!cliente) return;

    try {
      await api.delete(`/clientes/${cliente.id}`);
      alert('Tutor e pets excluídos com sucesso!');
      navigate('/dashboard/pacientes');
    } catch (error) {
      console.error('Erro ao excluir tutor:', error);
      alert('Erro ao excluir tutor');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Carregando paciente...</p>
      </div>
    );
  }

  if (!pet || !cliente) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Paciente não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const mappedRecords = records.map((r) => ({
    id: r.id,
    type: r.tipo || 'Consulta',
    summary: r.resumo || '',
    diagnosis: r.diagnostico || '',
    treatment: r.tratamento || '',
    veterinarian: r.veterinario || 'Veterinário não informado',
    date: r.criado_em,
    time: new Date(r.criado_em).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  const mappedLatestRecord = latestRecord
    ? {
        id: latestRecord.id,
        type: latestRecord.tipo || 'Consulta',
        summary: latestRecord.resumo || '',
        diagnosis: latestRecord.diagnostico || '',
        treatment: latestRecord.tratamento || '',
        veterinarian: latestRecord.veterinario || 'Veterinário não informado',
        date: latestRecord.criado_em,
        time: new Date(latestRecord.criado_em).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    : null;

  const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500',
  ];

  const avatarColor = avatarColors[(pet.nome || 'P').charCodeAt(0) % avatarColors.length];

  const groupedRecords = {};
  mappedRecords.forEach((r) => {
    const key = getMonthYear(r.date);
    if (!groupedRecords[key]) groupedRecords[key] = [];
    groupedRecords[key].push(r);
  });

  return (
    <div className="p-4 sm:p-8 lg:pl-8 pl-20">
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
                {(pet.nome || 'P').charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{pet.nome}</h1>
                <p className="text-sm text-gray-600">
                  {pet.raca || 'Raça não informada'} • {calculateAge(pet.data_nascimento)} • Tutor: {cliente.nome}
                </p>
              </div>
            </div>
          </div>

          {formData.allergies && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">Alergias:</span>
              <span className="text-sm text-red-700">{formData.allergies}</span>
            </div>
          )}
        </div>
      </div>

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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {activeSection === 'last-record' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <ClipboardList className="w-5 h-5 text-[#EF6C50]" />
              Último Prontuário
            </h2>

            {!mappedLatestRecord ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum prontuário registrado</p>
              </div>
            ) : (
              <RecordCard
                record={mappedLatestRecord}
                isEditing={editingRecordId === mappedLatestRecord.id}
                editingData={editingRecordData}
                onEdit={() => handleEditRecord(mappedLatestRecord)}
                onDelete={handleDeleteRecord}
                onCancelEdit={() => {
                  setEditingRecordId(null);
                  setEditingRecordData(null);
                }}
                onSave={handleSaveRecord}
                onExport={() => handleExportPDF(mappedLatestRecord)}
                onEditDataChange={setEditingRecordData}
                formatDate={formatDate}
              />
            )}
          </div>
        )}

        {activeSection === 'history' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-[#EF6C50]" />
              Histórico Completo
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {records.length} registro{records.length !== 1 ? 's' : ''}
              </span>
            </h2>

            {mappedRecords.length === 0 ? (
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
                          onCancelEdit={() => {
                            setEditingRecordId(null);
                            setEditingRecordData(null);
                          }}
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
              <PetFields formData={formData} onChange={setFormData} disabled={!isEditing} />
              <ObservationFields formData={formData} onChange={setFormData} disabled={!isEditing} />

              <div className="border-t border-gray-200 pt-6" />

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
                            Todos os pets de <strong>{formData.ownerName}</strong> serão excluídos permanentemente.
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
                          onClick={handleDeleteTutor}
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

              {isEditing && (
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      carregarDados();
                    }}
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

      <NewPatientModal
        isOpen={isAddingPet}
        onClose={() => setIsAddingPet(false)}
        onSubmit={async () => {
          setIsAddingPet(false);
          await carregarDados();
        }}
        existingOwner={{
          id: cliente.id,
          ownerName: formData.ownerName,
          ownerSexo: formData.ownerSexo,
          ownerNacionalidade: formData.ownerNacionalidade,
          ownerEstadoCivil: formData.ownerEstadoCivil,
          ownerCPF: formData.ownerCPF,
          ownerRG: formData.ownerRG,
          ownerDataNascimento: formData.ownerDataNascimento,
          ownerProfissao: formData.ownerProfissao,
          ownerComoConheceu: formData.ownerComoConheceu,
          ownerMatriculaConvenio: formData.ownerMatriculaConvenio,
          ownerEmail: formData.ownerEmail,
          ownerFacebook: formData.ownerFacebook,
          ownerInstagram: formData.ownerInstagram,
          ownerMarcacaoNeutra: formData.ownerMarcacaoNeutra,
          ownerMarcacaoPositiva: formData.ownerMarcacaoPositiva,
          ownerFotoUrl: formData.ownerFotoUrl,
        }}
      />
    </div>
  );
}

function RecordCard({
  record,
  isEditing,
  editingData,
  onEdit,
  onCancelEdit,
  onSave,
  onExport,
  onEditDataChange,
  onDelete,
  formatDate
}) {
  const data = isEditing && editingData ? editingData : record;

  return (
    <div className="rounded-lg p-5 border-2 border-gray-200 hover:border-[#EF6C50] transition-all">
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
          <>
            <Button onClick={onExport} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>

            <Button
              onClick={() => onDelete(record.id)}
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </Button>
          </>
        )}
      </div>
    </div>
  );
}