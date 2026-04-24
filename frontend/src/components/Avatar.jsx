import getInitials from "../utils/getInitials";

function Avatar({ user, size = 40 }) {
  const hasDefaultAvatar =
    !user?.avatar ||
    user.avatar ===
      "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

  if (hasDefaultAvatar) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white"
      >
        {getInitials(user?.name)}
      </div>
    );
  }

  return (
    <img
      src={user.avatar}
      alt={user.name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover border border-white/20"
    />
  );
}

export default Avatar;