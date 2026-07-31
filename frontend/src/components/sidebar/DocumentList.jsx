import { useDocuments } from "../../context/DocumentContext";

export default function DocumentList() {
  const { documents } = useDocuments();

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-xs uppercase text-slate-500">Documents</h3>

      {documents.length === 0 ? (
        <p className="text-sm text-slate-400">No documents</p>
      ) : (
        <ul className="space-y-1">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                px-2
                py-2
                hover:bg-white
                cursor-pointer
              "
            >
              📄
              <span className="truncate">{doc.filename}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
