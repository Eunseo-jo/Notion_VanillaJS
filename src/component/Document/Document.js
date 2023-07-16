import { push } from "../../utils/router.js";
import debounce from "../../utils/debounce.js";
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
        await this.documentStore.saveDocumentRequest({ title, content });
      },
      handleInputChange: this.handleInputChange,
      linkToSubDocument: (id) => {
        push(`/documents/${id}`);
      },
    });
  }

  setState = (nextState) => {
    if (this.documentStore.state.postId !== nextState.postId) {
      this.documentStore.setState(nextState);
      this.render();
    }
  };

  handleInputChange = debounce(async (data) => {
    if (data.title !== this.documentStore.state.title) {
      this.sidebarStore.updateDocumentTitle(data.postId, data.title);
    }
    this.documentStore.saveDocumentRequest(data);
  }, 500);

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
