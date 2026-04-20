from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any

import fitz
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
PDF_DIR = DATA_DIR / "pdfs"
TMP_DIR = BASE_DIR / "tmp"

COURSES_PATH = DATA_DIR / "courses.json"
PREREQUISITES_PATH = DATA_DIR / "prerequisites.json"
SYLLABUS_CHUNKS_PATH = DATA_DIR / "syllabus_chunks.json"
EMBEDDINGS_PATH = DATA_DIR / "embeddings.bin"
RULES_PATH = DATA_DIR / "rules.json"
MANIFEST_PATH = DATA_DIR / "manifest.json"
TEST_SCENARIOS_PATH = DATA_DIR / "test_scenarios.json"

LEGACY_TIMETABLE_COURSES_PATH = DATA_DIR / "timetable_courses.json"

TRACKS_PATH = DATA_DIR / "major_tracks.json"

HEADER_TOKENS = {
    "\ud559\ub144",
    "\uc774\uc218",
    "\uad6c\ubd84",
    "\uacfc\ubaa9\ucf54\ub4dc",
    "\ubd84\ubc18",
    "\uad50\uacfc\ubaa9\uba85",
    "\ud559\uc810",
    "\uad50\uc218\uba85",
    "\uc218\uc5c5\uc2dc\uac04",
    "\uac15\uc758\uc2e4",
    "\uad50\uc591\uc601\uc5ed",
}
COURSE_CODE_RE = re.compile(r"^\d{5}$")
GRADE_RE = re.compile(r"^[1-4]$")
SECTION_LINE_RE = re.compile(r"^(\d{3})\s*(.*)$")
CREDIT_RE = re.compile(r"^\d(?:\.\d)?$")
SEMESTER_PATTERNS = (
    re.compile(r"(20\d{2})\s*[-_ ]\s*([12])\s*\ud559\uae30"),
    re.compile(r"(20\d{2})\s*[-_ ]\s*([12])"),
    re.compile(r"(20\d{2})\ud559\ub144\ub3c4\s*([12])\ud559\uae30"),
)
TOKEN_RE = re.compile(r"[0-9A-Za-z\uac00-\ud7a3]+")
FOUNDATION_KEYWORDS = (
    "\uae30\ucd08",
    "\uc785\ubb38",
    "\uac1c\ub860",
    "\uc6d0\ub9ac",
    "\uc774\ud574",
    "\uae30\ubcf8",
)
ADVANCED_KEYWORDS = (
    "\uc751\uc6a9",
    "\uc2ec\ud654",
    "\uace0\uae09",
    "\ud504\ub85c\uc81d\ud2b8",
    "\ucea1\uc2a4\ud1a4",
    "\uc2e4\uc2b5",
    "\uc124\uacc4",
)
SYLLABUS_HINTS = (
    "\uc218\uc5c5\uacc4\ud68d",
    "\uac15\uc758\uacc4\ud68d",
    "\uac15\uc758\uacc4\ud68d\uc11c",
    "\uc218\uc5c5\uacc4\ud68d\uc11c",
    "syllabus",
)
TIMETABLE_HINTS = ("\uc2dc\uac04\ud45c",)
EMBED_DIMENSIONS = 256
WORD_TOKEN_WEIGHT = 1.0
NGRAM_TOKEN_WEIGHT = 0.35

SYNONYMS = {
    "\uac1c\ubc1c": ["\ud504\ub85c\uadf8\ub798\ubc0d", "\ucf54\ub529", "\uc18c\ud504\ud2b8\uc6e8\uc5b4"],
    "\ucf54\ub529": ["\ud504\ub85c\uadf8\ub798\ubc0d", "\uac1c\ubc1c"],
    "\ub370\uc774\ud130": ["\ubd84\uc11d", "\ud1b5\uacc4", "DB", "AI"],
    "\uc778\uacf5\uc9c0\ub2a5": ["AI", "\uba38\uc2e0\ub7ec\ub2dd", "\ub525\ub7ec\ub2dd"],
    "\ub124\ud2b8\uc6cc\ud06c": ["\ud1b5\uc2e0", "\ubcf4\uc548", "\uc778\ud504\ub77c"],
    "\ubcf4\uc548": ["\ub124\ud2b8\uc6cc\ud06c", "\uc2dc\uc2a4\ud15c"],
    "\ucf58\ud150\uce20": ["\ubbf8\ub514\uc5b4", "\uc2a4\ud1a0\ub9ac", "\uc601\uc0c1"],
    "\uc601\uc0c1": ["\ubbf8\ub514\uc5b4", "\ucf58\ud150\uce20"],
    "\uad50\uc721": ["\ud559\uc2b5", "\uad50\uc218", "\uc0c1\ub2f4"],
    "\uc0c1\ub2f4": ["\uad50\uc721", "\ubcf5\uc9c0"],
    "\ud589\uc815": ["\uc815\ucc45", "\uacf5\uacf5"],
    "\uacbd\uc601": ["\ub9c8\ucf00\ud305", "\uc7ac\ubb34", "\ud68c\uacc4"],
    "\ubb3c\ub958": ["\uc720\ud1b5", "\ubb34\uc5ed"],
    "\uad00\uad11": ["\ud638\ud154", "\uc11c\ube44\uc2a4"],
    "\uad6d\uc81c": ["\uae00\ub85c\ubc8c", "\ubb34\uc5ed", "\uc678\uad50"],
}


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip()


def canonical_key(text: str) -> str:
    return re.sub(r"[^0-9a-zA-Z\uac00-\ud7a3]+", "", normalize_space(text)).lower()


def parse_grade_value(value: str | int) -> int:
    try:
        number = int(value)
        if 1 <= number <= 4:
            return number
    except Exception:
        pass
    return 2


def semester_sort_key(semester: str) -> tuple[int, int]:
    match = re.fullmatch(r"(20\d{2})-([12])", normalize_space(semester))
    if not match:
        return (0, 0)
    return (int(match.group(1)), int(match.group(2)))


def course_level_score(course_name: str, grade_hint: int) -> int:
    score = grade_hint
    if any(keyword in course_name for keyword in FOUNDATION_KEYWORDS):
        score -= 1
    if any(keyword in course_name for keyword in ADVANCED_KEYWORDS):
        score += 1
    return max(1, min(5, score))


def fnv1a_32(text: str) -> int:
    value = 0x811C9DC5
    for byte in text.encode("utf-8"):
        value ^= byte
        value = (value * 0x01000193) & 0xFFFFFFFF
    return value


