UPDATE "LifeStyle" SET text = 
  CASE 
    WHEN id = 1 THEN 'Every day'
    WHEN id = 2 THEN '1-2 days per week'
    WHEN id = 3 THEN '3-5 days per week'
    WHEN id = 4 THEN 'Less than one day per week'
    WHEN id = 5 THEN 'Not at all'
    ELSE text 
  END;

UPDATE "Profile" SET life_style_id = 1 WHERE life_style_id = 6;

DELETE FROM "LifeStyle" WHERE id = 6;

UPDATE "ReferenceDataVersion" SET version = version + 1 WHERE id = 1;