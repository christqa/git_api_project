UPDATE "Profile"
SET bowel_movement_id = 1
WHERE bowel_movement_id IN (4,5,6);

DELETE FROM "BowelMovement"
WHERE id IN (4,5,6);

UPDATE "BowelMovement" SET text = '2-3 times per day' WHERE id = 2;
UPDATE "BowelMovement" SET text = '4 times per day or more' WHERE id = 3;

UPDATE "BowelMovement"
SET id = t.id, text = t.text
FROM (
  SELECT id, text
  FROM "BowelMovement"
  ORDER BY id
) t
WHERE "BowelMovement".id = t.id;

UPDATE "ReferenceDataVersion" SET version = version + 1 WHERE id = 1;