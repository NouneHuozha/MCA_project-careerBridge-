# CareerBridge Nagaland Dataset Inventory

**Dataset archive:** `Careerbridge(data).zip`
**Inspection date:** 22 September 2026
**Initial product region:** Nagaland
**Future product region:** The wider Northeast, using state-aware records from the beginning

## Executive conclusion

The supplied archive is valuable source material for CareerBridge’s first real regional catalogue. It contains three Excel workbooks with different responsibilities:

| Workbook | Main content | Records in primary sheet | Initial use |
|---|---|---:|---|
| `Nagaland.xlsx` | Institutions and education providers in Nagaland | 423 | Primary Nagaland institution catalogue |
| `EntranceExam.xlsx` | Northeast-relevant entrance, recruitment, professional, olympiad, and study-abroad examinations | 79 active exams | Shared Northeast examination catalogue, filtered by student relevance and state scope |
| `scholarships.xlsx` | Central, national private/CSR, Northeast-region, and state scholarship schemes | 66 schemes | Shared scholarship catalogue with Nagaland applicability derived from scope and state rules |

The data is more mature than the current bundled sample data in the repository. It already contains source URLs, verification statuses, and verification dates. It should not be imported by replacing the current TypeScript seeds directly. Instead, it should pass through a **raw workbook → staging tables → normalized canonical tables → verification-aware catalogue** pipeline.

The platform should be designed for all eight Northeast states now, even though the user experience will initially show Nagaland. Each imported entity should carry an explicit geographic scope so that Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Sikkim, and Tripura can be enabled later without redesigning the database.

## Workbook findings

### `Nagaland.xlsx`

The `Master Census` sheet contains 423 non-empty institution rows and 17 columns. The workbook describes a Nagaland education census generated on 19 September 2026. Its records cover schools, colleges, institutes, training centres, polytechnics, ITIs, universities, and medical or nursing institutions.

The institution distribution is broad:

| Attribute | Main values |
|---|---|
| Type | 226 schools, 108 colleges, 39 institutes, 19 training centres, 10 polytechnics, 9 ITIs, 7 universities, 5 medical/nursing providers |
| Entry stage | 256 after Class 10, 127 after Class 12, 40 both |
| Ownership | 254 private, 119 government, 50 central |
| Verification | 408 verified, 15 needs verification |
| Source URL | Present for all 423 records |
| Official website | Present for 191 records; absent for 232 |
| Contact information | Present for 151 records; absent for 272 |
| Hostel field | Filled for 19 records; blank for 404 |

The institution data is therefore strong for discovery and location-based browsing, but it does not yet provide complete website, contact, hostel, course, or geospatial coverage. Blank values must become explicit `unknown` or `unavailable` states in the application rather than being interpreted as negative facts.

The workbook contains district-label inconsistency that must be normalized before import. `Chumoukedima` and `Chümoukedima` appear as separate values, although they represent the same district. `Tseminyu` also needs to be aligned with the spelling used in the current application’s region seed. The workbook includes `Meluri`, which is not currently present in the repository’s region seed. A canonical district dictionary should be created before institution insertion.

The `Courses Offered` column is free text. It should not be inserted as one large institution attribute. It needs to be parsed or manually mapped into canonical course records and `institution_courses` links. Some entries describe streams or broad offerings rather than a single course, so the importer must support a review queue for ambiguous mappings.

### `EntranceExam.xlsx`

The `All Exams` sheet contains 79 active examination records and 18 columns. The workbook also has a `Removed (Discontinued)` sheet with 11 discontinued records and a `README` explaining the census method. The active rows have no blank cells in the primary sheet.

The active records are distributed as follows:

| Attribute | Coverage |
|---|---:|
| National scope | 57 |
| State scope | 19 |
| Institution scope | 3 |
| State value `Nagaland` | 2 explicit records |
| State value `All India` | 57 records |
| Verified status | 4 official, 75 multi-source |
| Active status | 79 |

The dataset correctly distinguishes examinations directly based in Nagaland from national examinations relevant to Nagaland students. For example, CUET-UG and JEE Main are national examinations but have clear relevance to institutions or pathways available to students in the Northeast. The application should therefore not filter only by `state = Nagaland`; it should combine state scope, national applicability, institution relationships, and course relationships.

The workbook contains useful fields that the current `entrance_exams` table does not fully preserve, including category, scope, state, examination mode, frequency, and status. These should be added to the schema or stored in a structured metadata column. The current schema is sufficient for basic display but would lose important user-facing information if the extra fields were discarded.

The workbook also includes some time-sensitive details inside free-text fields such as frequency and eligibility. These facts must retain their source URL and verification date. A later web-refresh pipeline should update volatile application windows and examination dates rather than treating the workbook text as permanently current.

### `scholarships.xlsx`

