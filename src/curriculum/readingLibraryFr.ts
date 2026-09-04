import type { ReadingPassage } from './readingLibrary.ts';

export const readingLibraryFr: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'fr_r1', title: 'Ma journée', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: 'Je m\'appelle Marie. J\'ai vingt-deux ans. Je suis étudiante à Paris. Chaque matin, je me réveille à sept heures. Je prends une douche et je m\'habille. Ensuite, je prends mon petit-déjeuner. Je mange du pain avec du beurre et de la confiture. Je bois un café au lait. Après le petit-déjeuner, je prends le métro pour aller à l\'université. Mes cours commencent à neuf heures. J\'étudie la littérature française. Le soir, je rentre chez moi. Je prépare le dîner et je regarde un film. Je me couche à onze heures.',
    wordCount: 98,
    vocabularyHighlights: ['petit-déjeuner', 'métro', 'université', 'dîner', 'se coucher'],
    questions: [
      { id: 'fr_r1q1', type: 'multiple_choice', question: 'À quelle heure Marie se réveille-t-elle ?', options: ['Six heures', 'Sept heures', 'Huit heures', 'Neuf heures'], correctAnswer: 'Sept heures', explanation: 'Le texte dit : « je me réveille à sept heures ».' },
      { id: 'fr_r1q2', type: 'true_false', question: 'Marie prend le bus pour aller à l\'université.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Le texte dit : « je prends le métro pour aller à l\'université ».' },
      { id: 'fr_r1q3', type: 'multiple_choice', question: 'Qu\'est-ce que Marie étudie ?', options: ['Les mathématiques', 'La littérature française', 'La médecine', 'L\'anglais'], correctAnswer: 'La littérature française', explanation: 'Le texte dit : « J\'étudie la littérature française ».' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'fr_r2', title: 'Au marché', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: 'Aujourd\'hui, c\'est samedi. Je vais au marché avec ma mère. Le marché est près de notre maison. Il y a beaucoup de monde. D\'abord, nous allons chez le marchand de fruits. Nous achetons des pommes, des oranges et des fraises. Ensuite, nous allons chez le boulanger. Ma mère achète deux baguettes et des croissants. Puis, nous achetons du fromage et du jambon. Le fromage sent très bon. Je veux aussi du chocolat, mais ma mère dit non. Nous payons et nous rentrons à la maison. J\'aide ma mère à ranger les courses dans la cuisine.',
    wordCount: 100,
    vocabularyHighlights: ['marché', 'boulanger', 'baguette', 'fromage', 'courses'],
    questions: [
      { id: 'fr_r2q1', type: 'multiple_choice', question: 'Quel jour vont-ils au marché ?', options: ['Dimanche', 'Samedi', 'Vendredi', 'Lundi'], correctAnswer: 'Samedi', explanation: 'Le texte commence par : « Aujourd\'hui, c\'est samedi ».' },
      { id: 'fr_r2q2', type: 'true_false', question: 'Ils achètent du chocolat au marché.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Le narrateur veut du chocolat, mais sa mère dit non.' },
      { id: 'fr_r2q3', type: 'multiple_choice', question: 'Qu\'est-ce qu\'ils achètent chez le boulanger ?', options: ['Du fromage', 'Des baguettes et des croissants', 'Des pommes', 'Du jambon'], correctAnswer: 'Des baguettes et des croissants', explanation: 'Le texte dit : « Ma mère achète deux baguettes et des croissants ».' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'fr_r3', title: 'Un week-end à Lyon', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: 'Le week-end dernier, mes amis et moi sommes allés à Lyon. Lyon est une grande ville dans le sud-est de la France. Nous avons pris le train depuis Paris. Le voyage a duré deux heures. Nous sommes arrivés à midi et nous avons déposé nos bagages à l\'hôtel. L\'après-midi, nous avons visité le Vieux Lyon. Les rues sont étroites et très jolies. Nous avons mangé dans un bouchon lyonnais, un restaurant traditionnel. J\'ai goûté la quenelle, un plat typique de Lyon. C\'était délicieux ! Le lendemain, nous sommes montés à la basilique de Fourvière. La vue sur la ville était magnifique. Nous avons aussi fait une promenade le long du Rhône. Le temps était ensoleillé et agréable. J\'ai beaucoup aimé ce week-end parce que Lyon est une ville pleine de charme et de bonne cuisine.',
    wordCount: 142,
    vocabularyHighlights: ['train', 'étroites', 'bouchon', 'basilique', 'ensoleillé'],
    questions: [
      { id: 'fr_r3q1', type: 'multiple_choice', question: 'Combien de temps a duré le voyage en train ?', options: ['Une heure', 'Deux heures', 'Trois heures', 'Quatre heures'], correctAnswer: 'Deux heures', explanation: 'Le texte dit : « Le voyage a duré deux heures ».' },
      { id: 'fr_r3q2', type: 'true_false', question: 'Ils ont mangé dans un restaurant japonais.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Ils ont mangé dans « un bouchon lyonnais, un restaurant traditionnel ».' },
      { id: 'fr_r3q3', type: 'multiple_choice', question: 'Quel fleuve traverse Lyon ?', options: ['La Seine', 'La Loire', 'Le Rhône', 'La Garonne'], correctAnswer: 'Le Rhône', explanation: 'Le texte mentionne « une promenade le long du Rhône ».' },
    ],
    tags: ['travel', 'france']
  },
  {
    id: 'fr_r4', title: 'Ma recette préférée', level: 'A2', topic: 'Food & Cooking', sourceType: 'original',
    content: 'Ma recette préférée est la crêpe. C\'est un plat français très populaire. Pour faire des crêpes, il faut de la farine, des œufs, du lait et un peu de beurre. D\'abord, je mets la farine dans un grand bol. Ensuite, j\'ajoute les œufs et le lait. Je mélange bien avec un fouet pour obtenir une pâte lisse. Je laisse reposer la pâte pendant trente minutes. Après, je fais chauffer une poêle avec un peu de beurre. Je verse une louche de pâte dans la poêle et je la fais cuire des deux côtés. Ma garniture préférée, c\'est le Nutella avec des bananes. Ma sœur préfère le sucre et le citron. Le dimanche matin, je fais des crêpes pour toute la famille. Tout le monde adore mes crêpes. C\'est un moment de partage que j\'aime beaucoup.',
    wordCount: 143,
    vocabularyHighlights: ['farine', 'mélanger', 'pâte', 'poêle', 'garniture'],
    questions: [
      { id: 'fr_r4q1', type: 'multiple_choice', question: 'Combien de temps faut-il laisser reposer la pâte ?', options: ['Dix minutes', 'Vingt minutes', 'Trente minutes', 'Une heure'], correctAnswer: 'Trente minutes', explanation: 'Le texte dit : « Je laisse reposer la pâte pendant trente minutes ».' },
      { id: 'fr_r4q2', type: 'multiple_choice', question: 'Quelle garniture la sœur préfère-t-elle ?', options: ['Le Nutella', 'Le sucre et le citron', 'La confiture', 'Le miel'], correctAnswer: 'Le sucre et le citron', explanation: 'Le texte dit : « Ma sœur préfère le sucre et le citron ».' },
      { id: 'fr_r4q3', type: 'true_false', question: 'Le narrateur fait des crêpes uniquement pour lui-même.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Le texte dit : « je fais des crêpes pour toute la famille ».' },
    ],
    tags: ['food', 'cooking', 'culture']
  },

  // ═══ B1 ═══
  {
    id: 'fr_r5', title: 'Les avantages du vélo en ville', level: 'B1', topic: 'Environment & Transport', sourceType: 'original',
    content: 'De plus en plus de citadins choisissent le vélo comme moyen de transport quotidien. Ce choix présente de nombreux avantages, tant pour les individus que pour la société. Tout d\'abord, le vélo est bon pour la santé. Faire du vélo régulièrement permet de renforcer le système cardiovasculaire, de réduire le stress et de maintenir un poids sain. Les médecins recommandent au moins trente minutes d\'activité physique par jour, et le trajet domicile-travail à vélo peut facilement remplir cet objectif.\n\nSur le plan économique, le vélo est beaucoup moins cher que la voiture. Il n\'y a pas de frais d\'essence, d\'assurance ou de stationnement. L\'entretien d\'un vélo coûte en moyenne dix fois moins qu\'une voiture.\n\nDu point de vue écologique, le vélo ne produit aucune émission de gaz à effet de serre. Dans les grandes villes comme Paris, où la pollution atmosphérique est un problème majeur, chaque cycliste contribue à améliorer la qualité de l\'air. De nombreuses municipalités encouragent l\'utilisation du vélo en créant des pistes cyclables sécurisées et en proposant des systèmes de vélos en libre-service.',
    wordCount: 168,
    vocabularyHighlights: ['citadins', 'cardiovasculaire', 'stationnement', 'émission', 'pistes cyclables'],
    questions: [
      { id: 'fr_r5q1', type: 'multiple_choice', question: 'Combien de minutes d\'activité physique les médecins recommandent-ils par jour ?', options: ['Quinze minutes', 'Vingt minutes', 'Trente minutes', 'Une heure'], correctAnswer: 'Trente minutes', explanation: 'Le texte dit : « Les médecins recommandent au moins trente minutes d\'activité physique par jour ».' },
      { id: 'fr_r5q2', type: 'true_false', question: 'L\'entretien d\'un vélo coûte aussi cher que celui d\'une voiture.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Le texte dit : « L\'entretien d\'un vélo coûte en moyenne dix fois moins qu\'une voiture ».' },
      { id: 'fr_r5q3', type: 'multiple_choice', question: 'Comment les municipalités encouragent-elles le vélo ?', options: ['En interdisant les voitures', 'En créant des pistes cyclables et des vélos en libre-service', 'En offrant des vélos gratuits à tous', 'En réduisant les impôts'], correctAnswer: 'En créant des pistes cyclables et des vélos en libre-service', explanation: 'Le texte mentionne « des pistes cyclables sécurisées et des systèmes de vélos en libre-service ».' },
    ],
    tags: ['environment', 'transport', 'health']
  },

  // ═══ B2 ═══
  {
    id: 'fr_r6', title: 'L\'impact du numérique sur l\'éducation', level: 'B2', topic: 'Education & Technology', sourceType: 'original',
    content: 'La révolution numérique a profondément transformé le paysage éducatif. Les nouvelles technologies offrent des possibilités inédites en matière d\'apprentissage, mais soulèvent également des interrogations sur l\'avenir de l\'enseignement traditionnel.\n\nL\'un des changements les plus significatifs est la démocratisation de l\'accès au savoir. Grâce à des plateformes comme Coursera, Khan Academy ou les MOOC universitaires, un étudiant vivant dans un village isolé peut désormais suivre les cours des meilleures universités du monde. Cette accessibilité a le potentiel de réduire les inégalités éducatives, à condition que l\'accès à Internet soit garanti pour tous.\n\nPar ailleurs, les outils numériques permettent une personnalisation de l\'apprentissage. Les logiciels adaptatifs analysent les forces et les faiblesses de chaque élève pour proposer des exercices sur mesure. L\'intelligence artificielle peut ainsi jouer le rôle d\'un tuteur personnel disponible vingt-quatre heures sur vingt-quatre.\n\nCependant, cette transformation suscite des inquiétudes légitimes. De nombreux enseignants craignent que la technologie ne remplace l\'interaction humaine, pourtant essentielle au développement social des jeunes. Les écrans omniprésents peuvent également nuire à la concentration et favoriser la distraction. Des études montrent que les élèves qui prennent des notes à la main retiennent mieux les informations que ceux qui utilisent un ordinateur.\n\nL\'enjeu consiste donc à trouver un équilibre entre innovation technologique et pédagogie traditionnelle, en utilisant le numérique comme un complément plutôt qu\'un substitut à l\'enseignement en présentiel.',
    wordCount: 210,
    vocabularyHighlights: ['démocratisation', 'personnalisation', 'adaptatifs', 'omniprésents', 'pédagogie'],
    questions: [
      { id: 'fr_r6q1', type: 'multiple_choice', question: 'Quel est l\'un des principaux avantages du numérique dans l\'éducation ?', options: ['Les cours sont plus courts', 'La démocratisation de l\'accès au savoir', 'Les professeurs travaillent moins', 'Les examens sont supprimés'], correctAnswer: 'La démocratisation de l\'accès au savoir', explanation: 'Le texte présente « la démocratisation de l\'accès au savoir » comme un changement majeur.' },
      { id: 'fr_r6q2', type: 'true_false', question: 'Les élèves qui prennent des notes sur ordinateur retiennent mieux les informations.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Le texte dit que « les élèves qui prennent des notes à la main retiennent mieux les informations que ceux qui utilisent un ordinateur ».' },
      { id: 'fr_r6q3', type: 'multiple_choice', question: 'Quelle est la conclusion du passage ?', options: ['Il faut supprimer la technologie dans les écoles', 'Le numérique doit remplacer les professeurs', 'Il faut trouver un équilibre entre numérique et pédagogie traditionnelle', 'Les MOOC sont inutiles'], correctAnswer: 'Il faut trouver un équilibre entre numérique et pédagogie traditionnelle', explanation: 'Le texte conclut par : « trouver un équilibre entre innovation technologique et pédagogie traditionnelle ».' },
    ],
    tags: ['education', 'technology', 'society']
  },
];
