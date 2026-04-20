from __future__ import annotations

from pipeline import build_static_assets


def main() -> None:
    summary = build_static_assets()
    print("[OK] static data build completed")
    print(f" - timetable PDFs: {', '.join(summary['timetable_pdfs'])}")
    print(f" - unique courses: {summary['course_count']}")
    print(f" - syllabus chunks: {summary['chunk_count']}")
    print(
        " - validation: "
        f"{summary['validation']['passed']}/{summary['validation']['total']} "
        f"(pass_rate={summary['validation']['pass_rate']:.2%})"
    )


if __name__ == "__main__":
    main()
