import { settings } from "@/lib/reservations";
import { SettingsForm } from "@/components/AdminForms";
export default async function Settings() {
  return (
    <>
      <div className="eyebrow">Business configuration</div>
      <h1>Settings</h1>
      <p className="muted">
        Manage pricing defaults and pending reservation holds.
      </p>
      <SettingsForm settings={JSON.parse(JSON.stringify(await settings()))} />
    </>
  );
}