def tokenize_text(text: str, synonyms: dict[str, list[str]] | None = None) -> list[str]:
    normalized = normalize_space(text).lower()
    if not normalized:
        return []

    tokens: list[str] = []
    for raw in TOKEN_RE.findall(normalized):
        if len(raw) == 1 and not raw.isdigit():
            continue
        tokens.append(f"w:{raw}")
        for alias in (synonyms or {}).get(raw, []):
            alias_text = normalize_space(alias).lower()
            if alias_text:
                tokens.append(f"w:{alias_text}")
        if len(raw) >= 2:
            max_n = min(4, len(raw))
            for n in range(2, max_n + 1):
                for index in range(0, len(raw) - n + 1):
                    tokens.append(f"g:{raw[index:index + n]}")
    return tokens


def text_to_vector(text: str, dimensions: int = EMBED_DIMENSIONS) -> np.ndarray:
    vector = np.zeros(dimensions, dtype=np.float32)
    tokens = tokenize_text(text, SYNONYMS)
    if not tokens:
        return vector

    counts = Counter(tokens)
    for token, count in counts.items():
        hashed = fnv1a_32(token)
        index = hashed % dimensions
        sign = -1.0 if hashed & 0x80000000 else 1.0
        base_weight = WORD_TOKEN_WEIGHT if token.startswith("w:") else NGRAM_TOKEN_WEIGHT
        weight = (1.0 + math.log(count)) * base_weight
        vector[index] += sign * weight

    norm = float(np.linalg.norm(vector))
    if norm > 0:
        vector /= norm
    return vector


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if a.size == 0 or b.size == 0:
        return 0.0
    return float(np.dot(a, b))


def infer_semester_from_filename(filename: str) -> str:
    for pattern in SEMESTER_PATTERNS:
        match = pattern.search(filename)
        if match:
            return f"{match.group(1)}-{match.group(2)}"
    return "unknown"


def find_pdf_paths() -> list[Path]:
    unique: dict[str, Path] = {}
    for directory in (DATA_DIR, PDF_DIR):
        if not directory.exists():
            continue
        for path in directory.rglob("*.pdf"):
            unique[str(path.resolve()).lower()] = path
    return sorted(unique.values(), key=lambda item: str(item).lower())


def is_timetable_pdf(path: Path) -> bool:
    return any(token in path.stem for token in TIMETABLE_HINTS)


def is_syllabus_pdf(path: Path) -> bool:
    return any(token.lower() in path.stem.lower() for token in SYLLABUS_HINTS)


def find_timetable_pdf_paths() -> list[Path]:
    return [path for path in find_pdf_paths() if is_timetable_pdf(path)]


def find_syllabus_pdf_paths() -> list[Path]:
    return [path for path in find_pdf_paths() if is_syllabus_pdf(path)]


def is_grade_token(token: str) -> bool:
    return bool(GRADE_RE.fullmatch(normalize_space(token)))


def is_course_type_token(token: str) -> bool:
    text = normalize_space(token)
    if not text or len(text) > 4:
        return False
    return bool(re.fullmatch(r"[\uac00-\ud7a3]{2,4}", text))


def is_credit_token(token: str) -> bool:
    return bool(CREDIT_RE.fullmatch(normalize_space(token)))


def is_time_token(token: str) -> bool:
    text = normalize_space(token)
    if not text:
        return False
    if any(day in text for day in ("\uc6d4", "\ud654", "\uc218", "\ubaa9", "\uae08", "\ud1a0", "\uc77c")) and re.search(r"\d", text):
        return True
    return ("\uc9d1\uc911" in text) or ("\uc628\ub77c\uc778" in text) or ("\uc0ac\uc774\ubc84" in text)


def is_row_start(lines: list[str], index: int) -> bool:
    if index + 2 >= len(lines):
        return False
    return (
        is_grade_token(lines[index])
        and is_course_type_token(lines[index + 1])
        and bool(COURSE_CODE_RE.fullmatch(lines[index + 2]))
    )


def is_major_header(lines: list[str], index: int) -> bool:
    line = normalize_space(lines[index])
    if not line or line in HEADER_TOKENS:
        return False
    if is_grade_token(line) or is_course_type_token(line):
        return False
    if COURSE_CODE_RE.fullmatch(line) or CREDIT_RE.fullmatch(line):
        return False
    if not (
        line.endswith(("\ud559\uacfc", "\ud559\ubd80", "\uc804\uacf5"))
        or ("\uc735\ud569\uc804\uacf5" in line)
    ):
        return False
    return index + 1 < len(lines) and is_row_start(lines, index + 1)


def parse_course_row(
    lines: list[str],
    start_index: int,
    major_name: str,
    semester: str,
    source_pdf: str,
    page: int,
) -> tuple[dict[str, Any] | None, int]:
    index = start_index
    grade = lines[index]
    completion_type = lines[index + 1]
    course_code = lines[index + 2]
    index += 3

    section = ""
    course_name_parts: list[str] = []
    if index < len(lines):
        section_line = lines[index]
        match = SECTION_LINE_RE.match(section_line)
        if match:
            section = match.group(1)
            tail = normalize_space(match.group(2))
            if tail:
                course_name_parts.append(tail)
            index += 1
        elif re.fullmatch(r"\d{3}", section_line):
            section = section_line
            index += 1

    while index < len(lines):
        token = lines[index]
        if is_credit_token(token):
            break
        if is_row_start(lines, index) or is_major_header(lines, index):
            break
        course_name_parts.append(token)
        index += 1

    course_name = normalize_space(" ".join(course_name_parts))

    credit = None
    if index < len(lines) and is_credit_token(lines[index]):
        credit = float(lines[index])
        index += 1

    professor_parts: list[str] = []
    while index < len(lines):
        token = lines[index]
        if is_time_token(token):
            break
        if is_row_start(lines, index) or is_major_header(lines, index):
            break
        professor_parts.append(token)
        index += 1
    professor = normalize_space(" ".join(professor_parts))

    time_parts: list[str] = []
    while index < len(lines) and is_time_token(lines[index]):
        time_parts.append(lines[index])
        index += 1
    class_time = normalize_space(" ".join(time_parts))

    room_parts: list[str] = []
    while index < len(lines):
        token = lines[index]
        if token in HEADER_TOKENS:
            index += 1
            continue
        if is_row_start(lines, index) or is_major_header(lines, index):
            break
        room_parts.append(token)
        index += 1
    classroom = normalize_space(" ".join(room_parts))

    if not major_name or not course_name:
        return None, max(index, start_index + 1)

    record = {
        "semester": semester,
        "major": major_name,
        "grade": grade,
        "completion_type": completion_type,
        "course_code": course_code,
        "section": section,
        "course_name": course_name,
        "credit": credit,
        "professor": professor,
        "class_time": class_time,
        "classroom": classroom,
        "source_pdf": source_pdf,
        "page": page,
    }
    return record, max(index, start_index + 1)


