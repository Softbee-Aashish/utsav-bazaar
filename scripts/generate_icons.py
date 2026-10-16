import os
import math
from PIL import Image, ImageDraw

out_dir = r"D:\utsav-bazaar\public\assets\icons"
os.makedirs(out_dir, exist_ok=True)

SIZE = 128

def create_base():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    return img, draw

# Colors
GOLD_DARK = (180, 83, 9, 255)
GOLD_MAIN = (212, 175, 55, 255)
GOLD_LIGHT = (255, 224, 130, 255)
WHITE = (255, 255, 255, 255)
EMERALD = (16, 185, 129, 255)
BLUE = (59, 130, 246, 255)
PURPLE = (168, 85, 247, 255)
RED = (239, 68, 68, 255)

def draw_disc_bg(draw, color):
    # Gradient-like circle background
    draw.ellipse([8, 8, SIZE-8, SIZE-8], fill=(20, 14, 28, 240), outline=GOLD_MAIN, width=3)
    draw.ellipse([14, 14, SIZE-14, SIZE-14], outline=(GOLD_MAIN[0], GOLD_MAIN[1], GOLD_MAIN[2], 70), width=1)

# 1. Overview & KPIs (Bar chart + trending line)
def make_icon_overview():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Bars
    bars = [(30, 75, 44, 98), (50, 55, 64, 98), (70, 42, 84, 98), (90, 30, 104, 98)]
    for x1, y1, x2, y2 in bars:
        draw.rounded_rectangle([x1, y1, x2, y2], radius=3, fill=GOLD_MAIN, outline=GOLD_LIGHT, width=1)
    # Trend arrow
    draw.line([(32, 68), (55, 48), (75, 38), (98, 24)], fill=EMERALD, width=3)
    draw.polygon([(98, 20), (106, 24), (98, 30)], fill=EMERALD)
    img.save(os.path.join(out_dir, "icon-overview.png"))

# 2. Orders & Fulfillment (Shopping bag with ribbon/tag)
def make_icon_orders():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Bag body
    draw.rounded_rectangle([32, 46, 96, 102], radius=8, fill=GOLD_DARK, outline=GOLD_LIGHT, width=2)
    # Bag handle
    draw.arc([46, 26, 82, 58], start=180, end=0, fill=GOLD_LIGHT, width=3)
    # Center emblem
    draw.ellipse([54, 64, 74, 84], fill=GOLD_MAIN, outline=WHITE, width=1)
    img.save(os.path.join(out_dir, "icon-orders.png"))

# 3. Products & Catalog (Package box + sparkle)
def make_icon_products():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # 3D Box perspective
    # Top lid
    top_poly = [(64, 30), (96, 46), (64, 62), (32, 46)]
    draw.polygon(top_poly, fill=GOLD_LIGHT, outline=GOLD_DARK)
    # Left face
    left_poly = [(32, 46), (64, 62), (64, 98), (32, 82)]
    draw.polygon(left_poly, fill=GOLD_MAIN, outline=GOLD_DARK)
    # Right face
    right_poly = [(64, 62), (96, 46), (96, 82), (64, 98)]
    draw.polygon(right_poly, fill=GOLD_DARK, outline=GOLD_MAIN)
    # Ribbon lines
    draw.line([(64, 30), (64, 98)], fill=WHITE, width=2)
    img.save(os.path.join(out_dir, "icon-products.png"))

# 4. Customers CRM (User silhouette with gold crown)
def make_icon_customers():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Head
    draw.ellipse([49, 36, 79, 66], fill=GOLD_LIGHT, outline=GOLD_MAIN, width=2)
    # Body
    draw.pieslice([28, 64, 100, 120], start=180, end=0, fill=GOLD_MAIN, outline=GOLD_LIGHT, width=2)
    # Royal star / crown on chest
    draw.polygon([(64, 72), (67, 80), (75, 80), (69, 85), (71, 93), (64, 88), (57, 93), (59, 85), (53, 80), (61, 80)], fill=WHITE)
    img.save(os.path.join(out_dir, "icon-customers.png"))

# 5. Billing & Invoices (Document with rupee symbol and seal)
def make_icon_billing():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Sheet of paper
    draw.rounded_rectangle([36, 28, 92, 100], radius=5, fill=(255, 252, 240, 255), outline=GOLD_MAIN, width=2)
    # Fold corner
    draw.polygon([(76, 28), (92, 44), (76, 44)], fill=GOLD_DARK)
    # Text lines
    for y in [48, 58, 68]:
        draw.line([(44, y), (82, y)], fill=(120, 100, 70, 200), width=2)
    # Gold wax seal
    draw.ellipse([64, 76, 86, 98], fill=GOLD_MAIN, outline=GOLD_DARK, width=2)
    img.save(os.path.join(out_dir, "icon-billing.png"))

