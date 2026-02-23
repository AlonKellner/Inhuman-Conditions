# Technical Research: PDF Asset Extraction

**Feature**: Automated PDF Asset Extraction
**Research Date**: 2026-02-22
**Status**: Complete

---

## Research Questions

From the Technical Context, the following items required clarification:

1. Best Python libraries for PDF parsing and image extraction
2. Best Python libraries for image processing and pattern matching
3. Best Python libraries for OCR (fallback when PDF text layer unavailable)
4. Approach for interactive bounding box labeling interface
5. Approach for generating web-based validation reports

---

## Decision 1: PDF Parsing and Image Extraction

### **Chosen: PyMuPDF (fitz) v1.27.1+**

### **Rationale:**
- **Performance**: 35x faster than pypdf, 95x faster than pdfplumber
- **Comprehensive features**: Text extraction, image extraction, page layout analysis, metadata handling
- **No external dependencies**: Pure Python binding with embedded C library
- **Active maintenance**: Released v1.27.1 on February 11, 2026
- **All-in-one solution**: Handles both PDF parsing AND PDF-to-image rendering (eliminates need for pdf2image + poppler)
- **Python 3.11+ compatible**

### **Alternatives Considered:**
- **pypdf (v6.7.0)**: Pure Python, simpler for basic tasks, but 35x slower. Good for merging/splitting, insufficient for content extraction at scale.
- **pdfplumber (v0.11.9)**: Superior table extraction with visual debugging, but 95x slower. Rejected as primary choice but keeping as optional dependency for table-heavy PDFs.
- **pdf2image + poppler**: Requires system-level Poppler installation (brew/apt-get), slower than PyMuPDF rendering, adds external dependency complexity.

### **Important Note:**
PyMuPDF uses AGPL license. Since this is an open-source development tool (not SaaS), AGPL is acceptable. Game runtime code remains unaffected (extraction tool is separate).

### **Implementation:**
```python
import fitz  # PyMuPDF

# Parse PDF
doc = fitz.open("catalyzer_cards.pdf")
page = doc[0]

# Extract text
text = page.get_text()

# Extract images
images = page.get_images()

# Render page to image for visual comparison
pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom
img_data = pix.samples  # Raw image bytes
```

---

## Decision 2: Image Processing

### **Chosen: Pillow (PIL Fork) v12.1.1+**

### **Rationale:**
- **Ease of use**: Intuitive API for crop, resize, format conversion
- **Perfect for this use case**: Extracted images need basic manipulation, not advanced computer vision
- **Active maintenance**: Released v12.1.1 on February 11, 2026
- **Python 3.11+ support**: Fully compatible with Python 3.11, 3.12, 3.13
- **Lightweight**: Minimal dependencies, fast pip installation
- **PyMuPDF integration**: PyMuPDF pixmaps convert directly to PIL Image objects

### **Alternatives Considered:**
- **OpenCV (opencv-python v4.13.0.92)**: Excellent performance but overkill for basic operations. Better suited for pattern matching (see Decision 3). Rejected as primary image processor due to complexity overhead.
- **scikit-image**: More research-oriented with NumPy/SciPy integration. Rejected because Pillow is simpler for basic operations.

### **Implementation:**
```python
from PIL import Image
import fitz

# Convert PyMuPDF pixmap to PIL Image
pix = page.get_pixmap()
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

# Basic operations
cropped = img.crop((x1, y1, x2, y2))
resized = cropped.resize((300, 300))
resized.save("maze.png")
```

---

## Decision 3: Pattern Matching for Finding Similar Content

### **Chosen: OpenCV (opencv-python v4.13.0.92+)**

### **Rationale:**
- **Industry standard**: `cv2.matchTemplate()` is the de facto solution for template matching
- **Proven algorithms**: Multiple matching methods (TM_CCOEFF_NORMED, TM_CCORR_NORMED, etc.)
- **Performance**: Rated 5/5 - highly optimized C++ implementations
- **Active maintenance**: Released v4.13.0.92 on February 5, 2026
- **Easy installation**: `pip install opencv-python` with no system dependencies
- **Integration**: Works seamlessly with PIL Images and NumPy arrays

