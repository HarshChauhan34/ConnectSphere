const getInitials = (name = "") => {
  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0][0]?.toUpperCase() || "";
  }

  return (
    (words[0][0] || "").toUpperCase() +
    (words[1][0] || "").toUpperCase()
  );
};

export default getInitials;