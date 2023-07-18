-- Remove duplicates
DELETE FROM "Invitations"
WHERE id IN (
  SELECT id
  FROM "Invitations"
  WHERE deleted IS NULL
    AND accepted_at IS NULL
    AND rejected_at IS NULL
  EXCEPT
  SELECT MAX(id)
  FROM "Invitations"
  WHERE deleted IS NULL
    AND accepted_at IS NULL
    AND rejected_at IS NULL
  GROUP BY from_user_id,
    to_user_email,
    to_group_id
  );