### **Alternatives Considered:**
- **scikit-image**: Provides `match_template()` with normalized cross-correlation. Simpler API but less flexible and slower than OpenCV. Rejected because OpenCV is faster and more feature-rich.
- **Custom similarity algorithms** (SSIM, perceptual hashing): Could implement on top of existing libraries. Rejected because OpenCV template matching handles most use cases; can layer custom algorithms if needed.

### **Implementation:**
```python
import cv2
import numpy as np
from PIL import Image

# Load labeled example (maze region from one PDF)
template = np.array(Image.open("labeled_maze_example.png"))

# Load target PDF page
target_page = np.array(Image.open("catalyzer_page.png"))

# Find matching regions
result = cv2.matchTemplate(target_page, template, cv2.TM_CCOEFF_NORMED)
threshold = 0.8
locations = np.where(result >= threshold)

# Extract matched regions
for pt in zip(*locations[::-1]):
    x, y = pt
    w, h = template.shape[1], template.shape[0]
    matched_region = target_page[y:y+h, x:x+w]
```

**Note**: For scale-invariant matching, implement multi-scale template matching (iterate through template sizes).

---

## Decision 4: OCR for Text Extraction (Fallback)

### **Chosen: PaddleOCR v3.x+**

### **Rationale:**
- **Best accuracy**: State-of-the-art performance, strong with complex layouts and Asian languages
- **Speed**: Faster than Tesseract while maintaining high accuracy
- **Multi-language support**: 80+ languages with robust detection
- **Advanced features**: Supports slanted text detection (non-straight bounding boxes)
- **Active development**: PaddleOCR 3.x and PP-OCRv5 released in 2026
- **Python 3.11 compatible** (note: Python 3.12 has compatibility issues)

### **Alternatives Considered:**
- **Tesseract (pytesseract)**: Google-maintained, 100+ languages, widely adopted. Good accuracy but slower and sometimes misses text. Rejected due to performance and accuracy trade-offs.
- **EasyOCR**: Easy to use, fast inference. However, maintenance status is "Inactive" per Snyk analysis, with unclear Python 3.11 support. Rejected due to maintenance concerns.

### **Implementation:**
```python
from paddleocr import PaddleOCR

# Initialize (one-time setup)
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# Extract text from image
result = ocr.ocr('catalyzer_card.png', cls=True)

# Parse results
for line in result[0]:
    bbox, (text, confidence) = line
    print(f"Text: {text}, Confidence: {confidence}")
```

**Installation:**
```bash
pip install "paddleocr[all]"  # Full installation
```
Requires Python 3.11 (not 3.12 yet) and PaddlePaddle 3.0+.

---

## Decision 5: Interactive Labeling Interface

### **Chosen: Matplotlib with RectangleSelector + PyMuPDF**

### **Rationale:**
- **Pure Python solution**: No GUI frameworks or web servers required
- **Seamless PyMuPDF integration**: PyMuPDF renders PDF pages directly to matplotlib
- **Built-in interactive widget**: `matplotlib.widgets.RectangleSelector` for drag-to-draw rectangles
- **Minimal dependencies**: Matplotlib likely already installed, no additional tools needed
- **Cross-platform**: Works on any system with Python and matplotlib backend
- **Zoom/pan controls**: Built into matplotlib's navigation toolbar
- **Coordinate extraction**: Rectangle selector returns exact pixel coordinates

### **Alternatives Considered:**
- **Tkinter GUI**: More complex to build from scratch. Rejected due to implementation overhead.
- **Streamlit (streamlit-pdf-viewer)**: Requires running web server, displays annotations but doesn't have native drawing tools (view-only). Rejected due to server dependency.
- **LabelImg**: Desktop app for image annotation, but requires installing separate application and doesn't integrate well with Python scripts. Rejected due to external dependency.
- **CVAT**: Enterprise-grade annotation platform, complete overkill for single developer, requires Docker/web server setup. Rejected due to complexity.

