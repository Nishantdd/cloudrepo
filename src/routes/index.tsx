import getS3Objects from "@/api/getS3Objects";
import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import { Loading } from "@/components/loading";
import type { ExplorerItem } from "@/types/s3";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  validateSearch: (search) => ({
    ...search,
    path: (search.path as string) ?? "",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { path } = Route.useSearch();
  const [data, setData] = useState<ExplorerItem[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const d = await getS3Objects("");
      setData(d);
      setLoading(false);
    };
    fetchData();
  }, []);

  const currentData = useMemo(
    () => data?.find((items) => items.path === path)?.objects || [],
    [data, path],
  );

  if(loading) return <Loading />

  return (
    <div className="flex flex-1 py-4 px-8">
      <DataTable columns={columns} data={currentData} />
    </div>
  );
}
