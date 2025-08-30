import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import data from "@/data/explorer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  validateSearch: (search) => ({
    ...search,
    path: (search.path as string) ?? "root",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { path } = Route.useSearch();
  const currentData = data.find((items) => items.path === path)?.objects || [];
  return <DataTable columns={columns} data={currentData} />;
}
