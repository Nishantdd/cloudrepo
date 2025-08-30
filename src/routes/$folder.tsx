import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import data from "@/data/explorer";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/$folder")({
  component: App,
});

function App() {
  const folder = useParams({ from: "/$folder" });
  return <DataTable columns={columns} data={data.data} />;
}
