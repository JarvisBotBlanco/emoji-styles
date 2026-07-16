#!/usr/bin/env python3
"""Preview or apply deterministic asset normalization."""

from __future__ import annotations

import argparse
from _cli import approval_flags, run_cli


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--size", type=int, default=256)
    parser.add_argument("--format", choices=("png", "webp", "avif"), default="webp")
    parser.add_argument("--safe-area", type=float, default=0.76)
    parser.add_argument("--yes", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    return run_cli(["assets", "normalize", args.input, args.output, "--size", str(args.size), "--format", args.format, "--safe-area", str(args.safe_area), *approval_flags(args)])


if __name__ == "__main__":
    raise SystemExit(main())
