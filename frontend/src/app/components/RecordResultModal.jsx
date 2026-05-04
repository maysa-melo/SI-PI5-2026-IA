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

export function RecordResultModal({ isOpen, onClose, onSave, patient, initialContent = '' }) {
  const [recordContent, setRecordContent] = useState(initialContent);

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
            <FileText className="w-6 h-6 text-[#EF6C50]" />
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
            className="min-h-[450px] font-mono text-sm leading-relaxed resize-none border-2 border-gray-200 focus-visible:border-[#EF6C50] focus-visible:ring-0"
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