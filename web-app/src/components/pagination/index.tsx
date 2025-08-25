import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  currentPage: number;
}

export function CustomPagination({
  totalItems,
  itemsPerPage,
  setCurrentPage,
  currentPage,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust startPage if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={`cursor-pointer ${
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-gray-100"
            }`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          />
        </PaginationItem>

        {startPage > 1 && (
          <>
            <PaginationItem className="cursor-pointer">
              <PaginationLink onClick={() => setCurrentPage(1)}>
                1
              </PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem>
                <span className="px-3 py-2">...</span>
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page} className="cursor-pointer">
            <PaginationLink
              className={`select-none ${
                page === currentPage
                  ? "bg-black text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <PaginationItem>
                <span className="px-3 py-2">...</span>
              </PaginationItem>
            )}
            <PaginationItem className="cursor-pointer">
              <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            className={`cursor-pointer ${
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-gray-100"
            }`}
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
