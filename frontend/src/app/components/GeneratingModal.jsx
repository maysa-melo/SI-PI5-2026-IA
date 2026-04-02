import { Loader2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './ui/dialog';

export function GeneratingModal({ isOpen }) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-4xl max-h-[98vh]" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-[#EF6C50]" />
            Processando Consulta
          </DialogTitle>
          <DialogDescription className="text-base">
            Aguarde enquanto a IA processações
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-16 h-16 text-[#EF6C50] animate-spin mb-6" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Gerando Prontuário...
          </h3>
          <p className="text-base text-gray-500 text-center max-w-md">
            A inteligência artificial está organizando e estruturando todasções da consulta
          </p>
          
          <div className="mt-8 flex flex-col gap-2 w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Transcrevendo áudio...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100" />
              <span className="text-sm text-gray-600">Identificando informações clínicas...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200" />
              <span className="text-sm text-gray-600">Formatando prontuário...</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
