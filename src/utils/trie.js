import Queue from "./Queue.js";

class Node {
  constructor(value = "") {
    this.value = value;
    this.children = new Map();
    this.isEnd = false;
  }
}

export default class Trie {
  constructor() {
    this.root = new Node();
  }

  has(string) {
    let currentNode = this.root;

    for (const char of string) {
      if (!currentNode.children.has(char)) {
        return false;
      }
      currentNode = currentNode.children.get(char);
    }
    return true;
  }

  insert(string) {
    let currentNode = this.root;

    for (const char of string) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new Node(currentNode.value + char));
      }
      currentNode = currentNode.children.get(char);
    }
    currentNode.isEnd = true;
  }
  //자동완성 코드 구현해보기 - 트리 파트에서 사용된 레벨 순회 응용
  autoComplete(word) {
    let currentNode = this.root;
    for (const char of word) {
      if (!currentNode.children.has(char)) {
        return [];
      }
      currentNode = currentNode.children.get(char);
    }
    const queue = new Queue();
    queue.enqueue({ node: currentNode, word: word });
    const suggest = [];
    while (queue.size()) {
      const { node, word } = queue.dequeue();
      if (node.isEnd) suggest.push(word);
      for (const [char, childNode] of node.children) {
        queue.enqueue({ node: childNode, word: word + char });
      }
    }
    return suggest;
  }
}
