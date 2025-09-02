import { useState } from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  ArrowDownToLine,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  File,
  Folder,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import deleteS3Object from "@/api/deleteS3Object";
import getS3Blob from "@/api/getS3Blob";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ObjectItem } from "@/types/s3";
import JSZip from "jszip";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  path: string;
  updateData: () => Promise<void>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  path,
  updateData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [selectedColumn, setSelectedColumn] = useState("name");
  const [stateMessage, setStateMessage] = useState({
    downloadMessage: "",
    deleteMessage: "",
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const downloadSelectedItems = async () => {
    setStateMessage((prev) => ({ ...prev, downloadMessage: "Downloading" }));
    const selectedRows = table.getSelectedRowModel().rows;
    const originalRows: ObjectItem[] =
      selectedRows.length > 0
        ? (selectedRows.map((row) => row.original) as ObjectItem[])
        : [];

    try {
      const entries = await Promise.all(
        originalRows.map(async (item) => {
          const key = path.length ? `${path}/${item.name}` : `${item.name}`;
          const blob = await getS3Blob(key);
          return { name: item.name, blob };
        }),
      );

      if (entries.length === 1) {
        const { name, blob } = entries[0];
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStateMessage((prev) => ({ ...prev, downloadMessage: "" }));
        return;
      }

      setStateMessage((prev) => ({ ...prev, downloadMessage: "Zipping" }));

      const zip = new JSZip();
      for (const entry of entries) {
        zip.file(entry.name, entry.blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `download-${new Date().toISOString().split("T")[0]}.zip`;
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(zipUrl), 2000);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download files. See console for details.");
    } finally {
      setStateMessage((prev) => ({ ...prev, downloadMessage: "" }));
    }
  };

  const deleteSelectedItems = async () => {
    setStateMessage((prev) => ({ ...prev, deleteMessage: "Deleting" }));
    const selectedRows = table.getSelectedRowModel().rows;
    const originalRows: ObjectItem[] =
      selectedRows.length > 0
        ? (selectedRows.map((row) => row.original) as ObjectItem[])
        : [];

    try {
      await Promise.all(
        originalRows.map(async (item) => {
          const key = path.length ? `${path}/${item.name}` : `${item.name}`;
          await deleteS3Object(key);
        }),
      );

      await updateData();
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("Failed to delete selected items. See console for details.");
    } finally {
      setStateMessage((prev) => ({ ...prev, deleteMessage: "" }));
    }
  };

  return (
    <div className="w-full space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex rounded-md shadow-xs relative">
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <Search className="size-4" />
              <span className="sr-only">Search</span>
            </div>
            <Input
              placeholder="Filter objects..."
              value={
                (table.getColumn(selectedColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn(selectedColumn)
                  ?.setFilterValue(event.target.value)
              }
              className="peer px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none -me-px rounded-e-none shadow-none focus-visible:z-1"
            />
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="rounded-s-none shadow-none">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name" className="pr-2 [&_svg]:hidden">
                  Object
                </SelectItem>
                <SelectItem value="type" className="pr-2 [&_svg]:hidden">
                  Type
                </SelectItem>
                <SelectItem
                  value="lastModified"
                  className="pr-2 [&_svg]:hidden"
                >
                  Last Modified
                </SelectItem>
                <SelectItem value="timestamp" className="pr-2 [&_svg]:hidden">
                  Timestamp
                </SelectItem>
                <SelectItem value="class" className="pr-2 [&_svg]:hidden">
                  Class
                </SelectItem>
                <SelectItem value="size" className="pr-2 [&_svg]:hidden">
                  Size
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="inline-flex w-fit -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-none rounded-s-md shadow-none focus-visible:z-10"
                onClick={() => console.log("Add File (Default Action)")}
                disabled={
                  Boolean(stateMessage.deleteMessage) ||
                  Boolean(stateMessage.downloadMessage)
                }
              >
                <Plus />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onSelect={() => console.log("Add File selected")}
              >
                <File />
                File
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => console.log("Add Folder selected")}
              >
                <Folder />
                Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className="rounded-none shadow-none focus-visible:z-10"
            onClick={downloadSelectedItems}
            disabled={
              Object.keys(rowSelection).length === 0 ||
              Boolean(stateMessage.downloadMessage) ||
              Boolean(stateMessage.deleteMessage)
            }
          >
            {stateMessage.downloadMessage ? (
              <>
                <Loader2 className="animate-spin" />
                {stateMessage.downloadMessage}
              </>
            ) : (
              <>
                <ArrowDownToLine />
                Download
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="rounded-none rounded-e-md shadow-none focus-visible:z-10"
            onClick={deleteSelectedItems}
            disabled={
              Object.keys(rowSelection).length === 0 ||
              Boolean(stateMessage.deleteMessage) ||
              Boolean(stateMessage.downloadMessage)
            }
          >
            {stateMessage.deleteMessage ? (
              <>
                <Loader2 className="animate-spin" />
                {stateMessage.deleteMessage}
              </>
            ) : (
              <>
                <Trash2 />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border [&>div]:max-h-[70vh]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="[&>*]:whitespace-nowrap sticky top-0 bg-background"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label className="max-sm:sr-only">Rows per page</Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
          <p>
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getRowCount(),
              )}
            </span>{" "}
            of <span className="text-foreground">{table.getRowCount()}</span>
          </p>
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirstIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLastIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
