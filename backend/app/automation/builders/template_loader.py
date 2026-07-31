from pathlib import Path
import json

TEMPLATE_DIR = Path(__file__).parent / "templates"


def load_template(template_name: str):

    template_path = TEMPLATE_DIR / f"{template_name}.json"

    with open(template_path, "r", encoding="utf-8") as f:
        return json.load(f)