import { getWhatsAppStatusVM } from "@/modules/settings/whatsapp";
import { getAuthorizedPharmacyContext } from "@/server/auth/dal";
import { can } from "@/modules/tenancy/authz";
import { WhatsAppPanel } from "@/modules/settings/components/whatsapp-panel";

export default async function WhatsAppConfigPage() {
  const [status, ctx] = await Promise.all([
    getWhatsAppStatusVM(),
    getAuthorizedPharmacyContext(),
  ]);
  const canManage = can("manage_whatsapp", ctx.role);

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        Pareie o WhatsApp da farmácia para começar a registrar as conversas.
      </p>
      <WhatsAppPanel initial={status} canManage={canManage} />
    </div>
  );
}
