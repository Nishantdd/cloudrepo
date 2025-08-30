import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import data from "@/data/explorer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DataTable columns={columns} data={data.root} />;
}