def parse_timetable_pdf(pdf_path: Path) -> list[dict[str, Any]]:
    semester = infer_semester_from_filename(pdf_path.name)
    records: list[dict[str, Any]] = []
    doc = fitz.open(pdf_path)
    try:
        for page_index, page in enumerate(doc, start=1):
            lines = [
                normalize_space(line)
                for line in (page.get_text("text") or "").splitlines()
                if normalize_space(line)
            ]
            if not lines:
                continue

            major_name = ""
            index = 0
            while index < len(lines):
                if is_major_header(lines, index):
                    major_name = lines[index]
                    index += 1
                    continue

                if is_row_start(lines, index):
                    record, next_index = parse_course_row(
                        lines=lines,
                        start_index=index,
                        major_name=major_name,
                        semester=semester,
                        source_pdf=pdf_path.name,
                        page=page_index,
                    )
                    if record is not None:
                        records.append(record)
                    index = next_index
                    continue
                index += 1
    finally:
        doc.close()

    unique_records: dict[tuple[Any, ...], dict[str, Any]] = {}
    for item in records:
        key = (
            item["semester"],
            item["major"],
            item["course_code"],
            item["section"],
            item["course_name"],
            item["class_time"],
            item["source_pdf"],
            item["page"],
        )
        unique_records[key] = item
    return list(unique_records.values())


def split_text(text: str, chunk_size: int = 700, overlap: int = 140) -> list[str]:
    normalized = normalize_space(text)
    if not normalized:
        return []
    if len(normalized) <= chunk_size:
        return [normalized]

    chunks: list[str] = []
    overlap = min(overlap, chunk_size - 1)
    start = 0
    while start < len(normalized):
        end = min(len(normalized), start + chunk_size)
        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(normalized):
            break
        start = end - overlap
    return chunks


def load_track_catalog() -> dict[str, dict[str, Any]]:
    if not TRACKS_PATH.exists():
        return {}
    with TRACKS_PATH.open("r", encoding="utf-8") as file:
        raw = json.load(file)
    catalog: dict[str, dict[str, Any]] = {}
    for entry in raw if isinstance(raw, list) else []:
        major = normalize_space(entry.get("major", ""))
        if not major:
            continue
        catalog[major] = {
            "pages": entry.get("pages", []),
            "notes": normalize_space(entry.get("notes", "")),
            "tracks": [
                {
                    "name": normalize_space(track.get("name", "")),
                    "summary": normalize_space(track.get("summary", "")),
                    "keywords": [normalize_space(item) for item in track.get("keywords", []) if normalize_space(item)],
                }
                for track in entry.get("tracks", [])
                if normalize_space(track.get("name", ""))
            ],
        }
    return catalog


def build_course_id(major: str, course_code: str, course_name: str) -> str:
    seed = f"{major}|{course_code}|{course_name}"
    digest = sha256(seed.encode("utf-8")).hexdigest()
    return f"course-{digest[:12]}"


def completion_core_score(completion_type: str) -> float:
    normalized = normalize_space(completion_type)
    if any(token in normalized for token in ("\ud544\uc218", "\uc804\ud544", "\ud575\uc2ec")):
        return 1.0
    if any(token in normalized for token in ("\uc804\uacf5", "\uc804\uc120")):
        return 0.75
    if any(token in normalized for token in ("\uad50\uc591", "\uc120\ud0dd")):
        return 0.45
    return 0.55


def build_raw_profile_text(course: dict[str, Any]) -> str:
    return normalize_space(
        " ".join(
            [
                course.get("major", ""),
                course.get("course_name", ""),
                course.get("course_code", ""),
                f"{course.get('grade', '')}\ud559\ub144",
                course.get("completion_type", ""),
                " ".join(course.get("offered_semesters", [])),
            ]
        )
    )


def build_profile_text(course: dict[str, Any]) -> str:
    track_terms = " ".join(
        " ".join([item.get("name", ""), *item.get("matched_keywords", [])])
        for item in course.get("track_contributions", [])
    )
    dependent_terms = " ".join(course.get("dependent_names", [])[:3])
    return normalize_space(
        " ".join(
            [
                build_raw_profile_text(course),
                track_terms,
                dependent_terms,
            ]
        )
    )


