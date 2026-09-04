import { ReadingPassage } from './readingLibrary';

export const readingLibraryPt: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'pt_r1', title: 'O meu dia', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: 'O meu nome é Ana. Tenho vinte anos. Sou estudante em Lisboa. Todas as manhãs, acordo às sete horas. Tomo um banho e visto-me. Depois, tomo o pequeno-almoço. Como pão com manteiga e bebo um café com leite. Depois do pequeno-almoço, apanho o autocarro para ir à universidade. As aulas começam às nove horas. Estudo línguas e literatura. Gosto muito de português porque é uma língua bonita e rica. À tarde, vou à biblioteca para estudar. Volto para casa às cinco da tarde. À noite, preparo o jantar com a minha irmã. Jantamos juntas e conversamos sobre o nosso dia. Deito-me às onze horas.',
    wordCount: 104,
    vocabularyHighlights: ['pequeno-almoço', 'autocarro', 'universidade', 'jantar', 'biblioteca'],
    questions: [
      { id: 'pt_r1q1', type: 'multiple_choice', question: 'A que horas acorda a Ana?', options: ['Às seis horas', 'Às sete horas', 'Às oito horas', 'Às nove horas'], correctAnswer: 'Às sete horas', explanation: 'O texto diz: «acordo às sete horas».' },
      { id: 'pt_r1q2', type: 'true_false', question: 'A Ana vai de carro para a universidade.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'O texto diz: «apanho o autocarro para ir à universidade».' },
      { id: 'pt_r1q3', type: 'multiple_choice', question: 'O que é que a Ana estuda?', options: ['Medicina', 'Engenharia', 'Línguas e literatura', 'Economia'], correctAnswer: 'Línguas e literatura', explanation: 'O texto diz: «Estudo línguas e literatura».' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'pt_r2', title: 'No supermercado', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: 'Hoje é sábado. Vou ao supermercado com a minha mãe. O supermercado fica perto da nossa casa. Há muitas pessoas. Primeiro, vamos à secção das frutas. Compramos maçãs, bananas e laranjas. As laranjas são muito doces. Depois, vamos à secção dos legumes. A minha mãe compra tomates, cenouras e alface. A seguir, compramos arroz e massa. Eu quero chocolate, mas a minha mãe diz que não. Também compramos leite e ovos. O total é vinte e cinco euros. Pagamos e voltamos para casa. Eu ajudo a minha mãe a guardar as compras na cozinha.',
    wordCount: 100,
    vocabularyHighlights: ['supermercado', 'frutas', 'legumes', 'compras', 'cozinha'],
    questions: [
      { id: 'pt_r2q1', type: 'multiple_choice', question: 'Que dia vão ao supermercado?', options: ['Domingo', 'Sábado', 'Sexta-feira', 'Segunda-feira'], correctAnswer: 'Sábado', explanation: 'O texto começa com: «Hoje é sábado».' },
      { id: 'pt_r2q2', type: 'true_false', question: 'Eles compram chocolate no supermercado.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'O narrador quer chocolate, mas a mãe diz que não.' },
      { id: 'pt_r2q3', type: 'multiple_choice', question: 'O que compram na secção dos legumes?', options: ['Maçãs e bananas', 'Tomates, cenouras e alface', 'Arroz e massa', 'Leite e ovos'], correctAnswer: 'Tomates, cenouras e alface', explanation: 'O texto diz: «A minha mãe compra tomates, cenouras e alface».' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'pt_r3', title: 'Uma viagem ao Rio', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: 'No mês passado, os meus amigos e eu fizemos uma viagem ao Rio de Janeiro. O Rio é uma cidade maravilhosa no sudeste do Brasil. Apanhámos o avião desde São Paulo. O voo durou uma hora. Chegámos ao meio-dia e deixámos as malas no hotel. À tarde, fomos à praia de Copacabana. A areia era branca e o mar estava azul e quente. Nadámos e jogámos voleibol de praia. Depois, visitámos o Cristo Redentor no morro do Corcovado. A vista da cidade lá de cima era incrível. À noite, fomos a um restaurante e provámos feijoada, o prato nacional do Brasil. Estava deliciosa! No segundo dia, subimos ao Pão de Açúcar de teleférico. Tirámos muitas fotografias da baía de Guanabara. Também passeámos pelo bairro de Santa Teresa, que tem casas coloridas e ruas estreitas. Adorei a viagem porque o Rio tem paisagens deslumbrantes e pessoas muito simpáticas.',
    wordCount: 148,
    vocabularyHighlights: ['maravilhosa', 'praia', 'feijoada', 'teleférico', 'paisagens'],
    questions: [
      { id: 'pt_r3q1', type: 'multiple_choice', question: 'Quanto tempo durou o voo?', options: ['Meia hora', 'Uma hora', 'Duas horas', 'Três horas'], correctAnswer: 'Uma hora', explanation: 'O texto diz: «O voo durou uma hora».' },
      { id: 'pt_r3q2', type: 'true_false', question: 'Eles comeram sushi num restaurante.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Eles provaram «feijoada, o prato nacional do Brasil».' },
      { id: 'pt_r3q3', type: 'multiple_choice', question: 'Qual é o prato nacional do Brasil mencionado no texto?', options: ['Churrasco', 'Feijoada', 'Açaí', 'Moqueca'], correctAnswer: 'Feijoada', explanation: 'O texto diz: «provámos feijoada, o prato nacional do Brasil».' },
    ],
    tags: ['travel', 'brazil']
  },
  {
    id: 'pt_r4', title: 'A culinária brasileira', level: 'A2', topic: 'Food & Cooking', sourceType: 'original',
    content: 'A culinária brasileira é muito rica e variada. Cada região do Brasil tem os seus pratos típicos e as suas tradições. No nordeste, a comida é influenciada pela cultura africana. O acarajé, feito com massa de feijão fradinho e camarão, é um dos pratos mais populares da Bahia. No sul, o churrasco é uma tradição muito importante. As famílias reúnem-se aos domingos para assar carne na grelha.\n\nA feijoada é considerada o prato nacional. É feita com feijão preto e vários tipos de carne de porco. Normalmente é servida com arroz, couve e farofa. Outro prato muito apreciado é o pão de queijo, originário de Minas Gerais. São pequenos bolinhos feitos com polvilho e queijo, perfeitos para o café da manhã.\n\nAs frutas tropicais também são uma parte essencial da alimentação brasileira. O açaí, o maracujá, a manga e a goiaba são usados em sucos, sobremesas e pratos principais. O Brasil é um país onde a comida une as pessoas e celebra a diversidade cultural.',
    wordCount: 155,
    vocabularyHighlights: ['culinária', 'churrasco', 'feijoada', 'farofa', 'tropicais'],
    questions: [
      { id: 'pt_r4q1', type: 'multiple_choice', question: 'De onde é originário o pão de queijo?', options: ['Bahia', 'São Paulo', 'Minas Gerais', 'Rio de Janeiro'], correctAnswer: 'Minas Gerais', explanation: 'O texto diz: «o pão de queijo, originário de Minas Gerais».' },
      { id: 'pt_r4q2', type: 'multiple_choice', question: 'O que é o acarajé?', options: ['Um tipo de carne', 'Um bolo de feijão fradinho e camarão', 'Uma fruta tropical', 'Um queijo'], correctAnswer: 'Um bolo de feijão fradinho e camarão', explanation: 'O texto diz: «O acarajé, feito com massa de feijão fradinho e camarão».' },
      { id: 'pt_r4q3', type: 'true_false', question: 'O churrasco é uma tradição do nordeste do Brasil.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'O texto diz: «No sul, o churrasco é uma tradição muito importante».' },
    ],
    tags: ['food', 'cooking', 'culture']
  },

  // ═══ B1 ═══
  {
    id: 'pt_r5', title: 'A educação no Brasil', level: 'B1', topic: 'Education', sourceType: 'original',
    content: 'O sistema educativo brasileiro tem enfrentado desafios significativos nas últimas décadas. Embora o acesso à escola tenha aumentado consideravelmente, a qualidade do ensino continua a ser uma preocupação importante. O Brasil investe cerca de seis por cento do seu PIB em educação, uma percentagem superior à de muitos países desenvolvidos, mas os resultados nos testes internacionais como o PISA permanecem abaixo da média.\n\nUm dos problemas principais é a desigualdade entre as escolas públicas e privadas. As escolas privadas geralmente oferecem melhores condições, professores mais qualificados e recursos tecnológicos mais avançados. Esta diferença afeta diretamente as oportunidades futuras dos alunos, criando um ciclo de desigualdade social.\n\nNos últimos anos, várias iniciativas têm procurado melhorar a situação. O programa Bolsa Família, por exemplo, condiciona o pagamento de apoio financeiro à frequência escolar das crianças. As universidades federais implementaram sistemas de cotas para estudantes de escolas públicas e de minorias raciais. Além disso, a expansão do ensino técnico e profissional tem criado novas oportunidades para jovens que procuram uma entrada mais rápida no mercado de trabalho.\n\nApesar destes avanços, os especialistas concordam que é necessário investir mais na formação e valorização dos professores para alcançar melhorias duradouras.',
    wordCount: 183,
    vocabularyHighlights: ['desigualdade', 'qualificados', 'cotas', 'valorização', 'duradouras'],
    questions: [
      { id: 'pt_r5q1', type: 'multiple_choice', question: 'Que percentagem do PIB o Brasil investe em educação?', options: ['Três por cento', 'Quatro por cento', 'Seis por cento', 'Dez por cento'], correctAnswer: 'Seis por cento', explanation: 'O texto diz: «O Brasil investe cerca de seis por cento do seu PIB em educação».' },
      { id: 'pt_r5q2', type: 'true_false', question: 'Os resultados do Brasil nos testes PISA estão acima da média.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'O texto diz que «os resultados nos testes internacionais como o PISA permanecem abaixo da média».' },
      { id: 'pt_r5q3', type: 'multiple_choice', question: 'O que é que os especialistas consideram necessário para melhorar a educação?', options: ['Construir mais escolas privadas', 'Investir na formação e valorização dos professores', 'Eliminar os testes internacionais', 'Reduzir o investimento em educação'], correctAnswer: 'Investir na formação e valorização dos professores', explanation: 'O texto diz: «é necessário investir mais na formação e valorização dos professores».' },
    ],
    tags: ['education', 'brazil', 'society']
  },

  // ═══ B2 ═══
  {
    id: 'pt_r6', title: 'Tecnologia e sociedade', level: 'B2', topic: 'Technology & Society', sourceType: 'original',
    content: 'A revolução tecnológica das últimas décadas transformou profundamente a forma como vivemos, trabalhamos e nos relacionamos. O avanço da inteligência artificial, da internet das coisas e da automação está a redesenhar o panorama socioeconómico mundial, trazendo oportunidades sem precedentes, mas também desafios complexos que exigem reflexão cuidadosa.\n\nNo âmbito profissional, a automação ameaça substituir milhões de empregos em setores como a manufatura, os transportes e até os serviços financeiros. Segundo estudos recentes, cerca de quarenta por cento dos postos de trabalho atuais poderão ser automatizados nos próximos vinte anos. Em contrapartida, surgirão novas profissões ligadas à programação, à análise de dados e à cibersegurança. A questão fundamental é se os sistemas de educação e formação profissional conseguirão adaptar-se com a rapidez necessária.\n\nA nível social, as redes digitais transformaram a comunicação humana. Se, por um lado, permitem conectar pessoas em diferentes continentes e democratizar o acesso à informação, por outro, facilitam a propagação de desinformação e contribuem para a polarização política. O fenómeno das bolhas informativas, em que os algoritmos nos mostram apenas conteúdos que confirmam as nossas opiniões, representa uma ameaça à diversidade de pensamento.\n\nNo contexto lusófono, países como Portugal e Brasil enfrentam o desafio adicional de reduzir o fosso digital entre áreas urbanas e rurais. Garantir que todos os cidadãos tenham acesso equitativo à tecnologia é essencial para evitar que a transformação digital aprofunde as desigualdades já existentes. A literacia digital deve ser uma prioridade educativa, preparando os cidadãos não apenas para usar a tecnologia, mas para compreender criticamente o seu impacto na sociedade.',
    wordCount: 227,
    vocabularyHighlights: ['automação', 'cibersegurança', 'desinformação', 'polarização', 'literacia digital'],
    questions: [
      { id: 'pt_r6q1', type: 'multiple_choice', question: 'Que percentagem dos empregos atuais poderá ser automatizada?', options: ['Dez por cento', 'Vinte por cento', 'Quarenta por cento', 'Sessenta por cento'], correctAnswer: 'Quarenta por cento', explanation: 'O texto diz: «cerca de quarenta por cento dos postos de trabalho atuais poderão ser automatizados».' },
      { id: 'pt_r6q2', type: 'true_false', question: 'As bolhas informativas promovem a diversidade de pensamento.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'O texto diz que as bolhas informativas «representam uma ameaça à diversidade de pensamento».' },
      { id: 'pt_r6q3', type: 'multiple_choice', question: 'Qual é o desafio adicional mencionado para os países lusófonos?', options: ['Criar mais redes sociais', 'Reduzir o fosso digital entre áreas urbanas e rurais', 'Aumentar a automação nas fábricas', 'Eliminar a inteligência artificial'], correctAnswer: 'Reduzir o fosso digital entre áreas urbanas e rurais', explanation: 'O texto diz: «enfrentam o desafio adicional de reduzir o fosso digital entre áreas urbanas e rurais».' },
    ],
    tags: ['technology', 'society', 'digital']
  },
];
