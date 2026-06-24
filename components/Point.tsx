type Props = {
  value: "blue" | "red" | null;
  onClick: () => void;
};

export default function Point({ value, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full cursor-pointer"
      style={{
        backgroundColor:
          value === "blue"
            ? "blue"
            : value === "red"
            ? "red"
            : "black",
      }}
    />
  );
}