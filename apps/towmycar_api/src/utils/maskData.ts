import { SQL, Column, sql } from "@towmycar/database";

export function maskText(text: SQL<string> | Column<any, any, any>, visibleChars: number = 3): SQL<string> {
  return sql<string>`CASE 
    WHEN ${text} IS NULL THEN NULL
    ELSE CONCAT(SUBSTRING(${text}, 1, ${visibleChars}), REPEAT('*', GREATEST(LENGTH(${text}) - ${visibleChars}, 0)))
  END`;
}

export function maskSensitiveData(
  text: SQL<string> | Column<any, any, any>,
  isVisible: SQL<boolean>,
  visibleChars: number = 3
): SQL<string> {
  return sql<string>`CASE 
    WHEN ${isVisible} THEN ${text}
    ELSE ${maskText(text, visibleChars)}
  END`;
} 