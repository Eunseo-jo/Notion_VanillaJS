import Trie from "../utils/trie.js";
import {
  addNewDocument,
  addSubDocument,
  deleteDocument,
  getDocumentsList,
} from "../utils/api/api.js";

export default class SidebarStore {
  constructor() {
    this.state = {
      sidebarData: [],
      searchKeyword: "",
    };

    this.subscribers = [];
    this.setInitialState();
  }

  setInitialState = async () => {
    const data = await getDocumentsList();
    this.state = { sidebarData: data };
  };

  setState = (nextState) => {
    this.state = nextState;
    this.notifySubscribers();
  };

  subscribe = (subscriber) => {
    this.subscribers.push(subscriber);
  };

  notifySubscribers = () => {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  };

  // 제목 업데이트
  updateDocumentTitle = (id, title, documents = this.state.sidebarData) => {
    const updatedDocuments = documents.map((doc) => {
      if (doc.id === id) {
        return { ...doc, title };
      }
      //하위 문서 확인
      else if (doc.documents.length > 0) {
        return {
          ...doc,
          documents: this.updateDocumentTitle(id, title, doc.documents),
        };
      }
      // id 다르고 하위 문서 없는 경우
      else {
        return doc;
      }
    });

    this.setState({
      ...this.state,
      sidebarData: updatedDocuments,
    });
  };

  //문서 검색 시 자동완성 리스트
  searchAutoComplete = (input) => {
    if (input.trim() === "") return;

    const words = input.toLowerCase().split(" ");
    const autoCompleteResults = [];

    const searchTitlesWithTrie = (word, documents) => {
      const suggestions = [];

      for (const doc of documents) {
        const trie = new Trie();
        trie.insert(doc.title);

        const titleSuggestions = trie.autoComplete(word);
        const titleSuggestionsWithInfo = titleSuggestions.map((title) => ({
          title,
          id: doc.id,
        }));

        suggestions.push(...titleSuggestionsWithInfo);

        if (doc.documents.length > 0) {
          const subDocumentSuggestions = searchTitlesWithTrie(
            word,
            doc.documents
          );
          suggestions.push(...subDocumentSuggestions);
        }
      }

      return suggestions;
    };

    for (const word of words) {
      const suggestions = searchTitlesWithTrie(word, this.state.sidebarData);
      autoCompleteResults.push(...suggestions);
    }

    return autoCompleteResults;
  };

  // 문서 검색 결과
  searchResults = (keyword) => {
    if (keyword.trim() === "") return;
    this.state.searchKeyword = keyword;
    const results = [];

    const searchTitles = (documents) => {
      for (const doc of documents) {
        if (doc.title.toLowerCase().includes(keyword.toLowerCase())) {
          results.push(doc);
        }

        if (doc.documents.length > 0) {
          searchTitles(doc.documents);
        }
      }
    };

    searchTitles(this.state.sidebarData);
    return results;
  };

  // 하위 문서 추가하기
  addSubDocument = async (id) => {
    try {
      const resId = await addSubDocument(id);
      return resId;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // 문서 지우기
  deleteDocument = async (id) => {
    if (confirm("문서를 삭제하시겠습니까?")) {
      try {
        if (await deleteDocument(id)) {
          return true;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    } else {
      alert("글이 삭제되지 않았습니다!");
      return false;
    }
  };

  // 새로운 루트 문서 만들기
  addNewDocument = async () => {
    try {
      const resId = await addNewDocument();
      return resId;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
}
