type PageSelectorProps = {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function PageSelector({ totalPages, currentPage, setCurrentPage }: PageSelectorProps) {
  const getPageNumbers = (): any[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = new Set<any>()

    pages.add(1)
    pages.add(totalPages)
    pages.add(currentPage)

    for (let i = Math.max(2, currentPage - 2); i < currentPage; i++) {
      pages.add(i)
    }

    for (let i = currentPage + 1; i < Math.min(totalPages, currentPage + 3); i++) {
      pages.add(i)
    }

    const sortedPages = Array.from(pages).sort((a,b) => a - b)
    const finalPages = sortedPages.reduce((acc, page, index, arr) => {
      if (index > 0 && (page > arr[index - 1] + 1)) {
        acc.push('...')
      }
      acc.push(page)
      return acc
    }, [])

    return finalPages
  }

  return (
    <div className="dropdown dropdown-top dropdown-end">
      <div tabIndex={0} role="button" className="cursor-pointer">Page {currentPage}</div>
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-horizontal bg-base-100 rounded-box z-1 w-48 p-2 shadow-md">
        {getPageNumbers().map((p, index): any => (
          <li key={index}>
            {p === '...' ? (
              <span className="px-2 py-1 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                className={p === currentPage ? 'active' : ''}
              >
                {p}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
