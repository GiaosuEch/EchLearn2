// @ts-nocheck
import { getLanguageMeta, normalizeLanguage } from '../utils/languageUtils';

export const CONTENT_TARGET_COUNT = 120;
export const SUPPORTED_SKILL_CONTENT = ['listening', 'speaking', 'reading', 'writing'] as const;

const LEVELS = ['A1', 'A1', 'A2', 'A2', 'B1', 'B1', 'B2', 'B2', 'C1', 'C2'];

const dailySituations = [
  { vi: 'Chào hỏi hằng ngày', en: 'daily greetings', tag: 'greetings' },
  { vi: 'Gọi món ở quán cà phê', en: 'ordering at a cafe', tag: 'cafe' },
  { vi: 'Hỏi đường trong thành phố', en: 'asking for directions', tag: 'directions' },
  { vi: 'Mua vé xe buýt hoặc tàu', en: 'buying transport tickets', tag: 'transport' },
  { vi: 'Đi siêu thị', en: 'shopping at the supermarket', tag: 'shopping' },
  { vi: 'Hỏi giá và trả tiền', en: 'asking prices and paying', tag: 'money' },
  { vi: 'Đặt phòng khách sạn', en: 'booking a hotel room', tag: 'hotel' },
  { vi: 'Gặp bác sĩ', en: 'visiting a doctor', tag: 'health' },
  { vi: 'Nói về thời tiết', en: 'talking about the weather', tag: 'weather' },
  { vi: 'Giới thiệu bản thân', en: 'introducing yourself', tag: 'intro' },
  { vi: 'Lịch trình buổi sáng', en: 'morning routine', tag: 'routine' },
  { vi: 'Nói chuyện ở trường', en: 'school conversation', tag: 'school' },
  { vi: 'Nói chuyện ở nơi làm việc', en: 'workplace conversation', tag: 'work' },
  { vi: 'Hẹn gặp bạn bè', en: 'making plans with friends', tag: 'friends' },
  { vi: 'Gọi điện thoại ngắn', en: 'short phone call', tag: 'phone' },
  { vi: 'Nhắn tin lịch sự', en: 'polite texting', tag: 'texting' },
  { vi: 'Ở sân bay', en: 'at the airport', tag: 'airport' },
  { vi: 'Tìm nhà vệ sinh / quầy thông tin', en: 'finding facilities', tag: 'facilities' },
  { vi: 'Nói về sở thích', en: 'talking about hobbies', tag: 'hobbies' },
  { vi: 'Nghe nhạc và podcast', en: 'music and podcasts', tag: 'media' },
  { vi: 'Đặt đồ ăn giao tận nơi', en: 'ordering delivery', tag: 'delivery' },
  { vi: 'Thuê nhà / hỏi địa chỉ', en: 'renting and addresses', tag: 'housing' },
  { vi: 'Mua thuốc ở hiệu thuốc', en: 'at the pharmacy', tag: 'pharmacy' },
  { vi: 'Xin lỗi và cảm ơn', en: 'apologies and thanks', tag: 'politeness' },
  { vi: 'Kể về cuối tuần', en: 'talking about the weekend', tag: 'weekend' },
  { vi: 'Hỏi giờ và lịch hẹn', en: 'time and appointments', tag: 'time' },
  { vi: 'Nói về gia đình', en: 'family conversation', tag: 'family' },
  { vi: 'Chụp ảnh / đăng mạng xã hội', en: 'photos and social media', tag: 'social' },
  { vi: 'Xử lý sự cố khẩn cấp', en: 'handling emergencies', tag: 'emergency' },
  { vi: 'Ôn tập trước khi đi du lịch', en: 'travel review', tag: 'travel-review' },
];

