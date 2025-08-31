import getExplorerItemsFromS3 from "@/api/getS3Objects";
import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/data-table";
import { Loading } from "@/components/loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ExplorerItem } from "@/types/s3";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Fragment, useEffect, useMemo, useState } from "react";

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
    const fetchData = async () =>
      await getExplorerItemsFromS3()
        .then((data) => setData(data))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));

    fetchData();
  }, []);

  const currentData = useMemo(
    () => data?.find((items) => items.path === path)?.objects || [],
    [data, path],
  );

  const segments = useMemo(() => {
    const trimmed = path.replace(/^\/+|\/+$/g, "");
    return trimmed === "" ? [] : trimmed.split("/");
  }, [path]);

  if (loading) return <Loading />;

  return (
    <div className="flex flex-1 flex-col py-4 px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>Home</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to="/" search={(prev) => ({ ...prev, path: "" })}>
                  /
                </Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>

          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;
            const prefix = `/${segments.slice(0, idx + 1).join("/")}`;
            return (
              <Fragment key={prefix}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{seg}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to="/"
                        search={(prev) => ({ ...prev, path: prefix })}
                      >
                        {seg}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <DataTable columns={columns} data={currentData} />
    </div>
  );
}
