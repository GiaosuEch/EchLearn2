import type { ReadingPassage } from './readingLibrary.ts';

export const readingLibraryEs: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'es_r1', title: 'Mi familia', level: 'A1', topic: 'Family', sourceType: 'original',
    content: 'Me llamo Carlos. Tengo veinticinco años. Vivo en Madrid con mi familia. Mi familia es grande. Mi padre se llama Antonio y trabaja en un banco. Mi madre se llama Carmen y es profesora de español. Tengo dos hermanos: un hermano mayor y una hermana menor. Mi hermano se llama Pedro y tiene veintisiete años. Él es ingeniero. Mi hermana se llama Lucía y tiene veinte años. Ella estudia medicina en la universidad. También tenemos un perro. Se llama Max. Los domingos, toda la familia come junta. Mi madre prepara paella, que es nuestro plato favorito. Me gusta mucho pasar tiempo con mi familia.',
    wordCount: 107,
    vocabularyHighlights: ['familia', 'hermano', 'profesora', 'universidad', 'paella'],
    questions: [
      { id: 'es_r1q1', type: 'multiple_choice', question: '¿Cuántos hermanos tiene Carlos?', options: ['Uno', 'Dos', 'Tres', 'Cuatro'], correctAnswer: 'Dos', explanation: 'El texto dice: « Tengo dos hermanos: un hermano mayor y una hermana menor ».' },
      { id: 'es_r1q2', type: 'true_false', question: 'La madre de Carlos trabaja en un banco.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'El padre trabaja en un banco. La madre es profesora de español.' },
      { id: 'es_r1q3', type: 'multiple_choice', question: '¿Qué estudia Lucía?', options: ['Ingeniería', 'Español', 'Medicina', 'Historia'], correctAnswer: 'Medicina', explanation: 'El texto dice: « Ella estudia medicina en la universidad ».' },
    ],
    tags: ['family', 'basics']
  },
  {
    id: 'es_r2', title: 'En el restaurante', level: 'A1', topic: 'Food & Dining', sourceType: 'original',
    content: 'Hoy es viernes. Mis amigos y yo vamos a un restaurante. El restaurante se llama "La Mesa Alegre". Está en el centro de la ciudad. Llegamos a las ocho de la noche. El camarero nos da la carta. Yo pido una sopa de tomate y un pollo con arroz. Mi amiga Ana pide una ensalada y pescado. Mi amigo Luis pide una pizza. Para beber, pedimos agua y zumo de naranja. La comida está muy rica. De postre, yo como un flan. Ana come helado de chocolate. Pagamos la cuenta y dejamos una propina. El camarero es muy simpático. Pasamos una noche muy agradable.',
    wordCount: 105,
    vocabularyHighlights: ['restaurante', 'camarero', 'carta', 'postre', 'propina'],
    questions: [
      { id: 'es_r2q1', type: 'multiple_choice', question: '¿Qué día van al restaurante?', options: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'], correctAnswer: 'Viernes', explanation: 'El texto comienza con: « Hoy es viernes ».' },
      { id: 'es_r2q2', type: 'multiple_choice', question: '¿Qué pide Luis?', options: ['Sopa', 'Ensalada', 'Pizza', 'Pescado'], correctAnswer: 'Pizza', explanation: 'El texto dice: « Mi amigo Luis pide una pizza ».' },
      { id: 'es_r2q3', type: 'true_false', question: 'De postre, el narrador come helado.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'El narrador come un flan. Ana es quien come helado de chocolate.' },
    ],
    tags: ['food', 'dining', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'es_r3', title: 'Viaje a Barcelona', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: 'El verano pasado, mi novia y yo viajamos a Barcelona. Barcelona es una ciudad hermosa en la costa mediterránea de España. Llegamos en avión desde Madrid. El vuelo duró solo una hora y media. Nos alojamos en un hotel pequeño cerca de Las Ramblas, la calle más famosa de la ciudad. El primer día, visitamos la Sagrada Familia, la iglesia diseñada por Antoni Gaudí. Es un edificio impresionante y muy alto. Por la tarde, caminamos por el Barrio Gótico. Las calles son estrechas y llenas de historia. Comimos tapas en un bar típico. Probamos patatas bravas, jamón serrano y tortilla española. Todo estaba delicioso. El segundo día, fuimos a la playa de la Barceloneta. El agua estaba tibia y el sol brillaba. Nadamos y tomamos el sol durante horas. Por la noche, vimos un espectáculo de flamenco. Fue una experiencia increíble. Barcelona es una ciudad que tiene de todo: cultura, playa, buena comida y mucha vida.',
    wordCount: 160,
    vocabularyHighlights: ['costa', 'iglesia', 'impresionante', 'tapas', 'espectáculo'],
    questions: [
      { id: 'es_r3q1', type: 'multiple_choice', question: '¿Cuánto duró el vuelo desde Madrid?', options: ['Una hora', 'Una hora y media', 'Dos horas', 'Tres horas'], correctAnswer: 'Una hora y media', explanation: 'El texto dice: « El vuelo duró solo una hora y media ».' },
      { id: 'es_r3q2', type: 'true_false', question: 'La Sagrada Familia fue diseñada por Pablo Picasso.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'El texto dice que fue « diseñada por Antoni Gaudí ».' },
      { id: 'es_r3q3', type: 'multiple_choice', question: '¿Qué hicieron el segundo día?', options: ['Visitaron un museo', 'Fueron a la playa', 'Tomaron un tren', 'Fueron de compras'], correctAnswer: 'Fueron a la playa', explanation: 'El texto dice: « El segundo día, fuimos a la playa de la Barceloneta ».' },
    ],
    tags: ['travel', 'spain']
  },
  {
    id: 'es_r4', title: 'Mi deporte favorito', level: 'A2', topic: 'Sports', sourceType: 'original',
    content: 'Mi deporte favorito es el fútbol. En España, el fútbol es más que un deporte: es una pasión. Empecé a jugar cuando tenía seis años. Mi padre me llevaba al parque todos los sábados para practicar. Ahora juego en un equipo local con mis amigos. Entrenamos los martes y jueves por la tarde. Los partidos son los domingos por la mañana. Yo juego de centrocampista porque me gusta correr y pasar el balón. El mes pasado, nuestro equipo ganó un torneo local. Fue un momento muy emocionante. Marcamos tres goles en la final. También me gusta ver fútbol en la televisión. Mi equipo favorito es el Real Madrid. Veo todos sus partidos con mi padre. Cuando hay un gol, gritamos y saltamos de alegría. El fútbol me enseña muchas cosas importantes: el trabajo en equipo, la disciplina y el respeto por los demás.',
    wordCount: 148,
    vocabularyHighlights: ['equipo', 'entrenamos', 'centrocampista', 'torneo', 'disciplina'],
    questions: [
      { id: 'es_r4q1', type: 'multiple_choice', question: '¿A qué edad empezó a jugar al fútbol?', options: ['Cuatro años', 'Cinco años', 'Seis años', 'Ocho años'], correctAnswer: 'Seis años', explanation: 'El texto dice: « Empecé a jugar cuando tenía seis años ».' },
      { id: 'es_r4q2', type: 'true_false', question: 'Los partidos del equipo son los sábados.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'El texto dice: « Los partidos son los domingos por la mañana ».' },
      { id: 'es_r4q3', type: 'multiple_choice', question: '¿Cuántos goles marcaron en la final?', options: ['Uno', 'Dos', 'Tres', 'Cuatro'], correctAnswer: 'Tres', explanation: 'El texto dice: « Marcamos tres goles en la final ».' },
    ],
    tags: ['sports', 'hobbies']
  },

  // ═══ B1 ═══
  {
    id: 'es_r5', title: 'El cambio climático', level: 'B1', topic: 'Environment', sourceType: 'original',
    content: 'El cambio climático es uno de los mayores desafíos que enfrenta la humanidad en el siglo XXI. Las temperaturas globales han aumentado aproximadamente 1,1 grados centígrados desde la era preindustrial, y los científicos advierten que las consecuencias serán cada vez más graves si no se toman medidas urgentes.\n\nLos efectos del cambio climático ya son visibles en todo el mundo. Los glaciares se derriten a un ritmo alarmante, el nivel del mar sube y los fenómenos meteorológicos extremos, como huracanes, sequías e inundaciones, son cada vez más frecuentes. En España, las olas de calor son más intensas y duraderas cada verano.\n\nLas principales causas son las emisiones de gases de efecto invernadero producidas por la quema de combustibles fósiles, la deforestación y la agricultura intensiva. Para combatir este problema, muchos países han firmado el Acuerdo de París, comprometiéndose a reducir sus emisiones.\n\nA nivel individual, cada persona puede contribuir: usando transporte público, reduciendo el consumo de carne, ahorrando energía en casa y apoyando políticas medioambientales responsables.',
    wordCount: 168,
    vocabularyHighlights: ['desafíos', 'glaciares', 'emisiones', 'combustibles fósiles', 'deforestación'],
    questions: [
      { id: 'es_r5q1', type: 'multiple_choice', question: '¿Cuánto han aumentado las temperaturas globales desde la era preindustrial?', options: ['0,5 grados', '1,1 grados', '2 grados', '3 grados'], correctAnswer: '1,1 grados', explanation: 'El texto dice: « Las temperaturas globales han aumentado aproximadamente 1,1 grados centígrados ».' },
      { id: 'es_r5q2', type: 'true_false', question: 'Los fenómenos meteorológicos extremos son menos frecuentes según el texto.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'El texto dice que « son cada vez más frecuentes ».' },
      { id: 'es_r5q3', type: 'multiple_choice', question: '¿Qué acuerdo internacional se menciona en el texto?', options: ['El Protocolo de Kioto', 'El Acuerdo de París', 'La Cumbre de Río', 'El Tratado de Lisboa'], correctAnswer: 'El Acuerdo de París', explanation: 'El texto dice: « muchos países han firmado el Acuerdo de París ».' },
    ],
    tags: ['environment', 'climate', 'society']
  },

  // ═══ B2 ═══
  {
    id: 'es_r6', title: 'Inteligencia artificial y empleo', level: 'B2', topic: 'Technology & Society', sourceType: 'original',
    content: 'La inteligencia artificial (IA) está transformando profundamente el mercado laboral mundial. Mientras algunos expertos predicen una era de prosperidad en la que las máquinas se encargarán de las tareas repetitivas y los humanos podrán dedicarse a trabajos más creativos, otros advierten sobre el riesgo de un desempleo masivo sin precedentes.\n\nSegún un informe del Foro Económico Mundial, la automatización podría eliminar 85 millones de empleos para 2025, pero simultáneamente crear 97 millones de nuevos puestos de trabajo. El desafío radica en que las competencias requeridas para estos nuevos empleos difieren sustancialmente de las actuales. Los trabajadores necesitarán habilidades en programación, análisis de datos y pensamiento crítico.\n\nLos sectores más vulnerables a la automatización incluyen la manufactura, el transporte y la atención al cliente. No obstante, profesiones que requieren empatía, creatividad y juicio ético —como la enfermería, la enseñanza y las artes— seguirán siendo predominantemente humanas.\n\nEl debate sobre la IA también plantea cuestiones éticas fundamentales. ¿Quién es responsable cuando un algoritmo toma una decisión incorrecta? ¿Cómo garantizamos que los beneficios de la automatización se distribuyan equitativamente en la sociedad? Estas preguntas exigen respuestas urgentes por parte de gobiernos, empresas y ciudadanos.\n\nLa clave está en la educación continua y la adaptabilidad. Los sistemas educativos deben preparar a las nuevas generaciones no solo con conocimientos técnicos, sino también con la capacidad de aprender, desaprender y reaprender a lo largo de toda la vida.',
    wordCount: 218,
    vocabularyHighlights: ['automatización', 'competencias', 'vulnerables', 'equitativamente', 'adaptabilidad'],
    questions: [
      { id: 'es_r6q1', type: 'multiple_choice', question: 'Según el Foro Económico Mundial, ¿cuántos nuevos empleos podría crear la automatización?', options: ['50 millones', '85 millones', '97 millones', '120 millones'], correctAnswer: '97 millones', explanation: 'El texto dice: « crear 97 millones de nuevos puestos de trabajo ».' },
      { id: 'es_r6q2', type: 'true_false', question: 'La enfermería es un sector muy vulnerable a la automatización.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'El texto dice que profesiones como la enfermería « seguirán siendo predominantemente humanas ».' },
      { id: 'es_r6q3', type: 'multiple_choice', question: '¿Cuál es la clave según la conclusión del texto?', options: ['Prohibir la inteligencia artificial', 'La educación continua y la adaptabilidad', 'Crear más fábricas', 'Reducir los salarios'], correctAnswer: 'La educación continua y la adaptabilidad', explanation: 'El texto concluye: « La clave está en la educación continua y la adaptabilidad ».' },
    ],
    tags: ['technology', 'work', 'society']
  },
];
