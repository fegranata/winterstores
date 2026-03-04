"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserReviews from "@/components/profile/UserReviews";
import ProfileSettings from "@/components/profile/ProfileSettings";
import DeleteAccountModal from "@/components/profile/DeleteAccountModal";

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  language: string;
  reviewCount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.push("/login");
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }

      // Fetch profile from API
      fetch("/api/users/me")
        .then((res) => {
          if (!res.ok) throw new Error("Not authenticated");
          return res.json();
        })
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(() => {
          router.push("/login");
        });
    });
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-slate-200" />

        {/* Profile header skeleton */}
        <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-4 w-56 rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Reviews skeleton */}
        <div className="mt-8 space-y-4">
          <div className="h-5 w-28 rounded bg-slate-200" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">My Profile</span>
      </nav>

      {/* Profile Header */}
      <ProfileHeader
        displayName={profile.displayName}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
        reviewCount={profile.reviewCount}
        createdAt={profile.createdAt}
      />

      {/* My Reviews */}
      <div className="mt-8">
        <UserReviews />
      </div>

      {/* Settings */}
      <div className="mt-8">
        <ProfileSettings
          initialDisplayName={profile.displayName}
          initialLanguage={profile.language}
          onDeleteAccount={() => setShowDeleteModal(true)}
        />
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}