The `Master` sheet contains 66 scholarship schemes and 13 columns. The workbook’s README states that it covers eight Northeast states as well as central, national private/CSR, and Northeast-region schemes. All 66 primary records are complete, with no blank values in the main sheet.

The verification distribution is:

| Status | Records |
|---|---:|
| Multi-source | 48 |
| Verified | 18 |
| Total | 66 |

This workbook is not a Nagaland-only workbook. It does not include a dedicated state column. Nagaland applicability must be derived from the scheme’s scope, provider, eligibility text, official URL, and state-specific slug. At minimum, the following records are directly relevant to the initial Nagaland launch:

- Vidyadhan Scholarship
- NEC Merit Scholarship
- Ishan Uday Special Scholarship Scheme
- Nagaland State Merit Scholarship
- Chief Minister’s Meritorious Students Fellowship
- State Agriculture Scholarship for B.Sc. and M.Sc. Agriculture, Nagaland

The central and national schemes should also be available to Nagaland students when their eligibility applies. State-specific schemes for Assam, Tripura, Manipur, Meghalaya, Mizoram, Sikkim, and Arunachal Pradesh should remain in the database with their geographic scope but should not appear in the Nagaland UI.

The current scholarship table maps closely to this workbook. The main missing concept is explicit geographic applicability. The canonical schema should add a scope model or a linking table such as `scholarship_regions`, rather than relying on string searches through provider and eligibility text.

## Mapping to the current CareerBridge schema

### Institutions

The institution workbook maps naturally to the existing `institutions` table:

| Workbook column | Canonical destination | Treatment |
|---|---|---|
| Institution Code | `institutions.code` | Preserve as the stable external key |
| Name | `institutions.name` | Trim whitespace and preserve official spelling |
| Type | `institutions.type` | Normalize `medical_nursing` and other values to the application vocabulary |
| Ownership | `institutions.ownership` | Map government, private, and central directly |
| District | `institutions.district` | Resolve through the canonical district dictionary |
| City Town | `institutions.city` | Normalize spelling but preserve source value in staging |
| Official Website | `institutions.official_website` | Blank means unavailable, not “no website exists” |
| Contact Info | Contact fields or raw staging field | Parse phone/email where possible; retain raw value for review |
| Hostel Available | `institutions.hostel_available` | `yes` when explicitly stated; otherwise `unknown` |
| Entry Stage | `institutions.study_levels` | Convert `after_class10`, `after_class12`, and `both` into normalized levels |
| Verification Status | `institutions.verification_status` | Preserve `verified` and `needs_verification` |
| Source Url | `institutions.source_url` and `institution_sources` | Store as a source record with retrieval date |
| Last Verified At | `institutions.last_verified_at` | Parse `YYYY-MM-DD` into a timestamp |
| Courses Offered | `institution_courses` | Requires controlled mapping and review; do not store only as opaque text |
| Social Media Url | `institution_sources` | Store as secondary source, not as the official source |

The workbook does not provide latitude and longitude. The application should initially use district/town-level coordinates from the region table, clearly labelled as approximate. Exact institution coordinates should only be added when sourced from an official page or a reliable geocoding process.

### Entrance examinations

The examination workbook maps to `entrance_exams` as follows:

| Workbook column | Canonical destination | Treatment |
|---|---|---|
| `exam_slug` | `entrance_exams.slug` | Preserve as stable key |
| `name` | `name` | Direct mapping |
| `short_name` | `shortName` | Direct mapping |
| `conducting_body` | `conductingBody` | Direct mapping |
| `applies_to` | `appliesTo` | Split into an array using the dataset delimiter |
| `eligibility` | `eligibility` | Direct mapping, with source metadata |
| `level_stage` | `levelStage` | Normalize `class_10` to `after_class10` where appropriate |
| `official_website` | `officialWebsite` | Direct mapping |
| `preparation` | `preparation` | Split into an array or retain structured text |
| `source_url` | `sourceUrl` | Direct mapping |
| `verification_status` | `verificationStatus` | Direct mapping |
| `last_verified_at` | `lastVerifiedAt` | Parse as timestamp |
| `category`, `scope`, `state`, `exam_mode`, `frequency`, `status` | New columns or metadata | Preserve; these are valuable for filtering and freshness |

The discontinued sheet should not be inserted into the active catalogue. It should be retained in a historical or audit table so the system can explain why an older examination no longer appears.

### Scholarships

The scholarship workbook maps almost one-to-one with the current `scholarships` table:

| Workbook column | Canonical destination |
|---|---|
| `scholarship_slug` | `scholarships.slug` |
| `name` | `scholarships.name` |
| `provider` | `scholarships.provider` |
| `category` | `scholarships.category` |
| `eligibility` | `scholarships.eligibility` |
| `amount_note` | `scholarships.amountNote` |
| `deadline_note` | `scholarships.deadlineNote` |
| `documents` | `scholarships.documents` after delimiter splitting |
| `official_url` | `scholarships.officialUrl` |
| `applies_to_stage` | `scholarships.appliesToStage` after delimiter splitting |
| `source_url` | `scholarships.sourceUrl` |
| `verification_status` | `scholarships.verificationStatus` |
| `last_verified_at` | `scholarships.lastVerifiedAt` |

