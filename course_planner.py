from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pipeline import COURSES_PATH, RULES_PATH, load_runtime_bundle, normalize_space, recommend_courses


def list_plannable_majors() -> list[str]:
    if not COURSES_PATH.exists():
        return []
    with COURSES_PATH.open("r", encoding="utf-8") as file:
        payload = json.load(file)
    return sorted(payload.get("majors", []))


def build_study_plan(
    major_name: str,
    completed_text: str,
    limit: int = 8,
    blocked_limit: int = 4,
    semester: str | None = None,
    interests: str = "",
    goals: str = "",
    selected_track: str = "",
) -> dict[str, Any]:
    bundle = load_runtime_bundle()
    if not semester and Path(RULES_PATH).exists():
        with RULES_PATH.open("r", encoding="utf-8") as file:
            rules = json.load(file)
        semester = rules.get("default_semester", "all")

    result = recommend_courses(
        bundle,
        {
            "major": major_name,
            "selected_track": selected_track,
            "target_semester": semester or "all",
            "interests": interests,
            "goals": goals,
            "completed_courses": completed_text,
        },
    )
    return {
        "major": major_name,
        "matched_completed": result.get("matched_completed", []),
        "unmatched_input": result.get("unmatched_completed", []),
        "recommendations": result.get("ready", [])[:limit],
        "blocked": result.get("blocked", [])[:blocked_limit],
    }


def main() -> None:
    majors = list_plannable_majors()
    if not majors:
        print("courses.json not found. Run `python ingest.py` first.")
        return
    print(f"[OK] plannable majors: {len(majors)}")
    print(f" - first major: {normalize_space(majors[0])}")


if __name__ == "__main__":
    main()
