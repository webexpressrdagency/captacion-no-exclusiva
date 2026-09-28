import { getConfig } from "@/lib/blob-store";
import FormRenderer from "@/components/FormRenderer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getConfig();
  return <FormRenderer config={config} />;
}
