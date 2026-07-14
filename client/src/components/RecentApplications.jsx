import { useEffect, useState } from "react";
import { getCompanies } from "../services/companyService";

const statusColor = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-yellow-100 text-yellow-700",
  Selected: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function RecentApplications() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data.companies.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-10">

      <h2 className="text-2xl font-bold mb-6">
        Recent Applications
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Company</th>

              <th className="p-3 text-left">Role</th>

              <th className="p-3 text-left">Location</th>

              <th className="p-3 text-left">Status</th>

            </tr>

          </thead>

          <tbody>

            {companies.map((company) => (

              <tr
                key={company._id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3 font-semibold">
                  {company.companyName}
                </td>

                <td className="p-3">
                  {company.role}
                </td>

                <td className="p-3">
                  {company.location}
                </td>

                <td className="p-3">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      statusColor[company.status]
                    }`}
                  >
                    {company.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}