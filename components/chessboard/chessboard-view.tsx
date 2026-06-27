type ChessboardViewProps = {
  fen: string;
};

export function ChessboardView({ fen }: ChessboardViewProps) {
  return (
    <div className="grid aspect-square w-full place-items-center border border-[#987d54] bg-[#ede4d4]">
      <p className="px-4 text-center text-sm font-semibold text-[#5d5548]">
        Chessboard package pending. Current FEN: {fen}
      </p>
    </div>
  );
}
