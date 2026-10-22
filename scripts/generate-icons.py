"""Regenerate the Axlori Resolve PNG icons (apple touch + PWA sizes).

Run from the repository root:
    python3 scripts/generate-icons.py

Requires Pillow. The favicon itself is the hand-written app/icon.svg; these
PNG renders exist for clients that do not support SVG favicons.
"""

from PIL import Image, ImageDraw

BRAND_BLUE = (37, 99, 235, 255)
NAVY = (23, 37, 84, 255)
WHITE = (255, 255, 255, 255)


def render_logo(size: int) -> Image.Image:
    scale = 4
    w = size * scale
    img = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - scale, w - scale], radius=int(w * 14 / 64), fill=BRAND_BLUE)
    pts = [(18 * w / 64, 33.5 * w / 64), (28 * w / 64, 43 * w / 64), (47 * w / 64, 22 * w / 64)]
    sw = int(6.5 * w / 64)
    d.line(pts, fill=WHITE, width=sw, joint="curve")
    r = sw / 2
    for x, y in pts:
        d.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)


def render_padded(size: int) -> Image.Image:
    bg = Image.new("RGBA", (size, size), NAVY)
    icon = render_logo(int(size * 0.78))
    off = (size - icon.size[0]) // 2
    bg.paste(icon, (off, off), icon)
    return bg


if __name__ == "__main__":
    render_logo(180).save("app/apple-icon.png")
    render_padded(192).convert("RGB").save("public/icons/icon-192.png")
    render_padded(512).convert("RGB").save("public/icons/icon-512.png")
    print("Icons regenerated.")
