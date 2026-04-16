export default function Header({ studentName }) {

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
      <h1 className="text-2xl font-semibold text-gray-900">
        Привет, {studentName}!
      </h1>
    </div>
  );
}
