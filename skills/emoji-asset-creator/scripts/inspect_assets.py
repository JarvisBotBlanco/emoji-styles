#!/usr/bin/env python3
"""Inspect raster assets with the Emoji Styles pipeline."""

from __future__ import annotations

import argparse
from _cli import run_cli


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="Asset file or directory")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    return run_cli(["assets", "inspect", args.input, *(["--json"] if args.json else [])])


if __name__ == "__main__":
    raise SystemExit(main())
