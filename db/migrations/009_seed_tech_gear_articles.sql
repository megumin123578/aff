INSERT INTO affiliate_links (id, provider, label, destination_url, affiliate_url, enabled, last_verified, notes)
VALUES
  ('shopee-keychron-k2', 'Shopee / Keychron', 'Xem giá Keychron K2 Pro trên Shopee', 'https://shopee.vn/search?keyword=keychron%20k2%20pro', '', true, '2026-08-25', 'Bàn phím cơ lập trình viên.'),
  ('lazada-nuphy-air75', 'Lazada / NuPhy', 'Xem giá NuPhy Air75 V2 trên Lazada', 'https://www.lazada.vn/catalog/?q=nuphy%20air75%20v2', '', true, '2026-08-25', 'Bàn phím low-profile gõ êm.'),
  ('shopee-dell-u2723qe', 'Shopee / Dell UltraSharp', 'Xem ưu đãi Dell UltraSharp U2723QE', 'https://shopee.vn/search?keyword=dell%20u2723qe', '', true, '2026-08-25', 'Màn hình 4K IPS Black cho coder.'),
  ('amazon-mac-mini-m4', 'Apple / Mac Mini M4', 'Xem Mac Mini M4 chính hãng', 'https://www.apple.com/mac-mini/', '', true, '2026-08-25', 'Home server & trạm code mini.'),
  ('shopee-beelink-ser5', 'Shopee / Beelink', 'Xem giá Mini PC Beelink SER5', 'https://shopee.vn/search?keyword=beelink%20ser5', '', true, '2026-08-25', 'Mini PC chạy Proxmox / Docker giá rẻ.'),
  ('shopee-mx-master-3s', 'Shopee / Logitech', 'Xem chuột Logitech MX Master 3S', 'https://shopee.vn/search?keyword=logitech%20mx%20master%203s', '', true, '2026-08-25', 'Chuột công thái học lập trình viên.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO articles (
  slug, title, description, category, tags, status, published_at, updated_at,
  cover_image, affiliate_ids, body_markdown
)
VALUES
(
  'minimalist-developer-desk-setup-2026',
  'Setup góc làm việc lập trình tối giản với ngân sách ~20 triệu: Tối ưu 8h code mỗi ngày',
  'Chi tiết từng món đồ công nghệ từ màn hình 4K, bàn phím cơ, chuột công thái học đến giải pháp giấu dây tuyệt đối cho lập trình viên.',
  'Desk Setup',
  ARRAY['Desk Setup', 'Ergonomics', 'Hardware', 'Productivity'],
  'published', '2026-08-20', '2026-08-25', '',
  ARRAY['shopee-dell-u2723qe', 'shopee-keychron-k2', 'shopee-mx-master-3s'],
  $markdown$Một góc làm việc tốt không phải là góc làm việc đắt tiền nhất, mà là góc làm việc giúp bạn **tập trung lâu nhất và giảm thiểu đau mỏi cổ vai gáy** sau 8–10 tiếng lập trình mỗi ngày.

Dưới đây là cấu hình góc setup tối giản với ngân sách quanh mức 20 triệu VNĐ đã được kiểm chứng qua thực tế.

## 1. Màn hình: Ưu tiên độ sắc nét của font chữ (PPI)

Khi đọc code cả ngày, điều mỏi mắt nhất là hiện tượng răng cưa font chữ trên các màn hình Full HD hoặc 2K kích thước lớn.

* **Lựa chọn tối ưu:** Dell UltraSharp U2723QE (27 inch 4K IPS Black, độ tương phản 2000:1, tích hợp cổng Type-C sạc 90W truyền hình ảnh 1 dây).
* **Điểm cộng:** Công nghệ IPS Black cho màu đen sâu, xem theme code Dark Mode rất nịnh mắt.

{{affiliate:shopee-dell-u2723qe|Xem ưu đãi Dell UltraSharp U2723QE}}

## 2. Bàn phím: Switch Tactile êm ái, gõ chuẩn không ồn

Bàn phím cơ cho lập trình viên cần đáp ứng 3 tiêu chí: Có độ nảy rõ ràng (giảm gõ nhầm), âm thanh đầm ấm (không gây phiền người xung quanh) và hỗ trợ layout macOS/Windows linh hoạt.

* **Đề xuất:** Keychron K2 Pro (Gateron Jupiter Brown Switch).
* **Thực tế sử dụng:** Bản Pro đã được hãng lót sẵn foam tiêu âm và lube switch từ nhà máy. Cảm giác gõ đầm, phím Space êm và không bị lọc xọc.

{{affiliate:shopee-keychron-k2|Xem giá Keychron K2 Pro trên Shopee}}

## 3. Chuột & Thiết bị điều khiển: Công thái học là bắt buộc

Cổ tay và ngón tay trỏ là nơi chịu áp lực nhiều nhất khi dùng chuột văn phòng dạng phẳng thông thường.

* **Đề xuất:** Logitech MX Master 3S.
* **Điểm sáng:** Cuộn vô cực MagSpeed lướt hàng nghìn dòng log cực nhanh, nút bấm Silent Click gần như triệt tiêu hoàn toàn tiếng ồn trong đêm.

{{affiliate:shopee-mx-master-3s|Xem chuột Logitech MX Master 3S}}

## 4. Quản lý dây điện (Cable Management)

Sự bừa bộn của dây cáp ngầm tạo ra sự mất tập trung thị giác:
* Dùng 1 máng đi dây kẹp dưới mặt bàn.
* Sử dụng 1 ổ cắm nối dài có công tắc tổng đặt gọn trong máng.
* Với laptop hỗ trợ Type-C, toàn bộ màn hình, sạc, chuột và bàn phím chỉ đi qua **duy nhất 1 sợi cáp USB-C cắm vào máy**.

---
*Bạn có câu hỏi về việc tương thích thiết bị hoặc muốn tư vấn theo ngân sách riêng? Hãy để lại bình luận bên dưới nhé!*$markdown$
),
(
  'mac-mini-m4-vs-mini-pc-homelab',
  'Mac Mini M4 vs Mini PC Linux: Đâu là lựa chọn hoàn hảo làm Home Server & Trạm Code?',
  'So sánh trực diện hiệu năng tiêu thụ điện, khả năng chạy Docker 24/7, nhiệt độ và chi phí giữa Mac Mini M4 và Mini PC Ryzen.',
  'Homelab',
  ARRAY['Mini PC', 'Homelab', 'Mac Mini', 'Docker', 'Hardware'],
  'published', '2026-08-22', '2026-08-25', '',
  ARRAY['amazon-mac-mini-m4', 'shopee-beelink-ser5'],
  $markdown$Với sự ra mắt của dòng chip Apple Silicon mới cùng sự bùng nổ của các dòng Mini PC chạy AMD Ryzen/Intel N100, việc tự dựng một **Home Server / Trạm dev chạy ngầm tại nhà** chưa bao giờ dễ dàng và tiết kiệm điện đến thế.

Nhưng nên chọn **Mac Mini M4** hay **Mini PC Linux (Beelink, Minisforum)**?

## Bảng so sánh nhanh thông số

| Tiêu chí | Mac Mini M4 (16GB RAM) | Mini PC Ryzen (Beelink SER5 32GB) |
| --- | --- | --- |
| **Giá thành tham khảo** | ~14.500.000₫ | ~7.500.000₫ |
| **Công suất tiêu thụ khi Idle** | **3W – 5W** (siêu tiết kiệm) | 8W – 12W |
| **Nâng cấp phần cứng** | Không thể nâng cấp RAM/SSD | Nâng cấp thoải mái 64GB RAM & 2 ổ NVMe |
| **Môi trường ảo hóa & Docker** | macOS (Docker chạy qua VM ảo) | Native Linux (Proxmox / Debian / Ubuntu) |
| **Độ ồn & Nhiệt độ** | Hoàn toàn im lặng | Quạt gió êm nhẹ khi tải cao |

## 1. Khi nào nên chọn Mac Mini M4?
* Bạn muốn một chiếc máy vừa làm máy tính phụ để bàn, vừa làm máy build iOS/macOS CI/CD, vừa chạy ngầm các container nhẹ.
* Cần độ bền tuyệt đối, ăn cực ít điện và thiết kế nhỏ gọn, không tiếng quạt.

{{affiliate:amazon-mac-mini-m4|Xem Mac Mini M4 chính hãng}}

## 2. Khi nào nên chọn Mini PC Linux (Beelink / Minisforum)?
* Mục tiêu 100% là **Homelab**: Chạy Proxmox VE, chia 10 container Docker (Nextcloud, Vaultwarden, Plex, Home Assistant, PostgreSQL).
* Muốn chi phí rẻ nhất trên mỗi GB RAM (dễ dàng cắm 32GB hay 64GB RAM DDR4/DDR5 với giá chỉ vài triệu đồng).

{{affiliate:shopee-beelink-ser5|Xem giá Mini PC Beelink SER5}}

## Lời khuyên
Nếu bạn cần một **Home Server thuần túy chạy 24/7 không cần màn hình (headless)**, Mini PC Linux đem lại p/p (hiệu năng trên giá thành) vượt trội. Nếu bạn cần kết hợp làm máy trạm đồ họa/code kiêm server phụ, Mac Mini M4 là khoản đầu tư tuyệt vời.$markdown$
),
(
  'best-quiet-mechanical-keyboards-for-coding',
  'Top bàn phím cơ gõ code êm ái: Không ồn văn phòng, cảm giác gõ sướng tay',
  'Đánh giá các mẫu bàn phím cơ hỗ trợ VIA/QMK, kết nối đa thiết bị, gõ cả ngày không mỏi tay cho Software Engineers.',
  'Keyboards',
  ARRAY['Keyboards', 'Mechanical Keyboard', 'Review', 'Hardware'],
  'published', '2026-08-24', '2026-08-25', '',
  ARRAY['shopee-keychron-k2', 'lazada-nuphy-air75'],
  $markdown$Tiếng clicky giòn tan có thể rất vui tai ở nhà, nhưng trong môi trường văn phòng hoặc khi làm việc đêm cạnh gia đình, một chiếc **bàn phím cơ êm ái nhưng vẫn có độ nảy rõ ràng** là lựa chọn văn minh và tinh tế hơn rất nhiều.

Dưới đây là 2 đại diện xuất sắc nhất năm 2026 được cộng đồng lập trình viên đánh giá cao.

## 1. NuPhy Air75 V2 — Vua bàn phím cơ Low-Profile mang đi lại

Nếu bạn quen gõ bàn phím cánh bướm/Magic Keyboard của MacBook nhưng muốn hành trình phím sâu hơn và nảy hơn:

* **Độ dày:** Siêu mỏng, không cần kê tay (wrist rest).
* **Switch khuyên dùng:** Cowberry hoặc Moss (Tactile êm ái).
* **Kết nối:** Bluetooth 5.1, 2.4GHz không độ trễ và dây Type-C.

{{affiliate:lazada-nuphy-air75|Xem giá NuPhy Air75 V2 trên Lazada}}

## 2. Keychron K2 Pro / Q1 Pro — Bàn phím cơ tiêu chuẩn cho bàn làm việc cố định

Dành cho những ai thích layout 75% đầy đủ hàng F và phím mũi tên riêng biệt:

* **Ưu điểm:** Khung nhôm chắc chắn, mạch hotswap dễ dàng thay switch mà không cần hàn chì.
* **Switch khuyên dùng:** Gateron Jupiter Brown (cho độ nảy vừa phải, âm thanh thock trầm).

{{affiliate:shopee-keychron-k2|Xem giá Keychron K2 Pro trên Shopee}}

---
*Mẹo nhỏ:* Nếu muốn bàn phím êm hơn nữa, bạn có thể thay keycap profile Cherry PBT dày dặn và dán thêm 1 lớp mút lót switch pad vào mạch PCB.$markdown$
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = EXCLUDED.updated_at,
  affiliate_ids = EXCLUDED.affiliate_ids,
  body_markdown = EXCLUDED.body_markdown;
