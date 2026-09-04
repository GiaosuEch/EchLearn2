import type { ReadingPassage } from './readingLibrary.ts';

export const readingLibraryIt: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'it_r1', title: 'La mia giornata', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: 'Mi chiamo Marco. Ho ventidue anni. Sono uno studente a Milano. Ogni mattina mi sveglio alle sette. Faccio la doccia e mi vesto. Poi faccio colazione. Mangio pane con burro e marmellata. Bevo un caffè con latte. Dopo colazione, prendo la metropolitana per andare all\'università. Le lezioni cominciano alle nove. Studio economia e commercio. Mi piace molto l\'italiano perché è una lingua bella. La sera torno a casa. Preparo la cena e guardo un film. Di solito mangio la pasta perché è il mio piatto preferito. Vado a letto alle undici.',
    wordCount: 96,
    vocabularyHighlights: ['colazione', 'metropolitana', 'università', 'cena', 'piatto'],
    questions: [
      { id: 'it_r1q1', type: 'multiple_choice', question: 'A che ora si sveglia Marco?', options: ['Alle sei', 'Alle sette', 'Alle otto', 'Alle nove'], correctAnswer: 'Alle sette', explanation: 'Il testo dice: «mi sveglio alle sette».' },
      { id: 'it_r1q2', type: 'true_false', question: 'Marco prende l\'autobus per andare all\'università.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Il testo dice: «prendo la metropolitana per andare all\'università».' },
      { id: 'it_r1q3', type: 'multiple_choice', question: 'Che cosa studia Marco?', options: ['Medicina', 'Economia e commercio', 'Letteratura', 'Ingegneria'], correctAnswer: 'Economia e commercio', explanation: 'Il testo dice: «Studio economia e commercio».' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'it_r2', title: 'Al mercato', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: 'Oggi è sabato. Vado al mercato con mia madre. Il mercato è vicino a casa nostra. C\'è molta gente. Prima andiamo dal fruttivendolo. Compriamo mele, arance e fragole. Le fragole sono molto rosse e dolci. Poi andiamo dal panettiere. Mia madre compra due pagnotte e dei cornetti. Dopo compriamo del formaggio e del prosciutto. Il formaggio ha un buon profumo. Io voglio anche del cioccolato, ma mia madre dice di no. Paghiamo e torniamo a casa. Aiuto mia madre a mettere la spesa in cucina.',
    wordCount: 95,
    vocabularyHighlights: ['mercato', 'fruttivendolo', 'panettiere', 'formaggio', 'spesa'],
    questions: [
      { id: 'it_r2q1', type: 'multiple_choice', question: 'Che giorno vanno al mercato?', options: ['Domenica', 'Sabato', 'Venerdì', 'Lunedì'], correctAnswer: 'Sabato', explanation: 'Il testo comincia con: «Oggi è sabato».' },
      { id: 'it_r2q2', type: 'true_false', question: 'Comprano del cioccolato al mercato.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Il narratore vuole del cioccolato, ma la madre dice di no.' },
      { id: 'it_r2q3', type: 'multiple_choice', question: 'Che cosa comprano dal panettiere?', options: ['Del formaggio', 'Due pagnotte e dei cornetti', 'Delle mele', 'Del prosciutto'], correctAnswer: 'Due pagnotte e dei cornetti', explanation: 'Il testo dice: «Mia madre compra due pagnotte e dei cornetti».' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'it_r3', title: 'Un fine settimana a Roma', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: 'Lo scorso fine settimana, i miei amici e io siamo andati a Roma. Roma è la capitale d\'Italia e una città piena di storia. Abbiamo preso il treno da Milano. Il viaggio è durato tre ore. Siamo arrivati a mezzogiorno e abbiamo lasciato i bagagli in albergo. Il pomeriggio abbiamo visitato il Colosseo. È un edificio antico e molto impressionante. Poi siamo andati a Fontana di Trevi. La tradizione dice che se lanci una moneta nella fontana, tornerai a Roma. Abbiamo mangiato in una trattoria vicino a Piazza Navona. Ho provato i carciofi alla romana, un piatto tipico. Erano deliziosi! Il giorno dopo abbiamo visitato il Vaticano e la Cappella Sistina. Gli affreschi di Michelangelo sono straordinari. Abbiamo anche passeggiato lungo il Tevere. Il tempo era soleggiato e piacevole. Mi è piaciuto molto questo fine settimana perché Roma è una città magica.',
    wordCount: 148,
    vocabularyHighlights: ['capitale', 'Colosseo', 'trattoria', 'affreschi', 'soleggiato'],
    questions: [
      { id: 'it_r3q1', type: 'multiple_choice', question: 'Quanto è durato il viaggio in treno?', options: ['Un\'ora', 'Due ore', 'Tre ore', 'Quattro ore'], correctAnswer: 'Tre ore', explanation: 'Il testo dice: «Il viaggio è durato tre ore».' },
      { id: 'it_r3q2', type: 'true_false', question: 'Hanno mangiato in un ristorante giapponese.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Hanno mangiato in «una trattoria vicino a Piazza Navona».' },
      { id: 'it_r3q3', type: 'multiple_choice', question: 'Quale fiume attraversa Roma?', options: ['Il Po', 'L\'Arno', 'Il Tevere', 'L\'Adige'], correctAnswer: 'Il Tevere', explanation: 'Il testo menziona «passeggiato lungo il Tevere».' },
    ],
    tags: ['travel', 'italy']
  },
  {
    id: 'it_r4', title: 'La cucina italiana', level: 'A2', topic: 'Food & Cooking', sourceType: 'original',
    content: 'La cucina italiana è famosa in tutto il mondo. Ogni regione d\'Italia ha i suoi piatti tipici e le sue tradizioni culinarie. La pasta è probabilmente il piatto più conosciuto. Ci sono centinaia di forme di pasta diverse: spaghetti, penne, fusilli, rigatoni e molte altre. Ogni forma è perfetta per un tipo diverso di salsa. Al nord, la gente preferisce il risotto e la polenta. Al sud, si usano più pomodori, olio d\'oliva e pesce fresco. La pizza è nata a Napoli nel diciottesimo secolo. La pizza margherita, con pomodoro, mozzarella e basilico, rappresenta i colori della bandiera italiana. In Italia, il pranzo è il pasto principale della giornata. Le famiglie si riuniscono a tavola e mangiano insieme. Il pasto inizia con un antipasto, poi il primo piatto con la pasta, il secondo con la carne o il pesce, e infine il dolce. Il caffè espresso alla fine del pranzo è una tradizione irrinunciabile.',
    wordCount: 145,
    vocabularyHighlights: ['culinarie', 'risotto', 'mozzarella', 'antipasto', 'espresso'],
    questions: [
      { id: 'it_r4q1', type: 'multiple_choice', question: 'Dove è nata la pizza?', options: ['Roma', 'Milano', 'Napoli', 'Firenze'], correctAnswer: 'Napoli', explanation: 'Il testo dice: «La pizza è nata a Napoli nel diciottesimo secolo».' },
      { id: 'it_r4q2', type: 'multiple_choice', question: 'Quali sono i colori della pizza margherita?', options: ['Giallo, verde e bianco', 'Rosso, bianco e verde', 'Blu, rosso e bianco', 'Arancione, verde e rosso'], correctAnswer: 'Rosso, bianco e verde', explanation: 'La pizza margherita ha «pomodoro, mozzarella e basilico» che rappresentano i colori della bandiera italiana (rosso, bianco e verde).' },
      { id: 'it_r4q3', type: 'true_false', question: 'In Italia, la cena è il pasto principale della giornata.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Il testo dice: «il pranzo è il pasto principale della giornata».' },
    ],
    tags: ['food', 'cooking', 'culture']
  },

  // ═══ B1 ═══
  {
    id: 'it_r5', title: 'I social media e i giovani', level: 'B1', topic: 'Society & Technology', sourceType: 'original',
    content: 'I social media hanno cambiato profondamente il modo in cui i giovani comunicano e interagiscono. Piattaforme come Instagram, TikTok e YouTube fanno parte della vita quotidiana di milioni di adolescenti in Italia e nel mondo. Secondo recenti studi, i ragazzi italiani tra i 13 e i 17 anni trascorrono in media tre ore al giorno sui social media.\n\nCi sono aspetti positivi: i social permettono di mantenere i contatti con amici lontani, di condividere interessi e di accedere a informazioni utili. Molti giovani usano queste piattaforme per imparare cose nuove, dalla cucina alla musica, dalle lingue straniere alla programmazione.\n\nTuttavia, esistono anche rischi significativi. Il cyberbullismo è un problema crescente che colpisce molti adolescenti. Il confronto costante con le immagini perfette degli altri può causare ansia e bassa autostima. Inoltre, l\'uso eccessivo dello smartphone può disturbare il sonno e ridurre il tempo dedicato allo studio e alle relazioni personali.\n\nGli esperti consigliano di stabilire limiti chiari nell\'uso dei social media e di dedicare più tempo alle attività all\'aperto e ai rapporti faccia a faccia.',
    wordCount: 170,
    vocabularyHighlights: ['interagiscono', 'adolescenti', 'cyberbullismo', 'autostima', 'eccessivo'],
    questions: [
      { id: 'it_r5q1', type: 'multiple_choice', question: 'Quanto tempo trascorrono in media i ragazzi italiani sui social media?', options: ['Un\'ora al giorno', 'Due ore al giorno', 'Tre ore al giorno', 'Cinque ore al giorno'], correctAnswer: 'Tre ore al giorno', explanation: 'Il testo dice: «trascorrono in media tre ore al giorno sui social media».' },
      { id: 'it_r5q2', type: 'true_false', question: 'I social media hanno solo effetti negativi sui giovani.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Il testo descrive sia aspetti positivi che rischi significativi.' },
      { id: 'it_r5q3', type: 'multiple_choice', question: 'Che cosa consigliano gli esperti?', options: ['Eliminare tutti i social media', 'Stabilire limiti chiari nell\'uso dei social media', 'Usare i social media tutto il giorno', 'Non usare mai lo smartphone'], correctAnswer: 'Stabilire limiti chiari nell\'uso dei social media', explanation: 'Il testo dice: «Gli esperti consigliano di stabilire limiti chiari nell\'uso dei social media».' },
    ],
    tags: ['society', 'technology', 'youth']
  },

  // ═══ B2 ═══
  {
    id: 'it_r6', title: 'Il cambiamento climatico in Italia', level: 'B2', topic: 'Environment', sourceType: 'original',
    content: 'Il cambiamento climatico rappresenta una delle sfide più urgenti che l\'Italia si trova ad affrontare. Negli ultimi decenni, le temperature medie nel paese sono aumentate di circa due gradi centigradi, un dato superiore alla media globale. Questo fenomeno ha conseguenze concrete sulla vita quotidiana degli italiani e sull\'economia del paese.\n\nL\'agricoltura italiana, famosa per la produzione di olio d\'oliva, vino e agrumi, è particolarmente vulnerabile. Le ondate di calore sempre più frequenti e le siccità prolungate stanno mettendo a rischio i raccolti. Al contempo, le precipitazioni sono diventate più intense e concentrate, causando alluvioni e frane che colpiscono regolarmente diverse regioni, dal Piemonte alla Sicilia.\n\nAnche il patrimonio culturale italiano è minacciato. L\'innalzamento del livello del mare mette in pericolo città costiere come Venezia, dove il fenomeno dell\'acqua alta sta diventando sempre più frequente e devastante. Monumenti antichi e opere d\'arte subiscono danni a causa dell\'erosione e delle variazioni di temperatura.\n\nPer contrastare questa crisi, l\'Italia ha adottato il Piano Nazionale di Ripresa e Resilienza, che destina risorse significative alla transizione ecologica. Tra le misure previste vi sono l\'espansione delle energie rinnovabili, la riqualificazione energetica degli edifici e lo sviluppo della mobilità sostenibile. Tuttavia, molti esperti ritengono che le azioni intraprese finora siano insufficienti e che sia necessario un impegno molto più deciso per proteggere il futuro del paese.',
    wordCount: 210,
    vocabularyHighlights: ['siccità', 'alluvioni', 'patrimonio', 'innalzamento', 'transizione ecologica'],
    questions: [
      { id: 'it_r6q1', type: 'multiple_choice', question: 'Di quanto sono aumentate le temperature medie in Italia?', options: ['Mezzo grado', 'Un grado', 'Circa due gradi', 'Tre gradi'], correctAnswer: 'Circa due gradi', explanation: 'Il testo dice: «le temperature medie nel paese sono aumentate di circa due gradi centigradi».' },
      { id: 'it_r6q2', type: 'true_false', question: 'Il cambiamento climatico non ha effetti sul patrimonio culturale italiano.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Il testo dice che «il patrimonio culturale italiano è minacciato» e cita l\'esempio di Venezia e dei monumenti antichi.' },
      { id: 'it_r6q3', type: 'multiple_choice', question: 'Quale città costiera è menzionata come particolarmente a rischio?', options: ['Napoli', 'Genova', 'Venezia', 'Bari'], correctAnswer: 'Venezia', explanation: 'Il testo dice: «L\'innalzamento del livello del mare mette in pericolo città costiere come Venezia».' },
    ],
    tags: ['environment', 'italy', 'society']
  },
];
