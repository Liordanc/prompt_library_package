/**
 * Prompt Library Document Service
 * Requires: PROMPT_LIBRARY_SCHEMA
 */

function createPromptDocument(promptData) {
  const folder = getOrCreatePromptFolder_(promptData.Category || "כללי");
  const documentName = buildPromptDocumentName_(promptData);
  const document = DocumentApp.create(documentName);
  const file = DriveApp.getFileById(document.getId());

  folder.addFile(file);
  removeFileFromRoot_(file);

  populatePromptDocument(document.getId(), promptData);

  logAction(
    "CREATE_PROMPT_DOCUMENT",
    "Document",
    document.getId(),
    "Success",
    `Prompt document created: ${documentName}`
  );

  return {
    documentId: document.getId(),
    documentUrl: document.getUrl(),
    documentName
  };
}

function populatePromptDocument(documentId, promptData) {
  const document = DocumentApp.openById(documentId);
  const body = document.getBody();

  body.clear();

  appendDocumentTitle_(body, promptData.Title);
  appendIdentificationSection_(body, promptData);
  appendUseCaseSection_(body, promptData);
  appendCurrentPromptSection_(body, promptData);
  appendUsageNotesSection_(body, promptData);
  appendVersionHistorySection_(body, promptData);

  document.saveAndClose();

  return {
    documentId,
    documentUrl: document.getUrl()
  };
}

function updatePromptDocument(promptId, newPromptContent, notes) {
  const record = getPromptRecordById(promptId);

  if (!record) {
    throw new Error(`Prompt not found: ${promptId}`);
  }

  const documentId = extractDocumentIdFromUrl_(record.Full_Doc_Link);
  const document = DocumentApp.openById(documentId);
  const body = document.getBody();

  replaceSectionContent_(body, "Current Prompt", newPromptContent);

  if (notes) {
    replaceSectionContent_(body, "Usage Notes", notes);
  }

  document.saveAndClose();

  logAction(
    "UPDATE_PROMPT_DOCUMENT",
    "Prompt",
    promptId,
    "Success",
    "Prompt document updated"
  );

  return {
    promptId,
    documentId,
    documentUrl: document.getUrl()
  };
}

function validatePromptDocument(promptId) {
  const record = getPromptRecordById(promptId);

  if (!record) {
    return {
      ok: false,
      promptId,
      errors: [`Prompt record not found: ${promptId}`]
    };
  }

  if (!record.Full_Doc_Link) {
    return {
      ok: false,
      promptId,
      errors: ["Full_Doc_Link is missing"]
    };
  }

  const documentId = extractDocumentIdFromUrl_(record.Full_Doc_Link);
  const document = DocumentApp.openById(documentId);
  const bodyText = document.getBody().getText();

  const requiredSections = [
    "Identification",
    "Use Case",
    "Current Prompt",
    "Usage Notes",
    "Version History"
  ];

  const missingSections = requiredSections.filter(section => !bodyText.includes(section));
  const errors = [];

  if (!bodyText.includes(String(record.Prompt_ID))) {
    errors.push("Prompt_ID not found in document");
  }

  if (missingSections.length > 0) {
    errors.push(`Missing sections: ${missingSections.join(", ")}`);
  }

  return {
    ok: errors.length === 0,
    promptId,
    documentId,
    errors
  };
}

function buildPromptDocumentName_(promptData) {
  const category = String(promptData.Category || "כללי").trim();
  const title = String(promptData.Title || "Untitled Prompt").trim();
  const version = String(promptData.Version || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion).trim();

  return `[${category}] ${title} - ${version}`;
}

function appendDocumentTitle_(body, title) {
  body.appendParagraph(title || "Untitled Prompt")
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);
}

function appendIdentificationSection_(body, promptData) {
  body.appendParagraph("Identification")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const rows = [
    ["Field", "Value"],
    ["Prompt_ID", promptData.Prompt_ID || ""],
    ["Title", promptData.Title || ""],
    ["Category", promptData.Category || ""],
    ["Subcategory", promptData.Subcategory || ""],
    ["Current_Version", promptData.Version || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion],
    ["Status", promptData.Status || PROMPT_LIBRARY_SCHEMA.settings.defaultPromptStatus],
    ["Updated_At", formatDateTime_(promptData.Updated_At || new Date())]
  ];

  body.appendTable(rows);
}

