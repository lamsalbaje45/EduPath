import { useState } from "react";

const initialProfile = {
  firstName: "Aarav",
  lastName: "Shrestha",
  email: "aarav.shrestha@example.com",
  location: "Kathmandu, Nepal",
  bio: "Aspiring software engineer who enjoys building useful products and learning new technologies.",
  institution: "Kathmandu Tech College",
  programme: "Bachelor of Computer Applications",
  year: "Second year",
  goal: "Frontend developer",
  workPreference: "Internship · Hybrid or remote",
};

const skills = ["React", "JavaScript", "Tailwind CSS", "Figma"];
const interests = ["Web development", "UI/UX design", "Startups"];

function Field({ label, value, name, onChange, editing, multiline = false }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      {editing ? (
        multiline ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows="3"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
          />
        ) : (
          <input
            name={name}
            value={value}
            onChange={onChange}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#5472FC] focus:ring-2 focus:ring-[#E7EEFF]"
          />
        )
      ) : (
        <p className="mt-2 text-sm leading-6 text-slate-600">{value}</p>
      )}
    </div>
  );
}

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [editing, setEditing] = useState(false);

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setProfile(draft);
    setEditing(false);
  };

  const updateDraft = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const data = editing ? draft : profile;

  return (
    <main className="min-h-screen bg-[#F7F8FA] pb-16 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 xl:px-0">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5472FC]">
              Student profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My profile
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Keep your education and career preferences up to date.
            </p>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white shadow-sm transition-colors hover:bg-[#435DDE] focus:outline-none focus:ring-2 focus:ring-[#5472FC] focus:ring-offset-2"
            >
              Edit profile
            </button>
          )}
        </div>

        <form onSubmit={saveProfile}>
          <section className="overflow-hidden rounded-2xl border border-[#D9E2FF] bg-white shadow-sm">
            <div className="h-28 bg-[radial-gradient(circle_at_82%_15%,rgba(255,255,255,0.38),transparent_28%),linear-gradient(120deg,#2551D9,#5472FC)]" />
            <div className="relative px-5 pb-6 sm:px-8">
              <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#E7EEFF] text-2xl font-black text-[#2551D9] shadow-sm">
                    {initials}
                  </div>
                  <div className="pb-1">
                    <h2 className="text-2xl font-black text-slate-950">{fullName}</h2>
                    <p className="mt-1 text-sm text-slate-500">{profile.programme}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#D9E2FF] bg-[#F6F8FF] px-4 py-3 sm:mb-1">
                  <div className="flex items-center justify-between gap-6">
                    <p className="text-xs font-black text-slate-700">Profile strength</p>
                    <p className="text-xs font-black text-[#2551D9]">80%</p>
                  </div>
                  <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-[#D9E2FF]">
                    <div className="h-full w-4/5 rounded-full bg-[#5472FC]" />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Role</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-700">Student</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Location</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-700">{profile.location}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Career goal</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-700">{profile.goal}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-black text-slate-950">About me</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field label="First name" name="firstName" value={data.firstName} onChange={updateDraft} editing={editing} />
                  <Field label="Last name" name="lastName" value={data.lastName} onChange={updateDraft} editing={editing} />
                  <Field label="Email address" name="email" value={data.email} onChange={updateDraft} editing={editing} />
                  <Field label="Location" name="location" value={data.location} onChange={updateDraft} editing={editing} />
                </div>
                <div className="mt-5">
                  <Field label="Bio" name="bio" value={data.bio} onChange={updateDraft} editing={editing} multiline />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-black text-slate-950">Education and career</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field label="Institution" name="institution" value={data.institution} onChange={updateDraft} editing={editing} />
                  <Field label="Programme" name="programme" value={data.programme} onChange={updateDraft} editing={editing} />
                  <Field label="Current year" name="year" value={data.year} onChange={updateDraft} editing={editing} />
                  <Field label="Career goal" name="goal" value={data.goal} onChange={updateDraft} editing={editing} />
                </div>
                <div className="mt-5">
                  <Field label="Work preference" name="workPreference" value={data.workPreference} onChange={updateDraft} editing={editing} />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-black text-slate-950">Skills</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Skills used to surface matching opportunities.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-[#E7EEFF] px-3 py-1.5 text-xs font-black text-[#2551D9]">
                      {skill}
                    </span>
                  ))}
                </div>
                {editing && <button type="button" className="mt-5 text-xs font-black text-[#2551D9] hover:text-[#435DDE]">+ Manage skills</button>}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-black text-slate-950">Interests</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span key={interest} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                      {interest}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#D9E2FF] bg-[#F6F8FF] p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2551D9]">Next step</p>
                <h2 className="mt-3 text-lg font-black leading-6 text-slate-950">Add your CV to stand out in applications.</h2>
                <button type="button" className="mt-5 rounded-xl bg-[#5472FC] px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-[#435DDE]">
                  Open CV Maker
                </button>
              </section>
            </aside>
          </div>

          {editing && (
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={cancelEditing} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-[#5472FC] px-5 py-3 text-xs font-black text-white transition-colors hover:bg-[#435DDE]">
                Save changes
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default Profile;
