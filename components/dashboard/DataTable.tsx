import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  searchPlaceholder?: string;
}

export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = 'Search...',
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

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-[0.81rem] bg-slate-800 border-slate-700 text-slate-100"
          />
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[0.81rem] h-9 hidden sm:flex">
          <Filter className="w-3.5 h-3.5 mr-2" />
          Filter
        </Button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="text-slate-400 text-[0.72rem] py-3">
                    {column.label}
                  </TableHead>
                ))}
                {(onEdit || onDelete || onView) && (
                  <TableHead className="text-slate-400 text-right text-[0.72rem] py-3 max-md:hidden">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className="border-slate-800 hover:bg-slate-800/50 md:cursor-default cursor-pointer"
                  onClick={() => {
                    // On mobile, clicking row opens view/edit. On desktop, use action menu.
                    if (window.innerWidth < 768) {
                      if (onView) onView(row);
                      else if (onEdit) onEdit(row);
                    }
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-slate-300 text-[0.81rem] py-3">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell className="text-right py-3 max-md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 h-8 w-8">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                          {onView && (
                            <DropdownMenuItem
                              onClick={() => onView(row)}
                              className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2" />
                              View
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(row)}
                              className="text-slate-300 hover:bg-slate-800 cursor-pointer text-[0.81rem]"
                            >
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(row)}
                              className="text-rose-400 hover:bg-slate-800 cursor-pointer text-[0.81rem]"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-[0.81rem] text-slate-400">
          <span className="hidden sm:inline">Show</span>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-18 h-8 text-[0.81rem] bg-slate-800 border-slate-700 text-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
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
            className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 text-[0.72rem] h-8 px-3"
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
                      ? 'bg-violet-500 text-white hover:bg-violet-600 text-[0.72rem] h-8 w-8'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800 text-[0.72rem] h-8 w-8'
                  }
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <span className="sm:hidden text-[0.81rem] text-slate-400">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 text-[0.72rem] h-8 px-3"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
