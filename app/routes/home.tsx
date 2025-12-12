import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { resumes } from "~/constants";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumifier" },
        { name: "description", content: "AI Resume Analyzer and application tracking tool." },
    ];
}

export default function Home() {
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading">
                    <h1>Track your application & Resume Rating</h1>
                    <h2>Review your submission and check AI-powered feedback.</h2>
                </div>
            </section>

            {resumes.length > 0 && (
                <div className="resumes-section">
                    {resumes.map((resume) => (
                        <ResumeCard key={resume.id} resume={resume} />
                    ))}
            </div>

            )}
        </main>
    );
}
