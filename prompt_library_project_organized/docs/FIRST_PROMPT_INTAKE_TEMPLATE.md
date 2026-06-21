# Prompt Library First Prompt Intake Template

```javascript
addPrompt({
  Title: "",
  Category: "כללי",
  Subcategory: "לבדיקה",
  Description: "",
  Full_Prompt: ``,
  Tags: [],
  Is_Favorite: false,
  Tool_Target: "ChatGPT",
  Prompt_Type: "General",
  Status: "Draft",
  Source: "ChatGPT conversation",
  Notes: ""
});
```

## Example

```javascript
addPrompt({
  Title: "Prompt Improvement Audit",
  Category: "כתיבת פרומפטים",
  Subcategory: "שיפור פרומפט",
  Description: "Reviews and improves an existing prompt while preserving its intended goal.",
  Full_Prompt: `You are a prompt improvement specialist.

Analyze the provided prompt for clarity, missing constraints, conflicting instructions, structure, and execution risk.

Return:
1. Main problems.
2. Required changes.
3. Improved prompt.
4. Notes about remaining risks.`,
  Tags: ["prompt-writing", "audit", "improvement"],
  Is_Favorite: true,
  Tool_Target: "General",
  Prompt_Type: "Audit",
  Status: "Active",
  Source: "Initial library setup",
  Notes: "Use as the first real prompt only if no better production prompt is selected."
});
```
