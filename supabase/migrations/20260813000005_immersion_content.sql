-- 20260813000005_immersion_content.sql
-- Create robust tables for dynamic immersion content

CREATE TABLE public.immersion_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    language VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    title_translation TEXT,
    author TEXT NOT NULL,
    publication TEXT NOT NULL,
    cefr_mapping VARCHAR(10) NOT NULL,
    word_count INTEGER NOT NULL,
    content JSONB NOT NULL,
    target_collocations JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.immersion_podcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    language VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    title_translation TEXT,
    host TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    cefr_mapping VARCHAR(10) NOT NULL,
    duration_sec FLOAT NOT NULL,
    transcript JSONB NOT NULL,
    target_collocations JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.immersion_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immersion_podcasts ENABLE ROW LEVEL SECURITY;

-- Anyone can read public content
CREATE POLICY "Public articles are readable by everyone." 
ON public.immersion_articles FOR SELECT USING (true);

CREATE POLICY "Public podcasts are readable by everyone." 
ON public.immersion_podcasts FOR SELECT USING (true);

-- Seed Data (Migrating from GlobalContentRegistry)
INSERT INTO public.immersion_articles 
(slug, language, title, title_translation, author, publication, cefr_mapping, word_count, content, target_collocations)
VALUES
(
    'en-article-econ-1',
    'en',
    'The Algorithmic Market: Redefining Value in the 21st Century',
    'Thị trường thuật toán: Tái định nghĩa giá trị trong thế kỷ 21',
    'Jonathan Sterling',
    'The Economist Paradigm (Simulation)',
    'C1',
    1540,
    '[
        {
          "paragraphId": "p1",
          "text": "In the nascent stages of algorithmic trading, the sheer velocity of transactions superseded substantive economic fundamentals. Today, however, we witness a paradigm shift where predictive models are not merely reacting to market fluctuations, but actively orchestrating them.",
          "translation": "Trong những giai đoạn phôi thai của giao dịch thuật toán, tốc độ tuyệt đối của các giao dịch đã vượt lên trên các nguyên tắc kinh tế cơ bản cốt lõi. Tuy nhiên, ngày nay, chúng ta chứng kiến một sự chuyển dịch mô hình nơi các mô hình dự đoán không chỉ phản ứng với những biến động của thị trường, mà còn chủ động điều phối chúng.",
          "grammaticalHighlights": [
            {
              "text": "where predictive models are not merely reacting... but actively orchestrating",
              "explanation": "Sử dụng cấu trúc \"not merely... but (also)\" để nhấn mạnh mức độ tiến hóa của sự việc.",
              "type": "complex_clause"
            }
          ]
        },
        {
          "paragraphId": "p2",
          "text": "Had regulatory frameworks been implemented earlier, the catastrophic flash crash of the prior decade might have been averted. The systemic fragility inherent in unbridled algorithmic autonomy remains a pressing concern for macroeconomic stability.",
          "translation": "Nếu các khung pháp lý được thực thi sớm hơn, thảm họa sụp đổ chớp nhoáng của thập kỷ trước có lẽ đã có thể được ngăn chặn. Sự mong manh mang tính hệ thống cố hữu trong sự tự chủ thuật toán không bị kiềm chế vẫn là một mối quan ngại cấp bách đối với sự ổn định kinh tế vĩ mô.",
          "grammaticalHighlights": [
            {
              "text": "Had regulatory frameworks been implemented earlier",
              "explanation": "Đảo ngữ câu điều kiện loại 3 (Third Conditional Inversion) mang tính học thuật cao. Tương đương: \"If regulatory frameworks had been implemented earlier\".",
              "type": "conditional"
            }
          ]
        }
      ]'::jsonb,
    '[
        {
          "id": "col-1",
          "phrase": "paradigm shift",
          "translation": "sự chuyển dịch mô hình",
          "cefr": "C1",
          "type": "collocation",
          "occurrences": ["Today, however, we witness a paradigm shift where predictive models..."]
        },
        {
          "id": "col-2",
          "phrase": "systemic fragility",
          "translation": "sự mong manh mang tính hệ thống",
          "cefr": "C2",
          "type": "collocation",
          "occurrences": ["The systemic fragility inherent in unbridled algorithmic autonomy..."]
        }
      ]'::jsonb
),
(
    'fr-article-phil-1',
    'fr',
    'L''Existentialisme à l''Ère Numérique',
    'Chủ nghĩa hiện sinh trong Kỷ nguyên Số',
    'Dr. Camille Dubois',
    'Revue de Philosophie Contemporaine (Simulation)',
    'C1',
    1200,
    '[
        {
          "paragraphId": "p1",
          "text": "Bien que l''hyperconnectivité ait aboli les frontières géographiques, elle a paradoxalement exacerbé le sentiment d''isolement ontologique. Il est impératif que nous redéfinissions l''authenticité sartrienne face aux algorithmes de recommandation.",
          "translation": "Mặc dù sự siêu kết nối đã xóa bỏ các ranh giới địa lý, nó lại nghịch lý làm trầm trọng thêm cảm giác cô lập về mặt bản thể luận. Việc chúng ta tái định nghĩa tính xác thực theo kiểu Sartre khi đối mặt với các thuật toán đề xuất là điều cấp bách.",
          "grammaticalHighlights": [
            {
              "text": "Bien que l''hyperconnectivité ait aboli",
              "explanation": "Sử dụng Subjonctif passé sau \"Bien que\" để diễn tả một hành động đã hoàn thành mang tính nhượng bộ.",
              "type": "subjunctive"
            },
            {
              "text": "Il est impératif que nous redéfinissions",
              "explanation": "Subjonctif présent bắt buộc sau cụm \"Il est impératif que\".",
              "type": "subjunctive"
            }
          ]
        }
      ]'::jsonb,
    '[
        {
          "id": "col-3",
          "phrase": "isolement ontologique",
          "translation": "sự cô lập về bản thể luận",
          "cefr": "C2",
          "type": "academic_word",
          "occurrences": ["elle a paradoxalement exacerbé le sentiment d''isolement ontologique."]
        }
      ]'::jsonb
);

