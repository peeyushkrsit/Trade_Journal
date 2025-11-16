export default function StatsCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {Icon && <Icon className="w-5 h-5 text-primary" />}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

