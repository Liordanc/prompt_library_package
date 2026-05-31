const PROMPT_LIBRARY_SCHEMA = Object.freeze({
  version: "1.0.0",
  locale: "iw_IL",
  timezone: "Asia/Jerusalem",

  workbook: {
    canonicalName: "prompts Library",
    backupNamePattern: "prompts Library - backup before restructure - {{timestamp}}",
    protectedMode: true,
    allowDestructiveChanges: false
  },

  settings: {
    previewTextLimit: 1500,
    defaultPromptStatus: "Active",
    defaultPromptType: "General",
    defaultToolTarget: "ChatGPT",
    defaultFavoriteState: false,
    defaultVersion: "v1.0",
    idPrefixes: {
      prompt: "PRM",
      category: "CAT",
      subcategory: "SUB",
      tag: "TAG",
      log: "LOG",
      version: "VER"
    }
  },

  controlledValues: {
    status: ["Active", "Draft", "Deprecated", "Archived"],
    promptType: ["System", "Template", "Audit", "Research", "Teaching", "Design", "Code", "Workflow", "General"],
    toolTarget: ["ChatGPT", "Gemini", "Claude", "General"],
    boolean: [true, false],
    logStatus: ["Success", "Warning", "Error"]
  },

  sheets: [
    {
      sheetName: "Prompts",
      required: true,
      sortOrder: 1,
      freezeRows: 1,
      columns: [
        { key: "Prompt_ID", label: "Prompt_ID", type: "Text", required: true, unique: true, editable: false, defaultValue: null },
        { key: "Title", label: "Title", type: "Text", required: true, unique: false, editable: true, defaultValue: null },
        { key: "Category", label: "Category", type: "Enum", required: true, unique: false, editable: true, validationSource: "Categories.Category_Name", defaultValue: null },
        { key: "Subcategory", label: "Subcategory", type: "Enum", required: false, unique: false, editable: true, validationSource: "Subcategories.Subcategory", defaultValue: null },
        { key: "Description", label: "Description", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Preview_Text", label: "Preview_Text", type: "LongText", required: false, unique: false, editable: true, maxLength: 1500, defaultValue: null },
        { key: "Full_Doc_Link", label: "Full_Doc_Link", type: "Url", required: true, unique: true, editable: true, defaultValue: null },
        { key: "Tags", label: "Tags", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Is_Favorite", label: "Is_Favorite", type: "Boolean", required: true, unique: false, editable: true, allowedValuesRef: "controlledValues.boolean", defaultValue: false },
        { key: "Tool_Target", label: "Tool_Target", type: "Enum", required: false, unique: false, editable: true, allowedValuesRef: "controlledValues.toolTarget", defaultValue: "ChatGPT" },
        { key: "Prompt_Type", label: "Prompt_Type", type: "Enum", required: true, unique: false, editable: true, allowedValuesRef: "controlledValues.promptType", defaultValue: "General" },
        { key: "Status", label: "Status", type: "Enum", required: true, unique: false, editable: true, allowedValuesRef: "controlledValues.status", defaultValue: "Active" },
        { key: "Version", label: "Version", type: "Text", required: true, unique: false, editable: true, defaultValue: "v1.0" },
        { key: "Created_At", label: "Created_At", type: "DateTime", required: true, unique: false, editable: false, defaultValue: "{{now}}" },
        { key: "Updated_At", label: "Updated_At", type: "DateTime", required: true, unique: false, editable: false, defaultValue: "{{now}}" },
        { key: "Source", label: "Source", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Notes", label: "Notes", type: "LongText", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Variables", label: "Variables", type: "LongText", required: false, unique: false, editable: true, defaultValue: null }
      ]
    },
    {
      sheetName: "Categories",
      required: true,
      sortOrder: 2,
      freezeRows: 1,
      columns: [
        { key: "Category_ID", label: "Category_ID", type: "Text", required: true, unique: true, editable: false, defaultValue: null },
        { key: "Category_Name", label: "Category_Name", type: "Text", required: true, unique: true, editable: true, defaultValue: null },
        { key: "Description", label: "Description", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Sort_Order", label: "Sort_Order", type: "Number", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Date_Created", label: "Date_Created", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" },
        { key: "Date_Modified", label: "Date_Modified", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" }
      ],
      seedRows: [
        ["CAT-001", "קוד ופיתוח", "Code creation, review, architecture, debugging, optimization", 1],
        ["CAT-002", "עיצוב וממשק", "UI, UX, design systems, screen reconstruction, components", 2],
        ["CAT-003", "מסמכים וסיכומים", "Summaries, document reviews, handoffs, specifications", 3],
        ["CAT-004", "הוראה ולמידה", "Lesson plans, learning maps, beginner explanations, exercises", 4],
        ["CAT-005", "מחקר ואימות", "Source checking, comparisons, web research, freshness checks", 5],
        ["CAT-006", "ניהול עבודה", "Task breakdown, planning, progress review, decisions", 6],
        ["CAT-007", "כתיבת פרומפטים", "System prompts, templates, prompt improvement, prompt review", 7],
        ["CAT-008", "כללי", "Temporary, uncategorized, or pending prompts", 8],
        ["CAT-099", "ארכיון", "Deprecated or archived prompts", 99]
      ]
    },
    {
      sheetName: "Subcategories",
      required: true,
      sortOrder: 3,
      freezeRows: 1,
      columns: [
        { key: "Subcategory_ID", label: "Subcategory_ID", type: "Text", required: true, unique: true, editable: false, defaultValue: null },
        { key: "Category", label: "Category", type: "Enum", required: true, unique: false, editable: true, validationSource: "Categories.Category_Name", defaultValue: null },
        { key: "Subcategory", label: "Subcategory", type: "Text", required: true, unique: false, editable: true, defaultValue: null },
        { key: "Description", label: "Description", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Date_Created", label: "Date_Created", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" },
        { key: "Date_Modified", label: "Date_Modified", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" }
      ],
      seedRows: [
        ["SUB-001", "קוד ופיתוח", "כתיבת קוד", "Creating new code"],
        ["SUB-002", "קוד ופיתוח", "בדיקת קוד", "Code review and quality audit"],
        ["SUB-003", "קוד ופיתוח", "ארכיטקטורה", "System structure and responsibility separation"],
        ["SUB-004", "קוד ופיתוח", "תיקון שגיאות", "Debugging and fixing existing issues"],
        ["SUB-005", "קוד ופיתוח", "שיפור ביצועים", "Performance and efficiency improvement"],
        ["SUB-006", "קוד ופיתוח", "תיעוד קוד", "Code documentation and explanation"],
        ["SUB-007", "עיצוב וממשק", "ניתוח ממשק", "UI and UX review"],
        ["SUB-008", "עיצוב וממשק", "מערכת עיצוב", "Tokens, typography, spacing, color, components"],
        ["SUB-009", "עיצוב וממשק", "שחזור מסך", "Reconstructing screen structure from screenshots"],
        ["SUB-010", "עיצוב וממשק", "רכיבים", "Buttons, cards, forms, menus, interface components"],
        ["SUB-011", "עיצוב וממשק", "חוויית משתמש", "Flow, hierarchy, cognitive load, accessibility"],
        ["SUB-012", "מסמכים וסיכומים", "סיכום", "Summarizing existing documents"],
        ["SUB-013", "מסמכים וסיכומים", "ביקורת מסמך", "Reviewing clarity, structure, contradictions, gaps"],
        ["SUB-014", "מסמכים וסיכומים", "הנד־אובר", "Handoff document for continuing work"],
        ["SUB-015", "מסמכים וסיכומים", "מפרט", "Product, system, or workflow specification"],
        ["SUB-016", "מסמכים וסיכומים", "ארגון תוכן", "Structuring messy content"],
        ["SUB-017", "הוראה ולמידה", "מערך שיעור", "Full lesson plan"],
        ["SUB-018", "הוראה ולמידה", "מפת למידה", "Structured learning map"],
        ["SUB-019", "הוראה ולמידה", "הסבר למתחילים", "Beginner-friendly explanation"],
        ["SUB-020", "הוראה ולמידה", "תרגול", "Exercises, questions, practice tasks"],
        ["SUB-021", "הוראה ולמידה", "בניית קורס", "Course or sequence planning"],
        ["SUB-022", "מחקר ואימות", "בדיקת מקורות", "Source verification"],
        ["SUB-023", "מחקר ואימות", "השוואה", "Comparison between tools, methods, or options"],
        ["SUB-024", "מחקר ואימות", "מחקר רשת", "Web research"],
        ["SUB-025", "מחקר ואימות", "בדיקת עדכניות", "Freshness and currency checking"],
        ["SUB-026", "מחקר ואימות", "חילוץ ממצאים", "Extracting findings from sources"],
        ["SUB-027", "ניהול עבודה", "פירוק משימה", "Breaking a broad request into executable steps"],
        ["SUB-028", "ניהול עבודה", "תכנון שלבים", "Defining execution order"],
        ["SUB-029", "ניהול עבודה", "בדיקת התקדמות", "Reviewing current status and remaining work"],
        ["SUB-030", "ניהול עבודה", "קבלת החלטות", "Decision support between alternatives"],
        ["SUB-031", "ניהול עבודה", "ניהול גרסאות", "Tracking changes and versions"],
        ["SUB-032", "כתיבת פרומפטים", "פרומפט מערכת", "Role, constraints, process, and boundaries"],
        ["SUB-033", "כתיבת פרומפטים", "פרומפט תבנית", "Reusable prompt template"],
        ["SUB-034", "כתיבת פרומפטים", "שיפור פרומפט", "Refining and upgrading existing prompts"],
        ["SUB-035", "כתיבת פרומפטים", "ביקורת פרומפט", "Finding ambiguity, gaps, and failures"],
        ["SUB-036", "כתיבת פרומפטים", "פרומפטים מרובי שלבים", "Multi-step prompt workflows"],
        ["SUB-037", "כללי", "זמני", "Temporary classification"],
        ["SUB-038", "כללי", "לא מסווג", "No clear category yet"],
        ["SUB-039", "כללי", "לבדיקה", "Requires later review"]
      ]
    },
    {
      sheetName: "Tags",
      required: true,
      sortOrder: 4,
      freezeRows: 1,
      columns: [
        { key: "Tag_ID", label: "Tag_ID", type: "Text", required: true, unique: true, editable: false, defaultValue: null },
        { key: "Tag_Name", label: "Tag_Name", type: "Text", required: true, unique: true, editable: true, defaultValue: null },
        { key: "Tag_Color", label: "Tag_Color", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Description", label: "Description", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Date_Created", label: "Date_Created", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" },
        { key: "Date_Modified", label: "Date_Modified", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" }
      ],
      seedRows: []
    },
    {
      sheetName: "Prompt_Tags",
      required: true,
      sortOrder: 5,
      freezeRows: 1,
      columns: [
        { key: "Prompt_ID", label: "Prompt_ID", type: "Text", required: true, unique: false, editable: true, defaultValue: null },
        { key: "Tag_ID", label: "Tag_ID", type: "Text", required: true, unique: false, editable: true, defaultValue: null },
        { key: "Date_Created", label: "Date_Created", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" }
      ]
    },
    {
      sheetName: "Settings",
      required: true,
      sortOrder: 6,
      freezeRows: 1,
      columns: [
        { key: "Setting_Key", label: "Setting_Key", type: "Text", required: true, unique: true, editable: false, defaultValue: null },
        { key: "Setting_Value", label: "Setting_Value", type: "Text", required: true, unique: false, editable: true, defaultValue: null },
        { key: "Description", label: "Description", type: "Text", required: false, unique: false, editable: true, defaultValue: null },
        { key: "Date_Modified", label: "Date_Modified", type: "DateTime", required: false, unique: false, editable: false, defaultValue: "{{now}}" }
      ],
      seedRows: [
        ["previewTextLimit", "1500", "Maximum number of characters stored in Preview_Text"],
        ["defaultPromptStatus", "Active", "Default lifecycle status for a new prompt"],
        ["defaultPromptType", "General", "Default prompt type"],
        ["defaultToolTarget", "ChatGPT", "Default target tool"],
        ["defaultFavoriteState", "FALSE", "Default favorite state"],
        ["defaultVersion", "v1.0", "Default initial prompt version"]
      ]
    },
    {
      sheetName: "Logs",
      required: true,
      sortOrder: 7,
      freezeRows: 1,
      columns: [
        { key: "Log_ID", label: "Log_ID", type: "Text", required: true, unique: true, editable: false, defaultValue: null },
        { key: "Timestamp", label: "Timestamp", type: "DateTime", required: true, unique: false, editable: false, defaultValue: "{{now}}" },
        { key: "Action_Type", label: "Action_Type", type: "Text", required: true, unique: false, editable: false, defaultValue: null },
        { key: "Entity_Type", label: "Entity_Type", type: "Text", required: true, unique: false, editable: false, defaultValue: null },
        { key: "Entity_ID", label: "Entity_ID", type: "Text", required: false, unique: false, editable: false, defaultValue: null },
        { key: "Status", label: "Status", type: "Enum", required: true, unique: false, editable: false, allowedValuesRef: "controlledValues.logStatus", defaultValue: null },
        { key: "Message", label: "Message", type: "LongText", required: false, unique: false, editable: false, defaultValue: null }
      ]
    },
    {
      sheetName: "PromptVersions",
      required: true,
      sortOrder: 8,
      freezeRows: 1,
      columns: [
        { key: "Version_ID", label: "Version_ID", type: "Text", required: true, unique: true, editable: false, defaultValue: null },
        { key: "Prompt_ID", label: "Prompt_ID", type: "Text", required: true, unique: false, editable: false, defaultValue: null },
        { key: "Version", label: "Version", type: "Text", required: true, unique: false, editable: false, defaultValue: null },
        { key: "Snapshot_JSON", label: "Snapshot_JSON", type: "LongText", required: true, unique: false, editable: false, defaultValue: null },
        { key: "Saved_At", label: "Saved_At", type: "DateTime", required: true, unique: false, editable: false, defaultValue: "{{now}}" },
        { key: "Change_Summary", label: "Change_Summary", type: "Text", required: false, unique: false, editable: false, defaultValue: null }
      ]
    }
  ],

  migration: {
    preserveExistingSheets: true,
    preserveExistingColumns: true,
    hiddenSheetsRequireReview: true,
    legacyFieldMap: {
      Prompt_ID: "Prompt_ID",
      Title: "Title",
      Description: "Description",
      Content: "Preview_Text",
      Category_ID: "Category",
      Prompt_Type: "Prompt_Type",
      Is_Pinned: "Is_Favorite",
      Date_Created: "Created_At",
      Date_Modified: "Updated_At"
    },
    deprecatedSheetsDetected: [
      "Prompts1",
      "Prompts2",
      "Prompts4",
      "Prompts5",
      "SCHEMA1",
      "SCHEMA2",
      "Categories1",
      "Tags1",
      "Prompt_Tags1"
    ]
  }
});