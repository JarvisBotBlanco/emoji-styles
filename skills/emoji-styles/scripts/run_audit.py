#!/usr/bin/env python3
"""Run the deterministic Emoji Styles source audit."""

from __future__ import annotations

import argparse
from pathlib import Path
from _cli import run_cli


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument("--target", default=".", help="Source path relative to the project")
    parser.add_argument("--format", choices=("terminal", "json", "sarif"), default="terminal")
    args = parser.parse_args()
    project = Path(args.project).resolve()
    return run_cli(["audit", args.target, "--format", args.format], project)


if __name__ == "__main__":
    raise SystemExit(main())
