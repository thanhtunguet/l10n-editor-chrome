import * as Figma from 'figma-api';
import {Repository} from 'react3l';
import {store} from 'src/store';
import type {GlobalState} from 'src/store/GlobalState';

export class FigmaRepository extends Repository {
  async getFigmaApiKey(): Promise<string> {
    const globalState: GlobalState = store.getState();
    const figmaApiKey = globalState.figma.apiKey;
    return figmaApiKey;
  }

  // Main function to fetch all text nodes from the Figma file
  public async fetchAllTextNodes(fileKey: string) {
    const figmaApiKey = await this.getFigmaApiKey();
    const api = new Figma.Api({
      personalAccessToken: figmaApiKey,
    });
    const getFileResult = await api.getFile(fileKey);
    const {document} = getFileResult;
    const textNodes: Figma.Node[] = [];
    this.fetchAllNodes(document, textNodes);
    return textNodes;
  }

  public fetchAllNodes(
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
