import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const RiskChart = ({ data }) => {
  const chartData = [
    { name: "High Risk", value: data.highRisk, color: "hsl(0 84% 60%)" },
    { name: "Medium Risk", value: data.mediumRisk, color: "hsl(45 93% 47%)" },
    { name: "Low Risk", value: data.lowRisk, color: "hsl(142 71% 45%)" },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RiskChart;
