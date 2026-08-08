/**
 * Standardized Sequential Composite ID Schema (Requirement 4)
 * ID Format Formula: `${className}-${subjectName}-ch${chapterNumber}`
 * Example: "class9-maths-ch1", "ssc-physics-ch4"
 * ONLY raw numeric integer represents the chapter in the ID string.
 */
export function buildCompositeId(className: string, subjectName: string, chapterNumber: number | string): string {
  const cleanClass = className.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanSubject = subjectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const numChapter = typeof chapterNumber === 'number'
    ? chapterNumber
    : (parseInt(String(chapterNumber).replace(/\D/g, ''), 10) || 1);

  return `${cleanClass}-${cleanSubject}-ch${numChapter}`;
}
