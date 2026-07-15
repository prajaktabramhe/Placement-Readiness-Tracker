const StatsCard = ({ title, value, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition duration-300 border-l-4 border-l-blue-500">
      <h3 className="text-gray-500 text-sm font-semibold uppercase">
        {title}
      </h3>

      <h2 className={`text-4xl font-bold mt-4 ${color}`}>
        {value}
      </h2>
    </div>
  );
};

export default StatsCard;
