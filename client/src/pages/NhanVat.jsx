import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CharacterCollection from '../components/CharacterCollection';

// ═══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU NHÂN VẬT — tách biệt hoàn toàn với phần UI
// ═══════════════════════════════════════════════════════════════════════════════

export const CHARACTERS_DATA = [
  // ── CỰU ƯỚC ────────────────────────────────────────────────────────────────
  {
    id: 'abraham',
    era: 'ot',
    stage: 'Giai đoạn Tổ phụ',
    name: 'Abraham',
    nameHebrew: 'אַבְרָהָם',
    nameMeaning: '"Cha của nhiều dân tộc"',
    nameMeaningNote: 'Tên gốc là Abram (cha được tôn trọng). Thiên Chúa đổi thành Abraham sau Giao ước cắt bì (St 17,5) — báo hiệu sứ mệnh mới.',
    period: '~2000–1900 TCN',
    emoji: '⛺',
    accent: '#CD853F',
    glowColor: '#CD853F40',
    heroGrad: 'linear-gradient(160deg, #3d2008 0%, #1e1005 60%, #0f0804 100%)',
    tagline: 'Cha của đức tin',
    imageKeywords: 'Cụ già râu bạc ngước nhìn bầu trời đầy sao sa mạc đêm, lều trại, ánh lửa vàng',
    bibleRefs: [
      { label: 'Thiên Chúa gọi Abraham', short: 'St 12,1–9' },
      { label: 'Lập Giao ước', short: 'St 15 & 17' },
      { label: 'Dâng Isaac', short: 'St 22' },
      { label: 'Trong GLCG', short: 'GLCG 59–64' },
    ],
    keyEvents: [
      { title: 'Tiếng gọi từ Ur', body: 'Thiên Chúa gọi Abraham rời bỏ quê hương Ur (Lưỡng Hà), họ hàng và nhà cha để đi đến đất Ngài sẽ chỉ. Abraham đã ra đi, tuy không biết mình đến đâu (Hr 11,8).', ref: 'St 12,1–4' },
      { title: 'Giao ước & Lời hứa', body: 'Thiên Chúa hứa: dòng dõi Abraham sẽ đông như sao trời và như cát biển, mọi dân tộc sẽ được chúc phúc qua ông. Dấu hiệu Giao ước là phép cắt bì.', ref: 'St 15 & 17' },
      { title: 'Thử thách Isaac', body: 'Thiên Chúa thử thách Abraham: dâng con trai duy nhất Isaac làm lễ toàn thiêu. Abraham vâng phục — và Thiên Chúa can thiệp, cung cấp con chiên thay thế. Đây là hình bóng của hy tế thập giá.', ref: 'St 22' },
    ],
    roleInSalvation: 'Abraham là điểm khởi đầu của Giao ước Cứu độ. Qua ông, Thiên Chúa lập dân Israel để qua dân đó chúc phúc cho muôn dân. Câu chuyện dâng Isaac là hình bóng tiên tri về Chúa Cha dâng Con Một trên thập giá.',
    ntConnection: '"Đức Giêsu Kitô, con cháu Đavít, con cháu Abraham" (Mt 1,1). Thánh Phaolô: "Abraham là cha của tất cả những người tin" — bất kể Do Thái hay ngoại giáo (Rm 4,16).',
    lesson: {
      title: 'Bài học Đức tin',
      content: 'Abraham không thấy trước kết quả, không biết đường đi — nhưng vẫn ra đi theo tiếng Chúa. Đức tin không cần thấy trước, chỉ cần tin tưởng vào Đấng đang dẫn đường.',
      memorize: '"Bởi đức tin, Abraham đã vâng nghe tiếng gọi mà ra đi... ông đã ra đi mà không biết mình đi đâu." — Hr 11,8',
    },
  },
  {
    id: 'moses',
    era: 'ot',
    stage: 'Giai đoạn Xuất hành',
    name: 'Môsê',
    nameHebrew: 'מֹשֶׁה',
    nameMeaning: '"Được kéo ra khỏi nước"',
    nameMeaningNote: 'Đặt bởi công chúa Ai Cập khi vớt ông lên từ sông Nile lúc còn là trẻ sơ sinh (Xh 2,10).',
    period: '~1318–1198 TCN',
    emoji: '🔥',
    accent: '#4A90D9',
    glowColor: '#4A90D940',
    heroGrad: 'linear-gradient(160deg, #062040 0%, #031420 60%, #020c14 100%)',
    tagline: 'Người giải phóng vĩ đại',
    imageKeywords: 'Người đàn ông đứng trước bụi gai bốc lửa sa mạc Sinai, ánh lửa siêu nhiên, đôi dép bỏ xuống cát',
    bibleRefs: [
      { label: 'Được gọi qua bụi gai lửa', short: 'Xh 3' },
      { label: 'Mười tai ương & Vượt Qua', short: 'Xh 7–12' },
      { label: 'Vượt Biển Đỏ', short: 'Xh 14' },
      { label: 'Mười Điều Răn', short: 'Xh 20' },
    ],
    keyEvents: [
      { title: 'Bụi gai bốc lửa', body: 'Thiên Chúa hiện ra với Môsê trong bụi gai cháy mà không thiêu rụi — mặc khải Danh thánh: "Ta là Đấng Ta Là" (YHWH). Môsê được sai đến giải phóng dân Israel.', ref: 'Xh 3' },
      { title: 'Xuất hành & Vượt Biển Đỏ', body: 'Sau mười tai ương, Pharaô cho dân ra đi. Thiên Chúa rẽ đôi Biển Đỏ — dân đi qua trên đất khô, quân Ai Cập bị cuốn trôi. Đây là biến cố giải phóng vĩ đại nhất Cựu Ước.', ref: 'Xh 14' },
      { title: 'Giao ước Sinai & 10 Điều Răn', body: 'Trên núi Sinai, Thiên Chúa ban Mười Điều Răn — Luật sống của dân được chọn. Môsê là trung gian giao ước giữa Thiên Chúa và Israel, hình bóng của Đức Giêsu là Trung gian Giao ước Mới.', ref: 'Xh 20' },
    ],
    roleInSalvation: 'Môsê là nhân vật trung tâm Cựu Ước: người mặc khải Danh thánh YHWH, người lãnh đạo Xuất hành, và người nhận Luật Pháp. Sự kiện Vượt qua và Manna là hình bóng trực tiếp của Bí tích Thánh Tẩy và Thánh Thể.',
    ntConnection: '"Pháp luật đã được Môsê ban, còn ân sủng và sự thật thì do Đức Giêsu Kitô mang lại" (Ga 1,17). Đức Giêsu là "Môsê Mới" — trên núi Beatitudes, Ngài công bố Luật Mới vượt trội Luật Cũ.',
    lesson: {
      title: 'Bài học Vâng phục',
      content: 'Môsê ban đầu xin Thiên Chúa gọi người khác vì ông sợ nói không thạo. Nhưng ông đã vâng phục, và Thiên Chúa làm việc lạ qua sự yếu đuối của ông. Thiên Chúa không chọn người tài — Ngài làm cho người được chọn trở nên tài.',
      memorize: '"Đừng lo về lời nói. Ta sẽ ở miệng ngươi và dạy ngươi phải nói gì." — Xh 4,12',
    },
  },
  {
    id: 'david',
    era: 'ot',
    stage: 'Giai đoạn Vương quốc',
    name: 'Đavít',
    nameHebrew: 'דָּוִד',
    nameMeaning: '"Người được yêu thương" hoặc "Chú yêu"',
    nameMeaningNote: 'Gốc từ tiếng Hípri dwd — biểu thị tình yêu và sự gần gũi. Đavít là người được Thiên Chúa chọn và yêu thương cách đặc biệt.',
    period: '~1040–970 TCN',
    emoji: '👑',
    accent: '#9B59B6',
    glowColor: '#9B59B640',
    heroGrad: 'linear-gradient(160deg, #220840 0%, #120520 60%, #0a0314 100%)',
    tagline: 'Vua thi sĩ — theo lòng Thiên Chúa',
    imageKeywords: 'Người trẻ đang chăn chiên đồi cỏ xanh, tay cầm đàn hạc, bầu trời sao Israel',
    bibleRefs: [
      { label: 'Đavít được chọn', short: '1Sm 16' },
      { label: 'Đavít và Gôliát', short: '1Sm 17' },
      { label: 'Giao ước Đavít', short: '2Sm 7' },
      { label: 'Thánh vịnh Đavít', short: 'Tv 22 · 23 · 51' },
    ],
    keyEvents: [
      { title: 'Được xức dầu chọn làm vua', body: 'Trong khi anh cả của Đavít trông có vẻ đạt tiêu chuẩn, Thiên Chúa bảo Samuel: "Đừng nhìn vào dáng bề ngoài — Ta xét con người qua tâm lòng." Cậu bé chăn chiên được chọn.', ref: '1Sm 16' },
      { title: 'Chiến thắng Gôliát', body: 'Đứng trước người khổng lồ Gôliát 3 mét, Đavít không mặc giáp trụ — chỉ có khăn ném và lòng tin: "Tôi nhân danh Đức Chúa các đạo binh mà đến với anh."', ref: '1Sm 17' },
      { title: 'Giao ước Đavít', body: 'Thiên Chúa hứa với Đavít: "Ta sẽ lập dòng dõi ngươi, vương triều ngươi sẽ kiên vững đến muôn đời." Lời hứa này là nền tảng niềm hy vọng Mêsia.', ref: '2Sm 7' },
    ],
    roleInSalvation: 'Giao ước Đavít là mắt xích trung tâm giữa Giao ước Abraham và Đức Kitô. Thánh vịnh Đavít — đặc biệt Tv 22 (bị bỏ rơi) và Tv 16 (phục sinh) — tiên báo chi tiết về cuộc Khổ nạn và Phục sinh.',
    ntConnection: '"Con cháu Đavít" là tước hiệu Mêsia căn bản. Dân chúng hô vang "Hoan hô Con vua Đavít!" khi Đức Giêsu vào Giêrusalem (Mt 21,9). Thiên thần loan báo: "Thiên Chúa sẽ ban cho Người ngôi báu Đavít" (Lc 1,32).',
    lesson: {
      title: 'Bài học Khiêm tốn & Sám hối',
      content: 'Dù là vua vĩ đại, Đavít đã phạm tội nặng. Nhưng ông biết khóc trước mặt Thiên Chúa, ăn năn thật lòng. Thánh vịnh 51 là bài cầu nguyện sám hối mẫu mực cho mọi thời đại.',
      memorize: '"Lạy Chúa, xin tạo cho con một trái tim trong sạch, đổi mới tinh thần cương quyết trong người con." — Tv 51,12',
    },
  },
  {
    id: 'solomon',
    era: 'ot',
    stage: 'Giai đoạn Vương quốc',
    name: 'Salômôn',
    nameHebrew: 'שְׁלֹמֹה',
    nameMeaning: '"Bình an" (shalom)',
    nameMeaningNote: 'Tên gắn với shalom (hòa bình). Triều đại ông là thời kỳ thịnh vượng và bình an nhất Israel — nhưng cũng kết thúc bằng chia rẽ.',
    period: '~970–931 TCN',
    emoji: '🏛️',
    accent: '#D4AF37',
    glowColor: '#D4AF3740',
    heroGrad: 'linear-gradient(160deg, #2a2000 0%, #181400 60%, #0c0a00 100%)',
    tagline: 'Vua khôn ngoan — xây Đền thờ',
    imageKeywords: 'Cung điện nguy nga vàng son Israel cổ đại, vua ngồi trên ngai vàng, Đền thờ Jerusalem',
    bibleRefs: [
      { label: 'Xin ơn khôn ngoan', short: '1V 3' },
      { label: 'Xây Đền thờ', short: '1V 5–8' },
      { label: 'Sách Cách ngôn', short: 'Cn 1–31' },
      { label: 'Diễn từ khánh thành', short: '1V 8,22–61' },
    ],
    keyEvents: [
      { title: 'Thiên Chúa ban ơn khôn ngoan', body: 'Khi Thiên Chúa hỏi muốn xin gì, Salômôn không xin giàu sang hay thọ mạng — ông xin "trái tim biết lắng nghe" để xét xử dân công minh. Thiên Chúa hài lòng và ban thêm giàu sang, danh dự.', ref: '1V 3' },
      { title: 'Xây Đền thờ Giêrusalem', body: 'Đền thờ thứ nhất — kỳ quan thế giới cổ đại — được xây trong 7 năm. Hòm Bia được rước vào Nơi Cực Thánh. Vinh quang Thiên Chúa (Shekinah) lấp đầy Đền thờ.', ref: '1V 5–8' },
      { title: 'Sa ngã & Hệ quả', body: 'Cuối đời, Salômôn bị các vợ ngoại quốc dẫn thờ ngẫu tượng. Sau khi ông qua đời, vương quốc bị chia đôi: Israel (Bắc) và Giuđa (Nam).', ref: '1V 11' },
    ],
    roleInSalvation: 'Đền thờ Salômôn là nơi Thiên Chúa ngự giữa dân — hình bóng thân xác Đức Kitô là "Đền thờ mới". Sự khôn ngoan của ông tiên báo Đức Khôn ngoan nhập thể: "Đây là Đấng còn hơn cả Salômôn" (Mt 12,42).',
    ntConnection: '"Đây là Đấng còn hơn cả Salômôn!" (Mt 12,42). Đức Giêsu là Đền thờ đích thực: "Phá Đền thờ này đi, nội ba ngày Ta sẽ xây dựng lại." (Ga 2,19)',
    lesson: {
      title: 'Bài học Khôn ngoan đích thực',
      content: 'Salômôn dạy ta rằng sự khôn ngoan đích thực không đến từ học vấn hay kinh nghiệm — mà bắt đầu từ kính sợ Thiên Chúa. Nhưng ông cũng cảnh tỉnh: dù khôn ngoan đến đâu mà xa Thiên Chúa là tự hủy hoại.',
      memorize: '"Kính sợ Đức Chúa là đầu mối sự khôn ngoan." — Cn 9,10',
    },
  },
  {
    id: 'isaiah',
    era: 'ot',
    stage: 'Giai đoạn Ngôn sứ',
    name: 'Isaia',
    nameHebrew: 'יְשַׁעְיָהוּ',
    nameMeaning: '"Thiên Chúa cứu độ" hoặc "Ơn cứu độ của YHWH"',
    nameMeaningNote: 'Tên ông chứa đựng sứ điệp cả cuộc đời — loan báo ơn cứu độ Thiên Chúa mang đến.',
    period: '~740–700 TCN',
    emoji: '📜',
    accent: '#E67E22',
    glowColor: '#E67E2240',
    heroGrad: 'linear-gradient(160deg, #301000 0%, #1c0a00 60%, #0e0500 100%)',
    tagline: 'Ngôn sứ ơn cứu độ — Tin Mừng Cựu Ước',
    imageKeywords: 'Ngôn sứ cao tuổi viết trên giấy cói ánh đèn dầu, tay chỉ lên trời, Giêrusalem nền',
    bibleRefs: [
      { label: 'Ơn gọi của Isaia', short: 'Is 6' },
      { label: 'Emmanuel — trinh nữ thụ thai', short: 'Is 7,14' },
      { label: 'Người Tôi Tớ đau khổ', short: 'Is 53' },
      { label: 'Năm Hồng ân', short: 'Is 61' },
    ],
    keyEvents: [
      { title: 'Thị kiến ngai thánh', body: 'Isaia thấy Thiên Chúa ngự trên ngai cao, Sêraphim hô vang "Thánh Thánh Thánh". Ông thưa: "Khốn cho tôi, miệng lưỡi tôi ô uế!" — thiên thần chạm than lửa vào môi ông. Đây là mô hình của mọi ơn gọi: gặp Thiên Chúa → nhận ra tội → được thanh tẩy → được sai đi.', ref: 'Is 6' },
      { title: 'Trinh nữ thụ thai (Is 7,14)', body: '"Này đây trinh nữ sẽ thụ thai và sinh hạ một con trai, đặt tên là Emmanuel." Đây là lời tiên tri về Đức Giêsu sinh bởi Đức Maria — được Thánh Matthêô trích dẫn (Mt 1,23).', ref: 'Is 7,14' },
      { title: 'Người Tôi Tớ đau khổ (Is 53)', body: '"Người bị khinh khi và bị người ta ruồng bỏ... vì tội lỗi ta mà Người bị đâm thâu, vì sự gian ác ta mà Người bị nghiền nát." Viết trước cuộc khổ nạn ~700 năm.', ref: 'Is 53' },
    ],
    roleInSalvation: 'Isaia là ngôn sứ vĩ đại nhất Cựu Ước về ơn cứu độ. Sách Isaia được gọi là "Tin Mừng thứ năm" vì mô tả Đức Kitô chi tiết hơn bất kỳ sách Cựu Ước nào. Đức Giêsu trích Is 61 khi công bố sứ vụ tại Nadarét.',
    ntConnection: 'Đức Giêsu mở sách Is 61 tại hội đường và nói: "Hôm nay ứng nghiệm lời Kinh Thánh này." (Lc 4,21). Gioan Tẩy Giả được mô tả là "tiếng hô trong sa mạc" theo Is 40,3.',
    lesson: {
      title: 'Bài học Sứ mạng',
      content: 'Isaia dạy ta rằng Thiên Chúa gọi mỗi người vào một sứ mạng cụ thể. Câu trả lời của ông là mẫu mực: "Này con đây, xin hãy sai con." Chúng ta được gọi không phải vì hoàn hảo, nhưng vì Chúa muốn.',
      memorize: '"Này con đây, xin hãy sai con đi." — Is 6,8',
    },
  },
  {
    id: 'jeremiah',
    era: 'ot',
    stage: 'Giai đoạn Lưu đày',
    name: 'Giêrêmia',
    nameHebrew: 'יִרְמְיָהוּ',
    nameMeaning: '"Thiên Chúa nâng đỡ" hoặc "YHWH đặt nền móng"',
    nameMeaningNote: 'Tên hứa hẹn sức mạnh và nền tảng — nhưng Giêrêmia lại là ngôn sứ chịu đau khổ nhất, hình bóng của Đức Kitô chịu khổ nạn.',
    period: '~645–580 TCN',
    emoji: '🕯️',
    accent: '#1ABC9C',
    glowColor: '#1ABC9C40',
    heroGrad: 'linear-gradient(160deg, #021a14 0%, #010e0c 60%, #000806 100%)',
    tagline: 'Ngôn sứ nước mắt — Giao ước Mới',
    imageKeywords: 'Ngôn sứ già ngồi khóc trên đống gạch đổ nát thành Jerusalem hoàng hôn đỏ',
    bibleRefs: [
      { label: 'Ơn gọi từ thuở còn thơ', short: 'Gr 1,4–10' },
      { label: 'Giao ước Mới', short: 'Gr 31,31–34' },
      { label: 'Thư gửi người lưu đày', short: 'Gr 29' },
      { label: 'Sách Ai ca', short: 'Ac 3' },
    ],
    keyEvents: [
      { title: 'Được gọi từ trước khi sinh', body: '"Trước khi ngươi sinh ra, Ta đã thánh hiến ngươi; Ta đặt ngươi làm ngôn sứ." Giêrêmia xin miễn vì còn trẻ, nhưng Thiên Chúa bảo: "Ta sẽ ở cùng ngươi."', ref: 'Gr 1,4–10' },
      { title: 'Giao ước Mới (Gr 31)', body: '"Ta sẽ lập một Giao ước Mới... Ta sẽ đặt Luật Ta vào lòng họ, khắc vào tâm khảm họ. Ta sẽ là Thiên Chúa của chúng và chúng sẽ là dân Ta." Lời hứa vĩ đại nhất về Hội Thánh.', ref: 'Gr 31,31–34' },
      { title: 'Thư gửi người lưu đày', body: 'Viết cho dân đang lưu đày Babylon: "Hãy cầu nguyện cho thành phố các ngươi đang sống, vì nếu nó được bình an thì các ngươi cũng được bình an." Bài học sống tốt trong hoàn cảnh khó khăn.', ref: 'Gr 29' },
    ],
    roleInSalvation: 'Giêrêmia là nhịp cầu quan trọng giữa Lưu đày và Tân Ước. Lời ông về Giao ước Mới là lời tiên tri trực tiếp nhất về Bí tích Thánh Thể và Hội Thánh. Ông cũng là hình bóng nổi bật nhất về Đức Kitô chịu khổ nạn.',
    ntConnection: '"Chén này là Giao ước Mới lập bằng Máu Ta" (Lc 22,20) — hoàn tất lời Giêrêmia sau 600 năm. Khi hỏi Đức Giêsu là ai, dân nói: "Có kẻ bảo là Giêrêmia" (Mt 16,14) — vì cả hai đều là ngôn sứ chịu đau khổ vì dân.',
    lesson: {
      title: 'Bài học Kiên trung',
      content: 'Giêrêmia rao giảng 40 năm mà gần như không ai nghe, bị tù ngục, ném xuống giếng. Nhưng ông không bỏ cuộc. Ngài dạy ta: trung thành với Thiên Chúa không đo bằng thành công — mà đo bằng trung tín.',
      memorize: '"Lạy Chúa, Ngài đã quyến rũ con, con đã để Ngài quyến rũ." — Gr 20,7',
    },
  },

  // ── TÂN ƯỚC ────────────────────────────────────────────────────────────────
  {
    id: 'mary',
    era: 'nt',
    stage: 'Giai đoạn Nhập thể',
    name: 'Đức Maria',
    nameHebrew: 'מִרְיָם',
    nameMeaning: '"Được Thiên Chúa yêu thương" hay "Đắng cay / Biển cả"',
    nameMeaningNote: 'Nguồn gốc tranh luận — nhưng trong ơn cứu độ, Mẹ là "Eva Mới": tiếng "xin vâng" của Mẹ đảo ngược tiếng "không" của Eva.',
    period: '~18 TCN – ~48 sau CN',
    emoji: '🌹',
    accent: '#E8A0B4',
    glowColor: '#E8A0B440',
    heroGrad: 'linear-gradient(160deg, #1a0820 0%, #100515 60%, #08030c 100%)',
    tagline: 'Mẹ Thiên Chúa — Mẹ Hội Thánh',
    imageKeywords: 'Người phụ nữ trẻ áo xanh kính cẩn cúi đầu trước ánh sáng thiêng liêng, bông hoa huệ',
    bibleRefs: [
      { label: 'Sứ thần truyền tin', short: 'Lc 1,26–38' },
      { label: 'Kinh Magnificat', short: 'Lc 1,46–55' },
      { label: 'Tại Tiệc cưới Cana', short: 'Ga 2,1–12' },
      { label: 'Đứng dưới chân Thập giá', short: 'Ga 19,25–27' },
    ],
    keyEvents: [
      { title: 'Tiếng "Xin vâng" đổi thay lịch sử', body: '"Này tôi là tôi tớ Đức Chúa, xin hãy thực hiện cho tôi theo lời sứ thần." — Một câu ngắn của một trinh nữ vô danh ở Nadarét đã mở ra cánh cửa nhập thể của Ngôi Lời.', ref: 'Lc 1,38' },
      { title: 'Tại Cana: "Người bảo gì, hãy làm đó"', body: 'Khi rượu cưới thiếu, Mẹ Maria nói với Đức Giêsu và nói với người hầu: "Người bảo gì, hãy làm đó." Đây là lời hướng dẫn thiêng liêng của Mẹ cho mọi Kitô hữu đến tận ngày nay.', ref: 'Ga 2,5' },
      { title: 'Đứng vững dưới chân Thập giá', body: 'Trong khi hầu hết môn đệ bỏ trốn, Mẹ Maria đứng vững dưới chân thập giá. Đức Giêsu trao Mẹ cho Gioan: "Đây là Mẹ con" — trao Mẹ cho toàn thể Hội Thánh.', ref: 'Ga 19,25–27' },
    ],
    roleInSalvation: 'Đức Maria là cộng sự đặc biệt trong Mầu nhiệm Cứu độ. Tiếng "xin vâng" của Mẹ là điều kiện để Ngôi Lời nhập thể. Mẹ là "Hòm Bia Giao ước Mới" — mang Đức Kitô đến cho thế gian.',
    ntConnection: '"Phúc cho Bà là người đã tin." (Lc 1,45). Mẹ Maria là mẫu gương đức tin hoàn hảo — tin trước khi hiểu, vâng phục trước khi thấy kết quả. Mẹ là khuôn mẫu của mọi môn đệ.',
    lesson: {
      title: 'Bài học Xin vâng',
      content: 'Mẹ Maria dạy ta rằng điều Thiên Chúa cần không phải là tài năng hay sức mạnh — mà là sự sẵn sàng. Một trái tim thưa "xin vâng" có thể thay đổi lịch sử.',
      memorize: '"Người bảo gì, hãy làm đó." — Ga 2,5',
    },
  },
  {
    id: 'john-baptist',
    era: 'nt',
    stage: 'Giai đoạn Dọn đường',
    name: 'Gioan Tẩy Giả',
    nameHebrew: 'יוֹחָנָן',
    nameMeaning: '"Thiên Chúa là Đấng ban ơn" hay "YHWH đã thương xót"',
    nameMeaningNote: 'Tên được chính sứ thần Gabriel đặt trước khi ông sinh ra (Lc 1,13) — báo hiệu ông là hồng ân đặc biệt của Thiên Chúa.',
    period: '~5 TCN – ~28 sau CN',
    emoji: '🌊',
    accent: '#3498DB',
    glowColor: '#3498DB40',
    heroGrad: 'linear-gradient(160deg, #052040 0%, #031428 60%, #010810 100%)',
    tagline: 'Người dọn đường — Êlia Mới',
    imageKeywords: 'Người ẩn tu bên bờ sông Jordan áo lạc đà, tay chỉ về phía trước, sa mạc Giuđê',
    bibleRefs: [
      { label: 'Ơn gọi từ trong dạ mẹ', short: 'Lc 1,5–25' },
      { label: 'Rao giảng ở sông Jordan', short: 'Mc 1,1–8' },
      { label: 'Làm phép rửa Đức Giêsu', short: 'Mt 3,13–17' },
      { label: '"Người phải lớn lên..."', short: 'Ga 3,30' },
    ],
    keyEvents: [
      { title: 'Nhảy mừng trong dạ mẹ', body: 'Khi Mẹ Maria — đang mang thai Đức Giêsu — đến thăm bà Êlisabét, thai nhi Gioan nhảy mừng trong dạ mẹ. Gioan nhận ra Đấng Cứu Thế ngay từ trong bào thai.', ref: 'Lc 1,41–44' },
      { title: 'Giọng hô trong sa mạc', body: '"Hãy dọn đường cho Đức Chúa, sửa lối cho thẳng để Người đi." Gioan ra đi vào sa mạc, ăn châu chấu và mật ong, mặc áo lạc đà — gương khổ tu và từ bỏ thế gian.', ref: 'Mc 1,3–6' },
      { title: '"Người phải lớn lên, tôi phải nhỏ lại"', body: 'Khi môn đệ báo rằng mọi người đến với Đức Giêsu, Gioan không ganh tị — ông nói câu nổi tiếng: "Người phải lớn lên, còn tôi phải nhỏ lại." Khiêm tốn vĩ đại nhất Tân Ước.', ref: 'Ga 3,30' },
    ],
    roleInSalvation: 'Gioan là "người trung gian" giữa Cựu Ước và Tân Ước. Đức Giêsu gọi ông là "người vĩ đại nhất sinh ra từ người phụ nữ" (Mt 11,11). Ông hoàn tất sứ vụ các ngôn sứ và khép lại thời Cựu Ước bằng việc chỉ về Đức Kitô.',
    ntConnection: '"Đây là Chiên Thiên Chúa, Đấng xóa bỏ tội trần gian!" (Ga 1,29) — Gioan là người đầu tiên công bố căn tính Đức Giêsu. Ông là nhân chứng anh dũng đến mức chịu chết chém vì dám nói sự thật.',
    lesson: {
      title: 'Bài học Khiêm tốn đích thực',
      content: 'Gioan là ngôn sứ vĩ đại nhất, nhưng không giữ sự vĩ đại cho mình. Ông giảm nhỏ để Đức Giêsu lớn lên. Đây là bí quyết của tất cả những người phục vụ Chúa: ta không phải là trung tâm.',
      memorize: '"Người phải lớn lên, còn tôi phải nhỏ lại." — Ga 3,30',
    },
  },
  {
    id: 'peter',
    era: 'nt',
    stage: 'Giai đoạn Hội Thánh',
    name: 'Thánh Phêrô',
    nameHebrew: 'שִׁמְעוֹן / Πέτρος',
    nameMeaning: '"Đá" (Petros / Cephas)',
    nameMeaningNote: 'Tên gốc là Simon (Simôn). Đức Giêsu đổi thành Kêpha (tiếng Aramaic: đá tảng) — Phêrô trong tiếng Hy Lạp. Cái tên chứa đựng sứ mạng.',
    period: '~1 TCN – ~64/68 sau CN',
    emoji: '🔑',
    accent: '#F39C12',
    glowColor: '#F39C1240',
    heroGrad: 'linear-gradient(160deg, #281800 0%, #180f00 60%, #0c0800 100%)',
    tagline: 'Đá tảng — Người chăn dắt Hội Thánh',
    imageKeywords: 'Ngư phủ trung niên bỏ lưới cá lên bờ hồ Galilê, bàn tay thô cầm chìa khóa vàng',
    bibleRefs: [
      { label: 'Được gọi từ lưới cá', short: 'Mt 4,18–20' },
      { label: 'Tuyên xưng đức tin', short: 'Mt 16,16–18' },
      { label: 'Chối Chúa & Hối hận', short: 'Lc 22,54–62' },
      { label: 'Được phục hồi', short: 'Ga 21,15–17' },
    ],
    keyEvents: [
      { title: '"Anh là Đá, trên đá này Ta xây Hội Thánh"', body: 'Khi Phêrô tuyên xưng: "Thầy là Đức Kitô, Con Thiên Chúa hằng sống", Đức Giêsu đáp: "Anh là Đá, trên đá này Ta sẽ xây Hội Thánh Ta." Phêrô nhận sứ mạng lãnh đạo Hội Thánh.', ref: 'Mt 16,16–18' },
      { title: 'Ba lần chối Chúa', body: 'Đêm Đức Giêsu bị bắt, Phêrô ba lần chối: "Tôi không biết người đó." Khi gà gáy, ông ra ngoài khóc lóc thảm thiết. Đây là khoảnh khắc thất bại nhất — và là nền tảng của ơn tha thứ.', ref: 'Lc 22,54–62' },
      { title: '"Anh có yêu mến Thầy không?"', body: 'Sau Phục sinh, Đức Giêsu hỏi ba lần: "Simon, anh có yêu mến Thầy không?" — Phêrô được phục hồi ba lần, tương ứng ba lần chối. "Hãy chăn dắt chiên của Thầy." Tình yêu chiến thắng tội lỗi.', ref: 'Ga 21,15–17' },
    ],
    roleInSalvation: 'Phêrô là nền tảng hữu hình của Hội Thánh sau Lễ Ngũ Tuần. Bài giảng đầu tiên của ông dẫn đến 3000 người chịu phép rửa. Sự vấp ngã và được phục hồi của ông là sứ điệp hy vọng cho mọi người tội nhân.',
    ntConnection: 'Phêrô là mẫu gương của người yếu đuối được Thiên Chúa biến thành người mạnh. Thư thứ nhất của ông (1Pr) là kho tàng giáo lý về đau khổ Kitô giáo và niềm hy vọng phục sinh.',
    lesson: {
      title: 'Bài học Tình yêu & Tha thứ',
      content: 'Phêrô dạy ta: dù có phạm tội nặng đến đâu, Chúa vẫn hỏi "Anh có yêu mến Thầy không?" — không hỏi về tội, nhưng hỏi về tình yêu. Câu trả lời cho tội lỗi là tình yêu dâng hiến.',
      memorize: '"Lạy Thầy, Thầy biết rõ mọi sự; Thầy biết con yêu mến Thầy." — Ga 21,17',
    },
  },
  {
    id: 'jesus',
    era: 'nt',
    stage: 'Trung tâm Lịch sử Cứu độ',
    name: 'Đức Giêsu Kitô',
    nameHebrew: 'יֵשׁוּעַ הַמָּשִׁיחַ',
    nameMeaning: '"Giêsu" = Thiên Chúa cứu độ · "Kitô" = Đấng được Xức dầu (Mêsia)',
    nameMeaningNote: 'Đây là tên duy nhất trong lịch sử nhân loại chứa đựng trọn vẹn chương trình cứu độ của Thiên Chúa. "Tên Ngài cao trọng hơn mọi danh hiệu." (Pl 2,9)',
    period: '~4 TCN – ~30 sau CN (và mãi mãi)',
    emoji: '✝️',
    accent: '#FFD700',
    glowColor: '#FFD70050',
    heroGrad: 'linear-gradient(160deg, #2a1e00 0%, #1a1200 60%, #0d0900 100%)',
    tagline: 'Thiên Chúa làm người — Đấng Cứu Thế duy nhất',
    imageKeywords: 'Ánh sáng chói rực hình bóng người đứng giang tay đồi Calvê hoàng hôn vàng son',
    bibleRefs: [
      { label: 'Ngôi Lời nhập thể', short: 'Ga 1,1–18' },
      { label: 'Bài giảng Tám Mối Phúc', short: 'Mt 5,1–12' },
      { label: 'Tử nạn & Phục sinh', short: 'Lc 23–24' },
      { label: 'Trong GLCG', short: 'GLCG 422–483' },
    ],
    keyEvents: [
      { title: 'Nhập thể — Thiên Chúa trở thành người', body: '"Ngôi Lời đã trở nên người phàm và cư ngụ giữa chúng ta." Đây là biến cố vĩ đại nhất lịch sử: Thiên Chúa vô hạn tự hạ mình vào trong thời gian và không gian, trở thành một đứa trẻ sơ sinh tại Bêlem.', ref: 'Ga 1,14' },
      { title: 'Sứ vụ: Tin Mừng Nước Trời', body: 'Ba năm sứ vụ công khai: giảng dạy Tám Mối Phúc, chữa lành kẻ đau yếu, tha tội, xua trừ ma quỷ, gọi 12 tông đồ — mặc khải khuôn mặt thật của Thiên Chúa là Cha nhân hậu.', ref: 'Mc 1,14–15' },
      { title: 'Tử nạn & Phục sinh — Đỉnh điểm ơn cứu độ', body: 'Chịu chết trên thập giá đền tội nhân loại. Ngày thứ ba, sống lại — chiến thắng tội lỗi và sự chết. "Nếu Đức Kitô không sống lại thì đức tin của chúng ta trống rỗng." (1Cr 15,17)', ref: 'Lc 24' },
    ],
    roleInSalvation: 'Đức Giêsu Kitô là trung tâm và mục tiêu toàn bộ Lịch sử Cứu độ. Tất cả Cựu Ước hướng về Ngài; tất cả Tân Ước xuất phát từ Ngài. "Ngài là Alpha và Omega, là Đầu và là Cuối." (Kh 22,13)',
    ntConnection: 'Đức Giêsu không chỉ ứng nghiệm Cựu Ước — Ngài hoàn tất và vượt trội tất cả: Ngài là Chiên Vượt Qua đích thực, Đền thờ đích thực, Đavít đích thực, Môsê đích thực, và hơn tất cả: Ngài là Thiên Chúa.',
    lesson: {
      title: 'Trọng tâm của Đức tin',
      content: 'Đức Giêsu Kitô không chỉ là nhân vật lịch sử hay thầy đạo đức — Ngài là Con Thiên Chúa hằng sống, Đấng Cứu Thế duy nhất, đang sống và đang yêu thương từng người ngay lúc này.',
      memorize: '"Thiên Chúa đã yêu thế gian đến nỗi ban Con Một, để ai tin vào Con của Người thì được sống muôn đời." — Ga 3,16',
    },
    isHero: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const CharacterModal = ({ char, onClose }) => {
  const [openEvent, setOpenEvent] = useState(null);
  if (!char) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <motion.div
          className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto sm:rounded-2xl rounded-t-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #12100a 0%, #0d0b08 100%)',
            border: `1px solid ${char.accent}35`,
            boxShadow: `0 -4px 40px ${char.accent}20, 0 0 0 1px ${char.accent}15`,
          }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Modal header ── */}
          <div
            className="sticky top-0 z-10 flex items-center gap-4 px-5 py-4"
            style={{ background: `linear-gradient(135deg, ${char.accent}18, ${char.accent}08)`, borderBottom: `1px solid ${char.accent}25` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${char.accent}20`, border: `1px solid ${char.accent}35` }}
            >
              {char.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-xl leading-tight" style={{ fontFamily: '"Lexend", "EB Garamond", Georgia, serif', color: char.accent }}>
                  {char.name}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: `${char.accent}18`, color: `${char.accent}cc`, border: `1px solid ${char.accent}30` }}>
                  {char.stage}
                </span>
              </div>
              <p className="text-white/45 text-[12px] mt-0.5">{char.tagline} · {char.period}</p>
            </div>
            <button onClick={onClose}
              className="shrink-0 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition">
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-5 space-y-6">
            {/* ── Tên & nghĩa ── */}
            <div className="rounded-xl px-4 py-4" style={{ background: `${char.accent}0e`, border: `1px solid ${char.accent}22` }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: `${char.accent}88` }}>📖 Ý nghĩa tên gọi</p>
              <div className="flex items-start gap-3">
                <span className="text-2xl font-serif leading-none" style={{ color: `${char.accent}66` }}>{char.nameHebrew}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: char.accent }}>{char.nameMeaning}</p>
                  <p className="text-white/55 text-[12px] leading-relaxed mt-1">{char.nameMeaningNote}</p>
                </div>
              </div>
            </div>

            {/* ── Biến cố chính ── */}
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5" style={{ color: `${char.accent}88` }}>
                <span>📅</span> Biến cố chính
              </p>
              <div className="space-y-2">
                {char.keyEvents.map((ev, i) => (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${openEvent === i ? char.accent + '40' : 'rgba(255,255,255,0.06)'}` }}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      style={{ background: openEvent === i ? `${char.accent}0c` : 'transparent' }}
                      onClick={() => setOpenEvent(openEvent === i ? null : i)}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: `${char.accent}22`, color: char.accent }}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium" style={{ color: openEvent === i ? char.accent : 'rgba(255,255,255,0.7)' }}>
                        {ev.title}
                      </span>
                      <span className="text-[10px] shrink-0" style={{ color: `${char.accent}77` }}>{ev.ref}</span>
                      <motion.div animate={{ rotate: openEvent === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight size={14} style={{ color: `${char.accent}66` }} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openEvent === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-3.5 text-white/65 text-[13px] leading-relaxed" style={{ paddingTop: 0 }}>
                            {ev.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Vai trò Lịch sử Cứu độ ── */}
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5" style={{ color: `${char.accent}88` }}>
                <span>🏛️</span> Vai trò trong Lịch sử Cứu độ
              </p>
              <p className="text-white/65 text-[13px] leading-relaxed">{char.roleInSalvation}</p>
            </div>

            {/* ── Liên hệ Tân Ước ── */}
            <div className="rounded-xl px-4 py-3.5" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.18)' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'rgba(255,215,0,0.7)' }}>
                <span>🔗</span> Liên hệ Tân Ước
              </p>
              <p className="text-white/60 text-[13px] leading-relaxed">{char.ntConnection}</p>
            </div>

            {/* ── Ghi nhớ ── */}
            <div
              className="rounded-2xl px-5 py-5"
              style={{ background: `linear-gradient(135deg, ${char.accent}18, ${char.accent}08)`, border: `1px solid ${char.accent}35` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} style={{ color: char.accent }} />
                <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: char.accent }}>
                  ⭐ GHI NHỚ · {char.lesson.title}
                </p>
              </div>
              <p className="text-white/70 text-[13px] leading-relaxed mb-3">{char.lesson.content}</p>
              <p
                className="text-sm italic font-medium leading-relaxed border-l-2 pl-3"
                style={{ color: char.accent, borderColor: `${char.accent}60` }}
              >
                {char.lesson.memorize}
              </p>
            </div>

            {/* ── Tham chiếu Kinh Thánh ── */}
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <BookOpen size={11} /> Tham chiếu Kinh Thánh
              </p>
              <div className="flex flex-wrap gap-2">
                {char.bibleRefs.map((r, i) => (
                  <span key={i}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full cursor-default"
                    style={{ background: `${char.accent}10`, color: `${char.accent}cc`, border: `1px solid ${char.accent}25` }}
                    title={r.label}
                  >
                    <ExternalLink size={10} />
                    {r.short}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Từ khóa hình ảnh ── */}
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                🔍 Từ khóa tìm hình ảnh minh họa
              </p>
              <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.35)' }}>{char.imageKeywords}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER CARD
// ═══════════════════════════════════════════════════════════════════════════════

const CharacterCard = ({ char, onClick }) => (
  <motion.article
    variants={cardVariants}
    className="rounded-2xl overflow-hidden cursor-pointer group"
    style={{
      background: char.heroGrad,
      border: `1px solid ${char.accent}25`,
      boxShadow: `0 4px 20px ${char.accent}0a`,
    }}
    whileHover={{ scale: 1.03, y: -5, boxShadow: `0 16px 40px ${char.accent}30, 0 0 0 1px ${char.accent}45` }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    onClick={onClick}
  >
    {/* Hero area */}
    <div className="relative h-28 flex items-center justify-center overflow-hidden" style={{ background: `radial-gradient(ellipse 70% 80% at 50% 30%, ${char.accent}28 0%, transparent 75%)` }}>
      {/* Era stripe */}
      <div className="absolute top-3 left-3">
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{
            background: char.era === 'ot' ? 'rgba(180,120,20,0.3)' : 'rgba(255,215,0,0.2)',
            color: char.era === 'ot' ? '#D4AF37' : '#FFE566',
            border: char.era === 'ot' ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,229,102,0.3)',
          }}
        >
          {char.era === 'ot' ? 'Cựu Ước' : 'Tân Ước'}
        </span>
      </div>

      {/* Stage badge */}
      <div className="absolute top-3 right-3">
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${char.accent}18`, color: `${char.accent}bb`, border: `1px solid ${char.accent}25` }}>
          {char.stage.replace('Giai đoạn ', '')}
        </span>
      </div>

      {/* Emoji hero */}
      <motion.div
        className="text-5xl"
        style={{ filter: `drop-shadow(0 0 16px ${char.accent}60)` }}
        whileHover={{ scale: 1.15, rotate: char.id === 'jesus' ? 0 : [-2, 2, -2, 0] }}
        transition={{ duration: 0.3 }}
      >
        {char.emoji}
      </motion.div>
    </div>

    {/* Body */}
    <div className="px-4 pb-4 pt-3">
      {/* Name + Hebrew */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3
          className="font-bold text-base leading-tight"
          style={{ fontFamily: '"Lexend", "EB Garamond", Georgia, serif', color: char.accent }}
        >
          {char.name}
        </h3>
        <span className="text-lg leading-none mt-0.5 opacity-40 shrink-0" style={{ color: char.accent }}>
          {char.nameHebrew.charAt(0)}
        </span>
      </div>
      <p className="text-[11px] mb-2.5" style={{ color: `${char.accent}66` }}>{char.period}</p>

      {/* Tagline */}
      <p className="text-white/50 text-[12px] italic leading-snug mb-3 line-clamp-2">{char.tagline}</p>

      {/* Key facts preview */}
      <div className="space-y-1 mb-4">
        {char.keyEvents.slice(0, 2).map((ev, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: `${char.accent}66` }} />
            <span className="text-[11px] text-white/45 leading-snug line-clamp-1">{ev.title}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold"
        style={{ background: `${char.accent}12`, border: `1px solid ${char.accent}22`, color: `${char.accent}cc` }}
      >
        <span>Xem chi tiết</span>
        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  </motion.article>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const FILTERS = [
  { id: 'all', label: 'Tất cả', count: CHARACTERS_DATA.length },
  { id: 'ot', label: 'Cựu Ước', count: CHARACTERS_DATA.filter(c => c.era === 'ot').length },
  { id: 'nt', label: 'Tân Ước', count: CHARACTERS_DATA.filter(c => c.era === 'nt').length },
];

export default function NhanVat() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(180deg, #020609 0%, #050810 60%, #020609 100%)' }}
    >
      {/* Watermark cross */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.018]" aria-hidden>
        <svg width="420" height="420" viewBox="0 0 100 100" fill="none">
          <rect x="44" y="5" width="12" height="90" rx="6" fill="#D4AF37" />
          <rect x="10" y="28" width="80" height="12" rx="6" fill="#D4AF37" />
        </svg>
      </div>

      {/* ── Header ── */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <Link
          to="/lich-su-cuu-do"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-6 transition-colors hover:opacity-80"
          style={{ color: 'rgba(212,175,55,0.6)' }}
        >
          <ArrowLeft size={13} />
          Lịch sử Cứu độ
        </Link>

        <p className="text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: 'rgba(212,175,55,0.5)' }}>
          Giáo lý Xứ Đoàn · Anrê Phú Yên
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2 leading-tight"
          style={{
            fontFamily: '"Lexend", "EB Garamond", Georgia, serif',
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFE566 45%, #CD853F 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Nhân vật tiêu biểu
        </h1>
        <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
          9 nhân vật từ Abraham đến Thánh Phaolô — mỗi người là một mắt xích
          trong chuỗi Lịch sử Cứu độ của Thiên Chúa.
        </p>
      </motion.div>

      {/* ── CharacterCollection — 3×3 grid, filter, progress ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <CharacterCollection />
      </div>
    </div>
  );
}