function appendUseCaseSection_(body, promptData) {
  body.appendParagraph("Use Case")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(promptData.Description || "");
}

function appendCurrentPromptSection_(body, promptData) {
  body.appendParagraph("Current Prompt")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const promptText = promptData.Full_Prompt || promptData.Content || promptData.Preview_Text || "";
  body.appendParagraph(promptText);
}

function appendUsageNotesSection_(body, promptData) {
  body.appendParagraph("Usage Notes")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(promptData.Notes || "");
}

function appendVersionHistorySection_(body, promptData) {
  body.appendParagraph("Version History")
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const rows = [
    ["Version", "Date", "Change Summary", "Status"],
    [
      promptData.Version || PROMPT_LIBRARY_SCHEMA.settings.defaultVersion,
      formatDateTime_(promptData.Created_At || new Date()),
      "Initial version",
      promptData.Status || PROMPT_LIBRARY_SCHEMA.settings.defaultPromptStatus
    ]
  ];

  body.appendTable(rows);
}

function replaceSectionContent_(body, sectionTitle, newContent) {
  const paragraphs = body.getParagraphs();
  let sectionIndex = -1;
  let nextSectionIndex = -1;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const text = paragraph.getText().trim();

    if (text === sectionTitle) {
      sectionIndex = body.getChildIndex(paragraph);
      continue;
    }

    if (sectionIndex !== -1 && paragraph.getHeading() === DocumentApp.ParagraphHeading.HEADING2) {
      nextSectionIndex = body.getChildIndex(paragraph);
      break;
    }
  }

  if (sectionIndex === -1) {
    throw new Error(`Section not found: ${sectionTitle}`);
  }

  const deleteFrom = sectionIndex + 1;
  const deleteTo = nextSectionIndex === -1 ? body.getNumChildren() - 1 : nextSectionIndex - 1;

  for (let i = deleteTo; i >= deleteFrom; i--) {
    body.removeChild(body.getChild(i));
  }

  body.insertParagraph(deleteFrom, String(newContent || ""));
}

function getOrCreatePromptRootFolder_() {
  const rootFolderName = "Prompt Library";
  const folders = DriveApp.getFoldersByName(rootFolderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(rootFolderName);
}

function getOrCreatePromptFolder_(categoryName) {
  const rootFolder = getOrCreatePromptRootFolder_();
  const folderName = resolveCategoryFolderName_(categoryName);
  const folders = rootFolder.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return rootFolder.createFolder(folderName);
}

function resolveCategoryFolderName_(categoryName) {
  const map = {
    "קוד ופיתוח": "01 - קוד ופיתוח",
    "עיצוב וממשק": "02 - עיצוב וממשק",
    "מסמכים וסיכומים": "03 - מסמכים וסיכומים",
    "הוראה ולמידה": "04 - הוראה ולמידה",
    "מחקר ואימות": "05 - מחקר ואימות",
    "ניהול עבודה": "06 - ניהול עבודה",
    "כתיבת פרומפטים": "07 - כתיבת פרומפטים",
    "כללי": "08 - כללי",
    "ארכיון": "99 - ארכיון"
  };

  return map[categoryName] || "08 - כללי";
}

function removeFileFromRoot_(file) {
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (error) {
    logError("REMOVE_FILE_FROM_ROOT", "File", file.getId(), error.message);
  }
}

function extractDocumentIdFromUrl_(url) {
  const text = String(url || "");
  const match = text.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);

  if (match && match[1]) {
    return match[1];
  }

  if (/^[a-zA-Z0-9-_]+$/.test(text)) {
    return text;
  }

  throw new Error("Invalid Google Docs URL or document ID");
}

function formatDateTime_(value) {
  const date = value instanceof Date ? value : new Date(value);

  return Utilities.formatDate(
    date,
    PROMPT_LIBRARY_SCHEMA.timezone,
    "yyyy-MM-dd HH:mm:ss"
  );
}
