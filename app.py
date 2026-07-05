"""
app.py — Inkwell deployed on Streamlit Cloud
Reads index.html, inlines all local JS files, and serves the full app.
"""

import re
import streamlit as st
from pathlib import Path

st.set_page_config(
    page_title="Inkwell — Write Beautifully",
    page_icon="✒️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Hide Streamlit chrome so Inkwell fills the full viewport ──────────────
st.markdown("""
<style>
  /* Hide all Streamlit UI chrome */
  #MainMenu, header, footer,
  [data-testid="stToolbar"],
  [data-testid="stDecoration"],
  [data-testid="stStatusWidget"] { display: none !important; }

  /* Remove all padding so the iframe fills the window */
  .main .block-container {
    padding: 0 !important;
    max-width: 100% !important;
  }
  .stApp { overflow: hidden; }
  iframe { border: none; display: block; }
</style>
""", unsafe_allow_html=True)


@st.cache_data
def build_inlined_html() -> str:
    """Read index.html, replace every <script src="js/..."> with an inline block."""
    base = Path(__file__).parent
    html = (base / "index.html").read_text(encoding="utf-8")

    def inline_script(match: re.Match) -> str:
        src = match.group(1)          # e.g. js/core.js
        js_path = base / src
        if js_path.exists():
            code = js_path.read_text(encoding="utf-8")
            return f"<script>/* {src} */\n{code}\n</script>"
        return match.group(0)          # leave unchanged if not found

    # Replace <script src="js/anything.js"></script>
    html = re.sub(
        r'<script\s+src="(js/[^"]+)"\s*></script>',
        inline_script,
        html,
    )
    return html


html_content = build_inlined_html()

# Render at full viewport height (Streamlit Cloud viewport is ~900 px on average,
# but scrolling=True lets the inner app handle its own scroll).
st.components.v1.html(
    html_content,
    height=900,
    scrolling=False,
)
