import { useState } from 'react';
import { FileText, PawPrint, User, Save, Download, Calendar, Clock, Edit, X, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PetFields, ObservationFields, OwnerFields } from './PatientFormFields';


// Mock data de prontuários por paciente
const mockMedicalRecords = {
  '1': [
    {
      id: 1,
      date: '2026-03-17',
      time: '14:30',
      veterinarian: 'Dr. Carlos Mendes',
      summary: 'Vômitos e perda de apetite. Prescrição de ranitidina e metoclopramida.',
      diagnosis: 'Gastroenterite aguda',
      treatment: 'Ranitidina 50mg 12/12h + Metoclopramida 10mg 8/8h por 5 dias'
    },
    {
      id: 2,
      date: '2026-02-15',
      time: '10:00',
      veterinarian: 'Dra. Ana Paula Silva',
      summary: 'Vacinação antirrábica aplicada. Check-up preventivo sem alterações.',
      diagnosis: 'Animal saudável',
      treatment: 'Vacina antirrábica aplicada'
    },
  ],
  '2': [
    {
      id: 3,
      date: '2026-03-10',
      time: '11:15',
      veterinarian: 'Dra. Ana Paula Silva',
      summary: 'Vacinação antirrábica aplicada. Check-up preventivo sem alterações.',
      diagnosis: 'Animal saudável',
      treatment: 'Vacina antirrábica aplicada'
    },
  ],
  '3': [
    {
      id: 4,
      date: '2026-03-16',
      time: '16:45',
      veterinarian: 'Dr. Carlos Mendes',
      summary: 'Reavaliação de dermatite. Melhora significativa com o tratamento prescrito.',
      diagnosis: 'Dermatite atópica em remissão',
      treatment: 'Manter tratamento atual por mais 7 dias'
    },
  ]
};

