from __future__ import annotations

from pipeline import build_static_assets


def main() -> None:
    summary = build_static_assets()
    print("[OK] timetable data refreshed")
    print(f" - unique courses: {summary['course_count']}")


if __name__ == "__main__":
    main()
