from __future__ import annotations

import json

from pipeline import TEST_SCENARIOS_PATH, load_runtime_bundle, run_validation


def main() -> None:
    if not TEST_SCENARIOS_PATH.exists():
        print("test_scenarios.json not found. Run `python ingest.py` first.")
        return

    with TEST_SCENARIOS_PATH.open("r", encoding="utf-8") as file:
        scenarios = json.load(file)

    report = run_validation(load_runtime_bundle(), scenarios)
    summary = report["summary"]
    print("[OK] validation completed")
    print(
        f" - passed: {summary['passed']}/{summary['total']} "
        f"(pass_rate={summary['pass_rate']:.2%})"
    )


if __name__ == "__main__":
    main()
