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
        <label className="block text-sm font-semibold text-gray-900 mb-1">Имя</label>
        <input
          type="text"
          value={name}
          disabled={!editing}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled={!editing}
          onChange={onEmailChange}
          autoComplete="email"
          aria-invalid={editing && !!emailError}
          aria-describedby={editing && emailError ? "email-error" : undefined}
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200"
        />
        {editing && emailError && (
          <p id="email-error" className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
      </div>
    </>
  );
}
