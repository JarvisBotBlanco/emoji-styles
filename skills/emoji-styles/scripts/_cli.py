#!/usr/bin/env python3
"""Resolve the Emoji Styles CLI without executing a shell."""

from __future__ import annotations

import os
from pathlib import Path
import shlex
import shutil
import subprocess
from typing import Sequence


def resolve_cli() -> list[str]:
    override = os.environ.get("EMOJI_STYLES_CLI")
    if override:
        return shlex.split(override)
    installed = shutil.which("emoji-styles")
    if installed:
        return [installed]
    roots = [Path.cwd(), *Path(__file__).resolve().parents]
    for root in roots:
        binary = root / "node_modules" / ".bin" / "emoji-styles"
        if binary.is_file():
            return [str(binary)]
        entry = root / "packages" / "cli" / "dist" / "cli.js"
        if entry.is_file() and shutil.which("node"):
            return [shutil.which("node") or "node", str(entry)]
    raise SystemExit("Emoji Styles CLI not found. Install/build emoji-styles-cli or set EMOJI_STYLES_CLI.")


def run_cli(arguments: Sequence[str], cwd: Path) -> int:
    completed = subprocess.run([*resolve_cli(), *arguments], cwd=cwd, check=False)
    return completed.returncode
