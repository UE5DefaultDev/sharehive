import {
  getProfileByUsername,
  getUserCourses,
  getUserFollowedCourses,
} from "@/actions/profile.action";
import { notFound } from "next/navigation";
import React from "react";
import ProfilePageClient from "./ProfilePageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const user = await getProfileByUsername((await params).username);

  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.name}'s profile`,
  };
}

async function ProfilePage({
  params,
}: {
  params: Promise<{ username:string }>;
}) {
  const user = await getProfileByUsername((await params).username);
  if (!user) notFound();

  const [courses, followedCourses] = await Promise.all([
    getUserCourses(user.id),
    getUserFollowedCourses(user.id),
  ]);
  return (
    <ProfilePageClient
      user={user}
      courses={courses}
      followedCourses={followedCourses}
    />
  );
}

export default ProfilePage;