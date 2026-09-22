# CareerBridge Catalogue Validation Report

**Validation scope:** Institutions, entrance examinations, scholarships, and their student-facing UI requirements.  
**Source data:** The supplied Nagaland workbook, entrance-exam workbook, and scholarship workbook.  
**Validation status:** **PASS**, with one source annotation normalized during import.

## Overall result

The three supplied catalogues are structurally compatible with the current CareerBridge import pipeline and student-facing pages. The institution workbook contains **423 records**, the entrance-exam workbook contains **79 records**, and the scholarship workbook contains **66 records**. Each dataset has unique keys, complete required fields, and no duplicate rows.

The validation also confirmed that institution search and filtering are represented in the UI, exam details display the preserved classification metadata, and scholarship filters cover every study stage present in the workbook.

## Dataset checks

| Dataset | Workbook rows | Required headers | Duplicate keys | Required blanks | URL result |
|---|---:|---|---:|---:|---|
| Institutions | 423 | Present | 0 | 0 | One descriptive source annotation is normalized to its embedded URL |
| Entrance examinations | 79 | Present | 0 | 0 | Valid official and source URLs |
| Scholarships | 66 | Present | 0 | 0 | Valid official and source URLs |

The institution workbook contains 18 distinct district spellings. `Chumoukedima` and `Chümoukedima` both occur in the source file; approval normalization maps the unaccented spelling to the canonical UI spelling `Chümoukedima`. The static institution filter list contains 16 current Nagaland districts, including the districts available in the current catalogue.

## UI compatibility checks

The institution listing and detail pages expose the fields required for the imported data: name, location, district, official website, verification status, search, and filters. Unknown values remain explicitly unavailable rather than being presented as negative facts.

The entrance-exam page displays name, conducting body, eligibility, preparation, official website, source, verification status, and the preserved category, scope, state, exam mode, and active-status metadata.

The scholarship page displays provider, eligibility, amount, deadline, documents, official URL, source URL, verification status, and applicable study-stage badges. Its filters cover Class 9, Class 10, Class 11, Class 12, Diploma, Undergraduate, and Postgraduate.

## Fixes made during validation

The approval mapping now extracts the first valid HTTP or HTTPS URL from source fields that contain descriptive text followed by a URL. This prevents malformed `SourceLink` targets while retaining the usable official source link.

The entrance-exam UI now shows the metadata fields that were preserved in the database during the exam import work. Without this change, those fields would have been stored but invisible to students.

## Validation commands

The repeatable validator is available at [`scripts/validate-catalog-data.py`](../scripts/validate-catalog-data.py). It checks workbook headers, row counts, duplicate keys, required values, URL shape, stage coverage, district coverage, and source-code UI requirements.

TypeScript and ESLint both passed after the fixes. A live PostgreSQL query was not available in the sandbox environment, so this report validates the supplied workbooks and repository UI/source contracts rather than querying the user's local PostgreSQL instance directly. The local database should still be spot-checked after pulling the changes.

## Recommended local smoke checks

After pulling the branch, open `/institutions`, `/exams`, and `/scholarships`. Search for an institution with a source annotation, open an exam and confirm its metadata badges, and test each scholarship stage filter. In pgAdmin, confirm the canonical counts remain 423 institutions, 79 entrance exams, and 66 scholarships.

## Conclusion

The catalogue data and UI contracts pass the automated validation. The remaining verification step is a local PostgreSQL count and browser smoke test because the user's database runs outside this sandbox.

## References

[1]: https://github.com/NouneHuozha/MCA_project-careerBridge-/tree/feature/admin-import-review "CareerBridge feature branch"
