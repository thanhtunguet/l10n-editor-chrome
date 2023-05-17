import * as Figma from 'figma-api';

export class FigmaRepository {
  async getFigmaApiKey(): Promise<string> {
    const {figmaApiKey} = await chrome.storage.sync.get('figmaApiKey');
    return figmaApiKey;
  }

  // Main function to fetch all text nodes from the Figma file
  async fetchAllTextNodes(fileKey: string) {
    const figmaApiKey = await this.getFigmaApiKey();
    const api = new Figma.Api({
      personalAccessToken: figmaApiKey,
    });
    const getFileResult = await api.getFile(fileKey);
    const {document} = getFileResult;
    const components = await api.getTeamComponents('1047428911490061155');
    console.log(components);
    const textNodes: Figma.Node[] = [];
    this.fetchAllNodes(document, textNodes);
    return textNodes;
  }

  fetchAllNodes(
    node: Figma.Node & {children?: Figma.Node[]},
    result: Figma.Node[],
  ) {
    if (node.type === 'TEXT') {
      result.push(node);
      return;
    }
    if (node.children?.length > 0) {
      node.children.forEach((childNode) => {
        this.fetchAllNodes(childNode, result);
      });
    }
  }
}

export const figmaRepository = new FigmaRepository();
