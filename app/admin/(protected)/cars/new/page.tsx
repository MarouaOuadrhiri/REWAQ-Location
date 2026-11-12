import { VehicleForm } from "@/components/AdminForms";
export default function NewVehicle() {
  return (
    <>
      <div className="eyebrow">Fleet management</div>
      <h1>Add a vehicle</h1>
      <p className="muted">
        Set individual rates and upload photography after saving.
      </p>
      <VehicleForm />
    </>
  );
}
