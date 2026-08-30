import { useState } from "react";
import { ProfileSidebar } from "../components/profile/ProfileSidebar";
import {
  ProfessionalSummary,
  AcademicStanding,
  CoreCompetencies,
  CareerTrajectory,
} from "../components/profile/ProfileSections";
import { Skeleton } from "../components/ui/Card";
import useProfile from "../hooks/useProfile";
import ProfileEditor from "../components/profile/ProfileEditor";

function StudentProfile() {
  const { user, loading, error, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-40" />
                <Skeleton className="h-32" />
              </div>
            ) : (
              <ProfileSidebar user={user} onEdit={() => setEditing(true)} />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-24" />
              </>
            ) : editing ? (
              <ProfileEditor user={user} onCancel={() => setEditing(false)} onSave={updateProfile} />
            ) : user ? (
              <>
                <div className="flex justify-end"><button type="button" onClick={() => setEditing(true)} className="text-sm font-semibold text-teal-700 hover:underline">Edit profile</button></div>
                <ProfessionalSummary bio={user.studentProfile?.bio} />
                <AcademicStanding studentProfile={user.studentProfile} />
                <CoreCompetencies studentProfile={user.studentProfile} />
                <CareerTrajectory studentProfile={user.studentProfile} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No profile data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
