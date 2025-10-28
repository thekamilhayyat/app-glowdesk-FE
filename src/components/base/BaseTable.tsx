import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table as AntTable } from "antd";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseSelect, BaseSelectItem } from "@/components/base/BaseSelect";
import { BaseTooltip } from "@/components/base/BaseTooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface SortConfig {
  field: keyof any;
  direction: "asc" | "desc";
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export interface BaseTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  sortConfig?: SortConfig;
  onSort?: (field: keyof T) => void;
  pagination?: PaginationConfig;
  showPagination?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  caption?: string;
  showHeader?: boolean;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
}

export function BaseTable<T extends Record<string, any>>({
  data,
  columns,
  sortConfig,
  onSort,
  pagination,
  showPagination = true,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No data available",
  loading = false,
  className,
  caption,
  showHeader = true,
  rowClassName,
  onRowClick,
}: BaseTableProps<T>) {
  const handleSort = (field: keyof T) => {
    console.log("BaseTable handleSort called with field:", field);
    console.log("Column sortable:", columns.find(col => col.key === field)?.sortable);
    console.log("onSort function exists:", !!onSort);
    
    if (onSort && columns.find(col => col.key === field)?.sortable !== false) {
      console.log("Calling onSort with field:", field);
      onSort(field);
    }
  };

  const getSortIcon = (field: keyof T) => {
    if (!sortConfig || sortConfig.field !== field) {
      return <ChevronUp className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const isSortable = (field: keyof T) => {
    const column = columns.find(col => col.key === field);
    return column?.sortable !== false && !!onSort;
  };

  const renderCell = (column: TableColumn<T>, item: T) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    return value;
  };

  const totalPages = pagination && showPagination ? Math.ceil(pagination.totalItems / pagination.itemsPerPage) : 0;
  const startIndex = pagination && showPagination ? (pagination.currentPage - 1) * pagination.itemsPerPage : 0;
  const endIndex = pagination && showPagination ? startIndex + pagination.itemsPerPage : data.length;
  const currentData = pagination && showPagination ? data.slice(startIndex, endIndex) : data;

  // Convert columns to Ant Design format
  const antColumns = columns.map((column) => ({
    title: (
      <div className="flex items-center gap-2">
        <span>{column.header}</span>
        {isSortable(column.key) && getSortIcon(column.key)}
      </div>
    ),
    dataIndex: String(column.key),
    key: String(column.key),
    width: column.width,
    className: column.className,
    render: (value: any, record: T) => renderCell(column, record),
    onHeaderCell: () => ({
      onClick: () => handleSort(column.key),
      style: { cursor: isSortable(column.key) ? 'pointer' : 'default' }
    }),
  }));

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="border rounded-md">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="border rounded-md">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <AntTable
        columns={antColumns}
        dataSource={currentData}
        rowKey={(record) => record.id || record.key || record.employee_id || Math.random().toString()}
        pagination={false}
        showHeader={showHeader}
        onRow={(record, index) => ({
          onClick: () => onRowClick?.(record),
          className: cn(
            onRowClick && "cursor-pointer",
            rowClassName?.(record, index || 0)
          ),
        })}
        locale={{
          emptyText: emptyMessage
        }}
      />

      {/* Pagination */}
      {pagination && showPagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <BaseSelect
              value={pagination.itemsPerPage.toString()}
              onValueChange={(value) => pagination.onItemsPerPageChange(parseInt(value))}
              className="w-20"
            >
              <BaseSelectItem value="5">5</BaseSelectItem>
              <BaseSelectItem value="10">10</BaseSelectItem>
              <BaseSelectItem value="20">20</BaseSelectItem>
              <BaseSelectItem value="50">50</BaseSelectItem>
            </BaseSelect>
            <span className="text-sm text-muted-foreground">entries</span>
            <span className="text-sm text-muted-foreground">
              ({startIndex + 1}-{Math.min(endIndex, pagination.totalItems)} of {pagination.totalItems})
            </span>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <BaseTooltip content="Previous page">
                <BaseButton
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(Math.max(pagination.currentPage - 1, 1))}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </BaseButton>
              </BaseTooltip>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <BaseButton
                  key={page}
                  variant={pagination.currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => pagination.onPageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </BaseButton>
              ))}
              
              <BaseTooltip content="Next page">
                <BaseButton
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(Math.min(pagination.currentPage + 1, totalPages))}
                  disabled={pagination.currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </BaseButton>
              </BaseTooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to create sortable columns
export function createSortableColumn<T>(
  key: keyof T,
  header: string,
  options?: {
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
    width?: string;
  }
): TableColumn<T> {
  return {
    key,
    header,
    sortable: true,
    ...options,
  };
}

// Helper function to create non-sortable columns
export function createColumn<T>(
  key: keyof T,
  header: string,
  options?: {
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
    width?: string;
  }
): TableColumn<T> {
  return {
    key,
    header,
    sortable: false,
    ...options,
  };
} 