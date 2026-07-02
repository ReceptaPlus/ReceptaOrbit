import { getPharmacyVM } from "@/modules/settings/queries";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { can } from "@/modules/tenancy/authz";
import { FarmaciaForm } from "./farmacia-form";

export default async function FarmaciaPage() {
  const [pharmacy, ctx] = await Promise.all([getPharmacyVM(), getAuthorizedPharmacyContext()]);
  const canEdit = can("edit_pharmacy", ctx.role);

  return <FarmaciaForm initial={pharmacy} canEdit={canEdit} />;
}
