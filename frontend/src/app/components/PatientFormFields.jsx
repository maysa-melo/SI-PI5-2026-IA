import { PawPrint, User, AlertTriangle, ImagePlus, X } from 'lucide-react';
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

/* =========================
   Máscaras e formatadores
========================= */
const onlyNumbers = (value = '') => value.replace(/\D/g, '');

const maskCPF = (value = '') => {
  const numbers = onlyNumbers(value).slice(0, 11);
  return numbers
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
};

const maskRG = (value = '') => {
  const clean = value.replace(/[^0-9xX]/g, '').slice(0, 9);

  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return clean.replace(/^(\d{2})(\d+)/, '$1.$2');
  if (clean.length <= 8) return clean.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3');

  return clean.replace(/^(\d{2})(\d{3})(\d{3})([0-9xX])$/, '$1.$2.$3-$4');
};

const maskPhone = (value = '') => {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numbers
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

const normalizeWeight = (value = '') => {
  let clean = value.replace(/[^\d,]/g, '');

  const firstCommaIndex = clean.indexOf(',');
  if (firstCommaIndex !== -1) {
    clean =
      clean.slice(0, firstCommaIndex + 1) +
      clean.slice(firstCommaIndex + 1).replace(/,/g, '');
  }

  const [integer = '', decimal = ''] = clean.split(',');
  const limitedInteger = integer.slice(0, 3);
  const limitedDecimal = decimal.slice(0, 2);

  return limitedDecimal !== ''
    ? `${limitedInteger},${limitedDecimal}`
    : limitedInteger;
};

export function PetFields({ formData, onChange, disabled = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <PawPrint className="w-4 h-4 text-[#38A169]" />
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
          {formData.species === 'Outro' ? (
            <div className="flex gap-2">
              <Input
                id="speciesCustom"
                value={formData.speciesCustom || ''}
                onChange={(e) => onChange({ ...formData, speciesCustom: e.target.value })}
                placeholder="Digite a espécie"
                required
                disabled={disabled}
                className="h-10 text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => onChange({ ...formData, species: '', speciesCustom: '' })}
                disabled={disabled}
                className="h-10 px-3 text-xs border rounded-md hover:bg-gray-100 text-gray-600"
              >
                Voltar
              </button>
            </div>
          ) : (
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
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="breed" className="text-xs font-medium">
            Raça
          </Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => onChange({ ...formData, breed: e.target.value })}
            placeholder="Ex: Labrador"
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

        <div className="space-y-1.5">
          <Label htmlFor="petSexo" className="text-xs font-medium">
            Sexo
          </Label>
          <Select
            value={formData.petSexo}
            onValueChange={(value) => onChange({ ...formData, petSexo: value })}
            disabled={disabled}
          >
            <SelectTrigger id="petSexo" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Macho">Macho</SelectItem>
              <SelectItem value="Fêmea">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petPeso" className="text-xs font-medium">
            Peso (kg)
          </Label>
          <Input
            id="petPeso"
            type="text"
            inputMode="decimal"
            value={formData.petPeso}
            onChange={(e) => onChange({ ...formData, petPeso: normalizeWeight(e.target.value) })}
            placeholder="Ex: 12,50"
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petPorte" className="text-xs font-medium">
            Porte
          </Label>
          <Select
            value={formData.petPorte}
            onValueChange={(value) => onChange({ ...formData, petPorte: value })}
            disabled={disabled}
          >
            <SelectTrigger id="petPorte" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mini">Mini</SelectItem>
              <SelectItem value="Pequeno">Pequeno</SelectItem>
              <SelectItem value="Médio">Médio</SelectItem>
              <SelectItem value="Grande">Grande</SelectItem>
              <SelectItem value="Gigante">Gigante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petCastrado" className="text-xs font-medium">
            Castrado
          </Label>
          <Select
            value={formData.petCastrado}
            onValueChange={(value) => onChange({ ...formData, petCastrado: value })}
            disabled={disabled}
          >
            <SelectTrigger id="petCastrado" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petVivo" className="text-xs font-medium">
            Vivo
          </Label>
          <Select
            value={String(formData.petVivo)}
            onValueChange={(value) => onChange({ ...formData, petVivo: value === 'true' })}
            disabled={disabled}
          >
            <SelectTrigger id="petVivo" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petCor" className="text-xs font-medium">
            Cor
          </Label>
          <Input
            id="petCor"
            value={formData.petCor}
            onChange={(e) => onChange({ ...formData, petCor: e.target.value })}
            placeholder="Ex: Caramelo"
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petPelagem" className="text-xs font-medium">
            Pelagem
          </Label>
          <Input
            id="petPelagem"
            value={formData.petPelagem}
            onChange={(e) => onChange({ ...formData, petPelagem: e.target.value })}
            placeholder="Ex: Curta, Lisa"
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petPedigree" className="text-xs font-medium">
            Pedigree
          </Label>
          <Input
            id="petPedigree"
            value={formData.petPedigree}
            onChange={(e) => onChange({ ...formData, petPedigree: e.target.value })}
            placeholder="Número do pedigree"
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petChip" className="text-xs font-medium">
            Chip
          </Label>
          <Input
            id="petChip"
            value={formData.petChip}
            onChange={(e) => onChange({ ...formData, petChip: e.target.value })}
            placeholder="Número do microchip"
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="petMatriculaConvenio" className="text-xs font-medium">
            Matrícula Convênio
          </Label>
          <Input
            id="petMatriculaConvenio"
            value={formData.petMatriculaConvenio}
            onChange={(e) => onChange({ ...formData, petMatriculaConvenio: e.target.value })}
            placeholder="Matrícula do convênio"
            disabled={disabled}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="petFotoUrl" className="text-xs font-medium">
            Foto do Pet
          </Label>
          {formData.petFotoUrl ? (
            <div className="relative w-24 h-24 rounded-md overflow-hidden border">
              <img src={formData.petFotoUrl} alt="Foto do pet" className="w-full h-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange({ ...formData, petFotoUrl: '' })}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <label
              htmlFor="petFotoUrl"
              className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-md cursor-pointer hover:border-[#38A169] hover:bg-[#38A169]/5 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : 'border-gray-300'}`}
            >
              <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Clique para anexar imagem</span>
              <input
                id="petFotoUrl"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onChange({ ...formData, petFotoUrl: url, petFotoFile: file });
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export function ObservationFields({ formData, onChange, disabled = false }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
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
          <User className="w-4 h-4 text-[#38A169]" />
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
            onChange={(e) => onChange({ ...formData, ownerCPF: maskCPF(e.target.value) })}
            placeholder="000.000.000-00"
            required
            disabled={disabled}
            inputMode="numeric"
            maxLength={14}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerRG" className="text-xs font-medium">
            RG
          </Label>
          <Input
            id="ownerRG"
            value={formData.ownerRG}
            onChange={(e) => onChange({ ...formData, ownerRG: maskRG(e.target.value) })}
            placeholder="00.000.000-0"
            disabled={disabled}
            inputMode="numeric"
            maxLength={12}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerSexo" className="text-xs font-medium">
            Sexo
          </Label>
          <Select
            value={formData.ownerSexo}
            onValueChange={(value) => onChange({ ...formData, ownerSexo: value })}
            disabled={disabled}
          >
            <SelectTrigger id="ownerSexo" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Feminino">Feminino</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerDataNascimento" className="text-xs font-medium">
            Data de Nascimento
          </Label>
          <Input
            id="ownerDataNascimento"
            type="date"
            value={formData.ownerDataNascimento}
            onChange={(e) => onChange({ ...formData, ownerDataNascimento: e.target.value })}
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerNacionalidade" className="text-xs font-medium">
            Nacionalidade
          </Label>
          <Input
            id="ownerNacionalidade"
            value={formData.ownerNacionalidade}
            onChange={(e) => onChange({ ...formData, ownerNacionalidade: e.target.value })}
            placeholder="Ex: Brasileiro(a)"
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerEstadoCivil" className="text-xs font-medium">
            Estado Civil
          </Label>
          <Select
            value={formData.ownerEstadoCivil}
            onValueChange={(value) => onChange({ ...formData, ownerEstadoCivil: value })}
            disabled={disabled}
          >
            <SelectTrigger id="ownerEstadoCivil" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
              <SelectItem value="Casado(a)">Casado(a)</SelectItem>
              <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
              <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
              <SelectItem value="União Estável">União Estável</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerProfissao" className="text-xs font-medium">
            Profissão
          </Label>
          <Input
            id="ownerProfissao"
            value={formData.ownerProfissao}
            onChange={(e) => onChange({ ...formData, ownerProfissao: e.target.value })}
            placeholder="Ex: Engenheiro(a)"
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerPhone" className="text-xs font-medium">
            Telefone
          </Label>
          <Input
            id="ownerPhone"
            value={formData.ownerPhone}
            onChange={(e) => onChange({ ...formData, ownerPhone: maskPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
            disabled={disabled}
            inputMode="numeric"
            maxLength={15}
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

        <div className="space-y-1.5">
          <Label htmlFor="ownerFacebook" className="text-xs font-medium">
            Facebook
          </Label>
          <Input
            id="ownerFacebook"
            value={formData.ownerFacebook}
            onChange={(e) => onChange({ ...formData, ownerFacebook: e.target.value })}
            placeholder="facebook.com/usuario"
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerInstagram" className="text-xs font-medium">
            Instagram
          </Label>
          <Input
            id="ownerInstagram"
            value={formData.ownerInstagram}
            onChange={(e) => onChange({ ...formData, ownerInstagram: e.target.value })}
            placeholder="@usuario"
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerComoConheceu" className="text-xs font-medium">
            Como Conheceu
          </Label>
          <Select
            value={formData.ownerComoConheceu}
            onValueChange={(value) => onChange({ ...formData, ownerComoConheceu: value })}
            disabled={disabled}
          >
            <SelectTrigger id="ownerComoConheceu" className="h-10 text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Indicação">Indicação</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Passou na frente">Passou na frente</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerMatriculaConvenio" className="text-xs font-medium">
            Matrícula Convênio
          </Label>
          <Input
            id="ownerMatriculaConvenio"
            value={formData.ownerMatriculaConvenio}
            onChange={(e) => onChange({ ...formData, ownerMatriculaConvenio: e.target.value })}
            placeholder="Matrícula do convênio"
            disabled={disabled}
            className="h-10 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ownerFotoUrl" className="text-xs font-medium">
            Foto do Tutor
          </Label>
          {formData.ownerFotoUrl ? (
            <div className="relative w-24 h-24 rounded-md overflow-hidden border">
              <img src={formData.ownerFotoUrl} alt="Foto do tutor" className="w-full h-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange({ ...formData, ownerFotoUrl: '' })}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <label
              htmlFor="ownerFotoUrl"
              className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-md cursor-pointer hover:border-[#38A169] hover:bg-[#38A169]/5 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : 'border-gray-300'}`}
            >
              <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Clique para anexar imagem</span>
              <input
                id="ownerFotoUrl"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onChange({ ...formData, ownerFotoUrl: url, ownerFotoFile: file });
                  }
                }}
              />
            </label>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerMarcacaoNeutra" className="text-xs font-medium">
            Marcação Neutra
          </Label>
          <Textarea
            id="ownerMarcacaoNeutra"
            value={formData.ownerMarcacaoNeutra}
            onChange={(e) => onChange({ ...formData, ownerMarcacaoNeutra: e.target.value })}
            placeholder="Anotações neutras sobre o cliente"
            disabled={disabled}
            className="text-sm min-h-20 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ownerMarcacaoPositiva" className="text-xs font-medium">
            Marcação Positiva
          </Label>
          <Textarea
            id="ownerMarcacaoPositiva"
            value={formData.ownerMarcacaoPositiva}
            onChange={(e) => onChange({ ...formData, ownerMarcacaoPositiva: e.target.value })}
            placeholder="Anotações positivas sobre o cliente"
            disabled={disabled}
            className="text-sm min-h-20 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}