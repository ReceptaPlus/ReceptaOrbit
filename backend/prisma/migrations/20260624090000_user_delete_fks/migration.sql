-- Permite excluir um usuário sem violar FKs:
--  · memberships que ELE convidou: invited_by_user_id vira NULL (preserva o vínculo)
--  · convites que ELE criou: são removidos junto (pendentes, sem valor após a exclusão)
ALTER TABLE "pharmacy_memberships" DROP CONSTRAINT "pharmacy_memberships_invited_by_user_id_fkey";
ALTER TABLE "pharmacy_memberships" ADD CONSTRAINT "pharmacy_memberships_invited_by_user_id_fkey"
    FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_invitations" DROP CONSTRAINT "user_invitations_created_by_user_id_fkey";
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
