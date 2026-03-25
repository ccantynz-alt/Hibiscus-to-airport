import os
from pathlib import Path
from typing import Dict, Any

AGENTS_DIR = Path(__file__).resolve().parent / "agents"

def _read_agent_md(agent_id: str) -> str:
    name = agent_id if agent_id.endswith(".md") else f"{agent_id}.md"
    p = AGENTS_DIR / name
    if not p.exists():
        raise FileNotFoundError(f"Missing agent prompt: {p}")
    return p.read_text(encoding="utf-8")

def run_agent_local_stub(agent_id: str, user_message: str, context: Dict[str, Any]) -> Dict[str, Any]:
    prompt = _read_agent_md(agent_id)
    return {
        "ok": True,
        "mode": "stub",
        "agentId": agent_id,
        "note": "OPENAI_API_KEY not configured; returning a structured stub response.",
        "promptPreview": prompt[:400],
        "userMessage": user_message,
        "context": context,
        "result": {
            "summary": "Stub run. Configure OPENAI_API_KEY in Render to enable real agent reasoning.",
            "nextSteps": [
                "Set OPENAI_API_KEY in Render Environment (backend service).",
                "Optionally set OPENAI_MODEL (default in code: gpt-5-mini).",
                "Re-run agent from the cockpit."
            ],
        },
    }

def run_agent_openai(agent_id: str, user_message: str, context: Dict[str, Any]) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return run_agent_local_stub(agent_id, user_message, context)

    from openai import OpenAI

    # Safer default than "gpt-5" for many accounts; override via OPENAI_MODEL in Render.
    model = (os.getenv("OPENAI_MODEL") or "gpt-5-mini").strip()
    system = _read_agent_md(agent_id)

    client = OpenAI(api_key=api_key)

    resp = client.responses.create(
        model=model,
        input=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"CONTEXT (json): {context}\\n\\nUSER: {user_message}"}
        ],
        max_output_tokens=1200,
    )

    text = ""
    try:
        text = resp.output_text
    except Exception:
        text = str(resp)

    return {
        "ok": True,
        "mode": "openai",
        "agentId": agent_id,
        "model": model,
        "resultText": text,
    }