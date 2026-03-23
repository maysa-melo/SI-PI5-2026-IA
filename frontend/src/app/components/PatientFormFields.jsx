import { PawPrint, User, AlertTriangle } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';

export function PetFields({ formData, onChange, disabled = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <PawPrint className="w-4 h-4 text-[#032048]" />
        Dados do Pet
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="petName" className="text-xs font-medium">
            Nome do Pet *
          </Label>
          <Input
            id="petName"
            value={formData.petName}
            onChange={(e) => onChange({ ...formData, petName: e.target.value })}
            placeholder="Ex: Rex"
            required
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="species" className="text-xs font-medium">
            Espécie *
          </Label>
          <Select
            value={formData.species}
            onValueChange={(value) => onChange({ ...formData, species: value })}
            disabled={disabled}
          >
            <SelectTrigger id="species" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cão">Cão</SelectItem>
              <SelectItem value="Gato">Gato</SelectItem>
              <SelectItem value="Ave">Ave</SelectItem>
              <SelectItem value="Réptil">Réptil</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="breed" className="text-xs font-medium">
            Raça *
          </Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => onChange({ ...formData, breed: e.target.value })}
            placeholder="Ex: Labrador"
            required
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birthDate" className="text-xs font-medium">
            Data de Nascimento
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => onChange({ ...formData, birthDate: e.target.value })}
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export function ObservationFields({ formData, onChange, disabled = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <AlertTriangle className="w-4 h-4 text-[#032048]" />
        Observações Importantes
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="allergies" className="text-xs font-medium">
            Alergias
          </Label>
          <Input
            id="allergies"
            value={formData.allergies}
            onChange={(e) => onChange({ ...formData, allergies: e.target.value })}
            placeholder="Ex: Penicilina, corticoides"
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="importantNotes" className="text-xs font-medium">
            Notas Importantes
          </Label>
          <Textarea
            id="importantNotes"
            value={formData.importantNotes}
            onChange={(e) => onChange({ ...formData, importantNotes: e.target.value })}
            placeholder="Ex: Paciente com histórico de convulsões"
            disabled={disabled}
            className="text-sm min-h-20"
          />
        </div>
      </div>
    </div>
  );
}

export function OwnerFields({ formData, onChange, disabled = false, headerExtra = null }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <User className="w-4 h-4 text-[#032048]" />
          Dados do Tutor
        </div>
        {headerExtra}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ownerName" className="text-xs font-medium">
            Nome Completo *
          </Label>
          <Input
            id="ownerName"
            value={formData.ownerName}
            onChange={(e) => onChange({ ...formData, ownerName: e.target.value })}
            placeholder="Ex: Maria Silva"
            required
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerCPF" className="text-xs font-medium">
            CPF *
          </Label>
          <Input
            id="ownerCPF"
            value={formData.ownerCPF}
            onChange={(e) => onChange({ ...formData, ownerCPF: e.target.value })}
            placeholder="000.000.000-00"
            required
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerPhone" className="text-xs font-medium">
            Telefone *
          </Label>
          <Input
            id="ownerPhone"
            value={formData.ownerPhone}
            onChange={(e) => onChange({ ...formData, ownerPhone: e.target.value })}
            placeholder="(00) 00000-0000"
            required
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerEmail" className="text-xs font-medium">
            E-mail
          </Label>
          <Input
            id="ownerEmail"
            type="email"
            value={formData.ownerEmail}
            onChange={(e) => onChange({ ...formData, ownerEmail: e.target.value })}
            placeholder="exemplo@email.com"
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