export function PatientDetailModal({ isOpen, onClose, onAddPetForOwner, onDeleteOwner, patient }) {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingRecordData, setEditingRecordData] = useState(null);
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
    importantNotes: patient?.importantNotes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Dados do paciente atualizados com sucesso!');
    setIsEditing(false);
  };

  const handleExportPDF = (record) => {
    alert(`Exportando prontuário #${record.id} em PDF`);
  };

  const handleEditRecord = (record) => {
    setEditingRecordId(record.id);
    setEditingRecordData({ ...record });
  };

  const handleCancelEditRecord = () => {
    setEditingRecordId(null);
    setEditingRecordData(null);
  };

  const handleSaveRecord = () => {
    alert('Prontuário atualizado com sucesso!');
    setEditingRecordId(null);
    setEditingRecordData(null);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!patient) return null;

  const medicalRecords = mockMedicalRecords[patient.id] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-[#032048]" />
            Ficha do Paciente - {patient.petName}
          </DialogTitle>
          <DialogDescription className="text-base">
            Visualize dados, histórico de prontuários e exporte documentos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Dados do Paciente</TabsTrigger>
            <TabsTrigger value="history">
              Histórico de Prontuários ({medicalRecords.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dados do Paciente */}
          <TabsContent value="info" className="flex-1 overflow-y-auto pr-2 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Edit Button */}
              {!isEditing && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Cadastro
                  </Button>
                </div>
              )}

              {/* Sub-Tabs: Pet e Tutor */}
              <Tabs defaultValue="pet" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pet" className="gap-2">
                    <PawPrint className="w-4 h-4" />
                    Pet
                  </TabsTrigger>
                  <TabsTrigger value="owner" className="gap-2">
                    <User className="w-4 h-4" />
                    Tutor
                  </TabsTrigger>
                </TabsList>

                {/* Sub-Tab: Pet */}
                <TabsContent value="pet" className="space-y-4 mt-4">
                  <PetFields formData={formData} onChange={setFormData} disabled={!isEditing} />
                  <ObservationFields formData={formData} onChange={setFormData} disabled={!isEditing} />
                </TabsContent>

                {/* Sub-Tab: Tutor */}
                <TabsContent value="owner" className="space-y-4 mt-4">
                  <OwnerFields
                    formData={formData}
                    onChange={setFormData}
                    disabled={!isEditing}
                    headerExtra={!isEditing && onAddPetForOwner && (
                      <Button
                        type="button"
                        onClick={() => {
                          onAddPetForOwner({
                            ownerName: formData.ownerName,
                            ownerPhone: formData.ownerPhone,
                            ownerCPF: formData.ownerCPF,
                            ownerEmail: formData.ownerEmail
                          });
                          onClose();
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-[#032048] border-[#032048] hover:bg-[#CFEAF3]"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar outro pet
                      </Button>
                    )}
                  />

                  {/* Excluir Tutor */}
                  {!isEditing && onDeleteOwner && (
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
                              <p className="text-sm font-semibold text-red-800">
                                Tem certeza que deseja excluir?
                              </p>
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
                              className="gap-2"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={() => onDeleteOwner(patient.ownerCPF)}
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
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 justify-end pt-3 border-t sticky bottom-0 bg-white">
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
                    className="h-10 px-5 text-sm bg-[#FFB144] hover:bg-[#E59530]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>

          {/* Tab: Histórico de Prontuários */}
          <TabsContent value="history" className="flex-1 overflow-y-auto pr-2">
            {medicalRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum prontuário registrado para este paciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalRecords.map((record) => {
                  const isEditingThis = editingRecordId === record.id;
                  const currentData = isEditingThis && editingRecordData ? editingRecordData : record;

                  return (
                    <div
                      key={record.id}
                      className="bg-white rounded-lg p-5 border-2 border-gray-200 hover:border-[#032048] transition-all"
                    >
                      {/* Record Header */}
                      <div className="flex flex-col gap-4 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(currentData.date)}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {currentData.time}
                            </div>
                          </div>
                          {!isEditingThis && (
                            <Button
                              onClick={() => handleEditRecord(record)}
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Button>
                          )}
                        </div>

                        {isEditingThis && editingRecordData ? (
                          // Edit Mode
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700">
                                Diagnóstico
                              </Label>
                              <Input
                                value={editingRecordData.diagnosis || ''}
                                onChange={(e) =>
                                  setEditingRecordData({
                                    ...editingRecordData,
                                    diagnosis: e.target.value
                                  })
                                }
                                className="h-9 text-sm"
                                placeholder="Digite o diagnóstico"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700">Resumo</Label>
                              <Textarea
                                value={editingRecordData.summary}
                                onChange={(e) =>
                                  setEditingRecordData({
                                    ...editingRecordData,
                                    summary: e.target.value
                                  })
                                }
                                className="text-sm min-h-20"
                                placeholder="Resumo da consulta"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700">
                                Tratamento
                              </Label>
                              <Textarea
                                value={editingRecordData.treatment || ''}
                                onChange={(e) =>
                                  setEditingRecordData({
                                    ...editingRecordData,
                                    treatment: e.target.value
                                  })
                                }
                                className="text-sm min-h-20"
                                placeholder="Prescrição e tratamento"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-gray-700">
                                Veterinário
                              </Label>
                              <Input
                                value={editingRecordData.veterinarian}
                                onChange={(e) =>
                                  setEditingRecordData({
                                    ...editingRecordData,
                                    veterinarian: e.target.value
                                  })
                                }
                                className="h-9 text-sm"
                                placeholder="Nome do veterinário"
                              />
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex-1">
                            {currentData.diagnosis && (
                              <div className="mb-2">
                                <span className="text-xs font-semibold text-gray-700">
                                  Diagnóstico:
                                </span>
                                <p className="text-sm text-gray-900">{currentData.diagnosis}</p>
                              </div>
                            )}

                            <div className="mb-2">
                              <span className="text-xs font-semibold text-gray-700">Resumo:</span>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {currentData.summary}
                              </p>
                            </div>

                            {currentData.treatment && (
                              <div className="mb-2">
                                <span className="text-xs font-semibold text-gray-700">
                                  Tratamento:
                                </span>
                                <p className="text-sm text-gray-700">{currentData.treatment}</p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500 mt-2">
                              Veterinário: {currentData.veterinarian}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        {isEditingThis ? (
                          <>
                            <Button
                              onClick={handleCancelEditRecord}
                              variant="outline"
                              size="sm"
                              className="gap-2 flex-1 sm:flex-none"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleSaveRecord}
                              size="sm"
                              className="gap-2 flex-1 sm:flex-none bg-[#FFB144] hover:bg-[#E59530]"
                            >
                              <Save className="w-4 h-4" />
                              Salvar Prontuário
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleExportPDF(record)}
                              variant="outline"
                              size="sm"
                              className="gap-2 flex-1 sm:flex-none"
                            >
                              <Download className="w-4 h-4" />
                              Exportar PDF
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}