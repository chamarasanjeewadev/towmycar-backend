import { SQL, Column, sql } from "@towmycar/database";
import { TRIAL_PERIOD_DAYS } from "@towmycar/common";

export function getIsInTrialPeriod(
  createdAt: Column<any, any, any>,
): SQL<boolean> {
  return sql`
    DATE_PART('day', NOW() - ${createdAt}) <= ${TRIAL_PERIOD_DAYS}
  `;
}

export function maskSensitiveData(
  text: SQL<string> | Column<any, any, any>,
  isVisible: SQL<boolean>,
  visibleChars: number = 3,
): SQL<string> {
  return sql<string>`CASE 
    WHEN ${isVisible} THEN ${text}
    ELSE CASE 
      WHEN ${text} IS NULL THEN NULL
      ELSE CONCAT(
        SUBSTRING(${text}, 1, ${visibleChars}), 
        REPEAT('*', GREATEST(LENGTH(${text}) - ${visibleChars}, 0))
      )
    END
  END`;
}