const phraseBank: Record<string, { target: string; vi: string; roman?: string; focus?: string }[]> = {
  en: [
    { target: 'Hello, nice to meet you.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { target: 'I would like a coffee and some water.', vi: 'Tôi muốn một cà phê và một ít nước.' },
    { target: 'Where is the nearest station?', vi: 'Nhà ga gần nhất ở đâu?' },
    { target: 'How much does this cost?', vi: 'Cái này giá bao nhiêu?' },
    { target: 'Can I pay by card?', vi: 'Tôi có thể trả bằng thẻ không?' },
    { target: 'I have a reservation under my name.', vi: 'Tôi có đặt chỗ dưới tên của mình.' },
    { target: 'I do not feel well today.', vi: 'Hôm nay tôi thấy không khỏe.' },
    { target: 'What time does the bus leave?', vi: 'Xe buýt khởi hành lúc mấy giờ?' },
    { target: 'Could you speak more slowly, please?', vi: 'Bạn có thể nói chậm hơn được không?' },
    { target: 'I am learning English every day.', vi: 'Tôi đang học tiếng Anh mỗi ngày.' },
    { target: 'Let us meet at the entrance.', vi: 'Chúng ta hãy gặp nhau ở lối vào.' },
    { target: 'I need help finding this address.', vi: 'Tôi cần giúp tìm địa chỉ này.' },
    { target: 'The weather is beautiful today.', vi: 'Hôm nay thời tiết đẹp.' },
    { target: 'Please send me a message later.', vi: 'Lát nữa hãy nhắn tin cho tôi.' },
    { target: 'I like listening to music on the bus.', vi: 'Tôi thích nghe nhạc trên xe buýt.' },
    { target: 'Is this seat available?', vi: 'Chỗ ngồi này còn trống không?' },
    { target: 'I want to practice speaking for five minutes.', vi: 'Tôi muốn luyện nói trong năm phút.' },
    { target: 'Can you recommend a simple podcast?', vi: 'Bạn có thể gợi ý một podcast đơn giản không?' },
    { target: 'I will call you when I arrive.', vi: 'Tôi sẽ gọi cho bạn khi tôi đến nơi.' },
    { target: 'Please show me the way on the map.', vi: 'Vui lòng chỉ đường cho tôi trên bản đồ.' },
  ],
  fr: [
    { target: 'Bonjour, ravi de vous rencontrer.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { target: 'Je voudrais un café et de l’eau.', vi: 'Tôi muốn một cà phê và nước.', roman: 'Je voudrais un café et de l’eau.' },
    { target: 'Où est la gare la plus proche ?', vi: 'Nhà ga gần nhất ở đâu?' },
    { target: 'Combien ça coûte ?', vi: 'Cái này giá bao nhiêu?' },
    { target: 'Puis-je payer par carte ?', vi: 'Tôi có thể trả bằng thẻ không?' },
    { target: 'J’ai une réservation à mon nom.', vi: 'Tôi có đặt chỗ dưới tên của mình.' },
    { target: 'Je ne me sens pas bien aujourd’hui.', vi: 'Hôm nay tôi thấy không khỏe.' },
    { target: 'À quelle heure part le bus ?', vi: 'Xe buýt khởi hành lúc mấy giờ?' },
    { target: 'Pouvez-vous parler plus lentement ?', vi: 'Bạn có thể nói chậm hơn không?' },
    { target: 'J’apprends le français tous les jours.', vi: 'Tôi học tiếng Pháp mỗi ngày.' },
    { target: 'Retrouvons-nous à l’entrée.', vi: 'Hãy gặp nhau ở lối vào.' },
    { target: 'J’ai besoin d’aide pour trouver cette adresse.', vi: 'Tôi cần giúp tìm địa chỉ này.' },
    { target: 'Il fait beau aujourd’hui.', vi: 'Hôm nay thời tiết đẹp.' },
    { target: 'Envoyez-moi un message plus tard.', vi: 'Hãy nhắn tin cho tôi sau.' },
    { target: 'J’aime écouter de la musique dans le bus.', vi: 'Tôi thích nghe nhạc trên xe buýt.' },
    { target: 'Cette place est-elle libre ?', vi: 'Chỗ này còn trống không?' },
    { target: 'Je veux pratiquer l’oral pendant cinq minutes.', vi: 'Tôi muốn luyện nói năm phút.' },
    { target: 'Pouvez-vous recommander un podcast simple ?', vi: 'Bạn có thể gợi ý một podcast đơn giản không?' },
    { target: 'Je vous appellerai quand j’arriverai.', vi: 'Tôi sẽ gọi bạn khi tôi đến.' },
    { target: 'Montrez-moi le chemin sur la carte, s’il vous plaît.', vi: 'Vui lòng chỉ đường trên bản đồ.' },
  ],
  de: [
    { target: 'Hallo, schön Sie kennenzulernen.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { target: 'Ich möchte einen Kaffee und Wasser.', vi: 'Tôi muốn một cà phê và nước.' },
    { target: 'Wo ist der nächste Bahnhof?', vi: 'Nhà ga gần nhất ở đâu?' },
    { target: 'Wie viel kostet das?', vi: 'Cái này giá bao nhiêu?' },
    { target: 'Kann ich mit Karte bezahlen?', vi: 'Tôi có thể trả bằng thẻ không?' },
    { target: 'Ich habe eine Reservierung auf meinen Namen.', vi: 'Tôi có đặt chỗ dưới tên mình.' },
    { target: 'Mir geht es heute nicht gut.', vi: 'Hôm nay tôi thấy không khỏe.' },
    { target: 'Wann fährt der Bus ab?', vi: 'Xe buýt khởi hành lúc mấy giờ?' },
    { target: 'Können Sie bitte langsamer sprechen?', vi: 'Bạn có thể nói chậm hơn không?' },
    { target: 'Ich lerne jeden Tag Deutsch.', vi: 'Tôi học tiếng Đức mỗi ngày.' },
    { target: 'Treffen wir uns am Eingang.', vi: 'Hãy gặp nhau ở lối vào.' },
    { target: 'Ich brauche Hilfe, diese Adresse zu finden.', vi: 'Tôi cần giúp tìm địa chỉ này.' },
    { target: 'Das Wetter ist heute schön.', vi: 'Hôm nay thời tiết đẹp.' },
    { target: 'Schick mir später bitte eine Nachricht.', vi: 'Lát nữa hãy nhắn tin cho tôi.' },
    { target: 'Ich höre gern Musik im Bus.', vi: 'Tôi thích nghe nhạc trên xe buýt.' },
    { target: 'Ist dieser Platz frei?', vi: 'Chỗ này còn trống không?' },
    { target: 'Ich möchte fünf Minuten Sprechen üben.', vi: 'Tôi muốn luyện nói năm phút.' },
    { target: 'Können Sie einen einfachen Podcast empfehlen?', vi: 'Bạn có thể gợi ý một podcast đơn giản không?' },
    { target: 'Ich rufe dich an, wenn ich ankomme.', vi: 'Tôi sẽ gọi bạn khi đến nơi.' },
    { target: 'Zeigen Sie mir bitte den Weg auf der Karte.', vi: 'Vui lòng chỉ đường trên bản đồ.' },
  ],
  zh: [
    { target: '你好，很高兴认识你。', vi: 'Xin chào, rất vui được gặp bạn.', roman: 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.' },
    { target: '我想要一杯咖啡和水。', vi: 'Tôi muốn một ly cà phê và nước.', roman: 'Wǒ xiǎng yào yì bēi kāfēi hé shuǐ.' },
    { target: '最近的车站在哪里？', vi: 'Nhà ga gần nhất ở đâu?', roman: 'Zuìjìn de chēzhàn zài nǎlǐ?' },
    { target: '这个多少钱？', vi: 'Cái này giá bao nhiêu?', roman: 'Zhège duōshǎo qián?' },
    { target: '我可以刷卡吗？', vi: 'Tôi có thể trả bằng thẻ không?', roman: 'Wǒ kěyǐ shuākǎ ma?' },
    { target: '我有一个预订。', vi: 'Tôi có một đặt chỗ.', roman: 'Wǒ yǒu yí ge yùdìng.' },
    { target: '我今天不太舒服。', vi: 'Hôm nay tôi không khỏe lắm.', roman: 'Wǒ jīntiān bú tài shūfu.' },
    { target: '公共汽车几点出发？', vi: 'Xe buýt khởi hành lúc mấy giờ?', roman: 'Gōnggòng qìchē jǐ diǎn chūfā?' },
    { target: '请说慢一点。', vi: 'Vui lòng nói chậm hơn.', roman: 'Qǐng shuō màn yìdiǎn.' },
    { target: '我每天学习中文。', vi: 'Tôi học tiếng Trung mỗi ngày.', roman: 'Wǒ měitiān xuéxí Zhōngwén.' },
    { target: '我们在入口见面吧。', vi: 'Chúng ta gặp nhau ở lối vào nhé.', roman: 'Wǒmen zài rùkǒu jiànmiàn ba.' },
    { target: '我需要帮忙找这个地址。', vi: 'Tôi cần giúp tìm địa chỉ này.', roman: 'Wǒ xūyào bāngmáng zhǎo zhège dìzhǐ.' },
    { target: '今天天气很好。', vi: 'Hôm nay thời tiết rất đẹp.', roman: 'Jīntiān tiānqì hěn hǎo.' },
    { target: '请稍后给我发消息。', vi: 'Vui lòng nhắn tin cho tôi sau.', roman: 'Qǐng shāohòu gěi wǒ fā xiāoxi.' },
    { target: '我喜欢在公交车上听音乐。', vi: 'Tôi thích nghe nhạc trên xe buýt.', roman: 'Wǒ xǐhuan zài gōngjiāochē shang tīng yīnyuè.' },
    { target: '这个座位有人吗？', vi: 'Chỗ ngồi này có ai chưa?', roman: 'Zhège zuòwèi yǒu rén ma?' },
    { target: '我想练习说五分钟。', vi: 'Tôi muốn luyện nói năm phút.', roman: 'Wǒ xiǎng liànxí shuō wǔ fēnzhōng.' },
    { target: '你能推荐一个简单的播客吗？', vi: 'Bạn có thể gợi ý một podcast đơn giản không?', roman: 'Nǐ néng tuījiàn yí ge jiǎndān de bōkè ma?' },
    { target: '我到了以后给你打电话。', vi: 'Tôi sẽ gọi cho bạn sau khi đến.', roman: 'Wǒ dào le yǐhòu gěi nǐ dǎ diànhuà.' },
    { target: '请在地图上给我指路。', vi: 'Vui lòng chỉ đường cho tôi trên bản đồ.', roman: 'Qǐng zài dìtú shang gěi wǒ zhǐlù.' },
  ],
  ja: [
    { target: 'こんにちは。よろしくお願いします。', vi: 'Xin chào, mong được giúp đỡ / rất vui được gặp bạn.', roman: 'Konnichiwa. Yoroshiku onegaishimasu.' },
    { target: 'コーヒーと水をください。', vi: 'Cho tôi cà phê và nước.', roman: 'Koohii to mizu o kudasai.' },
    { target: '一番近い駅はどこですか。', vi: 'Nhà ga gần nhất ở đâu?', roman: 'Ichiban chikai eki wa doko desu ka.' },
    { target: 'これはいくらですか。', vi: 'Cái này giá bao nhiêu?', roman: 'Kore wa ikura desu ka.' },
    { target: 'カードで払えますか。', vi: 'Tôi có thể trả bằng thẻ không?', roman: 'Kaado de haraemasu ka.' },
    { target: '予約があります。', vi: 'Tôi có đặt chỗ.', roman: 'Yoyaku ga arimasu.' },
    { target: '今日は体調がよくありません。', vi: 'Hôm nay tôi không khỏe.', roman: 'Kyou wa taichou ga yoku arimasen.' },
    { target: 'バスは何時に出ますか。', vi: 'Xe buýt khởi hành lúc mấy giờ?', roman: 'Basu wa nanji ni demasu ka.' },
    { target: 'もう少しゆっくり話してください。', vi: 'Vui lòng nói chậm hơn một chút.', roman: 'Mou sukoshi yukkuri hanashite kudasai.' },
    { target: '毎日日本語を勉強しています。', vi: 'Tôi học tiếng Nhật mỗi ngày.', roman: 'Mainichi nihongo o benkyou shite imasu.' },
    { target: '入口で会いましょう。', vi: 'Hãy gặp nhau ở lối vào.', roman: 'Iriguchi de aimashou.' },
    { target: 'この住所を探すのを手伝ってください。', vi: 'Vui lòng giúp tôi tìm địa chỉ này.', roman: 'Kono juusho o sagasu no o tetsudatte kudasai.' },
    { target: '今日は天気がいいです。', vi: 'Hôm nay thời tiết đẹp.', roman: 'Kyou wa tenki ga ii desu.' },
    { target: 'あとでメッセージを送ってください。', vi: 'Lát nữa hãy gửi tin nhắn cho tôi.', roman: 'Ato de messeeji o okutte kudasai.' },
    { target: 'バスで音楽を聞くのが好きです。', vi: 'Tôi thích nghe nhạc trên xe buýt.', roman: 'Basu de ongaku o kiku no ga suki desu.' },
    { target: 'この席は空いていますか。', vi: 'Ghế này còn trống không?', roman: 'Kono seki wa aite imasu ka.' },
    { target: '五分間、話す練習をしたいです。', vi: 'Tôi muốn luyện nói trong năm phút.', roman: 'Go-funkan, hanasu renshuu o shitai desu.' },
    { target: '簡単なポッドキャストをおすすめできますか。', vi: 'Bạn có thể gợi ý podcast đơn giản không?', roman: 'Kantan na poddokyasuto o osusume dekimasu ka.' },
    { target: '着いたら電話します。', vi: 'Khi đến nơi tôi sẽ gọi.', roman: 'Tsuitara denwa shimasu.' },
    { target: '地図で道を教えてください。', vi: 'Vui lòng chỉ đường trên bản đồ.', roman: 'Chizu de michi o oshiete kudasai.' },
  ],
  ko: [
    { target: '안녕하세요. 만나서 반갑습니다.', vi: 'Xin chào, rất vui được gặp bạn.', roman: 'Annyeonghaseyo. Mannaseo bangapseumnida.' },
    { target: '커피와 물을 주세요.', vi: 'Cho tôi cà phê và nước.', roman: 'Keopi-wa mul-eul juseyo.' },
    { target: '가장 가까운 역이 어디예요?', vi: 'Nhà ga gần nhất ở đâu?', roman: 'Gajang gakkaun yeogi eodiyeyo?' },
    { target: '이거 얼마예요?', vi: 'Cái này giá bao nhiêu?', roman: 'Igeo eolmayeyo?' },
    { target: '카드로 결제할 수 있어요?', vi: 'Tôi có thể thanh toán bằng thẻ không?', roman: 'Kadeuro gyeoljehal su isseoyo?' },
    { target: '제 이름으로 예약했어요.', vi: 'Tôi đã đặt chỗ bằng tên của mình.', roman: 'Je ireumeuro yeyakhaesseoyo.' },
    { target: '오늘 몸이 안 좋아요.', vi: 'Hôm nay tôi không khỏe.', roman: 'Oneul mom-i an joayo.' },
    { target: '버스가 몇 시에 출발해요?', vi: 'Xe buýt khởi hành lúc mấy giờ?', roman: 'Beoseuga myeot sie chulbalhaeyo?' },
    { target: '조금 천천히 말해 주세요.', vi: 'Vui lòng nói chậm hơn một chút.', roman: 'Jogeum cheoncheonhi malhae juseyo.' },
    { target: '매일 한국어를 공부해요.', vi: 'Tôi học tiếng Hàn mỗi ngày.', roman: 'Maeil hangugeo-reul gongbuhaeyo.' },
    { target: '입구에서 만나요.', vi: 'Hãy gặp nhau ở lối vào.', roman: 'Ipgueseo mannayo.' },
    { target: '이 주소를 찾는 것을 도와주세요.', vi: 'Vui lòng giúp tôi tìm địa chỉ này.', roman: 'I jusoreul chatneun geoseul dowajuseyo.' },
    { target: '오늘 날씨가 좋아요.', vi: 'Hôm nay thời tiết đẹp.', roman: 'Oneul nalssiga joayo.' },
    { target: '나중에 메시지를 보내 주세요.', vi: 'Lát nữa hãy nhắn tin cho tôi.', roman: 'Najunge mesijireul bonae juseyo.' },
    { target: '버스에서 음악 듣는 것을 좋아해요.', vi: 'Tôi thích nghe nhạc trên xe buýt.', roman: 'Beoseueseo eumak deunneun geoseul joahaeyo.' },
    { target: '이 자리 비었어요?', vi: 'Chỗ này còn trống không?', roman: 'I jari bieosseoyo?' },
    { target: '오 분 동안 말하기 연습을 하고 싶어요.', vi: 'Tôi muốn luyện nói năm phút.', roman: 'O bun dongan malhagi yeonseubeul hago sipeoyo.' },
    { target: '쉬운 팟캐스트를 추천해 줄 수 있어요?', vi: 'Bạn có thể gợi ý một podcast dễ không?', roman: 'Swiun patkaeseuteureul chucheonhae jul su isseoyo?' },
    { target: '도착하면 전화할게요.', vi: 'Khi đến nơi tôi sẽ gọi.', roman: 'Dochakamyeon jeonhwahalgeyo.' },
    { target: '지도에서 길을 알려 주세요.', vi: 'Vui lòng chỉ đường trên bản đồ.', roman: 'Jidoeseo gireul allyeo juseyo.' },
  ],
  es: [
    { target: 'Hola, mucho gusto.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { target: 'Quiero un café y agua.', vi: 'Tôi muốn cà phê và nước.' },
    { target: '¿Dónde está la estación más cercana?', vi: 'Nhà ga gần nhất ở đâu?' },
    { target: '¿Cuánto cuesta esto?', vi: 'Cái này giá bao nhiêu?' },
    { target: '¿Puedo pagar con tarjeta?', vi: 'Tôi có thể trả bằng thẻ không?' },
    { target: 'Tengo una reserva a mi nombre.', vi: 'Tôi có đặt chỗ dưới tên mình.' },
    { target: 'Hoy no me siento bien.', vi: 'Hôm nay tôi không khỏe.' },
    { target: '¿A qué hora sale el autobús?', vi: 'Xe buýt khởi hành lúc mấy giờ?' },
    { target: '¿Puede hablar más despacio, por favor?', vi: 'Bạn có thể nói chậm hơn không?' },
    { target: 'Aprendo español todos los días.', vi: 'Tôi học tiếng Tây Ban Nha mỗi ngày.' },
    { target: 'Nos vemos en la entrada.', vi: 'Hẹn gặp ở lối vào.' },
    { target: 'Necesito ayuda para encontrar esta dirección.', vi: 'Tôi cần giúp tìm địa chỉ này.' },
    { target: 'Hoy hace buen tiempo.', vi: 'Hôm nay thời tiết đẹp.' },
    { target: 'Envíame un mensaje más tarde.', vi: 'Lát nữa hãy nhắn tin cho tôi.' },
    { target: 'Me gusta escuchar música en el autobús.', vi: 'Tôi thích nghe nhạc trên xe buýt.' },
    { target: '¿Este asiento está libre?', vi: 'Chỗ này còn trống không?' },
    { target: 'Quiero practicar hablar cinco minutos.', vi: 'Tôi muốn luyện nói năm phút.' },
    { target: '¿Puedes recomendar un podcast sencillo?', vi: 'Bạn có thể gợi ý podcast đơn giản không?' },
    { target: 'Te llamaré cuando llegue.', vi: 'Tôi sẽ gọi bạn khi đến.' },
    { target: 'Muéstrame el camino en el mapa, por favor.', vi: 'Vui lòng chỉ đường trên bản đồ.' },
  ],
  it: [
    { target: 'Ciao, piacere di conoscerti.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { target: 'Vorrei un caffè e dell’acqua.', vi: 'Tôi muốn cà phê và nước.' },
    { target: 'Dov’è la stazione più vicina?', vi: 'Nhà ga gần nhất ở đâu?' },
    { target: 'Quanto costa questo?', vi: 'Cái này giá bao nhiêu?' },
    { target: 'Posso pagare con carta?', vi: 'Tôi có thể trả bằng thẻ không?' },
    { target: 'Ho una prenotazione a mio nome.', vi: 'Tôi có đặt chỗ dưới tên mình.' },
    { target: 'Oggi non mi sento bene.', vi: 'Hôm nay tôi không khỏe.' },
    { target: 'A che ora parte l’autobus?', vi: 'Xe buýt khởi hành lúc mấy giờ?' },
    { target: 'Può parlare più lentamente?', vi: 'Bạn có thể nói chậm hơn không?' },
    { target: 'Studio italiano ogni giorno.', vi: 'Tôi học tiếng Ý mỗi ngày.' },
    { target: 'Ci vediamo all’ingresso.', vi: 'Hẹn gặp ở lối vào.' },
    { target: 'Ho bisogno di aiuto per trovare questo indirizzo.', vi: 'Tôi cần giúp tìm địa chỉ này.' },
    { target: 'Oggi il tempo è bello.', vi: 'Hôm nay thời tiết đẹp.' },
    { target: 'Mandami un messaggio più tardi.', vi: 'Lát nữa hãy nhắn tin cho tôi.' },
    { target: 'Mi piace ascoltare musica sull’autobus.', vi: 'Tôi thích nghe nhạc trên xe buýt.' },
    { target: 'Questo posto è libero?', vi: 'Chỗ này còn trống không?' },
    { target: 'Voglio praticare il parlato per cinque minuti.', vi: 'Tôi muốn luyện nói năm phút.' },
    { target: 'Puoi consigliare un podcast semplice?', vi: 'Bạn có thể gợi ý podcast đơn giản không?' },
    { target: 'Ti chiamo quando arrivo.', vi: 'Tôi sẽ gọi bạn khi đến.' },
    { target: 'Mi mostri la strada sulla mappa, per favore.', vi: 'Vui lòng chỉ đường trên bản đồ.' },
  ],
  pt: [
    { target: 'Olá, prazer em conhecer você.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { target: 'Eu quero um café e água.', vi: 'Tôi muốn cà phê và nước.' },
    { target: 'Onde fica a estação mais próxima?', vi: 'Nhà ga gần nhất ở đâu?' },
    { target: 'Quanto custa isto?', vi: 'Cái này giá bao nhiêu?' },
    { target: 'Posso pagar com cartão?', vi: 'Tôi có thể trả bằng thẻ không?' },
    { target: 'Tenho uma reserva em meu nome.', vi: 'Tôi có đặt chỗ dưới tên mình.' },
    { target: 'Hoje não me sinto bem.', vi: 'Hôm nay tôi không khỏe.' },
    { target: 'A que horas sai o ônibus?', vi: 'Xe buýt khởi hành lúc mấy giờ?' },
    { target: 'Pode falar mais devagar, por favor?', vi: 'Bạn có thể nói chậm hơn không?' },
    { target: 'Eu estudo português todos os dias.', vi: 'Tôi học tiếng Bồ Đào Nha mỗi ngày.' },
    { target: 'Vamos nos encontrar na entrada.', vi: 'Hãy gặp nhau ở lối vào.' },
    { target: 'Preciso de ajuda para encontrar este endereço.', vi: 'Tôi cần giúp tìm địa chỉ này.' },
    { target: 'O tempo está bonito hoje.', vi: 'Hôm nay thời tiết đẹp.' },
    { target: 'Envie-me uma mensagem mais tarde.', vi: 'Lát nữa hãy nhắn tin cho tôi.' },
    { target: 'Gosto de ouvir música no ônibus.', vi: 'Tôi thích nghe nhạc trên xe buýt.' },
    { target: 'Este lugar está livre?', vi: 'Chỗ này còn trống không?' },
    { target: 'Quero praticar fala por cinco minutos.', vi: 'Tôi muốn luyện nói năm phút.' },
    { target: 'Você pode recomendar um podcast simples?', vi: 'Bạn có thể gợi ý podcast đơn giản không?' },
    { target: 'Vou ligar quando eu chegar.', vi: 'Tôi sẽ gọi khi đến nơi.' },
    { target: 'Mostre-me o caminho no mapa, por favor.', vi: 'Vui lòng chỉ đường trên bản đồ.' },
  ],
  ru: [
    { target: 'Здравствуйте, приятно познакомиться.', vi: 'Xin chào, rất vui được gặp bạn.', roman: 'Zdravstvuyte, priyatno poznakomitsya.' },
    { target: 'Я хочу кофе и воду.', vi: 'Tôi muốn cà phê và nước.', roman: 'Ya khochu kofe i vodu.' },
    { target: 'Где ближайшая станция?', vi: 'Nhà ga gần nhất ở đâu?', roman: 'Gde blizhayshaya stantsiya?' },
    { target: 'Сколько это стоит?', vi: 'Cái này giá bao nhiêu?', roman: 'Skolko eto stoit?' },
    { target: 'Можно оплатить картой?', vi: 'Tôi có thể trả bằng thẻ không?', roman: 'Mozhno oplatit kartoy?' },
    { target: 'У меня есть бронь на моё имя.', vi: 'Tôi có đặt chỗ dưới tên mình.', roman: 'U menya est bron na moyo imya.' },
    { target: 'Сегодня я плохо себя чувствую.', vi: 'Hôm nay tôi không khỏe.', roman: 'Segodnya ya plokho sebya chuvstvuyu.' },
    { target: 'Во сколько отправляется автобус?', vi: 'Xe buýt khởi hành lúc mấy giờ?', roman: 'Vo skolko otpravlyaetsya avtobus?' },
    { target: 'Пожалуйста, говорите медленнее.', vi: 'Vui lòng nói chậm hơn.', roman: 'Pozhaluysta, govorite medlenneye.' },
    { target: 'Я каждый день учу русский язык.', vi: 'Tôi học tiếng Nga mỗi ngày.', roman: 'Ya kazhdyy den uchu russkiy yazyk.' },
    { target: 'Давайте встретимся у входа.', vi: 'Hãy gặp nhau ở lối vào.', roman: 'Davayte vstretimsya u vkhoda.' },
    { target: 'Мне нужна помощь с этим адресом.', vi: 'Tôi cần giúp với địa chỉ này.', roman: 'Mne nuzhna pomoshch s etim adresom.' },
    { target: 'Сегодня хорошая погода.', vi: 'Hôm nay thời tiết đẹp.', roman: 'Segodnya khoroshaya pogoda.' },
    { target: 'Напишите мне позже.', vi: 'Lát nữa hãy nhắn tin cho tôi.', roman: 'Napishite mne pozzhe.' },
    { target: 'Мне нравится слушать музыку в автобусе.', vi: 'Tôi thích nghe nhạc trên xe buýt.', roman: 'Mne nravitsya slushat muzyku v avtobuse.' },
    { target: 'Это место свободно?', vi: 'Chỗ này còn trống không?', roman: 'Eto mesto svobodno?' },
    { target: 'Я хочу практиковать речь пять минут.', vi: 'Tôi muốn luyện nói năm phút.', roman: 'Ya khochu praktikat rech pyat minut.' },
    { target: 'Можете посоветовать простой подкаст?', vi: 'Bạn có thể gợi ý podcast đơn giản không?', roman: 'Mozhete posovetovat prostoy podkast?' },
    { target: 'Я позвоню, когда приеду.', vi: 'Tôi sẽ gọi khi đến nơi.', roman: 'Ya pozvonyu, kogda priyedu.' },
    { target: 'Покажите мне дорогу на карте.', vi: 'Vui lòng chỉ đường trên bản đồ.', roman: 'Pokazhite mne dorogu na karte.' },
  ],
  vi: [
    { target: 'Xin chào, rất vui được gặp bạn.', vi: 'Xin chào, rất vui được gặp bạn.' },
    { target: 'Tôi muốn một ly cà phê và một chai nước.', vi: 'Tôi muốn một ly cà phê và một chai nước.' },
    { target: 'Nhà ga gần nhất ở đâu?', vi: 'Nhà ga gần nhất ở đâu?' },
    { target: 'Cái này giá bao nhiêu?', vi: 'Cái này giá bao nhiêu?' },
    { target: 'Tôi có thể thanh toán bằng thẻ không?', vi: 'Tôi có thể thanh toán bằng thẻ không?' },
    { target: 'Tôi có đặt phòng dưới tên của mình.', vi: 'Tôi có đặt phòng dưới tên của mình.' },
    { target: 'Hôm nay tôi thấy không khỏe.', vi: 'Hôm nay tôi thấy không khỏe.' },
    { target: 'Xe buýt khởi hành lúc mấy giờ?', vi: 'Xe buýt khởi hành lúc mấy giờ?' },
    { target: 'Bạn có thể nói chậm hơn được không?', vi: 'Bạn có thể nói chậm hơn được không?' },
    { target: 'Tôi luyện tiếng Việt mỗi ngày.', vi: 'Tôi luyện tiếng Việt mỗi ngày.' },
    { target: 'Chúng ta gặp nhau ở lối vào nhé.', vi: 'Chúng ta gặp nhau ở lối vào nhé.' },
    { target: 'Tôi cần giúp tìm địa chỉ này.', vi: 'Tôi cần giúp tìm địa chỉ này.' },
    { target: 'Hôm nay thời tiết rất đẹp.', vi: 'Hôm nay thời tiết rất đẹp.' },
    { target: 'Lát nữa bạn nhắn tin cho tôi nhé.', vi: 'Lát nữa bạn nhắn tin cho tôi nhé.' },
    { target: 'Tôi thích nghe nhạc trên xe buýt.', vi: 'Tôi thích nghe nhạc trên xe buýt.' },
    { target: 'Chỗ ngồi này còn trống không?', vi: 'Chỗ ngồi này còn trống không?' },
    { target: 'Tôi muốn luyện nói trong năm phút.', vi: 'Tôi muốn luyện nói trong năm phút.' },
    { target: 'Bạn có thể gợi ý một podcast đơn giản không?', vi: 'Bạn có thể gợi ý một podcast đơn giản không?' },
    { target: 'Khi đến nơi tôi sẽ gọi cho bạn.', vi: 'Khi đến nơi tôi sẽ gọi cho bạn.' },
    { target: 'Vui lòng chỉ đường cho tôi trên bản đồ.', vi: 'Vui lòng chỉ đường cho tôi trên bản đồ.' },
  ],
  th: [
    { target: 'สวัสดี ยินดีที่ได้รู้จัก', vi: 'Xin chào, rất vui được gặp bạn.', roman: 'Sawatdi, yindi thi dai ruchak.' },
    { target: 'ฉันต้องการกาแฟและน้ำ', vi: 'Tôi muốn cà phê và nước.', roman: 'Chan tongkan kafae lae nam.' },
    { target: 'สถานีที่ใกล้ที่สุดอยู่ที่ไหน', vi: 'Nhà ga gần nhất ở đâu?', roman: 'Sathani thi klai thisut yu thi nai?' },
    { target: 'อันนี้ราคาเท่าไร', vi: 'Cái này giá bao nhiêu?', roman: 'An ni rakha thao rai?' },
    { target: 'จ่ายด้วยบัตรได้ไหม', vi: 'Tôi có thể trả bằng thẻ không?', roman: 'Chai duai bat dai mai?' },
    { target: 'ฉันมีการจองในชื่อของฉัน', vi: 'Tôi có đặt chỗ dưới tên mình.', roman: 'Chan mi kan chong nai chue khong chan.' },
    { target: 'วันนี้ฉันรู้สึกไม่ค่อยสบาย', vi: 'Hôm nay tôi không khỏe lắm.', roman: 'Wan ni chan rusuek mai khoi sabai.' },
    { target: 'รถบัสออกกี่โมง', vi: 'Xe buýt khởi hành lúc mấy giờ?', roman: 'Rot bat ok ki mong?' },
    { target: 'กรุณาพูดช้าลงหน่อย', vi: 'Vui lòng nói chậm hơn.', roman: 'Karuna phut cha long noi.' },
    { target: 'ฉันเรียนภาษาไทยทุกวัน', vi: 'Tôi học tiếng Thái mỗi ngày.', roman: 'Chan rian phasa Thai thuk wan.' },
    { target: 'เจอกันที่ทางเข้า', vi: 'Hẹn gặp ở lối vào.', roman: 'Joe kan thi thang khao.' },
    { target: 'ช่วยฉันหาที่อยู่นี้หน่อย', vi: 'Vui lòng giúp tôi tìm địa chỉ này.', roman: 'Chuai chan ha thi yu ni noi.' },
    { target: 'วันนี้อากาศดีมาก', vi: 'Hôm nay thời tiết rất đẹp.', roman: 'Wan ni akat di mak.' },
    { target: 'ส่งข้อความหาฉันทีหลังนะ', vi: 'Lát nữa hãy nhắn tin cho tôi.', roman: 'Song khokhwam ha chan thi lang na.' },
    { target: 'ฉันชอบฟังเพลงบนรถบัส', vi: 'Tôi thích nghe nhạc trên xe buýt.', roman: 'Chan chop fang phleng bon rot bat.' },
    { target: 'ที่นั่งนี้ว่างไหม', vi: 'Chỗ ngồi này còn trống không?', roman: 'Thi nang ni wang mai?' },
    { target: 'ฉันอยากฝึกพูดห้านาที', vi: 'Tôi muốn luyện nói năm phút.', roman: 'Chan yak fuek phut ha nathi.' },
    { target: 'แนะนำพอดแคสต์ง่าย ๆ ได้ไหม', vi: 'Bạn có thể gợi ý podcast đơn giản không?', roman: 'Naenam podcast ngai ngai dai mai?' },
    { target: 'เมื่อฉันถึงแล้วจะโทรหา', vi: 'Khi đến nơi tôi sẽ gọi.', roman: 'Muea chan thueng laeo cha thonha.' },
    { target: 'ช่วยบอกทางบนแผนที่ให้หน่อย', vi: 'Vui lòng chỉ đường trên bản đồ.', roman: 'Chuai bok thang bon phaenthi hai noi.' },
  ],
  ar: [
    { target: 'مرحبا، سعيد بلقائك.', vi: 'Xin chào, rất vui được gặp bạn.', roman: 'Marhaban, saeed biliqaik.' },
    { target: 'أريد قهوة وماء.', vi: 'Tôi muốn cà phê và nước.', roman: 'Uridu qahwa wa maa.' },
    { target: 'أين أقرب محطة؟', vi: 'Nhà ga gần nhất ở đâu?', roman: 'Ayna aqrab mahattah?' },
    { target: 'كم سعر هذا؟', vi: 'Cái này giá bao nhiêu?', roman: 'Kam siir hatha?' },
    { target: 'هل يمكنني الدفع بالبطاقة؟', vi: 'Tôi có thể trả bằng thẻ không?', roman: 'Hal yumkinuni ad-daf bilbitaqa?' },
    { target: 'لدي حجز باسمي.', vi: 'Tôi có đặt chỗ dưới tên mình.', roman: 'Ladayya hajz bismi.' },
    { target: 'لا أشعر أنني بخير اليوم.', vi: 'Hôm nay tôi thấy không khỏe.', roman: 'La ashur annani bikhayr alyawm.' },
    { target: 'متى يغادر الحافلة؟', vi: 'Xe buýt khởi hành lúc mấy giờ?', roman: 'Mata yughadir alhafila?' },
    { target: 'من فضلك تكلم ببطء أكثر.', vi: 'Vui lòng nói chậm hơn.', roman: 'Min fadlik takallam bibut akthar.' },
    { target: 'أتعلم العربية كل يوم.', vi: 'Tôi học tiếng Ả Rập mỗi ngày.', roman: 'Ataallam al-arabiyya kulla yawm.' },
    { target: 'لنلتق عند المدخل.', vi: 'Hãy gặp nhau ở lối vào.', roman: 'Linaltaqi inda al-madkhal.' },
    { target: 'أحتاج مساعدة في العثور على هذا العنوان.', vi: 'Tôi cần giúp tìm địa chỉ này.', roman: 'Ahtaj musaada fi al-uthur ala hatha al-unwan.' },
    { target: 'الطقس جميل اليوم.', vi: 'Hôm nay thời tiết đẹp.', roman: 'Al-taqs jamil alyawm.' },
    { target: 'أرسل لي رسالة لاحقا.', vi: 'Lát nữa hãy nhắn tin cho tôi.', roman: 'Arsil li risala lahiqan.' },
    { target: 'أحب الاستماع إلى الموسيقى في الحافلة.', vi: 'Tôi thích nghe nhạc trên xe buýt.', roman: 'Uhibb al-istima ila al-musiqa fi al-hafila.' },
    { target: 'هل هذا المقعد متاح؟', vi: 'Chỗ này còn trống không?', roman: 'Hal hatha al-maqad mutah?' },
    { target: 'أريد ممارسة التحدث خمس دقائق.', vi: 'Tôi muốn luyện nói năm phút.', roman: 'Urid mumarasat al-tahadduth khams daqaiq.' },
    { target: 'هل يمكنك اقتراح بودكاست بسيط؟', vi: 'Bạn có thể gợi ý podcast đơn giản không?', roman: 'Hal yumkinuk iqtirah podcast basit?' },
    { target: 'سأتصل بك عندما أصل.', vi: 'Tôi sẽ gọi bạn khi đến nơi.', roman: 'Saatasil bika indama asil.' },
    { target: 'من فضلك أرني الطريق على الخريطة.', vi: 'Vui lòng chỉ đường trên bản đồ.', roman: 'Min fadlik arini al-tariq ala al-kharita.' },
  ],
};

function getBank(lang: string) {
  return phraseBank[normalizeLanguage(lang)] || phraseBank.en;
}

export function getLanguageSample(lang: string) {
  const bank = getBank(lang);
  const first = bank[0] || phraseBank.en[0];
  const coffee = bank[1] || first;
  const question = bank[2] || first;
  return { hello: first.target, thanks: first.target, coffee: coffee.target, question: question.target, shortText: `${first.target} ${coffee.target} ${question.target}`, roman: first.roman };
}

function ui(uiLang: string, vi: string, en: string) {
  return normalizeLanguage(uiLang) === 'vi' ? vi : en;
}

function getLevel(i: number) {
  return LEVELS[i % LEVELS.length];
}

function mediaResources(lang: string, situation: any, skill: string, phrase: any) {
  const meta = getLanguageMeta(lang);
  const baseQuery = `${meta.name} ${situation.en} beginner ${skill} example clear audio`;
  const phraseQuery = `${meta.name} "${phrase.target}" pronunciation example`;
  return [
    { type: 'youtube_search', label: 'YouTube example search', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(baseQuery)}` },
    { type: 'youtube_search', label: 'Phrase pronunciation search', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(phraseQuery)}` },
  ];
}

function pickDistractors(bank: any[], correct: string, i: number) {
  const pool = bank.map(p => p.target).filter(v => v && v !== correct);
  return [pool[(i + 3) % pool.length], pool[(i + 7) % pool.length], pool[(i + 11) % pool.length]].filter(Boolean);
}

function makeIntro(lang: string, i: number) {
  const bank = getBank(lang);
  const a = bank[i % bank.length];
  const b = bank[(i * 7 + 5) % bank.length];
  const c = bank[(i * 11 + Math.floor(i / bank.length) + 9) % bank.length];
  const phrases = [a, b, c].filter(Boolean);
  return {
    a,
    b,
    c,
    transcript: phrases.map((p) => p.target).join(' '),
    roman: phrases.map((p) => p.roman).filter(Boolean).join(' '),
    meaningVietnamese: phrases.map((p) => p.vi).join(' '),
  };
}

export function getTargetListeningTasks(lang: string, uiLang = 'vi') {
  const normalized = normalizeLanguage(lang);
  const meta = getLanguageMeta(normalized);
  const bank = getBank(normalized);
  return Array.from({ length: CONTENT_TARGET_COUNT }, (_, i) => {
    const situation = dailySituations[i % dailySituations.length];
    const { a, transcript, roman, meaningVietnamese } = makeIntro(normalized, i);
    const correct = a.target;
    const distractors = pickDistractors(bank, correct, i);
    return {
      id: `${normalized}_listening_daily_${String(i + 1).padStart(3, '0')}`,
      level: getLevel(i),
      title: ui(uiLang, `${situation.vi} — nghe ${i + 1}`, `${situation.en} — listening ${i + 1}`),
      topic: ui(uiLang, situation.vi, situation.en),
      durationEstimate: 25 + (i % 45),
      transcript,
      romanization: roman,
      meaningVietnamese,
      mediaResources: mediaResources(normalized, situation, 'listening', a),
      questions: [
        { id: 'q1', type: 'multiple_choice', question: ui(uiLang, 'Bạn nghe thấy câu nào đầu tiên?', 'Which sentence did you hear first?'), options: [correct, ...distractors].filter(Boolean), correctAnswer: correct, explanation: ui(uiLang, `Câu mở đầu là “${correct}” nghĩa là “${a.vi}”.`, `The first sentence is “${correct}”.`) },
        { id: 'q2', type: 'multiple_choice', question: ui(uiLang, 'Nghĩa tiếng Việt gần nhất là gì?', 'What is the closest meaning?'), options: [a.vi, bank[(i + 4) % bank.length].vi, bank[(i + 8) % bank.length].vi, bank[(i + 12) % bank.length].vi].filter(Boolean), correctAnswer: a.vi, explanation: ui(uiLang, `“${a.target}” = “${a.vi}”.`, `The meaning is “${a.vi}”.`) },
      ],
    };
  });
}

export function getTargetReadingPassages(lang: string, uiLang = 'vi') {
  const normalized = normalizeLanguage(lang);
  const meta = getLanguageMeta(normalized);
  const bank = getBank(normalized);
  return Array.from({ length: CONTENT_TARGET_COUNT }, (_, i) => {
    const situation = dailySituations[i % dailySituations.length];
    const p1 = bank[i % bank.length];
    const p2 = bank[(i + 2) % bank.length];
    const p3 = bank[(i + 6) % bank.length];
    const targetText = `${p1.target}\n${p2.target}\n${p3.target}`;
    const viMeaning = `${p1.vi} ${p2.vi} ${p3.vi}`;
    const roman = [p1.roman, p2.roman, p3.roman].filter(Boolean).join('\n');
    const content = `${targetText}${roman ? `\n\nRomanization:\n${roman}` : ''}\n\n${ui(uiLang, 'Nghĩa tiếng Việt', 'Vietnamese meaning')}: ${viMeaning}`;
    return {
      id: `${normalized}_reading_daily_${String(i + 1).padStart(3, '0')}`,
      level: getLevel(i),
      title: ui(uiLang, `${situation.vi} — đọc ${i + 1}`, `${situation.en} — reading ${i + 1}`),
      topic: ui(uiLang, situation.vi, situation.en),
      wordCount: targetText.length,
      content,
      targetText,
      meaningVietnamese: viMeaning,
      mediaResources: mediaResources(normalized, situation, 'reading', p1),
      vocabularyHighlights: [p1.target, p2.target, p3.target],
      questions: [
        { id: 'q1', type: 'multiple_choice', question: ui(uiLang, 'Ý chính của đoạn là gì?', 'What is the main idea?'), options: [ui(uiLang, situation.vi, situation.en), ui(uiLang, dailySituations[(i + 5) % dailySituations.length].vi, dailySituations[(i + 5) % dailySituations.length].en), ui(uiLang, dailySituations[(i + 9) % dailySituations.length].vi, dailySituations[(i + 9) % dailySituations.length].en), ui(uiLang, dailySituations[(i + 13) % dailySituations.length].vi, dailySituations[(i + 13) % dailySituations.length].en)], correctAnswer: ui(uiLang, situation.vi, situation.en), explanation: ui(uiLang, `Đoạn đọc luyện tình huống “${situation.vi}”.`, `This passage practices “${situation.en}”.`) },
        { id: 'q2', type: 'multiple_choice', question: ui(uiLang, 'Câu đầu có nghĩa gần nhất là gì?', 'What is the closest meaning of the first sentence?'), options: [p1.vi, p2.vi, p3.vi, bank[(i + 10) % bank.length].vi], correctAnswer: p1.vi, explanation: ui(uiLang, `“${p1.target}” = “${p1.vi}”.`, `The first sentence means “${p1.vi}”.`) },
      ],
    };
  });
}

export function getTargetSpeakingPrompts(lang: string, uiLang = 'vi') {
  const normalized = normalizeLanguage(lang);
  const meta = getLanguageMeta(normalized);
  const bank = getBank(normalized);
  return Array.from({ length: CONTENT_TARGET_COUNT }, (_, i) => {
    const situation = dailySituations[i % dailySituations.length];
    const p1 = bank[i % bank.length];
    const p2 = bank[(i + 3) % bank.length];
    const p3 = bank[(i + 6) % bank.length];
    return {
      id: `${normalized}_speaking_daily_${String(i + 1).padStart(3, '0')}`,
      level: getLevel(i),
      title: `${meta.nativeName} ${i + 1}`,
      topic: ui(uiLang, situation.vi, situation.en),
      prompt: ui(uiLang, `Nói 4–6 câu bằng ${meta.nativeName} cho tình huống “${situation.vi}”. Hãy dùng ít nhất 2 mẫu: “${p1.target}”, “${p2.target}”.`, `Say 4–6 sentences in ${meta.nativeName} for “${situation.en}”. Use at least 2 patterns: “${p1.target}”, “${p2.target}”.`),
      modelAnswer: `${p1.target} ${p2.target} ${p3.target}`,
      meaningVietnamese: `${p1.vi} ${p2.vi} ${p3.vi}`,
      romanization: [p1.roman, p2.roman, p3.roman].filter(Boolean).join(' '),
      timeLimit: 45 + (i % 5) * 15,
      expectedDurationSeconds: 35 + (i % 4) * 15,
      bulletPoints: [
        ui(uiLang, `Mở đầu bằng một câu phù hợp: ${p1.target}`, `Open with a useful sentence: ${p1.target}`),
        ui(uiLang, `Thêm một chi tiết đời sống: ${situation.vi.toLowerCase()}`, `Add one daily-life detail: ${situation.en}`),
        ui(uiLang, 'Ghi âm lại và nghe lại để sửa phát âm.', 'Record yourself and replay to improve pronunciation.'),
      ],
      tags: [situation.tag, getLevel(i).toLowerCase(), 'daily-life'],
      mediaResources: mediaResources(normalized, situation, 'speaking pronunciation', p1),
    };
  });
}

export function getTargetWritingPrompts(lang: string, uiLang = 'vi') {
  const normalized = normalizeLanguage(lang);
  const meta = getLanguageMeta(normalized);
  const bank = getBank(normalized);
  return Array.from({ length: CONTENT_TARGET_COUNT }, (_, i) => {
    const situation = dailySituations[i % dailySituations.length];
    const p1 = bank[i % bank.length];
    const p2 = bank[(i + 4) % bank.length];
    const minWords = getLevel(i).startsWith('A') ? 20 : getLevel(i).startsWith('B') ? 45 : 80;
    return {
      id: `${normalized}_writing_daily_${String(i + 1).padStart(3, '0')}`,
      level: getLevel(i),
      topic: ui(uiLang, situation.vi, situation.en),
      prompt: ui(uiLang, `Viết một đoạn ngắn bằng ${meta.nativeName} về “${situation.vi}”. Hãy dùng: “${p1.target}” và “${p2.target}”.`, `Write a short paragraph in ${meta.nativeName} about “${situation.en}”. Use: “${p1.target}” and “${p2.target}”.`),
      instructions: ui(uiLang, `Mục tiêu: áp dụng vào cuộc sống thật. Gợi ý nghĩa: ${p1.vi}; ${p2.vi}.`, `Goal: apply this to real life. Suggested meanings: ${p1.vi}; ${p2.vi}.`),
      modelAnswer: `${p1.target} ${p2.target}`,
      meaningVietnamese: `${p1.vi} ${p2.vi}`,
      minWords,
      tags: [situation.tag, getLevel(i).toLowerCase(), 'daily-life'],
      mediaResources: mediaResources(normalized, situation, 'writing example', p1),
    };
  });
}

export function getSkillContentSummary(lang: string, uiLang = 'vi') {
  return {
    listening: getTargetListeningTasks(lang, uiLang).length,
    speaking: getTargetSpeakingPrompts(lang, uiLang).length,
    reading: getTargetReadingPassages(lang, uiLang).length,
    writing: getTargetWritingPrompts(lang, uiLang).length,
  };
}