### **Implementation:**
```python
import fitz  # PyMuPDF
import matplotlib.pyplot as plt
from matplotlib.widgets import RectangleSelector
import numpy as np
import json

class PDFAnnotator:
    def __init__(self, pdf_path, page_num=0):
        self.doc = fitz.open(pdf_path)
        self.page = self.doc[page_num]
        self.bboxes = []

    def onselect(self, eclick, erelease):
        """Callback for rectangle selection"""
        x1, y1 = eclick.xdata, eclick.ydata
        x2, y2 = erelease.xdata, erelease.ydata
        self.bboxes.append({
            'x1': min(x1, x2), 'y1': min(y1, y2),
            'x2': max(x1, x2), 'y2': max(y1, y2),
            'content_type': 'maze'  # Would prompt user for this
        })
        print(f"Added bbox: {self.bboxes[-1]}")

    def annotate(self):
        # Render PDF page to image
        pix = self.page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
            pix.height, pix.width, pix.n
        )

        # Display in matplotlib
        fig, ax = plt.subplots(figsize=(12, 16))
        ax.imshow(img)

        # Add rectangle selector
        selector = RectangleSelector(
            ax, self.onselect,
            useblit=True,
            button=[1],  # Left mouse button
            minspanx=5, minspany=5,
            spancoords='pixels',
            interactive=True
        )

        plt.show()
        return self.bboxes

    def save_annotations(self, output_path):
        with open(output_path, 'w') as f:
            json.dump(self.bboxes, f, indent=2)

# Usage
annotator = PDFAnnotator('catalyzer_cards.pdf', page_num=0)
bboxes = annotator.annotate()
annotator.save_annotations('labels.json')
```

---

## Decision 6: Web-Based Validation Report

### **Chosen: Jinja2 Templates with Pure HTML/CSS**

### **Rationale:**
- **Zero runtime dependencies**: Generated HTML works in any browser without JavaScript frameworks or servers
- **Minimal Python dependencies**: Only requires `jinja2`
- **True offline viewing**: HTML files with embedded base64 images or relative paths work completely offline
- **Professional appearance**: Modern CSS (Grid/Flexbox) provides excellent layouts
- **Easy customization**: HTML/CSS templates easier to modify than framework-specific code
- **Small file size**: Self-contained HTML files easy to share via email or Git

### **Alternatives Considered:**
- **Plotly/Dash**: Cannot export full layouts to static HTML, requires server for interactive features. Rejected due to server dependency.
- **Static site generators (Jekyll/Hugo)**: Overkill for simple reports, requires learning new templating systems. Rejected due to complexity.
- **pytest-html**: Designed for test reports, not general-purpose validation reports with image comparisons. Rejected as not suitable for this use case.
- **Streamlit**: Requires server to run, cannot create true static offline reports. Rejected due to server dependency.

### **Implementation:**
```python
from jinja2 import Environment, FileSystemLoader
import base64

class ValidationReportGenerator:
    def __init__(self, template_dir='templates'):
        self.env = Environment(loader=FileSystemLoader(template_dir))

    def image_to_base64(self, image_path):
        """Convert image to base64 for embedding in HTML"""
        with open(image_path, 'rb') as f:
            return base64.b64encode(f.read()).decode()

    def generate_report(self, data, output_path='validation_report.html'):
        template = self.env.get_template('validation_report.html')

        # Prepare data with embedded images
        for item in data['comparisons']:
            item['source_img'] = self.image_to_base64(item['source_path'])
            item['extracted_img'] = self.image_to_base64(item['extracted_path'])

        html = template.render(
            title=data['title'],
            summary=data['summary'],
            comparisons=data['comparisons'],
            errors=data.get('errors', []),
            success_rate=data.get('success_rate', 0)
        )

        with open(output_path, 'w') as f:
            f.write(html)

# Usage
generator = ValidationReportGenerator()
data = {
    'title': 'PDF Extraction Validation Report',
    'summary': 'Validated 60 extracted mazes from 11 module PDFs',
    'success_rate': 0.97,  # 97% accuracy
    'comparisons': [
        {
            'page': 1,
            'pdf_name': 'smalltalk_suspect.pdf',
            'source_path': 'source_page1.png',
            'extracted_path': 'mazes/smalltalk-001.png',
            'status': 'Match',
            'confidence': 0.98
        }
    ],
    'errors': ['Page 3: Image resolution below minimum (250x250 < 300x300)']
}
generator.generate_report(data, 'validation_report.html')
```

