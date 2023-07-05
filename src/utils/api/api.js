import { request } from "./request.js";

export const getDocumentsList = async () => {
  const documentList = await request("/documents");
  return documentList;
};

export const getDocumentContent = async (postId) => {
  const documentData = await request(`/documents/${postId}`);
  return documentData;
};

export const saveDocument = async ({ title, content }) => {
  const { pathname } = window.location;
  const [, , postId] = pathname.split("/");

  const updateData = await request(`/documents/${postId}`, {
    method: "PUT",
    body: JSON.stringify({
      title: title,
      content: content,
    }),
  });
  return updateData;
};

export const addNewDocument = async () => {
  const newDoc = await request("/documents", {
    method: "POST",
    body: JSON.stringify({
      title: "제목 없음",
      parent: null,
    }),
  });

  return newDoc.id;
};

export const addSubDocument = async (id) => {
  const newId = await request("/documents", {
    method: "POST",
    body: JSON.stringify({
      title: "제목 없음",
      parent: id,
    }),
  }).then((res) => {
    return res.id;
  });
  return newId;
};

export const deleteDocument = async (id) => {
  const res = await request(`/documents/${id}`, {
    method: "DELETE",
  });

  return res;
};
