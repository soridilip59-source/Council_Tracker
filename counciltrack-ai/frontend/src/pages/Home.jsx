
import { Link } from "react-router-dom";
import {
  ArrowRight, Users, Target, TrendingUp,
  MessageSquare, Code2, BriefcaseBusiness,
  ChartNoAxesCombined
} from "lucide-react";

const programs = [
  {
    code: "SOP",
    name: "School of Programming",
    icon: Code2,
    color: "bg-purple-100 text-purple-700",
  },
  {
    code: "SOB",
    name: "School of Business",
    icon: BriefcaseBusiness,
    color: "bg-green-100 text-green-700",
  },
  {
    code: "SOF",
    name: "School of Finance",
    icon: ChartNoAxesCombined,
    color: "bg-amber-100 text-amber-700",
  },
];

const features = [
  {
    icon: Users,
    title: "Student Leadership",
    text: "Students take responsibility and lead community initiatives.",
  },
  {
    icon: Target,
    title: "Council Goals",
    text: "Every council works towards meaningful goals and activities.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    text: "Monitor achievements and monthly council performance.",
  },
  {
    icon: MessageSquare,
    title: "Student Voice",
    text: "Share feedback and suggestions without creating an account.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#F8FAF8]">

      {/* HERO */}
      <section className="bg-[#355C46] text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p className="text-orange-300 font-semibold mb-5">
            NAVGURUKUL · DANTEWADA CAMPUS
          </p>

          <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
            Together We Learn.
            <span className="text-orange-300"> Together We Lead.</span>
          </h1>

          <p className="text-gray-200 mt-6 max-w-2xl text-lg leading-8">
            Discover our learning community, explore student-led
            councils, celebrate achievements and help us grow
            through your feedback.
          </p>

          <div className="flex flex-wrap gap-4 mt-9">
            <Link
              to="/councils"
              className="bg-orange-500 hover:bg-orange-600 px-7 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              Explore Councils <ArrowRight size={18}/>
            </Link>

            <Link
              to="/feedback"
              className="border border-white px-7 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-900"
            >
              Give Feedback
            </Link>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-green-700 font-bold">WELCOME TO OUR COMMUNITY</p>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-gray-900">
            More Than Just Learning
          </h2>
          <p className="text-gray-600 mt-5 leading-8">
            At NavGurukul Dantewada, learning goes beyond classrooms.
            Students collaborate, take leadership, organize activities
            and build a supportive community.
          </p>
          <Link to="/about" className="inline-flex mt-6 text-green-800 font-bold gap-2">
            Discover Our Story <ArrowRight size={18}/>
          </Link>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-green-700 font-bold">OUR LEARNING PROGRAMS</p>
            <h2 className="text-3xl font-bold mt-2">Explore Our Schools</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((program) => {
              const Icon = program.icon;
              return (
                <div key={program.code}
                  className="bg-gray-50 border rounded-2xl p-7 hover:shadow-lg transition">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${program.color}`}>
                    <Icon size={30}/>
                  </div>
                  <h3 className="text-2xl font-bold mt-5">{program.code}</h3>
                  <p className="font-semibold text-gray-800 mt-2">
                    {program.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-green-700 font-bold">OUR COMMUNITY</p>
          <h2 className="text-3xl font-bold mt-2">What Makes Us Special?</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-white p-6 rounded-2xl border hover:shadow-md">
                <Icon size={32} className="text-green-700"/>
                <h3 className="font-bold text-lg mt-5">{item.title}</h3>
                <p className="text-gray-500 text-sm mt-3 leading-6">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#355C46] text-white py-16 text-center px-6">
        <h2 className="text-3xl font-bold">Your Voice Matters!</h2>
        <p className="mt-4 text-gray-200">
          Help our councils improve through your feedback and suggestions.
        </p>
        <Link to="/feedback"
          className="inline-flex mt-7 bg-orange-500 px-7 py-3 rounded-lg font-bold">
          Share Your Feedback
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-300 py-8 text-center">
        <p className="font-bold text-white">NavGurukul · Dantewada</p>
        <p className="text-sm mt-2">CouncilTrack AI · Learn Together, Grow Together.</p>
        <p className="text-xs mt-4">© 2026 CouncilTrack AI</p>
      </footer>

    </main>
  );
}
