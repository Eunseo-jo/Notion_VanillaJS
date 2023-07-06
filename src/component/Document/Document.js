import { push } from "../../utils/router.js";
import Editor from "./Editor.js";

export default class Document {
  constructor({ $target, documentStore, sidebarStore }) {
    this.$target = $target;
    this.sidebarStore = sidebarStore;
    this.documentStore = documentStore;
    this.editor = new Editor({
      $target: this.$target,
      initialState: this.documentStore.state,
      saveDocument: async ({ title, content }) => {
        await this.documentStore.saveDocument({ title, content });
      },
      handleInputChange: this.handleInputChange,
      linkToSubDocument: (id) => {
        push(`/documents/${id}`);
      },
    });
  }

  setState = async (nextState) => {
    if (this.documentStore.state.postId !== nextState.postId) {
      await this.documentStore.setState(nextState);
      this.render();
    }
  };

  handleInputChange = (data) => {
    if (data.title !== this.documentStore.state.title) {
      this.sidebarStore.updateDocumentTitle(data.postId, data.title);
    }
    this.documentStore.saveDocument(data);
  };

  render = () => {
    const { postId, title, content, documents } = this.documentStore.state;
    this.editor.setState({
      postId: postId,
      title: title || "",
      content: content || "",
      documents: documents || [],
    });
  };
}