def aggregate_courses(records: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    grouped: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    grouped_offerings: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for row in records:
        major = normalize_space(row.get("major", ""))
        course_name = normalize_space(row.get("course_name", ""))
        if not major or not course_name:
            continue

        key = canonical_key(row.get("course_code") or course_name)
        current = grouped[major].get(key)
        grouped_offerings[major].append(row)

        if current is None:
            grouped[major][key] = {
                "id": build_course_id(major, normalize_space(row.get("course_code", "")), course_name),
                "major": major,
                "course_name": course_name,
                "course_code": normalize_space(row.get("course_code", "")),
                "grade": normalize_space(row.get("grade", "")),
                "completion_type": normalize_space(row.get("completion_type", "")),
                "credit": row.get("credit"),
                "offered_semesters": [normalize_space(row.get("semester", ""))] if normalize_space(row.get("semester", "")) else [],
                "sections": [normalize_space(row.get("section", ""))] if normalize_space(row.get("section", "")) else [],
                "professors": [normalize_space(row.get("professor", ""))] if normalize_space(row.get("professor", "")) else [],
                "class_times": [normalize_space(row.get("class_time", ""))] if normalize_space(row.get("class_time", "")) else [],
                "classrooms": [normalize_space(row.get("classroom", ""))] if normalize_space(row.get("classroom", "")) else [],
                "source_refs": [
                    {
                        "source_pdf": normalize_space(row.get("source_pdf", "")),
                        "page": int(row.get("page", 0) or 0),
                    }
                ],
            }
            continue

        semester = normalize_space(row.get("semester", ""))
        if semester and semester not in current["offered_semesters"]:
            current["offered_semesters"].append(semester)

        for field, value in (
            ("sections", normalize_space(row.get("section", ""))),
            ("professors", normalize_space(row.get("professor", ""))),
            ("class_times", normalize_space(row.get("class_time", ""))),
            ("classrooms", normalize_space(row.get("classroom", ""))),
        ):
            if value and value not in current[field]:
                current[field].append(value)

        reference = {
            "source_pdf": normalize_space(row.get("source_pdf", "")),
            "page": int(row.get("page", 0) or 0),
        }
        if reference not in current["source_refs"]:
            current["source_refs"].append(reference)

        current_grade = parse_grade_value(current.get("grade", ""))
        next_grade = parse_grade_value(row.get("grade", ""))
        if next_grade < current_grade:
            current["grade"] = normalize_space(row.get("grade", ""))
        if not current.get("course_code") and normalize_space(row.get("course_code", "")):
            current["course_code"] = normalize_space(row.get("course_code", ""))
        if not current.get("completion_type") and normalize_space(row.get("completion_type", "")):
            current["completion_type"] = normalize_space(row.get("completion_type", ""))
        if current.get("credit") is None and row.get("credit") is not None:
            current["credit"] = row.get("credit")

    courses: list[dict[str, Any]] = []
    for major, course_map in grouped.items():
        for item in course_map.values():
            item["offered_semesters"] = sorted(set(item["offered_semesters"]), key=semester_sort_key)
            item["latest_offered_semester"] = item["offered_semesters"][-1] if item["offered_semesters"] else "unknown"
            item["grade_value"] = parse_grade_value(item.get("grade", ""))
            item["order_value"] = course_level_score(item.get("course_name", ""), item["grade_value"])
            item["core_score"] = completion_core_score(item.get("completion_type", ""))
            item["track_contributions"] = []
            item["prerequisite_ids"] = []
            item["prerequisite_names"] = []
            item["dependent_ids"] = []
            item["dependent_names"] = []
            item["dependent_count"] = 0
            item["graduation_contribution"] = 0.0
            item["chunk_indices"] = []
            item["keywords"] = []
            item["raw_profile_text"] = build_raw_profile_text(item)
            courses.append(item)

    courses.sort(key=lambda item: (item["major"], item["grade_value"], item["order_value"], item["course_name"]))
    return courses, grouped_offerings


def keyword_score(text: str, tokens: list[str]) -> tuple[float, list[str]]:
    normalized = normalize_space(text).lower()
    if not normalized:
        return 0.0, []
    score = 0.0
    hits: list[str] = []
    for token in tokens:
        lowered = normalize_space(token).lower()
        if len(lowered) < 2:
            continue
        count = normalized.count(lowered)
        if count:
            score += float(count)
            if lowered not in {item.lower() for item in hits}:
                hits.append(token)
            if len(hits) >= 3:
                break
    return score, hits


def infer_track_contributions(courses: list[dict[str, Any]], track_catalog: dict[str, dict[str, Any]]) -> None:
    for course in courses:
        major_tracks = track_catalog.get(course["major"], {}).get("tracks", [])
        if not major_tracks:
            course["track_contributions"] = []
            course["keywords"] = [course["course_name"], course["course_code"]]
            continue

        course_vector = text_to_vector(course["raw_profile_text"])
        scored: list[dict[str, Any]] = []
        for track in major_tracks:
            track_text = normalize_space(" ".join([track["name"], track.get("summary", ""), *track.get("keywords", [])]))
            track_vector = text_to_vector(track_text)
            lexical_score, matched_keywords = keyword_score(course["raw_profile_text"], [track["name"], *track.get("keywords", [])])
            similarity = cosine_similarity(course_vector, track_vector)
            score = similarity + (0.15 * lexical_score)
            if score <= 0:
                continue
            scored.append(
                {
                    "name": track["name"],
                    "score": round(score, 4),
                    "matched_keywords": matched_keywords[:3],
                }
            )

        scored.sort(key=lambda item: item["score"], reverse=True)
        top = scored[:3]
        if not top and major_tracks:
            fallback = major_tracks[0]
            top = [{"name": fallback["name"], "score": 0.18, "matched_keywords": fallback.get("keywords", [])[:2]}]
        course["track_contributions"] = top

        keyword_candidates = [course["course_name"], course.get("course_code", "")]
        for item in top:
            keyword_candidates.append(item["name"])
            keyword_candidates.extend(item.get("matched_keywords", []))
        deduped: list[str] = []
        seen: set[str] = set()
        for token in keyword_candidates:
            normalized = normalize_space(token)
            lowered = normalized.lower()
            if len(normalized) < 2 or lowered in seen:
                continue
            deduped.append(normalized)
            seen.add(lowered)
        course["keywords"] = deduped


def build_initial_synthetic_chunk(course: dict[str, Any]) -> str:
    track_terms = " ".join(
        " ".join([item.get("name", ""), *item.get("matched_keywords", [])])
        for item in course.get("track_contributions", [])[:2]
    )
    return normalize_space(" ".join([course["raw_profile_text"], track_terms]))


def build_syllabus_chunks(courses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
    chunk_id = 0
    by_id = {course["id"]: course for course in courses}
    syllabi = find_syllabus_pdf_paths()

    course_codes = {course["course_code"]: course["id"] for course in courses if course.get("course_code")}
    course_names = sorted(
        [(course["course_name"], course["id"]) for course in courses if course.get("course_name")],
        key=lambda item: len(item[0]),
        reverse=True,
    )

    for pdf_path in syllabi:
        doc = fitz.open(pdf_path)
        try:
            for page_number, page in enumerate(doc, start=1):
                page_text = normalize_space(page.get_text("text") or "")
                if not page_text:
                    continue

                matched_ids: set[str] = set()
                for code, course_id in course_codes.items():
                    if code and code in page_text:
                        matched_ids.add(course_id)
                for course_name, course_id in course_names:
                    if course_name and course_name in page_text:
                        matched_ids.add(course_id)
                    if len(matched_ids) >= 6:
                        break

                if not matched_ids:
                    continue

                page_chunks = split_text(page_text)
                for course_id in matched_ids:
                    course = by_id[course_id]
                    for text in page_chunks:
                        chunks.append(
                            {
                                "id": chunk_id,
                                "course_id": course_id,
                                "major": course["major"],
                                "text": text,
                                "source_pdf": pdf_path.name,
                                "page": page_number,
                                "synthetic": False,
                            }
                        )
                        chunk_id += 1
        finally:
            doc.close()

    courses_with_real_chunks = {chunk["course_id"] for chunk in chunks}
    for course in courses:
        if course["id"] in courses_with_real_chunks:
            continue
        chunks.append(
            {
                "id": chunk_id,
                "course_id": course["id"],
                "major": course["major"],
                "text": build_initial_synthetic_chunk(course),
                "source_pdf": "",
                "page": 0,
                "synthetic": True,
            }
        )
        chunk_id += 1

    return chunks


def infer_prerequisites(courses: list[dict[str, Any]]) -> dict[str, list[str]]:
    names = [normalize_space(course.get("course_name", "")) for course in courses if normalize_space(course.get("course_name", ""))]
    by_key = {canonical_key(name): name for name in names}
    prereq_map: dict[str, set[str]] = {name: set() for name in names}

    def find_course(keyword: str) -> str | None:
        if not keyword:
            return None
        for course_name in names:
            if keyword in course_name:
                return course_name
        return None

    for name in names:
        if "\uc751\uc6a9" in name:
            base = normalize_space(name.replace("\uc751\uc6a9", ""))
            base_name = by_key.get(canonical_key(base))
            if base_name and base_name != name:
                prereq_map[name].add(base_name)

        if "\uc2ec\ud654" in name:
            base = normalize_space(name.replace("\uc2ec\ud654", ""))
            base_name = by_key.get(canonical_key(base))
            if base_name and base_name != name:
                prereq_map[name].add(base_name)

        if "\uc54c\uace0\ub9ac\uc998" in name:
            candidate = find_course("\uc790\ub8cc\uad6c\uc870") or find_course("\ub370\uc774\ud130\uad6c\uc870")
            if candidate and candidate != name:
                prereq_map[name].add(candidate)

        if ("\ub370\uc774\ud130\ubca0\uc774\uc2a4" in name) or ("DB" in name):
            candidate = find_course("\uc790\ub8cc\uad6c\uc870") or find_course("\ud504\ub85c\uadf8\ub798\ubc0d")
            if candidate and candidate != name:
                prereq_map[name].add(candidate)

        if any(
            keyword in name
            for keyword in (
                "\ud504\ub85c\uc81d\ud2b8",
                "\ucea1\uc2a4\ud1a4",
                "\uc2e4\uc2b5",
                "\uc124\uacc4",
            )
        ):
            candidate = (
                find_course("\uc54c\uace0\ub9ac\uc998")
                or find_course("\uc790\ub8cc\uad6c\uc870")
                or find_course("\ub370\uc774\ud130\ubca0\uc774\uc2a4")
            )
            if candidate and candidate != name:
                prereq_map[name].add(candidate)

    return {name: sorted(items) for name, items in prereq_map.items() if items}


def build_prerequisite_graph(courses: list[dict[str, Any]]) -> dict[str, Any]:
    courses_by_major: dict[str, list[dict[str, Any]]] = defaultdict(list)
    courses_by_id = {course["id"]: course for course in courses}

    for course in courses:
        courses_by_major[course["major"]].append(course)

    edges: dict[str, list[str]] = {course["id"]: [] for course in courses}
    removed_edges: list[dict[str, str]] = []

    for major, major_courses in courses_by_major.items():
        prereq_names = infer_prerequisites(major_courses)
        name_to_id = {course["course_name"]: course["id"] for course in major_courses}
        proposed_edges = {
            name_to_id[name]: [name_to_id[item] for item in names if item in name_to_id]
            for name, names in prereq_names.items()
            if name in name_to_id
        }

        for course_id, prereq_ids in proposed_edges.items():
            for prereq_id in prereq_ids:
                if has_path(edges, prereq_id, course_id):
                    removed_edges.append({"course_id": course_id, "prerequisite_id": prereq_id})
                    continue
                if prereq_id not in edges[course_id]:
                    edges[course_id].append(prereq_id)

    dependents: dict[str, list[str]] = {course["id"]: [] for course in courses}
    for course_id, prereq_ids in edges.items():
        for prereq_id in prereq_ids:
            dependents[prereq_id].append(course_id)

    for course in courses:
        prereq_ids = sorted(edges.get(course["id"], []), key=lambda item: courses_by_id[item]["course_name"])
        dependent_ids = sorted(dependents.get(course["id"], []), key=lambda item: courses_by_id[item]["course_name"])
        course["prerequisite_ids"] = prereq_ids
        course["prerequisite_names"] = [courses_by_id[item]["course_name"] for item in prereq_ids]
        course["dependent_ids"] = dependent_ids
        course["dependent_names"] = [courses_by_id[item]["course_name"] for item in dependent_ids]
        course["dependent_count"] = len(dependent_ids)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "edges": edges,
        "dependents": dependents,
        "removed_edges": removed_edges,
    }


def has_path(edges: dict[str, list[str]], start: str, goal: str) -> bool:
    if start == goal:
        return True
    visited: set[str] = set()
    stack = [start]
    while stack:
        current = stack.pop()
        if current in visited:
            continue
        visited.add(current)
        for next_node in edges.get(current, []):
            if next_node == goal:
                return True
            if next_node not in visited:
                stack.append(next_node)
    return False


def compute_graduation_contribution(courses: list[dict[str, Any]], selected_track: str | None = None) -> None:
    for course in courses:
        if selected_track:
            track_score = 0.0
            for item in course.get("track_contributions", []):
                if item.get("name") == selected_track:
                    track_score = float(item.get("score", 0.0))
                    break
        else:
            track_score = float(course.get("track_contributions", [{}])[0].get("score", 0.0)) if course.get("track_contributions") else 0.0
        normalized_track_score = max(0.0, min(1.0, track_score))
        unlock_score = min(1.0, course.get("dependent_count", 0) / 3.0)
        core_score = float(course.get("core_score", 0.55))
        course["graduation_contribution"] = round((0.45 * core_score) + (0.35 * normalized_track_score) + (0.20 * unlock_score), 4)


def build_embeddings(chunks: list[dict[str, Any]]) -> np.ndarray:
    vectors = [text_to_vector(chunk["text"]) for chunk in chunks]
    if not vectors:
        return np.zeros((0, EMBED_DIMENSIONS), dtype=np.float32)
    return np.vstack(vectors).astype(np.float32)


def attach_chunk_indices(courses: list[dict[str, Any]], chunks: list[dict[str, Any]]) -> None:
    course_to_indices: dict[str, list[int]] = defaultdict(list)
    for index, chunk in enumerate(chunks):
        course_to_indices[chunk["course_id"]].append(index)
    for course in courses:
        course["chunk_indices"] = course_to_indices.get(course["id"], [])


def build_rules(track_catalog: dict[str, dict[str, Any]], courses: list[dict[str, Any]]) -> dict[str, Any]:
    semesters = sorted(
        {
            semester
            for course in courses
            for semester in course.get("offered_semesters", [])
            if semester and semester != "unknown"
        },
        key=semester_sort_key,
    )
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "default_semester": semesters[-1] if semesters else "all",
        "semesters": semesters,
        "weights": {
            "semantic": 0.55,
            "curriculum": 0.20,
            "graduation": 0.25,
            "prerequisite_penalty": 0.50,
        },
        "limits": {
            "ready": 8,
            "blocked": 4,
        },
        "embedding": {
            "dimensions": EMBED_DIMENSIONS,
            "word_token_weight": WORD_TOKEN_WEIGHT,
            "ngram_token_weight": NGRAM_TOKEN_WEIGHT,
            "synonyms": SYNONYMS,
        },
        "explanation_slots": [
            "interest_match",
            "prerequisite_status",
            "offered_semester",
            "follow_on_link",
            "track_contribution",
        ],
        "track_catalog": track_catalog,
    }


