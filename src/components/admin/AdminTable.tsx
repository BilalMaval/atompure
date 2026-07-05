import { type ReactNode } from "react";

export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-beige-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-cream-100 text-charcoal-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-beige-200">{children}</tbody>
      </table>
    </div>
  );
}
