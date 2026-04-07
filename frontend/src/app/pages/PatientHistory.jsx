import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';

export function PatientHistory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pet, setPet] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [prontuarios, setProntuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        const petRes = await api.get(`/pets/${id}`);
        setPet(petRes.data);

        const clienteRes = await api.get(`/clientes/${petRes.data.cliente_id}`);
        setCliente(clienteRes.data);

        const prontuariosRes = await api.get(`/pets/${id}/prontuarios`);
        setProntuarios(prontuariosRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id]);

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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Não informado';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Não informado';

    return date.toLocaleString('pt-BR');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '--:--';

    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
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

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Sem data';

    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!pet || !cliente) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Paciente não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const groupedProntuarios = {};
  prontuarios.forEach((prontuario) => {
    const key = getMonthYear(prontuario.criado_em);
    if (!groupedProntuarios[key]) groupedProntuarios[key] = [];
    groupedProntuarios[key].push(prontuario);
  });

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Histórico Clínico</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Todos os atendimentos e informações do paciente
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1c5ca6] to-[#38A169] px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white text-[#1c5ca6] border-4 border-white shadow-lg">
                  <span className="text-4xl sm:text-6xl font-bold">
                    {(pet.nome || 'P').charAt(0)}
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left text-white">
                  <h2 className="text-3xl font-bold mb-2">{pet.nome}</h2>
                  <div className="space-y-1 text-sm opacity-90">
                    <p className="text-base">
                      {pet.raca || 'Raça não informada'} • {calculateAge(pet.data_nascimento)} • {pet.peso_kg ? `${pet.peso_kg} kg` : 'Peso não informado'}
                    </p>
                    <p>
                      Tutor: {cliente.nome} • {cliente.email || 'E-mail não informado'}
                    </p>
                    <p>
                      Cadastrado desde: {formatDate(pet.criado_em)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#EF6C50]">{prontuarios.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Prontuários</div>
                </div>

                <div className="text-center border-x border-gray-200">
                  <div className="text-2xl font-bold text-[#EF6C50]">
                    {calculateAge(pet.data_nascimento)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Idade</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {pet.vivo === false ? 'Inativo' : 'Ativo'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Status</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#EF6C50]" />
                Histórico de Atendimentos
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Cronologia completa de consultas e procedimentos
              </p>
            </div>

            <div className="p-6">
              {prontuarios.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum prontuário registrado</p>
                </div>
              ) : (
                Object.entries(groupedProntuarios).map(([monthYear, monthProntuarios]) => (
                  <div key={monthYear} className="mb-8 last:mb-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        {monthYear}
                      </div>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="space-y-4">
                      {monthProntuarios.map((prontuario) => (
                        <div
                          key={prontuario.id}
                          className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 hover:border-[#EF6C50] hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-[#EF6C50] text-white rounded-full text-xs font-semibold">
                                  {prontuario.tipo || 'Consulta'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {prontuario.veterinario || 'Veterinário não informado'}
                                </span>
                              </div>

                              {prontuario.diagnostico && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-700">Diagnóstico</p>
                                  <p className="text-sm text-gray-700">{prontuario.diagnostico}</p>
                                </div>
                              )}

                              {prontuario.resumo && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-700">Resumo</p>
                                  <p className="text-sm text-gray-700 leading-relaxed">{prontuario.resumo}</p>
                                </div>
                              )}

                              {prontuario.tratamento && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700">Tratamento</p>
                                  <p className="text-sm text-gray-700">{prontuario.tratamento}</p>
                                </div>
                              )}
                            </div>

                            <div className="text-right text-sm">
                              <div className="font-semibold text-gray-900">
                                {formatDate(prontuario.criado_em)}
                              </div>
                              <div className="text-gray-500 flex items-center justify-end gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(prontuario.criado_em)}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              Registrado em: {formatDateTime(prontuario.criado_em)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}