
import {
  Code2,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Users,
  Target,
  GraduationCap
} from "lucide-react";

const programs = [
  {
    code: "SOP",
    name: "School of Programming",
    description:
      "Explore programming, software development and technology skills.",
    icon: Code2,
    color: "bg-purple-100 text-purple-700",
  },
  {
    code: "SOB",
    name: "School of Business",
    description:
      "Develop business knowledge, professional skills and entrepreneurial thinking.",
    icon: BriefcaseBusiness,
    color: "bg-green-100 text-green-700",
  },
  {
    code: "SOF",
    name: "School of Finance",
    description:
      "Learn financial concepts, financial literacy and related skills.",
    icon: ChartNoAxesCombined,
    color: "bg-amber-100 text-amber-700",
  },
];

function About() {
  return (
    <main className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="bg-[#355C46] text-white py-20 px-6 text-center">
        <p className="text-orange-300 font-semibold mb-3">
          NAVGURUKUL · DANTEWADA
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-5">
          About Our Community
        </h1>

        <p className="max-w-2xl mx-auto text-gray-200 leading-7">
          A community of learners, educators and changemakers
          working together to build skills, confidence and
          meaningful opportunities.
        </p>
      </section>

      {/* Introduction */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-5">
              Welcome to NavGurukul
            </h2>

            <p className="text-gray-600 leading-8">
              NavGurukul is a learning community focused on
              helping students develop skills, confidence and
              opportunities for their future careers.
              At the Dantewada campus, students learn,
              collaborate, participate in activities and
              take responsibility through different councils.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <Users size={40} className="text-green-700 mb-4" />
            <h3 className="text-xl font-bold mb-3">
              Learn Together
            </h3>
            <p className="text-gray-600">
              Students grow through peer learning,
              teamwork, community participation and
              practical experiences.
            </p>
          </div>

        </div>
      </section>

      {/* Programs */}
      <section className="max-w-6xl mx-auto px-6 pb-16">

        <div className="text-center mb-10">
          <p className="text-green-700 font-semibold">
            OUR LEARNING PROGRAMS
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Explore Our Schools
          </h2>

          <p className="text-gray-500 mt-3">
            Different learning pathways and opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((program) => {
            const Icon = program.icon;

            return (
              <div
                key={program.code}
                className="bg-white rounded-2xl p-7 shadow-sm
                hover:shadow-lg transition border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-xl flex
                items-center justify-center ${program.color}`}>
                  <Icon size={28} />
                </div>

                <h3 className="text-2xl font-bold mt-5">
                  {program.code}
                </h3>

                <h4 className="font-semibold text-gray-800 mt-1">
                  {program.name}
                </h4>

                <p className="text-gray-500 mt-4 leading-7">
                  {program.description}
                </p>
              </div>
            );
          })}
        </div>

      </section>

      {/* Community */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">

          <div>
            <Target size={36} className="text-green-700 mb-4" />
            <h2 className="text-2xl font-bold mb-3">
              Our Community Goals
            </h2>
            <p className="text-gray-600 leading-7">
              Encourage leadership, discipline, collaboration,
              communication and student participation.
            </p>
          </div>

          <div>
            <GraduationCap size={36} className="text-green-700 mb-4" />
            <h2 className="text-2xl font-bold mb-3">
              Beyond Academics
            </h2>
            <p className="text-gray-600 leading-7">
              Students also participate in cultural events,
              English activities, sports, teamwork and
              community initiatives.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}

export default About;
