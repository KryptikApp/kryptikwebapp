type ISyncPieceType = "share" | "seedloopSerializedCipher";

/**
 * Useful for chunking data
 * @param data Data string
 * @param order Zero-based index of the piece
 */
export interface ISyncPiece {
  data: string;
  order: number;
  type: ISyncPieceType;
}

export function parseSyncPiece(pieceString: string): ISyncPiece {
  return JSON.parse(pieceString);
}

export function stringifySyncPiece(piece: ISyncPiece): string {
  return JSON.stringify(piece);
}
