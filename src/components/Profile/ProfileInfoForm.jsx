export default function ProfileInfoForm({
  name,
  email,
  setName,
  onEmailChange,
  emailError,
  editing,
}) {
  return (
    <>
      <div>
        <label className="block font-medium">Имя</label>
        <input
          type="text"
          value={name}
          disabled={!editing}
          onChange={(e) => setName(e.target.value)}
          className="input-style"
        />
      </div>

      <div>
        <label className="block font-medium">Email</label>
        <input
          type="email"
          value={email}
          disabled={!editing}
          onChange={onEmailChange}
          className="input-style"
        />
        {editing && emailError && (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
      </div>
    </>
  );
}
