import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Edit2, Check, X, Save, Trash2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';


export function MedicalRecord() {
  const navigate = useNavigate();
  const location = useLocation();

  const patient = location.state?.patient || {
    petName: 'Rex',
    breed: 'Golden Retriever',
    ownerName: 'Maria Silva'
  };

  const prontuario = location.state?.prontuario || null;
  const criadoEm = prontuario?.criado_em ? new Date(prontuario.criado_em) : new Date();
  const date = criadoEm.toLocaleDateString('pt-BR');
  const time = criadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Initial AI-generated content
  const [sections, setSections] = useState([
    {
      title: 'Resumo',
      content: prontuario?.resumo || 'Resumo ainda nao disponivel.',
      isEditing: false
    },
    {
      title: 'Diagnostico',
      content: prontuario?.diagnostico || 'Diagnostico ainda nao disponivel.',
      isEditing: false
    },
    {
      title: 'Tratamento',
      content: prontuario?.tratamento || 'Tratamento ainda nao disponivel.',
      isEditing: false
    }
  ]);

  const [editedContent, setEditedContent] = useState({});

  const handleEdit = (index) => {
    const newSections = [...sections];
    newSections[index].isEditing = true;
    setSections(newSections);
    setEditedContent({ ...editedContent, [index]: newSections[index].content });
  };

  const handleSaveEdit = (index) => {
    const newSections = [...sections];
    newSections[index].content = editedContent[index] || newSections[index].content;
    newSections[index].isEditing = false;
    setSections(newSections);
  };

  const handleCancelEdit = (index) => {
    const newSections = [...sections];
    newSections[index].isEditing = false;
    setSections(newSections);
    const newEditedContent = { ...editedContent };
    delete newEditedContent[index];
    setEditedContent(newEditedContent);
  };

  const handleDiscard = () => {
    if (confirm('Deseja realmente descartar este prontuário? Esta ação não pode ser desfeita.')) {
      navigate('/dashboard');
    }
  };

  const handleSave = () => {
    alert('Prontuário salvo com sucesso no histórico do paciente!');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Prontuário Gerado por IA
                </h1>
                <Sparkles className="w-5 h-5 text-[#F5A623]" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500">Revise e editeções antes de salvar</p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-gradient-to-r from-[#1c5ca6] to-[#38A169] rounded-lg p-4 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{patient.petName}</h2>
                  <p className="text-sm opacity-90">{patient.breed} • Tutor: {patient.ownerName}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{date}</p>
                <p className="opacity-90">{time}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                {!section.isEditing ? (
                  <Button
                    onClick={() => handleEdit(index)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveEdit(index)}
                      size="sm"
                      className="gap-2 bg-[#38A169] hover:bg-[#2D8B55] text-white"
                    >
                      <Check className="w-4 h-4" />
                      Salvar
                    </Button>
                    <Button
                      onClick={() => handleCancelEdit(index)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              {/* Section Content */}
              <div className="p-6">
                {section.isEditing ? (
                  <Textarea
                    value={editedContent[index] ?? section.content}
                    onChange={(e) =>
                      setEditedContent({ ...editedContent, [index]: e.target.value })
                    }
                    className="min-h-[150px] text-base leading-relaxed resize-none"
                    placeholder={`Digiteções de ${section.title.toLowerCase()}...`}
                  />
                ) : (
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDiscard}
            variant="outline"
            className="flex-1 h-12 sm:h-14 border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 text-base font-semibold"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Descartar
          </Button>

          <Button
            onClick={handleSave}
            className="flex-1 h-12 sm:h-14 bg-[#EF6C50] hover:bg-[#E05C40] text-white text-base font-semibold"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar no Histórico
          </Button>
        </div>
      </div>
    </div>
  );
}
