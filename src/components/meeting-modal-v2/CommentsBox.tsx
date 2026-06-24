"use client";

export function CommentsBox() {
  return (
    <div className="mt-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Comments</h3>
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5D0B5] text-xs font-bold text-slate-700"
          aria-hidden
        >
          LL
        </span>
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            placeholder="Leave a comment"
            className="w-full rounded-full border border-[#E8EAED] bg-white py-2.5 pl-4 pr-20 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#FF7A00] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20"
            readOnly
            aria-label="Leave a comment"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50"
              aria-label="Add emoji"
              title="Add emoji"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-5.657 3.536a.75.75 0 10-1.06 1.06 3.5 3.5 0 004.95 0 .75.75 0 00-1.06-1.06 2 2 0 01-2.83 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#FF7A00] hover:bg-[#FFF4E6]"
              aria-label="Send comment"
              title="Send"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.545l4.243-1.212 4.243 1.212a.75.75 0 00.95-.545l1.414-4.949a.75.75 0 00-.826-.95l-5.602 1.6a.75.75 0 01-.414 0L3.105 2.29z" />
                <path d="M10.394 12.737l-1.414 4.95a.75.75 0 001.326.67l2.121-2.122a.75.75 0 011.06 0l2.121 2.122a.75.75 0 001.326-.67l-1.414-4.95" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