INSERT INTO public.immersion_podcasts 
(slug, language, title, title_translation, host, audio_url, cefr_mapping, duration_sec, transcript, target_collocations)
VALUES
(
    'en-pod-lex-1',
    'en',
    'AGI, Consciousness, and the Future of Work',
    'Trí tuệ Nhân tạo Tổng quát, Ý thức và Tương lai của Công việc',
    'Tech Intellectuals Podcast',
    '/audio/mock_podcast_agi.mp3',
    'C1',
    15,
    '[
        {
          "id": "t1",
          "startTimeSec": 0,
          "endTimeSec": 5.5,
          "speaker": "Host",
          "text": "So when we contemplate the trajectory of AGI, we have to grapple with the alignment problem.",
          "translation": "Vì vậy, khi chúng ta chiêm nghiệm về quỹ đạo của AGI, chúng ta phải vật lộn với bài toán căn chỉnh.",
          "phoneticGaps": [
            { "word": "contemplate", "ipa": "/ˈkɒntəmpleɪt/" },
            { "word": "grapple", "ipa": "/ˈɡræpl/" }
          ]
        },
        {
          "id": "t2",
          "startTimeSec": 6.0,
          "endTimeSec": 12.0,
          "speaker": "Guest",
          "text": "Precisely. If we blindly optimize for efficiency, we risk inadvertently sidelining human values. It''s a precarious balancing act.",
          "translation": "Chính xác. Nếu chúng ta tối ưu hóa cho sự hiệu quả một cách mù quáng, chúng ta có nguy cơ vô tình gạt bỏ các giá trị của con người. Đó là một hành động cân bằng đầy rủi ro."
        }
      ]'::jsonb,
    '[
        {
          "id": "col-pod-1",
          "phrase": "grapple with",
          "translation": "vật lộn với (một vấn đề khó)",
          "cefr": "B2",
          "type": "phrasal_verb",
          "occurrences": ["we have to grapple with the alignment problem."]
        },
        {
          "id": "col-pod-2",
          "phrase": "precarious balancing act",
          "translation": "hành động cân bằng đầy rủi ro",
          "cefr": "C1",
          "type": "idiom",
          "occurrences": ["It''s a precarious balancing act."]
        }
      ]'::jsonb
);
