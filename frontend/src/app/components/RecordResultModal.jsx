import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';

export function RecordResultModal({ isOpen, onClose, onSave, patient }) {
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  const generateMockRecord = () => {
    if (!patient) return '';
    const { date, time } = getCurrentDateTime();
    
    return `PRONTUÁRIO VETERINÁRIO

Data: ${date}
Horário: ${time}

═══════════════════════════════════════════════════════════════

IDENTIFICAÇÃO DO PACIENTE
═══════════════════════════════════════════════════════════════
Nome: ${patient.petName}
Espécie: ${patient.species || 'Canino'}
Raça: ${patient.breed}
Idade: ${patient.age}
Tutor: ${patient.ownerName}

═══════════════════════════════════════════════════════════════

ANAMNESE
═══════════════════════════════════════════════════════════════
Queixa Principal:
O tutor relata que o animal apresentou episódios de vômito nas últimas 24 horas, com frequência de aproximadamente 3 vezes. Observou diminuição do apetite e apatia. O paciente está menos ativo que o habitual e demonstrou recusa parcial de ração. Não houve alteração significativa na ingestão de água. Ausência de diarreia ou outras alterações gastrintestinais.

Histórico Recente:
- Sem mudança de alimentação
- Sem acesso a lixo ou objetos estranhos (segundo tutor)
- Última vacinação em dia
- Vermifugação realizada há 2 meses

═══════════════════════════════════════════════════════════════

EXAME FÍSICO
═══════════════════════════════════════════════════════════════
Avaliação Geral:
Paciente alerta, responsivo ao manejo, escore corporal 5/9

Sinais Vitais:
- Temperatura Retal: 38.8°C (Normal: 38.0-39.2°C)
- Frequência Cardíaca: 95 bpm (Normal: 70-120 bpm)
- Frequência Respiratória: 28 mpm (Normal: 20-34 mpm)
- Tempo de Reperfusão Capilar: < 2 segundos

Avaliação Sistêmica:
- Mucosas: Róseas e úmidas
- Hidratação: Adequada (turgor cutâneo preservado)
- Linfonodos: Sem linfonodomegalia
- Pelagem/Pele: Sem alterações aparentes

Sistema Cardiovascular:
- Auscultação Cardíaca: Ritmo regular, bulhas normofonéticas, sem sopros ou arritmias

Sistema Respiratório:
- Auscultação Pulmonar: Murmúrio vesicular preservado bilateralmente, sem ruídos adventícios

Sistema Digestório:
- Cavidade Oral: Sem alterações, dentição preservada
- Palpação Abdominal: Leve desconforto à palpação em região epigástrica, sem massas ou organomegalias palpáveis

Sistema Urinário:
- Sem alterações à palpação vesical

═══════════════════════════════════════════════════════════════

DIAGNÓSTICO PRESUNTIVO
═══════════════════════════════════════════════════════════════
Gastrite Aguda

Diagnósticos Diferenciais:
- Indiscrição alimentar
- Gastroenterite inespecífica
- Corpo estranho (a esclarecer)

═══════════════════════════════════════════════════════════════

PLANO TERAPÊUTICO
═══════════════════════════════════════════════════════════════
Prescrição Médica:

1. Omeprazol 20mg
   - Dose: 1 comprimido VO a cada 24 horas
   - Duração: 7 dias
   - Administrar em jejum (30 min antes da alimentação)

2. Metoclopramida 10mg
   - Dose: 1/2 comprimido VO a cada 12 horas
   - Duração: 3 dias
   - Administrar 30 min antes das refeições

3. Probiótico Veterinário
   - Dose: Conforme orientação da embalagem
   - Duração: 10 dias
   - Auxilia na restauração da flora intestinal

═══════════════════════════════════════════════════════════════

ORIENTAÇÕES AO TUTOR
═══════════════════════════════════════════════════════════════
Manejo Alimentar:
- Jejum alimentar de 6 horas a partir de agora
- Após jejum, oferecer dieta leve e fracionada:
  • Frango cozido desfiado (sem pele/tempero) + arroz branco
  • Oferecer 4-5 pequenas porções ao longo do dia
- Manter por 48-72 horas
- Retornar gradualmente à dieta habitual após melhora
- Água: Manter sempre disponível em pequenas quantidades

Monitoramento:
- Observar frequência de vômitos
- Monitorar apetite e comportamento
- Atentar para sinais de desidratação

Sinais de Alerta (retornar imediatamente):
⚠️ Persistência ou aumento da frequência de vômitos
⚠️ Presença de sangue no vômito
⚠️ Diarreia com sangue
⚠️ Apatia severa ou dificuldade para se levantar
⚠️ Recusa total de água
⚠️ Distensão abdominal

═══════════════════════════════════════════════════════════════

CONDUTA E RETORNO
═══════════════════════════════════════════════════════════════
- Retorno agendado para reavaliação em 7 dias
- Retornar antes se necessário ou se houver piora do quadro
- Tutor orientado e ciente de todos os procedimentos
- Dúvidas esclarecidas

Observações Adicionais:
Caso não haja melhora em 48 horas ou piora do quadro, avaliar necessidade de exames complementares (hemograma, ultrassom abdominal).

═══════════════════════════════════════════════════════════════

Médico(a) Veterinário(a): _______________________________
CRMV: __________`;
  };

  const [recordContent, setRecordContent] = useState(() => generateMockRecord());

  const handleSave = () => {
    onSave(recordContent);
  };

  const handleClose = () => {
    if (confirm('Deseja sair sem salvar? As alterações serão perdidas.')) {
      onClose();
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[98vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-[#2C5EAD]" />
            Editar Prontuário
          </DialogTitle>
          <DialogDescription className="text-base">
            O texto abaixo foi gerado automaticamente. Você pode editá-lo antes de salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Editable Record Content */}
          <Textarea
            value={recordContent}
            onChange={(e) => setRecordContent(e.target.value)}
            className="min-h-[450px] font-mono text-sm leading-relaxed resize-none border-2 border-gray-200 focus-visible:border-[#2C5EAD] focus-visible:ring-0"
            placeholder="Conteúdo do prontuário..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-11 px-6"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white"
          >
            Salvar Prontuário
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}