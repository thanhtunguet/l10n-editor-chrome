import * as Figma from 'figma-api';
import {Repository} from 'react3l';

export class FigmaRepository extends Repository {
  private api: Figma.Api;

  public constructor(private apiKey: string) {
    super();
    this.api = new Figma.Api({
      personalAccessToken: apiKey,
    });
  }

  // Main function to fetch all text nodes from the Figma file
  public async fetchAllTextNodes(
    fileKey: string,
  ): Promise<Figma.Node<'TEXT'>[]> {
    const getFileResult = await this.api.getFile(fileKey);
    const {document} = getFileResult;
    const textNodes: Figma.Node[] = [];
    this.fetchAllNodes(document, textNodes);
    return textNodes as Figma.Node<'TEXT'>[];
  }

  public fetchAllNodes(
    node: Figma.Node & {children?: Figma.Node[]},
    result: Figma.Node[],
  ) {
    if (node.type === 'TEXT') {
      result.push(node);
      return;
    }
    if (!!node.children && node.children.length > 0) {
      node.children.forEach((childNode) => {
        this.fetchAllNodes(childNode, result);
      });
    }
  }
}
