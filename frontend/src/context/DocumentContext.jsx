import { createContext, useContext, useEffect, useState } from "react";

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from "../services/documentApi";

import { useWorkspace } from "./WorkspaceContext";

const DocumentContext = createContext();

export function DocumentProvider({ children }) {
  const { currentWorkspaceId } = useWorkspace();

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (currentWorkspaceId) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [currentWorkspaceId]);

  async function loadDocuments() {
    const docs = await getDocuments(currentWorkspaceId);

    setDocuments(docs);
  }

  async function addDocument(file) {
    await uploadDocument(currentWorkspaceId, file);

    await loadDocuments();
  }

  async function removeDocument(id) {
    await deleteDocument(id);

    await loadDocuments();
  }

  return (
    <DocumentContext.Provider
      value={{
        documents,
        addDocument,
        removeDocument,
        reloadDocuments: loadDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  return useContext(DocumentContext);
}
