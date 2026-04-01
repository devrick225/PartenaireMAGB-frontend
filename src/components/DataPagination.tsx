import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function DataPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: DataPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
    .reduce<(number | '...')[]>((acc, n, i, arr) => {
      if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Lignes par page</span>
        <Select value={String(pageSize)} onValueChange={v => { onPageSizeChange(Number(v)); onPageChange(1); }}>
          <SelectTrigger className="h-8 w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(s => (
              <SelectItem key={s} value={String(s)}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-2">
          {from}–{to} sur {total}
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)} disabled={safePage === 1}>
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(safePage - 1)} disabled={safePage === 1}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pageNumbers.map((n, i) =>
          n === '...' ? (
            <span key={`e-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
          ) : (
            <Button
              key={n}
              variant={safePage === n ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPageChange(n as number)}
            >
              {n}
            </Button>
          )
        )}

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(safePage + 1)} disabled={safePage === totalPages}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages)} disabled={safePage === totalPages}>
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
