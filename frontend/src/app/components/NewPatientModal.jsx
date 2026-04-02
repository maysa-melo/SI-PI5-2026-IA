import { useState } from 'react';
import { Plus, PawPrint, User, Info } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PetFields, ObservationFields, OwnerFields } from './PatientFormFields';

export function NewPatientModal({ isOpen, onClose, onSubmit, existingOwner }) {
  const [formData, setFormData] = useState({
    // Dados do Pet (tabela pets)
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
    // Dados do Tutor (tabela clientes)
    ownerName: existingOwner?.ownerName || '',
    ownerSexo: existingOwner?.ownerSexo || '',
    ownerNacionalidade: existingOwner?.ownerNacionalidade || '',
    ownerEstadoCivil: existingOwner?.ownerEstadoCivil || '',
    ownerCPF: existingOwner?.ownerCPF || '',
    ownerRG: existingOwner?.ownerRG || '',
    ownerDataNascimento: existingOwner?.ownerDataNascimento || '',
    ownerProfissao: existingOwner?.ownerProfissao || '',
    ownerComoConheceu: existingOwner?.ownerComoConheceu || '',
    ownerMatriculaConvenio: existingOwner?.ownerMatriculaConvenio || '',
    ownerEmail: existingOwner?.ownerEmail || '',
    ownerPhone: existingOwner?.ownerPhone || '',
    ownerFacebook: existingOwner?.ownerFacebook || '',
    ownerInstagram: existingOwner?.ownerInstagram || '',
    ownerMarcacaoNeutra: existingOwner?.ownerMarcacaoNeutra || '',
    ownerMarcacaoPositiva: existingOwner?.ownerMarcacaoPositiva || '',
    ownerFotoUrl: existingOwner?.ownerFotoUrl || '',
    // Observações
    allergies: '',
    importantNotes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Paciente cadastrado com sucesso!');
    onSubmit();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-6 h-6 text-[#EF6C50]" />
            Cadastrar Novo Paciente
          </DialogTitle>
          <DialogDescription className="text-base">
            {existingOwner
              ? 'Preencha os dados do novo pet'
              : 'Preencha os dados do pet e do tutor responsável'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Alerta quando for tutor existente */}
          {existingOwner && (
            <Alert className="bg-[#7DD87D]/12 border-[#7DD87D] border mb-4">
              <Info className="h-4 w-4 text-[#7DD87D]" />
              <AlertDescription className="text-sm text-[#1A2332]">
                <strong>Cadastrando novo pet para o tutor:</strong> {existingOwner.ownerName}
              </AlertDescription>
            </Alert>
          )}

          {existingOwner ? (
            /* Tutor existente: mostra apenas campos do pet */
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4">
              <PetFields formData={formData} onChange={setFormData} />
              <ObservationFields formData={formData} onChange={setFormData} />
            </div>
          ) : (
            /* Novo cadastro completo: tabs Tutor + Pet */
            <Tabs defaultValue="owner" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="owner" className="gap-2">
                  <User className="w-4 h-4" />
                  Tutor
                </TabsTrigger>
                <TabsTrigger value="pet" className="gap-2">
                  <PawPrint className="w-4 h-4" />
                  Pet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="owner" className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4">
                <OwnerFields
                  formData={formData}
                  onChange={setFormData}
                  disabled={false}
                />
              </TabsContent>

              <TabsContent value="pet" className="flex-1 overflow-y-auto pr-2 space-y-4 mt-4">
                <PetFields formData={formData} onChange={setFormData} />
                <ObservationFields formData={formData} onChange={setFormData} />
              </TabsContent>
            </Tabs>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 text-sm bg-[#EF6C50] hover:bg-[#E05C40]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Paciente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
