export default function ProfileAvatar({ avatar, setAvatar, editing }) {
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <img
        src={avatar || "https://via.placeholder.com/80"}
        alt="Аватар"
        className="w-20 h-20 rounded-full object-cover"
      />
      {editing && (
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="text-sm"
        />
      )}
    </div>
  );
}
