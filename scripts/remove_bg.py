from PIL import Image
import glob
import os

files = [
    r"d:\dự án GPT\ANTI_Phase20_avatar_mascot_fix\public\mascots\pepe_mascot_avatar.png",
    r"d:\dự án GPT\ANTI_Phase20_avatar_mascot_fix\public\mascots\pepe_mascot_tutor.png",
    r"d:\dự án GPT\ANTI_Phase20_avatar_mascot_fix\public\mascots\pepe_mascot_celebrate.png",
    r"d:\dự án GPT\ANTI_Phase20_avatar_mascot_fix\public\mascots\pepe_mascot_thinking.png",
    r"d:\dự án GPT\ANTI_Phase20_avatar_mascot_fix\public\mascots\pepe_mascot_sad.png",
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}, does not exist")
        continue
    img = Image.open(filepath).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # If pixel is close to white (background), make it transparent
        if r > 230 and g > 230 and b > 230:
            new_data.append((255, 255, 255, 0))
        elif r > 200 and g > 200 and b > 200:
            # Smooth antialiased edge fallback
            alpha = int(255 * (1 - (r - 200) / 35.0))
            new_data.append((r, g, b, max(0, min(255, alpha))))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(filepath, "PNG")
    print(f"Successfully processed {os.path.basename(filepath)}")

print("Done processing transparent backgrounds!")
