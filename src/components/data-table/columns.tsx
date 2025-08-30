import { Checkbox } from "@/components/ui/checkbox";
import type { ObjectItem } from "@/types/s3";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

export const columns: ColumnDef<ObjectItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Object
          {isSorted ? (
            isSorted === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            )
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "folder") {
        return (
          <a href={`/${item.name}`} className="text-blue-600 hover:underline">
            {item.name}
          </a>
        );
      }
      return <span>{item.name}</span>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Type
          {isSorted ? (
            isSorted === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            )
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Last Modified
          {isSorted ? (
            isSorted === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            )
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Timestamp
          {isSorted ? (
            isSorted === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            )
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "class",
    header: "Class",
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Size
          {isSorted ? (
            isSorted === "asc" ? (
              <ArrowUp />
            ) : (
              <ArrowDown />
            )
          ) : (
            <ArrowUpDown />
          )}
        </Button>
      );
    },
  },
];
