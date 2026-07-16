#!/usr/bin/env python3
"""Preview or generate a manifest-backed custom provider."""

from __future__ import annotations

import argparse
from _cli import approval_flags, run_cli


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("assets", help="Normalized asset directory")
    parser.add_argument("--output", required=True, help="Provider output directory")
    parser.add_argument("--id", required=True, help="Safe provider id")
    parser.add_argument("--provenance", required=True)
    parser.add_argument("--mapping")
    parser.add_argument("--label")
    parser.add_argument("--version", default="1.0.0")
    parser.add_argument("--license")
    parser.add_argument("--ownership")
    parser.add_argument("--yes", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    command = ["assets", "build", args.assets, "--output", args.output, "--id", args.id, "--version", args.version, "--provenance", args.provenance]
    for flag in ("mapping", "label", "license", "ownership"):
        value = getattr(args, flag)
        if value:
            command.extend([f"--{flag}", value])
    command.extend(approval_flags(args))
    return run_cli(command)


if __name__ == "__main__":
    raise SystemExit(main())
