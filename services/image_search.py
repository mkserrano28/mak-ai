from pathlib import Path

IMAGES = {
    "monkey": "assets/images/monkey.png",
    "guitar": "assets/images/guitar.png",
    "python": "assets/images/python.png",
    "ai": "assets/images/ai.png",
}


def get_slide_image(title):

    title = title.lower()

    for keyword, image in IMAGES.items():
        if keyword in title:
            return Path(image)

    return Path("assets/images/default.png")