from pathlib import Path
from pptx.dml.color import RGBColor


def get_theme(theme_name="business"):

    base = Path("assets/themes") / theme_name

    return {

        "background": base / "background.jpg",

        "logo": base / "logo.png",

        "title_font": "Aptos",

        "body_font": "Aptos",

        "title_size": 28,

        "body_size": 20,

        "title_color": RGBColor(30, 30, 30),

        "body_color": RGBColor(50, 50, 50)

    }