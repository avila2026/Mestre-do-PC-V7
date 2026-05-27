// lib/personas.js — Data layer para personas

const personasData = [
  {
    slug: 'gamers',
    title: 'Gamers',
    seoTitle: 'Otimizar PC para Gamers: Aumente FPS e Reduza Lag | Mestre do PC',
    seoDescription:
      'Descubra como otimizar seu PC para jogos. Soluções testadas que aumentam FPS e reduzem input lag com o Mestre do PC V7.',
    intro:
      'Gamers sabem que cada frame importa. Um PC lento pode ser a diferença entre vitória e derrota. O Mestre do PC V7 foi projetado para liberar recursos do sistema e entregar a performance que seus jogos merecem.',
    problems: [
      'FPS baixo mesmo em hardware moderno',
      'Input lag e stuttering durante partidas',
      'Temperatura alta da CPU/GPU por processos em segundo plano',
      'Memória RAM ocupada por apps desnecessários',
      'Disco rígido fragmentado aumentando loading times',
    ],
    steps: [
      'Abra o Mestre do PC V7 e execute "Limpeza Rápida Completa" para remover cache e arquivos temporários.',
      'Vá em "Processos" e encerre aplicativos em segundo plano que consomem RAM e CPU.',
      'Use "Liberar Memória RAM" para desalocar memória de processos ociosos.',
      'Execute "Limpar Prefetch" para otimizar o cache de inicialização de jogos.',
      'Reinicie o PC e sinta a diferença nos frames por segundo.',
    ],
    benchmarks: [
      { metric: 'FPS Médio', before: '45 FPS', after: '72 FPS (+60%)' },
      { metric: 'Input Lag', before: '45ms', after: '22ms (-51%)' },
      { metric: 'RAM Disponível', before: '2.1 GB', after: '5.8 GB (+176%)' },
    ],
    benefits: [
      'Libera RAM exclusivamente para jogos',
      'Reduz processos em segundo plano que causam stutter',
      'Otimiza cache de jogos para loading mais rápido',
      'Mantém temperaturas mais baixas ao reduzir carga da CPU',
    ],
    testimonial: {
      quote:
        'Depois de usar o Mestre do PC V7, meu CS:2 foi de 45 para 75 FPS estáveis. Não precisei comprar hardware novo!',
      author: 'Lucas M.',
      role: 'Streamer e Gamer',
    },
  },
  {
    slug: 'empresas',
    title: 'Empresas',
    seoTitle: 'Otimizar PCs de Empresa: Produtividade em Equipe | Mestre do PC',
    seoDescription:
      'Mantenha a frota de computadores da sua empresa rápida e saudável. O Mestre do PC V7 automatiza a manutenção em massa.',
    intro:
      'Em empresas, um PC lento é dinheiro perdido. Funcionários esperando abrir planilhas, travamentos durante reuniões e chamados de TI intermináveis. O Mestre do PC V7 transforma manutenção de TI em um processo automático de 1 clique.',
    problems: [
      'Funcionários perdem tempo com PCs lentos',
      'Chamados de TI consomem recursos da equipe técnica',
      'Dados sensíveis acumulados em caches de navegadores',
      'Computadores antigos que deveriam ser descartados ainda funcionam lentos',
      'Falta de padronização na manutenção preventiva',
    ],
    steps: [
      'Instale o Mestre do PC V7 em todas as estações de trabalho.',
      'Configure a "Limpeza Rápida Completa" como rotina semanal.',
      'Use "Limpar Cache de Navegadores" para proteger dados de clientes.',
      'Execute "Diagnóstico Completo" mensalmente para identificar problemas antes que afetem a produtividade.',
      'Monitore o uso de RAM e disco com o dashboard integrado.',
    ],
    benchmarks: [
      { metric: 'Tempo de Boot', before: '4m 30s', after: '1m 15s (-72%)' },
      { metric: 'Chamados de TI', before: '32/mês', after: '8/mês (-75%)' },
      { metric: 'Abertura do Office', before: '28s', after: '9s (-68%)' },
    ],
    benefits: [
      'Reduz chamados de TI em até 75%',
      'Padroniza manutenção preventiva em toda a frota',
      'Protege dados sensíveis limpando caches automaticamente',
      'Estende a vida útil de hardware antigo',
    ],
    testimonial: {
      quote:
        'Implementamos o Mestre do PC V7 em 45 estações. Reduzimos chamados de TI em 70% e os funcionários estão mais produtivos.',
      author: 'Ana R.',
      role: 'Gerente de TI',
    },
  },
];

export async function getAllPersonas() {
  return personasData;
}

export async function getPersonaBySlug(slug) {
  return personasData.find((p) => p.slug === slug) || null;
}
