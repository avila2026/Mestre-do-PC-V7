// lib/glossary.js — Data layer para glossário

const glossaryData = [
  {
    slug: 'cache-do-computador',
    title: 'Cache do Computador',
    seoTitle: 'O que é Cache do Computador e Como Limpar no Windows | Mestre do PC',
    seoDescription:
      'Entenda o que é cache do computador, por que ele deixa seu PC lento e como o Mestre do PC V7 limpa automaticamente em 1 clique.',
    definition:
      'Cache do computador é uma área de armazenamento temporário onde o sistema operacional e os navegadores guardam dados frequentemente acessados para acelerar o carregamento futuro.',
    impactOnPerformance:
      'Quando o cache fica muito cheio ou corrompido, ele pode causar lentidão, travamentos e erros inesperados em aplicativos.',
    howItWorks:
      'O Windows armazena arquivos temporários em pastas como %TEMP%, C:\\Windows\\Temp e caches de navegadores. Isso ajuda na primeira execução, mas acumula lixo digital.',
    whyItSlows:
      'Milhares de arquivos temporários fragmentam o disco, consomem espaço e fazem o sistema gastar tempo procurando dados relevantes.',
    powershellCommand:
      'Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue; Write-Host "Cache limpo!" -ForegroundColor Green',
    faqs: [
      {
        question: 'Limpar o cache é seguro?',
        answer:
          'Sim. Arquivos de cache são temporários. O Windows e os aplicativos recriam esses arquivos automaticamente quando necessário.',
      },
      {
        question: 'Com que frequência devo limpar o cache?',
        answer:
          'Recomendamos limpar o cache a cada 15 dias para manter o sistema ágil.',
      },
      {
        question: 'O Mestre do PC V7 limpa o cache de navegadores também?',
        answer:
          'Sim. O Mestre do PC V7 detecta e limpa caches do Chrome, Edge, Firefox e do sistema operacional em uma única operação.',
      },
    ],
  },
  {
    slug: 'memoria-ram',
    title: 'Memória RAM',
    seoTitle: 'O que é Memória RAM e Como Liberar no Windows | Mestre do PC',
    seoDescription:
      'Descubra o que é memória RAM, por que ela fica cheia e como o Mestre do PC V7 libera memória automaticamente para deixar seu PC mais rápido.',
    definition:
      'Memória RAM (Random Access Memory) é a memória volátil do computador onde o sistema operacional e os programas em execução armazenam dados temporários.',
    impactOnPerformance:
      'Quando a RAM atinge 90%+ de uso, o Windows começa a usar o arquivo de paginação no disco rígido, tornando o PC extremamente lento.',
    howItWorks:
      'Cada aplicativo aberto consome um bloco de RAM. Quando você fecha o app, nem sempre a memória é liberada completamente — sobram "vazamentos de memória".',
    whyItSlows:
      'RAM insuficiente força o uso do disco como memória virtual (swap), que é 1.000x mais lento que a memória física.',
    powershellCommand:
      '[System.GC]::Collect(); Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name,WorkingSet | Format-Table -AutoSize',
    faqs: [
      {
        question: 'Quanto de RAM é ideal para Windows?',
        answer: '8GB é o mínimo recomendado. Para multitarefa pesada, 16GB é ideal.',
      },
      {
        question: 'O Mestre do PC V7 aumenta a RAM física?',
        answer:
          'Não. Mas ele libera memória ocupada por processos desnecessários, aumentando a RAM disponível para seus aplicativos.',
      },
    ],
  },
  {
    slug: 'disco-100-porcento',
    title: 'Disco a 100%',
    seoTitle: 'Disco a 100% no Windows: Causas e Soluções | Mestre do PC',
    seoDescription:
      'Entenda por que seu disco fica a 100% de uso no Windows e como o Mestre do PC V7 resolve esse problema que deixa o PC travando.',
    definition:
      '"Disco a 100%" é quando o uso do disco rígido ou SSD atinge o máximo no Gerenciador de Tarefas, causando lentidão extrema.',
    impactOnPerformance:
      'Com o disco saturado, o sistema não consegue ler/gravar dados, causando travamentos de segundos a minutos.',
    howItWorks:
      'O Windows indexa arquivos, roda manutenção automática e atualizações em segundo plano — tudo isso compete pelo acesso ao disco.',
    whyItSlows:
      'Se o disco estiver fragmentado, cheio de arquivos temporários ou com serviços desnecessários, o uso fica perpetuamente alto.',
    powershellCommand:
      'Get-Process | Sort-Object DiskUsage -Descending | Select-Object -First 5 Name,DiskUsage | Format-Table -AutoSize',
    faqs: [
      {
        question: 'Disco a 100% pode danificar o HD?',
        answer:
          'Não diretamente. Mas uso constante máximo aquece o disco e pode reduzir a vida útil de HDDs mecânicos.',
      },
      {
        question: 'SSD também fica a 100%?',
        answer:
          'Sim, mas por motivos diferentes. SSDs sofrem com indexação excessiva e falta de TRIM.',
      },
    ],
  },
];

export async function getAllGlossaryTerms() {
  return glossaryData;
}

export async function getGlossaryTermBySlug(slug) {
  return glossaryData.find((t) => t.slug === slug) || null;
}