def write_json(path: Path, payload: Any) -> None:
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)


def write_embeddings(path: Path, embeddings: np.ndarray) -> None:
    path.write_bytes(embeddings.astype(np.float32).tobytes(order="C"))


def sha256_file(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_manifest(paths: list[tuple[Path, str]]) -> dict[str, Any]:
    version = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    assets = []
    for path, asset_type in paths:
        assets.append(
            {
                "path": path.relative_to(BASE_DIR).as_posix(),
                "type": asset_type,
                "sha256": sha256_file(path),
                "bytes": path.stat().st_size,
            }
        )
    return {
        "version": version,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "assets": assets,
    }


def build_test_scenarios(courses: list[dict[str, Any]], rules: dict[str, Any]) -> list[dict[str, Any]]:
    by_major: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for course in courses:
        by_major[course["major"]].append(course)

    scenarios: list[dict[str, Any]] = []
    for major, major_courses in sorted(by_major.items()):
        track_entry = rules.get("track_catalog", {}).get(major, {})
        tracks = track_entry.get("tracks", [])
        top_track = tracks[0] if tracks else None
        latest_semester = sorted(
            {semester for course in major_courses for semester in course.get("offered_semesters", []) if semester},
            key=semester_sort_key,
        )
        semester = latest_semester[-1] if latest_semester else rules.get("default_semester", "all")

        ready_interest = " ".join((top_track or {}).get("keywords", [])[:2]) or normalize_space((top_track or {}).get("name", ""))
        if not ready_interest and major_courses:
            ready_interest = major_courses[0]["course_name"]

        scenarios.append(
            {
                "id": f"{canonical_key(major)}-ready",
                "major": major,
                "selected_track": (top_track or {}).get("name", ""),
                "target_semester": semester,
                "interests": ready_interest,
                "goals": normalize_space((top_track or {}).get("summary", "")),
                "completed_courses": "",
                "expected_track": (top_track or {}).get("name", ""),
                "expects_blocked": False,
            }
        )

        blocked_target = next(
            (
                course
                for course in major_courses
                if course.get("prerequisite_names")
                and (semester in course.get("offered_semesters", []))
            ),
            None,
        )
        if blocked_target:
            scenarios.append(
                {
                    "id": f"{canonical_key(major)}-blocked",
                    "major": major,
                    "selected_track": (top_track or {}).get("name", ""),
                    "target_semester": semester,
                    "interests": blocked_target["course_name"],
                    "goals": "",
                    "completed_courses": "",
                    "expected_course": blocked_target["course_name"],
                    "expects_blocked": True,
                }
            )

        if len(scenarios) >= 24:
            break

    return scenarios[:24]


def parse_completed_text(completed_text: str) -> list[str]:
    raw = normalize_space(completed_text.replace(",", "\n").replace("/", "\n"))
    if not raw:
        return []
    items = [normalize_space(line) for line in raw.splitlines() if normalize_space(line)]
    deduped: list[str] = []
    seen: set[str] = set()
    for item in items:
        key = canonical_key(item)
        if not key or key in seen:
            continue
        deduped.append(item)
        seen.add(key)
    return deduped


def match_completed_courses(courses: list[dict[str, Any]], completed_text: str) -> tuple[set[str], list[str]]:
    inputs = parse_completed_text(completed_text)
    key_to_id: dict[str, str] = {}
    for course in courses:
        for candidate in (course["course_name"], course.get("course_code", "")):
            key = canonical_key(candidate)
            if key:
                key_to_id[key] = course["id"]

    matched: set[str] = set()
    unmatched: list[str] = []
    for item in inputs:
        key = canonical_key(item)
        exact = key_to_id.get(key)
        if exact:
            matched.add(exact)
            continue

        fallback = None
        for course in courses:
            name = course["course_name"]
            code = course.get("course_code", "")
            if item in name or name in item or (code and item == code):
                fallback = course["id"]
                break
        if fallback:
            matched.add(fallback)
        else:
            unmatched.append(item)
    return matched, unmatched


def build_reason_slots(
    course: dict[str, Any],
    params: dict[str, Any],
    missing_prerequisites: list[str],
    keyword_hits: list[str],
) -> dict[str, str]:
    selected_track = normalize_space(params.get("selected_track", ""))
    semester = normalize_space(params.get("target_semester", ""))

    if keyword_hits:
        interest_match = f"관심사 매칭: {', '.join(keyword_hits[:2])} 키워드와 직접 연결됩니다."
    else:
        interest_match = "관심사 매칭: 입력 텍스트와 과목 프로필 유사도가 높습니다."

    if missing_prerequisites:
        prerequisite_status = f"선수 충족 여부: {', '.join(missing_prerequisites[:3])} 미이수로 보류 대상입니다."
    elif course.get("prerequisite_names"):
        prerequisite_status = f"선수 충족 여부: {', '.join(course['prerequisite_names'][:3])} 이수 기준으로 충족 상태입니다."
    else:
        prerequisite_status = "선수 충족 여부: 별도 선수과목 없이 바로 수강 가능합니다."

    if semester and semester != "all":
        if semester in course.get("offered_semesters", []):
            offered_semester = f"개설학기: 선택 학기인 {semester}에 개설됩니다."
        else:
            offered_semester = f"개설학기: {semester} 개설 과목은 아니며 최근 개설은 {course.get('latest_offered_semester', '-') }입니다."
    else:
        offered_semester = f"개설학기: {', '.join(course.get('offered_semesters', [])[:3]) or '-'} 기준으로 확인됩니다."

    if course.get("dependent_names"):
        follow_on_link = f"후속과목 연결: {', '.join(course['dependent_names'][:2])}로 이어지는 기반 과목입니다."
    else:
        follow_on_link = "후속과목 연결: 직접 연결된 후속과목은 적지만 이수 부담이 낮습니다."

    selected_track_match = None
    if selected_track:
        for item in course.get("track_contributions", []):
            if item.get("name") == selected_track:
                selected_track_match = item
                break
    top_track = selected_track_match or (course.get("track_contributions") or [{}])[0]
    if top_track and top_track.get("name"):
        track_keywords = ", ".join(top_track.get("matched_keywords", [])[:2])
        if track_keywords:
            track_contribution = f"트랙 기여: {top_track['name']}과 {track_keywords} 축으로 연관도가 높습니다."
        else:
            track_contribution = f"트랙 기여: {top_track['name']} 쪽 졸업 설계에 기여도가 큽니다."
    else:
        track_contribution = "트랙 기여: 전공 공통 기반 과목으로 활용 가능합니다."

    return {
        "interest_match": interest_match,
        "prerequisite_status": prerequisite_status,
        "offered_semester": offered_semester,
        "follow_on_link": follow_on_link,
        "track_contribution": track_contribution,
    }


def build_reason_text(reason_slots: dict[str, str]) -> str:
    return " ".join(reason_slots.values())


def estimate_target_grade(completed_ids: set[str], courses_by_id: dict[str, dict[str, Any]]) -> int:
    completed_grades = [courses_by_id[item]["grade_value"] for item in completed_ids if item in courses_by_id]
    if not completed_grades:
        return 1
    return min(4, max(completed_grades) + 1)


def curriculum_score(course: dict[str, Any], target_grade: int) -> float:
    grade_gap = min(abs(course.get("grade_value", target_grade) - target_grade), 3) / 3.0
    grade_fit = 1.0 - grade_gap
    order_fit = 1.0 - ((course.get("order_value", 1) - 1) / 4.0)
    return (0.65 * grade_fit) + (0.35 * order_fit)


def graduation_score(course: dict[str, Any], selected_track: str) -> float:
    selected_track_score = 0.0
    if selected_track:
        for item in course.get("track_contributions", []):
            if item.get("name") == selected_track:
                selected_track_score = float(item.get("score", 0.0))
                break
    if not selected_track_score and course.get("track_contributions"):
        selected_track_score = float(course["track_contributions"][0].get("score", 0.0))
    selected_track_score = min(1.0, max(0.0, selected_track_score))
    unlock_score = min(1.0, course.get("dependent_count", 0) / 3.0)
    return (0.45 * float(course.get("core_score", 0.55))) + (0.35 * selected_track_score) + (0.20 * unlock_score)


def semantic_score(course: dict[str, Any], query_vector: np.ndarray, embeddings: np.ndarray) -> float:
    if query_vector.size == 0 or not course.get("chunk_indices"):
        return 0.0
    indices = np.array(course["chunk_indices"], dtype=np.int32)
    scores = embeddings[indices] @ query_vector
    return float(np.max(scores)) if scores.size else 0.0


def recommend_courses(bundle: dict[str, Any], params: dict[str, Any]) -> dict[str, Any]:
    courses = bundle["courses"]
    courses_by_id = {course["id"]: course for course in courses}
    rules = bundle["rules"]
    embeddings = bundle["embeddings"]

    major = normalize_space(params.get("major", ""))
    selected_track = normalize_space(params.get("selected_track", ""))
    target_semester = normalize_space(params.get("target_semester", "")) or rules.get("default_semester", "all")
    interests = normalize_space(params.get("interests", ""))
    goals = normalize_space(params.get("goals", ""))
    completed_text = normalize_space(params.get("completed_courses", ""))

    major_courses = [course for course in courses if course["major"] == major]
    matched_completed, unmatched_completed = match_completed_courses(major_courses, completed_text)
    target_grade = estimate_target_grade(matched_completed, courses_by_id)
    query_text = normalize_space(" ".join([interests, goals, selected_track]))
    query_vector = text_to_vector(query_text)

    ready: list[dict[str, Any]] = []
    blocked: list[dict[str, Any]] = []
    weights = rules.get("weights", {})

    for course in major_courses:
        if course["id"] in matched_completed:
            continue
        if target_semester != "all" and target_semester not in course.get("offered_semesters", []):
            continue

        missing_ids = [item for item in course.get("prerequisite_ids", []) if item not in matched_completed]
        missing_names = [courses_by_id[item]["course_name"] for item in missing_ids if item in courses_by_id]

        semantic = semantic_score(course, query_vector, embeddings)
        curriculum = curriculum_score(course, target_grade)
        graduation = graduation_score(course, selected_track)
        prereq_penalty = 0.0
        if missing_ids:
            prereq_penalty = (len(missing_ids) / max(1, len(course.get("prerequisite_ids", [])))) * float(
                weights.get("prerequisite_penalty", 0.50)
            )

        total_score = (
            semantic * float(weights.get("semantic", 0.55))
            + curriculum * float(weights.get("curriculum", 0.20))
            + graduation * float(weights.get("graduation", 0.25))
            - prereq_penalty
        )

        keyword_hits = [token for token in course.get("keywords", []) if token and token.lower() in query_text.lower()][:2]
        reason_slots = build_reason_slots(course, params, missing_names, keyword_hits)
        item = {
            "id": course["id"],
            "course_name": course["course_name"],
            "course_code": course.get("course_code", ""),
            "grade": course.get("grade", ""),
            "offered_semesters": course.get("offered_semesters", []),
            "track_contributions": course.get("track_contributions", []),
            "missing_prerequisites": missing_names,
            "score": round(total_score, 4),
            "score_breakdown": {
                "semantic": round(semantic, 4),
                "curriculum": round(curriculum, 4),
                "graduation": round(graduation, 4),
                "prerequisite_penalty": round(prereq_penalty, 4),
            },
            "reason_slots": reason_slots,
            "reason": build_reason_text(reason_slots),
        }
        if missing_names:
            blocked.append(item)
        else:
            ready.append(item)

    ready.sort(key=lambda item: (item["score"], item["score_breakdown"]["semantic"]), reverse=True)
    blocked.sort(key=lambda item: (item["score"], -len(item["missing_prerequisites"])), reverse=True)

    return {
        "ready": ready[: int(rules.get("limits", {}).get("ready", 8))],
        "blocked": blocked[: int(rules.get("limits", {}).get("blocked", 4))],
        "matched_completed": sorted((courses_by_id[item]["course_name"] for item in matched_completed), key=str.lower),
        "unmatched_completed": unmatched_completed,
    }


def load_runtime_bundle() -> dict[str, Any]:
    with COURSES_PATH.open("r", encoding="utf-8") as file:
        courses_payload = json.load(file)
    with PREREQUISITES_PATH.open("r", encoding="utf-8") as file:
        prerequisites_payload = json.load(file)
    with SYLLABUS_CHUNKS_PATH.open("r", encoding="utf-8") as file:
        chunks_payload = json.load(file)
    with RULES_PATH.open("r", encoding="utf-8") as file:
        rules_payload = json.load(file)

    dimensions = int(rules_payload.get("embedding", {}).get("dimensions", EMBED_DIMENSIONS))
    raw = np.fromfile(EMBEDDINGS_PATH, dtype=np.float32)
    embeddings = raw.reshape((-1, dimensions)) if raw.size else np.zeros((0, dimensions), dtype=np.float32)

    return {
        "courses": courses_payload.get("courses", []),
        "prerequisites": prerequisites_payload,
        "chunks": chunks_payload.get("chunks", []),
        "rules": rules_payload,
        "embeddings": embeddings,
    }


def run_validation(bundle: dict[str, Any], scenarios: list[dict[str, Any]]) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    passed = 0
    for scenario in scenarios:
        recommendation = recommend_courses(
            bundle,
            {
                "major": scenario["major"],
                "selected_track": scenario.get("selected_track", ""),
                "target_semester": scenario.get("target_semester", ""),
                "interests": scenario.get("interests", ""),
                "goals": scenario.get("goals", ""),
                "completed_courses": scenario.get("completed_courses", ""),
            },
        )
        ready = recommendation.get("ready", [])
        blocked = recommendation.get("blocked", [])
        checks: list[tuple[str, bool]] = []
        checks.append(("has_results", bool(ready or blocked)))
        checks.append(
            (
                "reason_slots_complete",
                all(
                    all(item.get("reason_slots", {}).get(slot) for slot in bundle["rules"].get("explanation_slots", []))
                    for item in [*(ready[:1]), *(blocked[:1])]
                ),
            )
        )

        if scenario.get("expects_blocked"):
            expected_course = scenario.get("expected_course", "")
            checks.append(("blocked_expected_course", any(item["course_name"] == expected_course for item in blocked)))
        else:
            checks.append(("has_ready_course", bool(ready)))
            expected_track = scenario.get("expected_track", "")
            if expected_track:
                checks.append(
                    (
                        "expected_track_visible",
                        any(
                            any(track.get("name") == expected_track for track in item.get("track_contributions", []))
                            for item in ready[:5]
                        ),
                    )
                )

        scenario_passed = all(result for _, result in checks)
        if scenario_passed:
            passed += 1
        results.append(
            {
                "scenario_id": scenario["id"],
                "major": scenario["major"],
                "passed": scenario_passed,
                "checks": [{"name": name, "passed": result} for name, result in checks],
                "top_ready": [item["course_name"] for item in ready[:3]],
                "top_blocked": [item["course_name"] for item in blocked[:3]],
            }
        )

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total": len(scenarios),
            "passed": passed,
            "failed": len(scenarios) - passed,
            "pass_rate": round((passed / len(scenarios)) if scenarios else 0.0, 4),
        },
        "results": results,
    }
    write_json(TMP_DIR / "validation_report.json", report)
    return report


