#!/usr/bin/env python3
"""Run Emoji Styles configuration and resolution validation."""

from __future__ import annotations

import argparse
from pathlib import Path
from _cli import run_cli


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project", nargs="?", default=".", help="Project root")
    parser.add_argument("--json", action="store_true", help="Emit structured command results")
    args = parser.parse_args()
    project = Path(args.project).resolve()
    suffix = ["--json"] if args.json else []
    doctor = run_cli(["doctor", *suffix], project)
    tests = run_cli(["test", *suffix], project)
    return max(doctor, tests)


if __name__ == "__main__":
    raise SystemExit(main())
