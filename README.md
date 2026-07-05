# Inkwell ✒️

A beautiful, feature-rich writing app — deployed on Streamlit Cloud.

## Deploy to Streamlit Cloud

1. Push this repo to GitHub (the whole folder as the repo root).
2. Go to [share.streamlit.io](https://share.streamlit.io) → **New app**.
3. Set:
   - **Repository**: your GitHub repo
   - **Branch**: `main`
   - **Main file path**: `app.py`
4. Click **Deploy** — done.

## Local development

```bash
pip install -r requirements.txt
streamlit run app.py
```

## File structure

```
.
├── app.py              # Streamlit entry point (inlines all JS at runtime)
├── index.html          # Inkwell app shell
├── js/                 # All JS modules (43 files)
├── requirements.txt
├── .streamlit/
│   └── config.toml
└── README.md
```