def write_legacy_timetable_snapshot(records: list[dict[str, Any]]) -> None:
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_courses": len(records),
        "courses": records,
    }
    write_json(LEGACY_TIMETABLE_COURSES_PATH, payload)


def build_static_assets() -> dict[str, Any]:
    ensure_dirs()

    timetable_pdfs = find_timetable_pdf_paths()
    if not timetable_pdfs:
        raise FileNotFoundError("시간표 PDF를 찾지 못했습니다. data/ 또는 data/pdfs/ 아래에 배치해 주세요.")

    raw_records: list[dict[str, Any]] = []
    file_stats: list[dict[str, Any]] = []
    for pdf_path in timetable_pdfs:
        parsed = parse_timetable_pdf(pdf_path)
        raw_records.extend(parsed)
        file_stats.append(
            {
                "pdf_filename": pdf_path.name,
                "semester": infer_semester_from_filename(pdf_path.name),
                "course_count": len(parsed),
            }
        )

    raw_records.sort(
        key=lambda item: (
            item.get("semester", ""),
            item.get("major", ""),
            item.get("course_code", ""),
            item.get("section", ""),
        )
    )
    write_legacy_timetable_snapshot(raw_records)

    track_catalog = load_track_catalog()
    courses, _ = aggregate_courses(raw_records)
    infer_track_contributions(courses, track_catalog)
    chunks = build_syllabus_chunks(courses)
    attach_chunk_indices(courses, chunks)
    prerequisites = build_prerequisite_graph(courses)
    compute_graduation_contribution(courses)

    rules = build_rules(track_catalog, courses)
    scenarios = build_test_scenarios(courses, rules)
    embeddings = build_embeddings(chunks)

    courses_payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "files": file_stats,
        "majors": sorted({course["major"] for course in courses}),
        "semesters": rules["semesters"],
        "total_courses": len(courses),
        "courses": courses,
    }
    chunks_payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_chunks": len(chunks),
        "chunks": chunks,
    }

    write_json(COURSES_PATH, courses_payload)
    write_json(PREREQUISITES_PATH, prerequisites)
    write_json(SYLLABUS_CHUNKS_PATH, chunks_payload)
    write_embeddings(EMBEDDINGS_PATH, embeddings)
    write_json(RULES_PATH, rules)
    write_json(TEST_SCENARIOS_PATH, scenarios)

    manifest = build_manifest(
        [
            (COURSES_PATH, "json"),
            (PREREQUISITES_PATH, "json"),
            (SYLLABUS_CHUNKS_PATH, "json"),
            (EMBEDDINGS_PATH, "bin"),
            (RULES_PATH, "json"),
            (TEST_SCENARIOS_PATH, "json"),
        ]
    )
    write_json(MANIFEST_PATH, manifest)

    bundle = load_runtime_bundle()
    report = run_validation(bundle, scenarios)
    return {
        "timetable_pdfs": [path.name for path in timetable_pdfs],
        "course_count": len(courses),
        "chunk_count": len(chunks),
        "validation": report["summary"],
    }
