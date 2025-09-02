import listExplorerItemsFromS3 from "@/api/listS3Objects";
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
import { Folder, Home } from "lucide-react";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

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
      await listExplorerItemsFromS3()
        .then((data) => setData(data))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));

    fetchData();
  }, []);

  const { trimmed, segments } = useMemo(() => {
    const trimmed = path.replace(/^\/+|\/+$/g, "");
    const segments = trimmed === "" ? [] : trimmed.split("/");
    return { trimmed, segments };
  }, [path]);

  const currentData = useMemo(
    () => data?.find((items) => items.path === trimmed)?.objects || [],
    [data, trimmed],
  );

  const updateCurrentData = useCallback(async () => {
    await listExplorerItemsFromS3()
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="flex flex-1 flex-col py-4 px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>
                <Home className="h-4 w-4" />
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to="/" search={(prev) => ({ ...prev, path: "" })}>
                  <Home className="h-4 w-4" />
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
                    <>
                      <Folder className="h-4 w-4 text-foreground" />
                      <BreadcrumbPage>{seg}</BreadcrumbPage>
                    </>
                  ) : (
                    <BreadcrumbLink asChild>
                      <>
                        <Folder className="h-4 w-4" />
                        <Link
                          to="/"
                          search={(prev) => ({ ...prev, path: prefix })}
                        >
                          {seg}
                        </Link>
                      </>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <DataTable
        columns={columns}
        data={currentData}
        path={trimmed}
        updateData={updateCurrentData}
      />
    </div>
  );
}
