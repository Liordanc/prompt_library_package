/**
 * @file 14_prompt_library_public_setup_runner.gs
 * @category 🚀 נקודת כניסה ציבורית להקמה
 *
 * קובץ זה מספק נקודת כניסה ציבורית אחת ופשוטה
 * להפעלת כל רצף ההקמה של הספרייה.
 *
 * פונקציות ציבוריות ראשיות:
 * - runFullProjectSetup — מפעילה את כל רצף ההקמה המלא בקריאה אחת
 *
 * דרישות: 12_prompt_library_menu_controller.gs
 */

/**
 * מפעילה את כל רצף ההקמה המלא של הפרויקט בקריאה אחת — ממנה כדאי להתחיל.
 * @category ציבורי
 * ▶️ ניתן להרצה ישירה מהסקריפט
 * @returns {Object} תוצאת ההקמה עם ok, stopped, ורשימת השלבים שבוצעו
 */
function runFullProjectSetup() {
  return runFullSetupSequence_();
}
