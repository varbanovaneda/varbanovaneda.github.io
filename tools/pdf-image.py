"""Resample one image to the pixel width it is printed at, as a compact JPEG (used by make-pdf.js)."""
import sys
from PIL import Image
src, out, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGB")
if im.width > width:
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
im.save(out, "JPEG", quality=80, optimize=True, progressive=True, subsampling=0)
