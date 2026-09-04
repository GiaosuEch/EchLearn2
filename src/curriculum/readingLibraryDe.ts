import type { ReadingPassage } from './readingLibrary.ts';

export const readingLibraryDe: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'de_r1', title: 'Mein Tag', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: 'Ich heiße Thomas. Ich bin dreiundzwanzig Jahre alt. Ich bin Student in Berlin. Jeden Morgen stehe ich um sieben Uhr auf. Ich dusche und ziehe mich an. Dann frühstücke ich. Ich esse Brot mit Käse und trinke einen Kaffee. Nach dem Frühstück fahre ich mit der U-Bahn zur Universität. Mein Unterricht beginnt um neun Uhr. Ich studiere Informatik. Am Nachmittag gehe ich in die Bibliothek und lerne. Um fünf Uhr gehe ich nach Hause. Am Abend koche ich Abendessen. Ich esse mit meinem Mitbewohner. Wir reden über unseren Tag. Um elf Uhr gehe ich ins Bett.',
    wordCount: 99,
    vocabularyHighlights: ['Frühstück', 'U-Bahn', 'Universität', 'Bibliothek', 'Mitbewohner'],
    questions: [
      { id: 'de_r1q1', type: 'multiple_choice', question: 'Um wie viel Uhr steht Thomas auf?', options: ['Sechs Uhr', 'Sieben Uhr', 'Acht Uhr', 'Neun Uhr'], correctAnswer: 'Sieben Uhr', explanation: 'Der Text sagt: „Jeden Morgen stehe ich um sieben Uhr auf."' },
      { id: 'de_r1q2', type: 'true_false', question: 'Thomas fährt mit dem Bus zur Universität.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Der Text sagt: „Ich fahre mit der U-Bahn zur Universität."' },
      { id: 'de_r1q3', type: 'multiple_choice', question: 'Was studiert Thomas?', options: ['Medizin', 'Informatik', 'Jura', 'Kunst'], correctAnswer: 'Informatik', explanation: 'Der Text sagt: „Ich studiere Informatik."' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'de_r2', title: 'Im Supermarkt', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: 'Heute ist Samstag. Ich gehe mit meiner Mutter in den Supermarkt. Wir brauchen Lebensmittel für die Woche. Zuerst gehen wir zur Obstabteilung. Wir kaufen Äpfel, Bananen und Trauben. Dann gehen wir zur Gemüseabteilung. Meine Mutter kauft Tomaten, Kartoffeln und Zwiebeln. Danach kaufen wir Brot, Milch und Eier. Ich möchte Schokolade, aber meine Mutter sagt, ich soll mehr Obst essen. Wir kaufen auch Wurst und Käse. An der Kasse bezahlen wir fünfundvierzig Euro. Wir gehen nach Hause und räumen alles in den Kühlschrank.',
    wordCount: 93,
    vocabularyHighlights: ['Supermarkt', 'Lebensmittel', 'Obst', 'Gemüse', 'Kühlschrank'],
    questions: [
      { id: 'de_r2q1', type: 'multiple_choice', question: 'An welchem Tag gehen sie einkaufen?', options: ['Sonntag', 'Samstag', 'Freitag', 'Montag'], correctAnswer: 'Samstag', explanation: 'Der Text beginnt mit: „Heute ist Samstag."' },
      { id: 'de_r2q2', type: 'true_false', question: 'Sie kaufen Schokolade im Supermarkt.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Der Erzähler möchte Schokolade, aber die Mutter sagt Nein.' },
      { id: 'de_r2q3', type: 'multiple_choice', question: 'Wie viel bezahlen sie an der Kasse?', options: ['Dreißig Euro', 'Vierzig Euro', 'Fünfundvierzig Euro', 'Fünfzig Euro'], correctAnswer: 'Fünfundvierzig Euro', explanation: 'Der Text sagt: „An der Kasse bezahlen wir fünfundvierzig Euro."' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'de_r3', title: 'Ein Wochenende in München', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: 'Letztes Wochenende sind meine Freunde und ich nach München gefahren. München ist die Hauptstadt von Bayern und eine sehr schöne Stadt. Wir sind mit dem Zug gefahren. Die Fahrt hat etwa vier Stunden gedauert. Wir haben in einem kleinen Hotel in der Nähe vom Marienplatz übernachtet. Am ersten Tag haben wir den Marienplatz besucht und das berühmte Glockenspiel gesehen. Dann haben wir im Englischen Garten spaziert. Der Park ist riesig und wunderschön. Am Nachmittag haben wir Weißwurst und Brezeln in einem traditionellen Biergarten gegessen. Das Essen war fantastisch! Am zweiten Tag haben wir das Deutsche Museum besucht. Es ist eines der größten Technikmuseen der Welt. Wir haben viele interessante Ausstellungen gesehen. München ist eine tolle Stadt mit viel Kultur und gutem Essen. Ich möchte unbedingt wiederkommen.',
    wordCount: 138,
    vocabularyHighlights: ['Hauptstadt', 'Glockenspiel', 'Biergarten', 'Museum', 'Ausstellungen'],
    questions: [
      { id: 'de_r3q1', type: 'multiple_choice', question: 'Wie lange hat die Zugfahrt gedauert?', options: ['Zwei Stunden', 'Drei Stunden', 'Vier Stunden', 'Fünf Stunden'], correctAnswer: 'Vier Stunden', explanation: 'Der Text sagt: „Die Fahrt hat etwa vier Stunden gedauert."' },
      { id: 'de_r3q2', type: 'true_false', question: 'Sie haben im Englischen Garten Weißwurst gegessen.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Sie haben im Englischen Garten spaziert, aber die Weißwurst in einem Biergarten gegessen.' },
      { id: 'de_r3q3', type: 'multiple_choice', question: 'Was haben sie am zweiten Tag gemacht?', options: ['Im Park spaziert', 'Das Deutsche Museum besucht', 'Weißwurst gegessen', 'Mit dem Zug gefahren'], correctAnswer: 'Das Deutsche Museum besucht', explanation: 'Der Text sagt: „Am zweiten Tag haben wir das Deutsche Museum besucht."' },
    ],
    tags: ['travel', 'germany']
  },
  {
    id: 'de_r4', title: 'Mein Lieblingshobby', level: 'A2', topic: 'Hobbies', sourceType: 'original',
    content: 'Mein Lieblingshobby ist Fotografieren. Ich habe vor drei Jahren damit angefangen, als mein Vater mir eine Kamera geschenkt hat. Am Anfang habe ich nur einfache Fotos von meiner Familie und meinen Freunden gemacht. Aber jetzt fotografiere ich am liebsten die Natur. Ich gehe oft in den Wald oder an den See und mache Bilder von Tieren, Blumen und Landschaften. Am Wochenende stehe ich manchmal sehr früh auf, um den Sonnenaufgang zu fotografieren. Das Licht am Morgen ist besonders schön. Ich bearbeite meine Fotos auch am Computer mit einem Bildbearbeitungsprogramm. Meine besten Bilder poste ich auf Instagram. Viele Leute schreiben nette Kommentare. Letzten Monat habe ich an einem Fotowettbewerb teilgenommen und den dritten Platz gewonnen. Darüber habe ich mich sehr gefreut. In der Zukunft möchte ich einen Fotokurs besuchen und noch besser werden.',
    wordCount: 139,
    vocabularyHighlights: ['Kamera', 'Landschaften', 'Sonnenaufgang', 'Bildbearbeitungsprogramm', 'Fotowettbewerb'],
    questions: [
      { id: 'de_r4q1', type: 'multiple_choice', question: 'Wann hat der Erzähler mit dem Fotografieren angefangen?', options: ['Vor einem Jahr', 'Vor zwei Jahren', 'Vor drei Jahren', 'Vor fünf Jahren'], correctAnswer: 'Vor drei Jahren', explanation: 'Der Text sagt: „Ich habe vor drei Jahren damit angefangen."' },
      { id: 'de_r4q2', type: 'true_false', question: 'Der Erzähler fotografiert am liebsten Gebäude in der Stadt.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Der Text sagt: „Jetzt fotografiere ich am liebsten die Natur."' },
      { id: 'de_r4q3', type: 'multiple_choice', question: 'Welchen Platz hat der Erzähler im Fotowettbewerb gewonnen?', options: ['Den ersten Platz', 'Den zweiten Platz', 'Den dritten Platz', 'Den vierten Platz'], correctAnswer: 'Den dritten Platz', explanation: 'Der Text sagt: „den dritten Platz gewonnen".' },
    ],
    tags: ['hobbies', 'photography']
  },

  // ═══ B1 ═══
  {
    id: 'de_r5', title: 'Umweltschutz in Deutschland', level: 'B1', topic: 'Environment', sourceType: 'original',
    content: 'Deutschland gilt als eines der führenden Länder im Bereich Umweltschutz. Mülltrennung ist hier selbstverständlich: Jeder Haushalt trennt seinen Abfall in verschiedene Tonnen — Papier, Plastik, Biomüll und Restmüll. Glasflaschen werden nach Farben sortiert in spezielle Container geworfen. Das Pfandsystem für Flaschen und Dosen motiviert die Menschen zusätzlich zum Recycling. Für jede zurückgegebene Flasche bekommt man zwischen acht und fünfundzwanzig Cent zurück.\n\nAuch im Bereich erneuerbare Energien ist Deutschland aktiv. Windräder und Solaranlagen prägen das Landschaftsbild, besonders im Norden des Landes. Die Regierung hat das Ziel, bis 2045 klimaneutral zu werden. Viele Bürger engagieren sich persönlich für den Umweltschutz. Sie kaufen regionale und saisonale Produkte, fahren Fahrrad statt Auto und reduzieren ihren Plastikverbrauch.\n\nAllerdings gibt es auch Kritik. Manche sagen, dass Deutschland zu langsam beim Kohleausstieg ist. Andere bemängeln, dass der öffentliche Nahverkehr nicht gut genug ausgebaut ist, um eine echte Alternative zum Auto zu bieten.',
    wordCount: 158,
    vocabularyHighlights: ['Mülltrennung', 'Pfandsystem', 'erneuerbare Energien', 'klimaneutral', 'Kohleausstieg'],
    questions: [
      { id: 'de_r5q1', type: 'multiple_choice', question: 'Wie viel Pfand bekommt man für eine zurückgegebene Flasche?', options: ['1 bis 5 Cent', '8 bis 25 Cent', '30 bis 50 Cent', '1 Euro'], correctAnswer: '8 bis 25 Cent', explanation: 'Der Text sagt: „zwischen acht und fünfundzwanzig Cent zurück".' },
      { id: 'de_r5q2', type: 'true_false', question: 'Deutschland möchte bis 2030 klimaneutral werden.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Der Text sagt: „Die Regierung hat das Ziel, bis 2045 klimaneutral zu werden."' },
      { id: 'de_r5q3', type: 'multiple_choice', question: 'Was wird im Text als Kritikpunkt genannt?', options: ['Zu viel Recycling', 'Zu langsamer Kohleausstieg', 'Zu viele Windräder', 'Zu hohe Pfandbeträge'], correctAnswer: 'Zu langsamer Kohleausstieg', explanation: 'Der Text sagt: „Manche sagen, dass Deutschland zu langsam beim Kohleausstieg ist."' },
    ],
    tags: ['environment', 'germany', 'society']
  },

  // ═══ B2 ═══
  {
    id: 'de_r6', title: 'Digitalisierung und Arbeitsmarkt', level: 'B2', topic: 'Technology & Work', sourceType: 'original',
    content: 'Die fortschreitende Digitalisierung verändert den deutschen Arbeitsmarkt grundlegend. Während traditionelle Berufe in der Produktion und Verwaltung zunehmend automatisiert werden, entstehen gleichzeitig neue Tätigkeitsfelder in der IT-Branche, im Bereich künstliche Intelligenz und in der digitalen Kommunikation.\n\nEine Studie des Instituts für Arbeitsmarkt- und Berufsforschung prognostiziert, dass in den kommenden Jahren etwa 1,5 Millionen Arbeitsplätze durch Automatisierung wegfallen könnten. Gleichzeitig werden jedoch voraussichtlich ebenso viele neue Stellen geschaffen. Das Problem liegt weniger in der Gesamtzahl der Arbeitsplätze als vielmehr in der Qualifikationslücke: Die verschwindenden und die entstehenden Berufe erfordern völlig unterschiedliche Kompetenzen.\n\nBesonders betroffen sind Routinetätigkeiten wie Dateneingabe, Buchhaltung und einfache Produktionsarbeit. Demgegenüber wächst die Nachfrage nach Fachkräften mit digitalen Kompetenzen, analytischem Denken und kreativen Fähigkeiten. Soziale und emotionale Intelligenz bleiben ebenfalls gefragt, da sie von Maschinen bisher nicht ersetzt werden können.\n\nExperten fordern daher eine umfassende Reform des Bildungssystems. Lebenslanges Lernen müsse zur Selbstverständlichkeit werden. Unternehmen sollten verstärkt in die Weiterbildung ihrer Mitarbeiter investieren, und der Staat müsse die digitale Infrastruktur ausbauen, insbesondere in ländlichen Regionen, wo der Breitbandausbau noch immer hinterherhinkt.',
    wordCount: 195,
    vocabularyHighlights: ['Digitalisierung', 'Automatisierung', 'Qualifikationslücke', 'Routinetätigkeiten', 'Weiterbildung'],
    questions: [
      { id: 'de_r6q1', type: 'multiple_choice', question: 'Wie viele Arbeitsplätze könnten laut der Studie durch Automatisierung wegfallen?', options: ['500.000', '1 Million', '1,5 Millionen', '3 Millionen'], correctAnswer: '1,5 Millionen', explanation: 'Der Text sagt: „etwa 1,5 Millionen Arbeitsplätze durch Automatisierung wegfallen könnten".' },
      { id: 'de_r6q2', type: 'true_false', question: 'Das Hauptproblem ist, dass insgesamt weniger Arbeitsplätze existieren werden.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Der Text sagt: „Das Problem liegt weniger in der Gesamtzahl der Arbeitsplätze als vielmehr in der Qualifikationslücke."' },
      { id: 'de_r6q3', type: 'multiple_choice', question: 'Was fordern Experten laut dem Text?', options: ['Weniger Technologie', 'Eine Reform des Bildungssystems', 'Mehr Routinetätigkeiten', 'Weniger Investitionen'], correctAnswer: 'Eine Reform des Bildungssystems', explanation: 'Der Text sagt: „Experten fordern daher eine umfassende Reform des Bildungssystems."' },
    ],
    tags: ['technology', 'work', 'society']
  },
];
