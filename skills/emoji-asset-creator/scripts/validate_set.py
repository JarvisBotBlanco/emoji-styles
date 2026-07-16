#!/usr/bin/env python3
"""Validate a normalized custom emoji collection."""

from __future__ import annotations

import argparse
from _cli import run_cli


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input")
    parser.add_argument("--size", type=int, default=256)
    parser.add_argument("--format", choices=("png", "webp", "avif"), default="webp")
    parser.add_argument("--safe-area", type=float, default=0.76)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    command = ["assets", "validate", args.input, "--size", str(args.size), "--format", args.format, "--safe-area", str(args.safe_area)]
    if args.json:
        command.append("--json")
    return run_cli(command)


if __name__ == "__main__":
    raise SystemExit(main())