**Template Structure** (`templates/validation_report.html`):
```html
<!DOCTYPE html>
<html>
<head>
    <title>{{ title }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .summary {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success-rate {
            font-size: 2em;
            color: {{ 'green' if success_rate >= 0.95 else 'orange' }};
        }
        .comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .image-container { text-align: center; }
        .image-container img {
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .error {
            background: #fee;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #f00;
            border-radius: 4px;
        }
        .match { color: green; }
        .mismatch { color: red; }
    </style>
</head>
<body>
    <h1>{{ title }}</h1>

    <div class="summary">
        <p>{{ summary }}</p>
        <p class="success-rate">Success Rate: {{ (success_rate * 100) | round(1) }}%</p>
    </div>

    <h2>Image Comparisons ({{ comparisons | length }} total)</h2>
    {% for comp in comparisons %}
    <div class="comparison">
        <div class="image-container">
            <h3>Source: {{ comp.pdf_name }} (Page {{ comp.page }})</h3>
            <img src="data:image/png;base64,{{ comp.source_img }}" alt="Source" />
        </div>
        <div class="image-container">
            <h3>Extracted: {{ comp.extracted_path }}</h3>
            <img src="data:image/png;base64,{{ comp.extracted_img }}" alt="Extracted" />
            <p class="{{ 'match' if comp.status == 'Match' else 'mismatch' }}">
                Status: {{ comp.status }} (Confidence: {{ (comp.confidence * 100) | round(1) }}%)
            </p>
        </div>
    </div>
    {% endfor %}

    {% if errors %}
    <h2>Error Log ({{ errors | length }} errors)</h2>
    {% for error in errors %}
    <div class="error">{{ error }}</div>
    {% endfor %}
    {% endif %}
</body>
</html>
```

---

## Final Technology Stack

```bash
# Core dependencies
pip install pymupdf>=1.27.1      # PDF parsing + rendering
pip install pillow>=12.1.1       # Image operations
pip install opencv-python>=4.13  # Pattern matching
pip install "paddleocr[all]"     # OCR (fallback, Python 3.11 only)
pip install jinja2>=3.0          # HTML report generation
pip install matplotlib>=3.0      # Interactive labeling

# Optional: for table-heavy PDFs
pip install pdfplumber>=0.11.9   # Superior table extraction
```

### Workflow Integration:

1. **Download**: Use `requests` to download PDFs from robots.management
2. **Labeling**: PyMuPDF renders PDF → Matplotlib displays → RectangleSelector captures bboxes → Save to JSON
3. **Extraction**:
   - PyMuPDF extracts text (PDF text layer) + images
   - PaddleOCR extracts text (if PDF text layer unavailable)
   - OpenCV finds matching patterns based on labeled examples
   - Pillow crops/resizes extracted content
4. **Validation**: Jinja2 generates HTML report with side-by-side comparisons
5. **Integration**: Python script updates catalyzerCards.ts (TypeScript) and copies assets to public/

---

## Constraints Satisfied

✅ **Minimal dependencies**: All libraries are pip-installable, no system dependencies (except Python 3.11)
✅ **Cross-platform**: Works on macOS, Linux, Windows
✅ **Performance**: PyMuPDF 35x faster than alternatives, meets <30min total extraction time
✅ **Accuracy**: PaddleOCR state-of-the-art, OpenCV proven pattern matching, target 95%+ accuracy achievable
✅ **Offline capability**: Jinja2 generates true offline HTML reports, no server needed
✅ **Developer-friendly**: Matplotlib labeling interface simple for single developer, no team collaboration overhead
✅ **Integration**: All libraries work together seamlessly (PyMuPDF → Pillow → OpenCV → Jinja2)

---

## License Considerations

- **PyMuPDF**: AGPL license - Acceptable for open-source development tool
- **Pillow**: HPND license - Permissive, no restrictions
- **OpenCV**: Apache 2.0 license - Permissive, no restrictions
- **PaddleOCR**: Apache 2.0 license - Permissive, no restrictions
- **Jinja2**: BSD 3-Clause license - Permissive, no restrictions
- **Matplotlib**: PSF license - Permissive, no restrictions

All chosen libraries are compatible with the game's CC BY-NC-SA 4.0 license. The extraction tool is a development utility, not distributed with the game runtime.

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | Claude Sonnet 4.5 | Initial research complete |
