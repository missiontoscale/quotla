import { useState, ReactNode } from 'react';
import { Search, Edit, Trash2, Download, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onDownload?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  resultCount?: number;
}

export function DataTable({
  columns,
  data,
  onDownload,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = 'Search...',
  filters,
  resultCount,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const displayCount = resultCount !== undefined ? resultCount : filteredData.length;

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-9 h-9 text-[0.81rem] bg-primary-700 border-primary-600 text-primary-50"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {filters}
      </div>

      <div className="bg-primary-800 border border-primary-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary-600 hover:bg-primary-700/50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="text-primary-400 text-[0.72rem] py-3">
                    {column.label}
                  </TableHead>
                ))}
                {(onDownload || onEdit || onDelete) && (
                  <TableHead className="text-primary-400 text-right text-[0.72rem] py-3 max-md:hidden w-24"></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className="border-primary-600 hover:bg-primary-700/50 md:cursor-default cursor-pointer group"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      if (onView) {
                        onView(row);
                      } else if (onEdit) {
                        onEdit(row);
                      }
                    }
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-primary-200 text-[0.81rem] py-3">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  {(onDownload || onEdit || onDelete) && (
                    <TableCell className="text-right py-3 max-md:hidden">
                      <div className="flex items-center justify-end gap-1">
                        {onDownload && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(row);
                            }}
                            className="text-quotla-orange hover:text-secondary-400 hover:bg-primary-700 h-7 w-7"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            className="text-primary-400 hover:text-quotla-orange hover:bg-primary-700 h-7 w-7"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <div className="overflow-hidden transition-all duration-300 ease-in-out w-0 group-hover:w-7 opacity-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                              }}
                              className="text-rose-400 hover:bg-rose-500/20 h-7 w-7"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-[0.81rem] text-primary-400">
          <span className="hidden sm:inline">Show</span>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-18 h-11 sm:h-8 text-[0.81rem] bg-primary-700 border-primary-600 text-primary-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-primary-800 border-primary-600">
              <SelectItem value="10" className="min-h-[44px] sm:min-h-0">10</SelectItem>
              <SelectItem value="25" className="min-h-[44px] sm:min-h-0">25</SelectItem>
              <SelectItem value="50" className="min-h-[44px] sm:min-h-0">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[0.81rem]">
            <span className="hidden sm:inline">of </span>{filteredData.length}<span className="hidden sm:inline"> entries</span>
          </span>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-primary-600 text-primary-300 hover:bg-primary-700 disabled:opacity-50 text-[0.72rem] h-11 sm:h-8 px-4 sm:px-3"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? 'bg-quotla-orange text-white hover:bg-secondary-500 text-[0.72rem] h-8 w-8'
                      : 'border-primary-600 text-primary-300 hover:bg-primary-700 text-[0.72rem] h-8 w-8'
                  }
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <span className="sm:hidden text-[0.81rem] text-primary-400">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-primary-600 text-primary-300 hover:bg-primary-700 disabled:opacity-50 text-[0.72rem] h-11 sm:h-8 px-4 sm:px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
