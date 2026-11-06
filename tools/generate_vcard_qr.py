#!/usr/bin/env python3
"""
CV/tools/generate_vcard_qr.py — Standalone vCard QR Code SVG Generator (Ticket 062).

Reads contact details from `georgy_dunaev.vcf` (or `data/cv_data.yaml`) and outputs a clean,
scalable vector SVG at `assets/qr_vcard.svg` styled with custom branding colors.
Works 100% offline with zero network calls.
"""

from pathlib import Path
try:
    import qrcode
    import qrcode.image.svg
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False

REPO_DIR = Path(__file__).resolve().parent.parent
VCF_PATH = REPO_DIR / "georgy_dunaev.vcf"
ASSETS_DIR = REPO_DIR / "assets"
OUT_SVG = ASSETS_DIR / "qr_vcard.svg"

DEFAULT_VCARD = """BEGIN:VCARD
VERSION:3.0
FN:Georgy Dunaev
N:Dunaev;Georgy;;;
TITLE:Software Engineer & Formal Verification Specialist
ORG:Independent / University of Potsdam
EMAIL;TYPE=INTERNET,PREF:georgedunaev@gmail.com
URL;TYPE=PREF:https://georgydunaev.github.io
URL:https://obeliskproofassistant.github.io
ADR;TYPE=HOME:;;Berlin / Potsdam;;;Germany
END:VCARD"""


def load_vcard_payload(vcf_path: Path = VCF_PATH) -> str:
    """Load vCard 3.0 payload from disk or return canonical fallback."""
    if vcf_path.is_file():
        text = vcf_path.read_text(encoding="utf-8").strip()
        if "BEGIN:VCARD" in text and "END:VCARD" in text:
            return text
    return DEFAULT_VCARD


def generate_vcard_svg(output_path: Path = OUT_SVG, primary_color: str = "#1e293b") -> Path:
    """Generate scalable SVG QR code encoding the vCard payload."""
    if not HAS_QRCODE:
        raise RuntimeError("qrcode library is required. Install via: pip install qrcode")
    payload = load_vcard_payload()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=qrcode.image.svg.SvgPathImage,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    svg_img = qr.make_image(
        attrib={"class": "vcard-qr-svg"},
        path_attrib={"fill": primary_color, "stroke": "none"},
    )
    svg_img.save(str(output_path))
    return output_path


def main() -> int:
    out = generate_vcard_svg()
    print(f"Generated vCard SVG QR code: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
