import {
  getDocumentsList,
  saveDocument,
  getDocumentContent,
} from "../utils/api/api.js";

export default class DocumentStore {
  constructor() {
    this.state = [];
  }

  setState = (nextState) => {
    this.state = nextState;
  };

  saveDocumentRequest = async ({ title, content }) => {
    //제목이 빈칸이면 원래 제목으로 설정
    if (title?.trim() === "") {
      title = this.state.title;
    }
    const post = await saveDocument({
      title: title,
      content: content,
    });

    return post;
  };

  getDocumentContentRequest = async (postId) => {
    const post = await getDocumentContent(postId);
    return post;
  };

  getDocumentsListRequest = async () => {
    const documents = await getDocumentsList();
    return documents;
  };

  getDocumentInfoRequest = async () => {
    const { pathname } = window.location;
    const [, , postId] = pathname.split("/");

    if (postId) {
      const post = await this.getDocumentContentRequest(postId);
      this.state = {
        postId: post.id,
        title: post.title,
        content: post.content,
        documents: post.documents,
      };

      return true;
    }
  };
}
