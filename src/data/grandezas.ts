import { Grandeza } from '../types';

export const GRANDEZAS: Grandeza[] = [
  {
    id: 'edificado',
    order: 1,
    name: 'Edificado',
    code: 'EDIF',
    description: 'Gestão técnica do edificado, piquete urgente 24h, intervenções no interior dos fogos, partes comuns, avarias de gás e elevadores.',
    iconName: 'Wrench',
    color: '#E62382', // Magenta institucional
    flowSlugs: ['obras-piquete-emergencia', 'obras-interior-fogo', 'obras-partes-comuns'],
    visioPageIndices: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 42, 65, 67, 68, 69, 70, 71, 72, 73, 74, 75, 84, 85, 86, 87, 107, 117]
  },
  {
    id: 'rendas',
    order: 2,
    name: 'Rendas',
    code: 'REND',
    description: 'Faturação e cobrança de rendas, emissão de referências Multibanco, débito direto SEPA, pedidos de redução e carência económica (ALD).',
    iconName: 'Receipt',
    color: '#8CBD45', // Verde institucional
    flowSlugs: ['rendas-acordos-regularizacao', 'rendas-reducao-carencia'],
    visioPageIndices: [14, 38, 76, 77, 78, 79, 80, 81, 82, 124, 125, 126, 127, 134, 139, 144, 145]
  },
  {
    id: 'divida',
    order: 3,
    name: 'Dívida',
    code: 'DIV',
    description: 'Planos prestacionais, acordos de regularização de dívida (ARD), cálculo de juros e cobrança coerciva em articulação com o contencioso.',
    iconName: 'CreditCard',
    color: '#379C8D', // Turquesa institucional
    flowSlugs: ['rendas-acordos-regularizacao'],
    visioPageIndices: [48, 49, 50, 51, 61, 112, 123]
  },
  {
    id: 'lojas_garagens',
    order: 4,
    name: 'Lojas/Garagens',
    code: 'ENH',
    description: 'Espaços Não Habitacionais (ENH): arrendamento de lojas, armazéns, garagens, cedências precárias a associações e faturação comercial.',
    iconName: 'Store',
    color: '#0284C7', // Azul moderno
    flowSlugs: ['habitacao-atribuicao'],
    visioPageIndices: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 140, 142, 143]
  },
  {
    id: 'social',
    order: 5,
    name: 'Social',
    code: 'SOC',
    description: 'Intervenção e apoio social a famílias vulneráveis, mediação de conflitos de vizinhança, visitas domiciliárias e banco de bens.',
    iconName: 'Users',
    color: '#E62382', // Magenta
    flowSlugs: ['gestao-social-apoio', 'gestao-social-conflitos'],
    visioPageIndices: [7, 8, 10, 11, 12, 13, 16, 33, 34, 39, 40, 41]
  },
  {
    id: 'juridico',
    order: 6,
    name: 'Jurídico',
    code: 'DAJ',
    description: 'Apoio Jurídico e Contencioso (DAJ): denúncias de ocupações abusivas, notificações judiciais, audiências de interessados e poderes de representação.',
    iconName: 'Scale',
    color: '#6366F1', // Indigo
    flowSlugs: ['denuncias-ocupacoes'],
    visioPageIndices: [15, 19, 43, 44, 45, 46, 47, 66, 108, 109, 110, 111, 113, 114]
  },
  {
    id: 'atendimento_geral',
    order: 7,
    name: 'Atendimento Geral',
    code: 'GERAL',
    description: 'Canal de acolhimento telefónico geral (Linha 855), informações institucionais, emissão de certidões administrativas e qualidade do serviço.',
    iconName: 'PhoneCall',
    color: '#10B981', // Verde esmeralda
    flowSlugs: ['triagem-inicial', 'administrativo-certidoes', 'reclamacoes-qualidade'],
    visioPageIndices: [1, 18, 102, 103, 104, 105, 106]
  },
  {
    id: 'renda_acessivel',
    order: 8,
    name: 'Renda Acessível',
    code: 'DRA',
    description: 'Divisão de Renda Acessível (DRA): programas municipais Lisboa Habita, contratos no regime acessível, renovações e gestão de condomínios DRA.',
    iconName: 'Home',
    color: '#F59E0B', // Âmbar
    flowSlugs: ['habitacao-atribuicao', 'habitacao-transmissao-troca'],
    visioPageIndices: [35, 36, 37, 52, 53, 54, 55, 56, 57, 58, 59, 62, 63, 64, 128, 129, 130, 131, 132, 133, 135, 136, 138]
  },
  {
    id: 'departamentos_centrais',
    order: 9,
    name: 'Departamentos Centrais',
    code: 'DEP',
    description: 'Direções centrais da GEBALIS: Gestão de Condomínios (DAF_GC), Recursos Humanos (DRH), Contratação Pública (DJCP), Faturação e Conselho de Administração.',
    iconName: 'Building2',
    color: '#8B5CF6', // Púrpura
    flowSlugs: ['condominios-administracao'],
    visioPageIndices: [6, 83, 88, 115, 116, 118, 119, 120, 121, 122]
  },
  {
    id: 'triagem',
    order: 10,
    name: 'Triagem',
    code: 'TRIA',
    description: 'Procedimento protocolar de acolhimento (1 ini), verificação de legitimidade (2 val), atuação operacional (3 act) e fecho de chamada (4 fecho).',
    iconName: 'Compass',
    color: '#0D9488', // Teal
    flowSlugs: ['triagem-inicial'],
    visioPageIndices: [2, 3, 4, 5, 32, 60, 137, 141]
  }
];

export function getGrandezaById(id: string): Grandeza | undefined {
  return GRANDEZAS.find(g => g.id === id);
}

export function getAllGrandezas(): Grandeza[] {
  return GRANDEZAS;
}
