# Prompt Library Known Risks

| Risk ID | Risk | Impact | Control |
|---|---|---|---|
| R-SCH-001 | Existing columns may contain legacy data that does not match the new schema | Data mismatch | Preserve legacy columns during migration |
| R-SCH-002 | Duplicate hidden sheets may contain data not yet reviewed | Accidental data loss | Do not delete hidden sheets before inspection |
| R-MIG-001 | `Content` may contain full prompts that are not yet copied to Google Docs | Loss of usable prompt content | Preserve `Content` until all rows have valid `Full_Doc_Link` |
| R-MIG-002 | `Is_Pinned` mapping to `Is_Favorite` may overwrite intentional values | Incorrect favorite state | Only map when `Is_Favorite` is blank |
| R-DOC-001 | Google Docs document creation may fail because of permissions or quota | Prompt record without full source | Create document before adding the prompt row |
| R-DOC-003 | Prompt formatting may be flattened inside Google Docs | Loss of structure | Preserve original Markdown, XML, JSON, and code blocks |
| R-SCR-001 | File load order may be incorrect | Runtime errors | Follow file manifest load order |
| R-DAT-001 | Duplicate `Prompt_ID` values | Broken lookup | Validate uniqueness |
| R-DAT-002 | Duplicate `Full_Doc_Link` values | Multiple records pointing to same document | Validate uniqueness |

## Stop Conditions

| Condition | Required Action |
|---|---|
| Backup cannot be created | Stop |
| Required sheet cannot be accessed | Stop |
| Required columns cannot be created | Stop |
| Google Docs document cannot be created | Stop |
| Prompt row is created without document link | Stop |
| Validation detects duplicate `Prompt_ID` | Stop |
| Validation detects missing required fields in new records | Stop |