The important addition is a geographic scope relation. A scheme can be central, Northeast-wide, Nagaland-specific, or specific to another state. That distinction should be represented structurally.

## Recommended data architecture

The workbooks should be imported into three layers.

### Raw source layer

Store the original uploaded file, workbook name, sheet name, row number, original row values, checksum, import timestamp, and dataset version. This layer protects the original research and makes the import reproducible.

### Staging layer

Convert each workbook row into a typed staging record. Staging records should include parsing warnings, normalization warnings, duplicate status, and an import decision such as `accepted`, `needs_review`, or `rejected`. No staging row should overwrite a canonical record automatically when its stable key already exists with materially different values.

### Canonical application layer

Insert approved records into the existing tables: institutions, institution sources, institution courses, entrance exams, scholarships, and related geographic tables. Each canonical record should retain the source reference, verification state, and last-verified timestamp.

The resulting flow should be:

```text
Excel workbook
    ↓
Raw import record
    ↓
Typed staging row
    ↓
Normalization and duplicate checks
    ↓
Human review for ambiguous rows
    ↓
Canonical PostgreSQL record
    ↓
Catalogue and mentor retrieval
```

## Important normalization rules

The first importer should normalize values without destroying the original source values.

- District names should use a canonical district ID. Store the workbook spelling separately as `source_district`.
- `Chumoukedima` and `Chümoukedima` should resolve to one district.
- `Tseminyu` and the application’s current spelling should resolve to one district.
- `Meluri` must be added to the Nagaland region catalogue if it is part of the accepted 17-district dataset.
- Blank hostel, website, contact, and course fields must become `unknown` or `unavailable`, not false values.
- `after_class10`, `after_class12`, `class_10`, and similar values must be normalized into a controlled vocabulary.
- Semicolon-separated values should become arrays.
- URLs should be validated as HTTP(S) URLs.
- Dates should be parsed strictly as `YYYY-MM-DD`.
- Duplicate checks should use the supplied stable slug or institution code before falling back to normalized name plus district.
- Verification states such as `verified`, `official`, and `multi_source` should be mapped to a controlled vocabulary while preserving the original value.
- A source URL is evidence of provenance, not proof that the data is still current. The UI should always show the verification date.

## What should be imported first

The best first import is the Nagaland institution census. It directly supports the current institution search, district filters, location exploration, and course discovery. The 423 rows can replace the current small sample institution dataset after normalization and review.

The second import should be the 79 active examinations. It will require a modest schema extension to preserve category, scope, state, mode, frequency, and active status.

The third import should be the scholarship workbook, but with geographic applicability modeled explicitly. For the Nagaland interface, show Nagaland-specific, Northeast-wide, central, and national schemes that match the student’s stage and eligibility. Hide other state-specific schemes until the student region changes.

## Data that should remain web-refreshed

The workbooks should be treated as a researched baseline, not as a permanent source of current facts. A later refresh system should fetch official pages and portals for volatile information, including:

- Application windows
- Exact deadlines
- Examination dates
- Current fees
- Current scholarship amounts
- Current eligibility thresholds
- Current notices
- Admission status
- Hostel availability
- Course availability for the current academic cycle

A refresh must create a new source snapshot rather than silently editing history. The application should show the latest successful retrieval and should downgrade stale records to `needs_verification` when their freshness period expires.

## Final assessment

The supplied data is suitable for building CareerBridge’s Nagaland-first catalogue and already aligns well with the project’s trust requirements. The central engineering task is not data entry. It is **controlled ingestion**: preserving source evidence, normalizing geography and vocabulary, separating stable catalogue data from volatile facts, and representing Northeast-wide scope explicitly.

The correct next implementation step is to build a dry-run importer that reads these three workbooks, reports normalization and duplicate decisions, and produces staging output without changing the production database. Once the dry run is reviewed, the importer can populate PostgreSQL and the UI can begin using the real Nagaland dataset.

## References

[1]: https://github.com/NouneHuozha/MCA_project-careerBridge- "CareerBridge GitHub repository"
[2]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/db/schema.ts "CareerBridge database schema"
[3]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/db/seed.ts "CareerBridge catalogue seeding implementation"
[4]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/services/catalog.ts "CareerBridge catalogue service"
[5]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/data/institutions.ts "CareerBridge current institution seed data"
[6]: https://github.com/NouneHuozha/MCA_project-careerBridge-/blob/main/src/data/learning.ts "CareerBridge current learning and scholarship seed data"