# 6. Discounts & Festive Banner (Tag with percentage)
def make_icon_discounts():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Hanging tag rotated
    tag = [(40, 30), (74, 30), (96, 56), (66, 92), (32, 60)]
    draw.polygon(tag, fill=GOLD_MAIN, outline=GOLD_LIGHT, width=2)
    # Eyelet
    draw.ellipse([44, 36, 52, 44], fill=(20, 14, 28, 255), outline=WHITE, width=1)
    # Percent mark
    draw.ellipse([54, 52, 60, 58], fill=WHITE)
    draw.line([(52, 74), (72, 48)], fill=WHITE, width=2)
    draw.ellipse([66, 64, 72, 70], fill=WHITE)
    img.save(os.path.join(out_dir, "icon-discounts.png"))

# 7. Google Sheets Sync (Spreadsheet grid + sync arrows)
def make_icon_gsheet():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Table grid
    draw.rounded_rectangle([30, 34, 98, 94], radius=6, fill=(16, 100, 60, 240), outline=EMERALD, width=2)
    # Inner table lines
    draw.line([(30, 52), (98, 52)], fill=EMERALD, width=2)
    draw.line([(30, 72), (98, 72)], fill=EMERALD, width=1)
    draw.line([(52, 34), (52, 94)], fill=EMERALD, width=1)
    draw.line([(76, 34), (76, 94)], fill=EMERALD, width=1)
    # Live Sync Indicator
    draw.ellipse([88, 22, 106, 40], fill=EMERALD, outline=WHITE, width=2)
    img.save(os.path.join(out_dir, "icon-gsheet.png"))

# 8. Customer Reviews (5-Point Shahi Golden Star with Sparkle)
def make_icon_reviews():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Big Star
    points = []
    cx, cy = 64, 64
    r_outer, r_inner = 34, 15
    for i in range(10):
        angle = i * math.pi / 5 - math.pi / 2
        r = r_outer if i % 2 == 0 else r_inner
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=GOLD_LIGHT, outline=GOLD_MAIN, width=2)
    img.save(os.path.join(out_dir, "icon-reviews.png"))

# 9. WhatsApp Direct Button Icon
def make_icon_whatsapp():
    img, draw = create_base()
    # Green circular badge
    draw.ellipse([10, 10, SIZE-10, SIZE-10], fill=(37, 211, 102, 255), outline=WHITE, width=3)
    # Speech bubble tail
    draw.polygon([(30, 92), (32, 76), (46, 86)], fill=(37, 211, 102, 255))
    draw.line([(30, 92), (46, 86)], fill=WHITE, width=2)
    # Phone handset curve
    draw.arc([42, 38, 86, 86], start=45, end=225, fill=WHITE, width=6)
    draw.ellipse([40, 58, 54, 76], fill=WHITE)
    draw.ellipse([74, 40, 88, 58], fill=WHITE)
    img.save(os.path.join(out_dir, "icon-whatsapp.png"))

# 10. Printable Bill / Packing Slip Icon
def make_icon_print():
    img, draw = create_base()
    draw_disc_bg(draw, GOLD_MAIN)
    # Printer base
    draw.rounded_rectangle([32, 54, 96, 92], radius=6, fill=GOLD_DARK, outline=GOLD_LIGHT, width=2)
    # Paper coming out top
    draw.rounded_rectangle([42, 26, 86, 54], radius=3, fill=(255, 255, 255, 255), outline=GOLD_MAIN, width=1)
    # Paper coming out bottom
    draw.rounded_rectangle([42, 76, 86, 104], radius=3, fill=(255, 255, 255, 255), outline=GOLD_MAIN, width=1)
    # Light button
    draw.ellipse([84, 62, 90, 68], fill=EMERALD)
    img.save(os.path.join(out_dir, "icon-print.png"))

make_icon_overview()
make_icon_orders()
make_icon_products()
make_icon_customers()
make_icon_billing()
make_icon_discounts()
make_icon_gsheet()
make_icon_reviews()
make_icon_whatsapp()
make_icon_print()
print("All 10 luxury PNG icons generated successfully!")
