interface StatCardProps {
  title: string;
  value: number;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
} 